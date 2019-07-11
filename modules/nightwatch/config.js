/* eslint-disable @typescript-eslint/camelcase */
const fs = require('fs')
const path = require('path')
const nightwatchImageComparison = require('@nitive/nightwatch-image-comparison')

const assert = require('assert')
const { argv } = require('yargs')

const config = JSON.parse(fs.readFileSync('./e2e-tools.json', { encoding: 'utf-8' }))

console.log(argv)
const env = argv.env

if (env === 'remoteChrome') {
  assert(process.env.CHROMEDRIVER_ACCESS_KEY, 'Set CHROMEDRIVER_ACCESS_KEY to run Nightwatch tests')
}

if (env === 'remoteIE') {
  assert(process.env.IEDRIVER_ACCESS_KEY, 'Set IEDRIVER_ACCESS_KEY to run Nightwatch tests')
}

function getChromeDriverPath() {
  const unixPath = path.resolve('./node_modules/.bin/chromedriver')
  return process.platform === 'win32' ? `${unixPath}.cmd` : unixPath
}

function removeEndingSlash(url) {
  return url.replace(/\/$/, '')
}

/**
 * @typedef {import('nightwatch').NightwatchTestSettingScreenshots & { webdriver: any }} TestSetting
 *
 * @typedef {import('nightwatch').NightwatchDesiredCapabilities} DesiredCapabilities
 *
 * @typedef {import('nightwatch').NightwatchGlobals & {
 *   skipScreenshotAssertions: boolean,
 * }} Globals
 *
 * @typedef {TestSetting & {
 *   type: 'webdriver',
 *   desiredCapabilities: DesiredCapabilities,
 *   globals?: Globals,
 * }} WebdriverBrowser
 *
 * @typedef {TestSetting & {
 *   type: 'selenium',
 *   host: string,
 *   port?: number,
 *   desiredCapabilities: DesiredCapabilities,
 *   globals?: Globals,
 * }} SeleniumBrowser
 *
 * @typedef {WebdriverBrowser | SeleniumBrowser} Browser
 */

/**
 * @param {Browser} browser
 * @returns {TestSetting}
 */
function getTestSettingsForBrowser(browser) {
  switch (browser.type) {
    case 'webdriver': {
      const { type, ...rest } = browser
      return {
        webdriver: {
          start_process: true,
          server_path: getChromeDriverPath(),
          port: 9515,
        },
        ...rest,
      }
    }
  }
}

/**
 * @param {{ [key: string]: Browser }} browsers
 * @returns {import('nightwatch').NightwatchTestSettings}
 */
function getTestSettings(browsers) {
  /** @type {import('nightwatch').NightwatchTestSettings} */
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

  webdriver: {
    start_process: true,
    server_path: getChromeDriverPath(),
    port: 9515,
  },

  test_settings: getTestSettings(config.nightwatch.browsers),

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
  launch_url: removeEndingSlash(process.env.LAUNCH_URL || 'http://arm.csssr.ru'),
}
