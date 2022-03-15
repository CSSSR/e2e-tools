const { getConfig, getSeleniumBasicAuthEnv, getEnvVariable } = require('@csssr/e2e-tools/utils')

const config = getConfig()

function getLaunchUrl() {
  const url = getEnvVariable('LAUNCH_URL', 'Launch URL')
  return url.endsWith('/') ? url.slice(0, -1) : url
}

function getBasicAuthAuthorizationHeader(browserName, browserConfig) {
  const { url, seleniumBasicAuth: sba } = browserConfig
  const username = getSeleniumBasicAuthEnv(browserName, sba.username_env, `Login for ${url}`)
  const password = getSeleniumBasicAuthEnv(browserName, sba.password_env, `Password for ${url}`)
  return `Basic ${Buffer.from(`${username}:${password}`, 'utf-8').toString('base64')}`
}

function getBrowser(browserName, browserConfig) {
  const { type, default: isDefault, remote, url, seleniumBasicAuth, ...settings } = browserConfig

  switch (type) {
    case 'playwright': {
      return {
        Playwright: {
          url: getLaunchUrl(),
          ...settings,
        },
      }
    }

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
          ...settings,
        },
        ...helpers,
      }
    }

    case 'testcafe': {
      return {
        TestCafe: {
          url: getLaunchUrl(),
          waitForTimeout: 3000,
          ...settings,
        },
        ...helpers,
      }
    }

    default:
      throw new Error(`Unexpected browser type ${type}`)
  }
}

const { browsers, helpers } = config.tools['@csssr/e2e-tools-codecept']

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
  helpers: getBrowser(browserName, browsers[browserName]),

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
    screenshotOnFail: {
      enabled: true,
    },
    allure: {
      enabled: !!process.env.ENABLE_ALLURE_REPORT,
      outputDir: './codecept/report/allure-reports',
      enableScreenshotDiffPlugin: true,
    },
  },

  include: {
    url: { launchUrl: getLaunchUrl() },
  },
}
