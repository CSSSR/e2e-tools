/* eslint-disable @typescript-eslint/camelcase */
const ci = require('ci-info')

const disableColors = ci.JENKINS
const forceColors = ci.GITHUB_ACTIONS

if (disableColors) {
  process.env.FORCE_COLOR = '0'
}

if (forceColors) {
  process.env.FORCE_COLOR = '1'
}

const url = require('url')
const path = require('path')
const chromedriver = require('chromedriver')
const geckodriver = require('geckodriver')
const nightwatchImageComparison = require('@csssr/nightwatch-image-comparison')
const nightwatchLocalFileUpload = require('@csssr/nightwatch-local-file-upload')
const packageName = require('./package.json').name
const mochawesome = require('mochawesome')
const { getTestsRootDir, getConfig, getEnvVariable } = require('@csssr/e2e-tools/utils')
const { argv } = require('yargs')

process.chdir(getTestsRootDir())
const config = getConfig()

function removeEndingSlash(url) {
  return url.replace(/\/$/, '')
}

function boolArg(value) {
  if (value === true || value === 'true') {
    return true
  }

  if (value === 'false') {
    return false
  }

  return undefined
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
        server_path: chromedriver.path,
        port: 9515,
      }

    case 'firefox':
      return {
        start_process: true,
        server_path: geckodriver.path,
        port: 4444,
      }

    default:
      throw new Error(
        `Невалидное имя браузера ${browserName} для локального запуска. Валидные значения: chrome и firefox.` +
          'Исправьте desiredCapabilities.browserName в e2e-config.json'
      )
  }
}

function parseUrl(settings) {
  if ((settings.host || settings.port) && settings.url) {
    throw new Error('Конфликтующие параметры url, host и port')
  }

  const parsed = settings.url && url.parse(settings.url)
  const host = settings.host || (parsed && parsed.hostname)
  const port = Number(
    settings.port || (parsed && parsed.port) || (parsed && parsed.protocol === 'https:' ? 443 : 80)
  )
  const useSsl =
    typeof settings.useSsl === 'boolean'
      ? settings.useSsl
      : port === 443 || (parsed && parsed.protocol === 'https:')
  return { host, port, useSsl }
}

function getTestSettingsForBrowser(browser, browserName) {
  const { type, ...settings } = browser

  if (settings.globals === undefined) {
    settings.globals = {}
  }

  if (typeof boolArg(argv.checkScreenshots) === 'boolean') {
    settings.globals.skipScreenshotAssertions = !boolArg(argv.checkScreenshots)
  }

  switch (type) {
    case 'webdriver': {
      return {
        webdriver: getWebdriverOptions(settings, browserName),
        ...settings,
      }
    }

    case 'selenium': {
      const { basicAuth, ...rest } = settings
      const { host, port, useSsl } = parseUrl(settings)
      const isDefaultPort = [80, 443].includes(port)
      const serverName = `${host}${!isDefaultPort ? `:${port}` : ''}`

      return {
        selenium: { port, host },
        useSsl,
        username: basicAuth && getEnvVariable(basicAuth.username_env, `Логин от ${serverName}`),
        access_key: basicAuth && getEnvVariable(basicAuth.password_env, `Пароль от ${serverName}`),
        ...rest,
      }
    }

    case 'browserstack': {
      return {
        selenium: {
          host: 'hub-cloud.browserstack.com',
          port: 443,
        },
        desiredCapabilities: {
          'browserstack.user': getEnvVariable('BROWSERSTACK_USER', `Browserstack username`),
          'browserstack.key': getEnvVariable('BROWSERSTACK_KEY', `Browserstack access key`),
          project: config.projectName,
          build: new Date().toLocaleString('ru', {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
          }),
          ...(settings.desiredCapabilities || {}),
        },

        disable_error_log: true,
        webdriver: {
          keep_alive: true,
          start_process: false,
        },
      }
    }
  }
}

function getTestSettings(browsers) {
  const testSettings = {}

  Object.keys(browsers).forEach((browserName) => {
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

const jenkinsReporter = {
  reporter: require('@csssr/mocha-jenkins-reporter'),
  reporterOptions: {
    junit_report_path: 'nightwatch/jenkins-report.xml',
    junit_report_name: 'Nightwatch Tests',
  },
}

function getReporter() {
  return ci.isCI ? jenkinsReporter : mochawesomeReporter
}

module.exports = {
  end_session_on_fail: false,
  disable_colors: disableColors,
  output_folder: false,
  src_folders: ['./nightwatch/tests'],
  filter: argv.test || '**/*.test.js',
  globals: {
    abortOnElementLocateError: true,
    screenshots: {
      testsRootDir: path.join(rootDir, 'nightwatch/tests'),
      screenshotsRootDir: path.join(rootDir, 'nightwatch/screenshots'),
    },
  },

  test_settings: getTestSettings(config.tools[packageName].browsers),

  test_runner: {
    type: 'mocha',
    options: {
      ui: '@csssr/mocha-testrail-ui',
      ...getReporter(),
    },
  },
  globals_path: path.join(__dirname, 'src/nightwatch-settings/globals.js'),
  custom_commands_path: [nightwatchLocalFileUpload.commandsPath],
  custom_assertions_path: [nightwatchImageComparison.assertionsPath],
  launch_url: removeEndingSlash(getEnvVariable('LAUNCH_URL', 'Адрес, на котором запускать тесты')),
}
