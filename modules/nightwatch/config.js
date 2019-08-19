/* eslint-disable @typescript-eslint/camelcase */
const path = require('path')
const isCI = require('is-ci')
const chromedriver = require('chromedriver')
const nightwatchImageComparison = require('@nitive/nightwatch-image-comparison')
const packageName = require('./package.json').name
const mochawesome = require('mochawesome')
const { getTestsRootDir, getConfig } = require('@nitive/e2e-tools/utils')
const { argv } = require('yargs')

process.chdir(getTestsRootDir())
const config = getConfig()

const publishResults = !!(argv.publishResults && config.testrail)

if (publishResults) {
  console.log('Test run results will be published to TestRail')
}

function checkEnvVariable(variableName) {
  if (!process.env[variableName]) {
    throw new Error(
      `Не определена переменная окружения ${variableName}. Создайте файл .env в директории e2e-tests и добавьте туда ${variableName}=<value>`
    )
  }
}

checkEnvVariable('LAUNCH_URL')

if (publishResults) {
  checkEnvVariable(config.testrail.username_env)
  checkEnvVariable(config.testrail.api_token_env)
}

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

      if (basicAuth && basicAuth.username_env) {
        checkEnvVariable(basicAuth.username_env)
      }

      if (basicAuth && basicAuth.password_env) {
        checkEnvVariable(basicAuth.password_env)
      }

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

const rootDir = getTestsRootDir()

const mochawesomeReporter = {
  reporter: mochawesome,
  reporterOptions: {
    reportDir: 'nightwatch/report',
    json: false,
  },
}

const junkinsReporter = {
  reporter: require('mocha-jenkins-reporter'),
  reporterOptions: {
    junit_report_path: 'nightwatch/jenkins-report.xml',
    junit_report_name: 'Nightwatch Tests',
  },
}

function getReporter() {
  const mainReporter = isCI ? junkinsReporter : mochawesomeReporter

  if (publishResults) {
    return {
      reporter: '@nitive/mocha-testrail-reporter',
      reporterOptions: {
        mode: 'publish_ran_tests',
        domain: config.testrail.domain,
        username: process.env[config.testrail.username_env],
        apiToken: process.env[config.testrail.api_token_env],
        projectId: config.testrail.projectId,
        testsRootDir: path.join(getTestsRootDir(), 'nightwatch/tests'),
        casePrefix: 'Автотест: ',
        additionalReporter: mainReporter.reporter,
        additionalReporterOptions: mainReporter.reporterOptions,
      },
    }
  }

  return mainReporter
}

module.exports = {
  output_folder: false,
  src_folders: ['./nightwatch/tests'],
  filter: '**/*.test.js',
  globals: {
    screenshots: {
      testsRootDir: path.join(rootDir, 'nightwatch/tests'),
      screenshotsRootDir: path.join(rootDir, 'nightwatch/screenshots'),
    },
  },

  test_settings: getTestSettings(config.tools[packageName].browsers),

  test_runner: {
    type: 'mocha',
    options: {
      ui: '@nitive/mocha-testrail-ui',
      ...getReporter(),
    },
  },
  globals_path: path.join(__dirname, 'src/globals.js'),
  custom_assertions_path: [nightwatchImageComparison.assertionsPath],
  launch_url: process.env.LAUNCH_URL && removeEndingSlash(process.env.LAUNCH_URL),
}
