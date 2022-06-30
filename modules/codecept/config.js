const { getConfig, getSeleniumBasicAuthEnv, getEnvVariable } = require('@csssr/e2e-tools/utils')

const config = getConfig()

function getLaunchUrl() {
  const url = getEnvVariable('LAUNCH_URL', 'Launch URL')
  return url.endsWith('/') ? url.slice(0, -1) : url
}

function getBasicAuthAuthorizationHeader(browserName, browserConfig) {
  const { url, seleniumBasicAuth: sba } = browserConfig
  if (!sba) return

  const username = getSeleniumBasicAuthEnv(browserName, sba.username_env, `Login for ${url}`)
  const password = getSeleniumBasicAuthEnv(browserName, sba.password_env, `Password for ${url}`)
  return `Basic ${Buffer.from(`${username}:${password}`, 'utf-8').toString('base64')}`
}

function getBrowser(browserName, browserConfig) {
  const {
    type,
    default: isDefault,
    remote,
    url,
    seleniumBasicAuth,
    desiredCapabilities,
    ...settings
  } = browserConfig

  switch (type) {
    case 'puppeteer': {
      return {
        Puppeteer: {
          url: getLaunchUrl(),
          ...settings,
        },
      }
    }

    case 'selenium': {
      if (!url) {
        throw new Error(`Selenium url is not specified for browser ${browserName}`)
      }

      if (
        desiredCapabilities.browserName === 'firefox' &&
        url === 'http://localhost' &&
        process.platform === 'win32'
      ) {
        desiredCapabilities['moz:firefoxOptions'].binary = getEnvVariable(
          'FIREFOX_BINARY',
          'Path to firefox binary'
        )
      }

      const u = new URL(url)
      return {
        WebDriver: {
          url: getLaunchUrl(),
          host: u.host,
          port: Number(u.port || (u.protocol === 'https:' ? 443 : 80)),
          protocol: u.protocol.slice(0, -1),
          headers: {
            Authorization: getBasicAuthAuthorizationHeader(browserName, browserConfig),
          },
          uniqueScreenshotNames: true,
          waitForTimeout: 15000,
          smartWait: 5000,
          desiredCapabilities,
          ...settings,
        },
        ...helpers,
      }
    }

    default:
      throw new Error(`Unexpected browser type ${type}`)
  }
}

const { browsers, helpers, plugins } = config.tools['@csssr/e2e-tools-codecept']

function getBrowserName() {
  if (process.env.BROWSER) {
    return process.env.BROWSER
  }

  for (const browserName of Object.keys(browsers)) {
    if (browsers[browserName].default) {
      return browserName
    }
  }
}

const browserName = getBrowserName()

exports.config = {
  tests: './tests/**/*.test.js',
  output: './report',
  helpers: {
    ...getBrowser(browserName, browsers[browserName]),
    ...{
      TestPlan: {
        require: '@csssr/e2e-tools-codecept/src/helpers/testplan',
      },
      ChaiWrapper: {
        require: 'codeceptjs-chai',
      },
      ResembleHelper: {
        require: 'codeceptjs-resemblehelper',
        screenshotFolder: './report/',
        baseFolder: './base/',
        diffFolder: './report/diff/',
      },
    },
  },
  bootstrap: null,
  mocha: {},
  name: 'e2e-tests',
  plugins: {
    pauseOnFail: {},
    retryFailedStep: {
      enabled: true,
    },
    tryTo: {
      enabled: true,
    },
    retryTo: {
      enabled: true,
    },
    screenshotOnFail: {
      enabled: true,
    },
    allure: {
      enabled: true,
      outputDir: './codecept/report/allure-reports',
      enableScreenshotDiffPlugin: true,
    },
    ...plugins,
  },

  include: {
    url: { launchUrl: getLaunchUrl() },
  },
}
