const os = require('os')
const fs = require('fs')
const fsp = require('fs/promises')
const fse = require('fs-extra')
const path = require('path')
const klaw = require('klaw')
const crypto = require('crypto')
const chalk = require('chalk')
const allure = require('allure-commandline')
const mime = require('mime-types')
const { S3 } = require('@aws-sdk/client-s3')

// To test this script
// export GITHUB_REPOSITORY=CSSSR/test-repo
// export GITHUB_REF=refs/heads/master
// export ALLURE_REPORT_DIRECTORIES="<path-to-dir-with-allure-reports>"
// export LAUNCH_URL=https://fake-url.my-company.com
// export RUN_COMMAND="yarn et codecept:run --browser remote_chrome"
// node modules/tools/upload-allure-report.js

const env = process.env
const cfg = {
  LAUNCH_URL: env.LAUNCH_URL,
  RUN_COMMAND: env.RUN_COMMAND,
  ALLURE_REPORT_DIRECTORIES: env.ALLURE_REPORT_DIRECTORIES.split(/[\s,]+/).map((s) => s.trim()),
  AWS_ACCESS_KEY_ID: env.AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY: env.AWS_SECRET_ACCESS_KEY,
}

function getSha1Hash(str) {
  const hash = crypto.createHash('sha1')
  hash.setEncoding('hex')
  hash.write(str)
  hash.end()
  return hash.read()
}

async function getEnvHash() {
  return getSha1Hash([cfg.LAUNCH_URL, cfg.RUN_COMMAND].join(''))
}

const s3 = new S3({
  region: 'eu-central-1',
  credentials: cfg.AWS_ACCESS_KEY_ID && {
    accessKeyId: cfg.AWS_ACCESS_KEY_ID,
    secretAccessKey: cfg.AWS_SECRET_ACCESS_KEY,
  },
})
const bucket = 'csssr-test-reports'

function addTrailingSlash(str) {
  if (str.slice(-1) === '/') {
    return str
  }
  return `${str}/`
}

async function listFiles(directoryPath) {
  const paths = []
  for await (const file of klaw(directoryPath)) {
    if (file.stats.isFile()) {
      paths.push({
        absolutePath: file.path,
        relativePath: file.path.replace(addTrailingSlash(directoryPath), ''),
      })
    }
  }

  return paths
}

async function listS3Directory(prefix) {
  const paths = []
  let continuationToken
  while (true) {
    const objects = await s3.listObjectsV2({
      Bucket: bucket,
      Prefix: prefix,
      ContinuationToken: continuationToken,
    })

    if (objects.Contents) {
      paths.push(
        ...objects.Contents.map((object) => ({
          key: object.Key,
          relativePath: object.Key.replace(prefix, ''),
        }))
      )
    }

    if (!objects.IsTruncated) {
      break
    }

    continuationToken = objects.NextContinuationToken
  }

  return paths
}

async function downloadS3File(key, filePath) {
  const obj = await s3.getObject({
    Bucket: bucket,
    Key: key,
  })
  await fse.ensureDir(path.dirname(filePath))

  return new Promise((resolve, reject) => {
    const writeStream = fs.createWriteStream(filePath)
    // @ts-ignore
    obj.Body.pipe(writeStream)
    writeStream.on('finish', resolve)
    writeStream.on('error', reject)
  })
}

async function uploadS3File(key, content) {
  await s3.putObject({
    Bucket: 'csssr-test-reports',
    Key: key,
    Body: content,
    ContentType: mime.contentType(path.basename(key)) || 'application/octet-stream',
  })
}

async function main() {
  const envHash = await getEnvHash()
  const s3Prefix =
    `repository/${env.GITHUB_REPOSITORY}/${env.GITHUB_REF.replace(/\//gu, '-')}/` + envHash
  const xmlReportPath = await fsp.mkdtemp(path.join(os.tmpdir(), 'allure-xml-report-'))
  const htmlReportPath = await fsp.mkdtemp(path.join(os.tmpdir(), 'allure-html-report-'))

  try {
    await Promise.all(
      cfg.ALLURE_REPORT_DIRECTORIES.map(async (dir) => {
        try {
          await fse.copy(dir, xmlReportPath)
        } catch (err) {
          // Ignore not found errors because there are often only one report exits —
          // Either nightwatch or codecept report is not present
          if (err?.code === 'ENOENT') {
            console.warn(`Directory ${dir} not found, ignoring it`)
            return
          }
          return Promise.reject(err)
        }
      })
    )

    const environment = new Map()
    environment.set('URL', cfg.LAUNCH_URL)
    environment.set('Command', cfg.RUN_COMMAND)
    environment.set('S3.Prefix', s3Prefix)

    const environmentPropertiesFileContent = [...environment.entries()]
      .map(([key, value]) => `${key}=${value}`)
      .join('\n')
    await fsp.writeFile(
      path.join(xmlReportPath, 'environment.properties'),
      environmentPropertiesFileContent,
      'utf8'
    )

    const previousReportHistory = await listS3Directory(`${s3Prefix}/allure-html-reports-history`)

    await Promise.all(
      previousReportHistory.map(async (file) => {
        const filePath = path.join(xmlReportPath, 'history', file.relativePath)
        await downloadS3File(file.key, filePath)
      })
    )

    const allureProcess = await allure(['generate', xmlReportPath, '--output', htmlReportPath])

    await new Promise((resolve, reject) => {
      allureProcess.on('exit', (exitCode) => {
        if (exitCode !== 0) {
          reject(new Error(`Error while generating allure report. Exit code is ${exitCode}`))
        }
        resolve()
      })
    })

    const htmlReportFiles = await listFiles(htmlReportPath)
    const htmlReportID = Math.random().toFixed(10).slice(2)
    await Promise.all(
      htmlReportFiles.map(async (reportFileName) => {
        const reportContent = await fsp.readFile(reportFileName.absolutePath, {
          encoding: 'utf-8',
        })
        await uploadS3File(
          `site-root/r/${htmlReportID}/${reportFileName.relativePath}`,
          reportContent
        )
      })
    )

    const htmlReportHistoryFiles = await listFiles(path.join(htmlReportPath, 'history'))
    await Promise.all(
      htmlReportHistoryFiles.map(async (reportFileName) => {
        const reportContent = await fsp.readFile(reportFileName.absolutePath, {
          encoding: 'utf-8',
        })
        await uploadS3File(
          `${s3Prefix}/allure-html-reports-history/${reportFileName.relativePath}`,
          reportContent
        )
      })
    )

    const reportLink = `https://test-reports.csssr.com/r/${htmlReportID}`

    console.log(chalk.cyan(`Report is successfully generated and available at ${reportLink}`))

    if ('GITHUB_ACTIONS' in process.env) {
      console.log(`::set-output name=report-link::${reportLink}`)
    }
  } finally {
    console.log('Cleaning temporary files…')
    await Promise.all([
      fsp.rm(xmlReportPath, { recursive: true, force: true }),
      fsp.rm(htmlReportPath, { recursive: true, force: true }),
    ])
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
