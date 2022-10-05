const os = require('os')
const { getConfig, getEnvVariable } = require('@csssr/e2e-tools/utils')
const { spawn, fork } = require('child_process')
const retry = require('async-retry')
const fetch = require('node-fetch')
const fs = require('fs')
const path = require('path')

function isLocalSeleniumUsed(browser) {
  const config = getConfig()
  const { browsers } = config.tools['@csssr/e2e-tools-codecept']
  const s = browsers[browser]

  return s.type === 'selenium' && s.url === 'http://localhost'
}

async function isSeleniumStarted() {
  try {
    const res = await fetch('http://localhost:4444')
    const data = await res.text()

    if (data.includes('Selenium Grid')) return true
  } catch (err) {
    return false
  }

  console.error('Port 4444 already taken, stop process using it')
  process.exit()
}

function win(seleniumPath) {
  fs.copyFileSync(
    path.join(__dirname, 'local-selenium-scripts', 'win.ps1'),
    path.join(seleniumPath, 'win.ps1')
  )

  spawn('powershell.exe', [
    '-Command',
    'Start-Process',
    'powershell',
    '-Verb',
    'RunAs',
    '-ArgumentList',
    `'-ExecutionPolicy Bypass cd ${seleniumPath};./win.ps1;'`,
  ])
}

function mac(seleniumPath) {
  fs.copyFileSync(
    path.join(__dirname, 'local-selenium-scripts', 'mac.sh'),
    path.join(seleniumPath, 'mac.sh')
  )

  const ch = spawn('./mac.sh', {
    cwd: seleniumPath,
    shell: true,
    detached: true,
    stdio: 'ignore',
  })
  ch.unref()
}

async function startSelenium() {
  const path = getEnvVariable('LOCAL_SELENIUM_PATH', 'Path to local selenium')

  if (!fs.existsSync(path)) {
    fs.mkdirSync(path)
  }

  switch (os.platform()) {
    case 'win32':
      win(path)
      break
    case 'darwin':
      mac(path)
      break
    default:
      console.error(`Local selenium on platform ${os.platform()} is not supported`)
      process.exit()
  }

  await retry(
    async () => {
      if (await isSeleniumStarted()) return true

      throw new Error('not up')
    },
    { retries: 180, factor: 1 }
  )
}

async function localSelenium(browser) {
  if (!isLocalSeleniumUsed(browser)) return

  if (await isSeleniumStarted()) return

  await startSelenium()
}

module.exports = { localSelenium }
