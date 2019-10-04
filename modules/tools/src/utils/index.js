const fs = require('fs')
const path = require('path')
const dotenv = require('dotenv')
const readlineSync = require('readline-sync')
const findRoot = require('find-root')
const prettier = require('prettier')
const validateNpmPackageName = require('validate-npm-package-name')
const { compile } = require('handlebars')
const glob = require('fast-glob')
const JSONWithComments = require('comment-json')
const prettierConfig = require('../../prettier')
const { isValidRepoSshAddress, getRepoSshAddress } = require('./repo-address')

const getTestsRootDir = () => {
  const foundRoot = findRoot(process.cwd())
  const testsPackagePath = path.join(foundRoot, 'e2e-tests')
  if (fs.existsSync(testsPackagePath)) {
    return testsPackagePath
  }

  return foundRoot
}

function getProjectRootDir() {
  return getTestsRootDir().replace(/\/e2e-tests$/, '')
}

function getConfigPath() {
  return path.join(getTestsRootDir(), 'e2e-tools.json')
}

function getConfig() {
  try {
    const configFile = fs.readFileSync(getConfigPath(), {
      encoding: 'utf-8',
    })

    return JSONWithComments.parse(configFile)
  } catch (err) {
    if (err && err.code === 'ENOENT') {
      throw new Error(`Config file ${err.path} was not found`)
    }

    throw err
  }
}

function getConfigSafe() {
  try {
    return getConfig()
  } catch (e) {
    return undefined
  }
}

function getParentProjectPackageJsonSafe() {
  try {
    return require(path.join(getProjectRootDir(), 'package.json'))
  } catch (e) {
    return undefined
  }
}

function createJsonFile({ filePath, fileContent }) {
  const formattedContent = prettier.format(JSONWithComments.stringify(fileContent), {
    parser: 'json',
  })
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, formattedContent)
}

function formatFile(filePath) {
  const ext = path.extname(filePath)
  const parser = {
    '.js': 'babel',
    '.json': 'json',
  }[ext]

  if (!parser) {
    return
  }

  const fileContent = fs.readFileSync(filePath, 'utf8')
  const formattedContent = prettier.format(fileContent, { ...prettierConfig, parser })
  fs.writeFileSync(filePath, formattedContent)
}

function updateJsonFile({ filePath, update }) {
  const file = fs.readFileSync(filePath, { encoding: 'utf-8' })
  const fileContent = JSONWithComments.parse(file)
  createJsonFile({ filePath, fileContent: update(fileContent) })
}

function updateToolConfig(tool, update) {
  updateJsonFile({
    filePath: getConfigPath(),
    update(config) {
      const toolSettings = config.tools[tool]

      if (!toolSettings) {
        throw new Error(`Tool ${tool} was not found`)
      }

      const updatedToolSettings = update(toolSettings === true ? {} : toolSettings)

      return {
        ...config,
        tools: {
          ...config.tools,
          [tool]: Object.keys(updatedToolSettings).length === 0 ? true : updatedToolSettings,
        },
      }
    },
  })
}

function initTemplate({ templatesRoot, root }) {
  return options => {
    const { data } = options
    const filePath = options.filePath
    const fileFullPath = path.join(root, options.filePath)
    const templatePath = path.join(templatesRoot, options.templatePath || `${filePath}.hbs`)

    fs.mkdirSync(path.dirname(fileFullPath), { recursive: true })
    const render = compile(fs.readFileSync(templatePath, 'utf8'))
    fs.writeFileSync(fileFullPath, render(data))
  }
}

function getRepoNameByAddress(str) {
  const matched = str.match(/\/(.*).git$/)

  if (!matched) {
    return undefined
  }

  return matched[1]
}

function validatePackageName(name) {
  if (name.startsWith('@')) {
    return false
  }

  return validateNpmPackageName(name).validForNewPackages
}

function getEnvVariable(variable, description) {
  try {
    const envFilePath = path.join(getTestsRootDir(), '.env')

    if (!fs.existsSync(envFilePath)) {
      fs.writeFileSync(envFilePath, '\n')
    }

    const config = dotenv.config()
    if (process.env[variable]) {
      return process.env[variable]
    }

    const value = readlineSync.question(`${description} (${variable}) `)

    const newConfig = { ...config.parsed, [variable]: value }

    const envFileContent =
      Object.keys(newConfig)
        .map(key => `${key}=${newConfig[key]}`)
        .join('\n') + '\n'

    fs.writeFileSync(envFilePath, envFileContent)

    return newConfig[variable]
  } catch (err) {
    console.log(`Произошла ошибка при получении ${variable}`)
    throw err
  }
}

function defaultGetDestinationPath(templatePath) {
  return templatePath.replace(/\.hbs$/, '').replace(/\.autogenerated$/, '')
}

function createFilesFromTemplates({
  templatesGlob,
  templatesData,
  templatesRoot,
  destinationRoot,
  getDestinationPath = defaultGetDestinationPath,
}) {
  const templatesPaths = glob.sync(templatesGlob, {
    dot: true,
    cwd: templatesRoot,
  })

  templatesPaths.forEach(templatePath => {
    const templateAbsolutePath = path.join(templatesRoot, templatePath)
    const destinationPath = getDestinationPath(templatePath)
    const destinationAbsolutePath = path.join(destinationRoot, destinationPath)

    fs.mkdirSync(path.dirname(destinationAbsolutePath), { recursive: true })
    const render = compile(fs.readFileSync(templateAbsolutePath, 'utf8'))
    fs.writeFileSync(destinationAbsolutePath, render(templatesData))
    formatFile(destinationAbsolutePath)
  })
}

module.exports = {
  getTestsRootDir,
  getProjectRootDir,
  getConfig,
  getConfigSafe,
  createJsonFile,
  updateJsonFile,
  updateToolConfig,
  initTemplate,
  getParentProjectPackageJsonSafe,
  getRepoNameByAddress,
  validatePackageName,
  getEnvVariable,
  createFilesFromTemplates,
  isValidRepoSshAddress,
  getRepoSshAddress,
}