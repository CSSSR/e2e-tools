/* eslint-disable @typescript-eslint/camelcase */
const path = require('path')
const isCI = require('is-ci')
const chromedriver = require('chromedriver')
const geckodriver = require('geckodriver')
const nightwatchImageComparison = require('@nitive/nightwatch-image-comparison')
const packageName = require('./package.json').name
const mochawesome = require('mochawesome')
const { getTestsRootDir, getConfig, getEnvVariable } = require('@csssr/e2e-tools/utils')
const { argv } = require('yargs')

process.chdir(getTestsRootDir())
const config = getConfig()

// Пути на Windows отпределяются неправильно, эта функция фиксит ихЊ
function getDriverPath({ executableName, executablePath }) {
  const nodeModulesPath = executablePath.replace(/(node_modules).*/, '$1')
  const unixPath = path.join(nodeModulesPath, `.bin/${executableName}`)
  return process.platform === 'win32' ? `${unixPath}.cmd` : unixPath
}

function removeEndingSlash(url) {
  return url.replace(/\/$/, '')
}

function getWebdriverOptions(settings, browserKeyName) {
  const { browserName } = (settings || {}).desiredCapabilities || {}

  if (!browserName) {
    throw new Error(
      `Не найдено имя браузера в конфигурации браузера (browsers.${browserKeyName}.desiredCapabilities.browserName)`
    )
  }

  switch (browserName.toLowerCase()) {
    case 'chrome':
      return {
        start_process: true,
        server_path: getDriverPath({
          executableName: 'chromedriver',
          executablePath: chromedriver.path,
        }),
        port: 9515,
      }

    case 'firefox':
      return {
        start_process: true,
        server_path: getDriverPath({
          executableName: 'geckodriver',
          executablePath: geckodriver.path,
        }),
        port: 4444,
      }

    default:
      throw new Error(
        `Невалидное имя браузера ${browserName} для локального запуска. Валидные значения: chrome и firefox.` +
          'Исправьте desiredCapabilities.browserName в e2e-config.json'
      )
  }
}

function getTestSettingsForBrowser(browser, browserName) {
  const { type, ...settings } = browser

  switch (type) {
    case 'webdriver': {
      return {
        webdriver: getWebdriverOptions(settings, browserName),
        ...settings,
      }
    }

    case 'selenium': {
      const { host, port = 80, basicAuth, ...rest } = settings
      const serverName = `${host}${port !== 80 ? `:${port}` : ''}`

      return {
        selenium_port: port,
        selenium_host: host,
        username: basicAuth && getEnvVariable(basicAuth.username_env, `Логин от ${serverName}`),
        access_key: basicAuth && getEnvVariable(basicAuth.password_env, `Пароль от ${serverName}`),
        ...rest,
      }
    }
  }
}

function getTestSettings(browsers) {
  const testSettings = {}

  Object.keys(browsers).forEach(browserName => {
    if (browserName !== argv.env) {
      return
    }

    const browser = browsers[browserName]
    testSettings[browserName] = getTestSettingsForBrowser(browser, browserName)
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
  const publishResults = !!(argv.publishResults && config.testrail)

  if (publishResults) {
    console.log('Test run results will be published to TestRail')

    return {
      reporter: '@nitive/mocha-testrail-reporter',
      reporterOptions: {
        mode: 'publish_ran_tests',
        domain: config.testrail.domain,
        username: getEnvVariable(config.testrail.username_env, 'TestRail логин'),
        apiToken: getEnvVariable(config.testrail.api_token_env, 'TestRail API токен'),
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
  end_session_on_fail: false,
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
  globals_path: path.join(__dirname, 'src/nightwatch-settings/globals.js'),
  custom_assertions_path: [nightwatchImageComparison.assertionsPath],
  launch_url: removeEndingSlash(getEnvVariable('LAUNCH_URL', 'Адрес, на котором запускать тесты')),
}
