/* eslint-disable @typescript-eslint/camelcase */
const fs = require('fs')
const path = require('path')
const chromedriver = require('chromedriver')
const nightwatchImageComparison = require('@nitive/nightwatch-image-comparison')
const packageName = require('./package.json').name

const config = JSON.parse(fs.readFileSync('./e2e-tools.json', { encoding: 'utf-8' }))

function getChromeDriverPath() {
  const nodeModulesPath = chromedriver.path.replace(/(node_modules).*/, '$1')
  const unixPath = path.join(nodeModulesPath, '.bin/chromedriver')
  return process.platform === 'win32' ? `${unixPath}.cmd` : unixPath
}

function removeEndingSlash(url) {
  return url.replace(/\/$/, '')
}

function getTestSettingsForBrowser(browser) {
  const { type, ...settings } = browser

  switch (type) {
    case 'webdriver': {
      return {
        webdriver: {
          start_process: true,
          server_path: getChromeDriverPath(),
          port: 9515,
        },
        ...settings,
      }
    }

    case 'selenium': {
      const { host, port = 80, basicAuth, ...rest } = settings

      return {
        selenium_port: port,
        selenium_host: host,
        username: basicAuth && process.env[basicAuth.username_env],
        access_key: basicAuth && process.env[basicAuth.password_env],
        ...rest,
      }
    }
  }
}

function getTestSettings(browsers) {
  const testSettings = {}

  Object.keys(browsers).forEach(browserName => {
    const browser = browsers[browserName]
    testSettings[browserName] = getTestSettingsForBrowser(browser)
  })

  return testSettings
}

module.exports = {
  output_folder: false,
  src_folders: ['./nightwatch/tests'],
  filter: '**/*.test.js',
  globals: {
    screenshots: {
      testsRootDir: path.join(__dirname, 'nightwatch/tests'),
      screenshotsRootDir: path.join(__dirname, 'nightwatch/screenshots'),
    },
  },

  test_settings: getTestSettings(config.tools[packageName].browsers),

  test_runner: {
    type: 'mocha',
    options: {
      ui: '@nitive/mocha-testrail-ui',
      bail: true,

      reporter: 'mochawesome',
      reporterOptions: {
        reportDir: 'nightwatch/report',
        json: false,
      },
    },
  },
  globals_path: path.join(__dirname, 'globals.js'),
  custom_assertions_path: [nightwatchImageComparison.assertionsPath],
  launch_url: process.env.LAUNCH_URL && removeEndingSlash(process.env.LAUNCH_URL),
}
