const path = require('path')
const {
  getConfig,
  updateToolConfig,
  createFilesFromTemplates,
  getProjectRootDir,
  addAnyProjectFields,
} = require('@csssr/e2e-tools/utils')
const { updateVsCodeConfig } = require('@csssr/e2e-tools/vscode')
const packageName = require('./package.json').name
const { getCommands } = require('./src/commands')

function createToolConfig() {
  return {
    browsers: {
      local_chrome: {
        default: true,
        type: 'selenium',

        url: 'http://localhost',
        port: 4444,

        browser: 'chrome',
        windowSize: '1920x1680',
        desiredCapabilities: {
          'goog:chromeOptions': {
            args: ['--no-sandbox', '--disable-gpu', '--window-size=1200,800'],
          },
        },
      },
      local_firefox: {
        type: 'selenium',

        url: 'http://localhost',
        port: 4444,

        browser: 'firefox',
        windowSize: '1920x1680',
        desiredCapabilities: {
          browserName: 'firefox',
          'moz:firefoxOptions': {
            args: ['--window-size=1200,800'],
          },
        },
      },
      remote_chrome: {
        remote: true,
        type: 'selenium',

        url: 'https://selenium.csssr.cloud',
        seleniumBasicAuth: {
          credentialsId: 'selenium',
          username_env: 'SELENIUM_USERNAME',
          password_env: 'SELENIUM_PASSWORD',
        },

        browser: 'chrome',
        windowSize: '1920x1680',
        desiredCapabilities: {
          'goog:chromeOptions': {
            args: ['--headless', '--no-sandbox', '--disable-gpu', '--window-size=1200,800'],
          },
        },
      },
    },
    githubActions: {
      enabled: true,
    },
  }
}

const vscodeSettings = {
  frameworkName: 'CodeceptJS',
  runCommand: 'codecept:run',
}

async function initScript(ctx) {
  await addAnyProjectFields(ctx, {
    templatesRoot: path.join(__dirname, 'templates'),
  })

  updateVsCodeConfig(vscodeSettings)
  updateToolConfig(packageName, createToolConfig)
}

function upgrade() {
  updateVsCodeConfig(vscodeSettings)
  createFilesFromTemplates({
    templatesGlob: '**/*.autogenerated.hbs',
    templatesData: { config: getConfig() },
    templatesRoot: path.join(__dirname, 'templates'),
    destinationRoot: getProjectRootDir(),
  })
}

module.exports = {
  getCommands,
  initScript,
  upgrade,
}
