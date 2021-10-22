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
        type: 'playwright',
        show: true,
        browser: 'chromium',
      },
      local_firefox: {
        type: 'playwright',
        browser: 'firefox',
        show: true,
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
      testcafe_remote_chrome: {
        type: 'testcafe',
        browser: '@csssr/csssr:remote-chrome:chrome',
        browserServer: 'k8s',
      },
      testcafe_remote_firefox: {
        type: 'testcafe',
        browser: '@csssr/csssr:remote-firefox:firefox',
        browserServer: 'k8s',
      },
      testcafe_macmini_safari: {
        type: 'testcafe',
        browser: '@csssr/csssr:macmini:safari',
        browserServer: 'ssh',
      },
      testcafe_macmini_chrome: {
        type: 'testcafe',
        browser: '@csssr/csssr:macmini:chrome',
        browserServer: 'ssh',
      },
      testcafe_macmini_firefox: {
        type: 'testcafe',
        browser: '@csssr/csssr:macmini:firefox',
        browserServer: 'ssh',
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
