const path = require('path')
const {
  getConfig,
  updateToolConfig,
  initTemplate,
  getTestsRootDir,
} = require('@nitive/e2e-tools/utils')
const packageName = require('./package.json').name

/**
 * @returns {import('yargs').CommandModule}
 */
const addNightwatchRunCommand = context => {
  const config = getConfig()
  const browsersConfig = config.tools[packageName].browsers
  const defaultBrowser = Object.entries(browsersConfig).find(([_, browser]) => browser.default)[0]
  const browsers = Object.keys(browsersConfig)

  return {
    aliases: ['nightwatch', 'nw'],
    builder: {
      browser: {
        alias: 'b',
        describe: 'Browser, defined in your e2e-tools.json file',
        default: defaultBrowser,
        choices: browsers,
      },
    },
    command: 'nightwatch:run',
    describe: 'Run nightwatch',
    handler(args) {
      context.spawnSync(
        'yarn',
        [
          'env-cmd',
          'nightwatch',
          '--env',
          args.browser,
          '--config',
          require.resolve('@nitive/e2e-tools-nightwatch/config'),
        ],
        { stdio: 'inherit' }
      )
    },
  }
}

function createToolConfig() {
  return {
    browsers: {
      local_chrome: {
        default: true,
        type: 'webdriver',
        desiredCapabilities: {
          browserName: 'chrome',
          'goog:chromeOptions': {
            args: ['--window-size=1200,800'],
          },
        },
        globals: {
          skipScreenshotAssertions: true,
        },
      },
      remote_chrome: {
        type: 'selenium',
        host: 'chromedriver.csssr.ru',
        basicAuth: {
          username_env: 'CHROMEDRIVER_USERNAME',
          password_env: 'CHROMEDRIVER_PASSWORD',
        },

        desiredCapabilities: {
          browserName: 'chrome',
          'goog:chromeOptions': {
            w3c: false,
            args: ['--headless', '--disable-gpu', '--window-size=1200,800'],
          },
        },
        globals: {
          skipScreenshotAssertions: false,
        },
      },
    },
  }
}

function getCommands(context) {
  return [addNightwatchRunCommand(context)]
}

function normalizeUrl(input) {
  if (input.startsWith('http')) {
    return input
  }

  return `http://${input}`
}

async function initScript({ inquirer }) {
  const createFromTemplate = initTemplate({
    root: getTestsRootDir(),
    templatesRoot: path.join(__dirname, 'templates/e2e-tests'),
  })

  createFromTemplate({ filePath: 'nightwatch/.eslintrc.js' })
  createFromTemplate({
    filePath: 'nightwatch/tests/Примеры/Переход на страницу авторизации.test.js',
  })
  createFromTemplate({ filePath: 'nightwatch/screenshots/.gitignore' })
  createFromTemplate({ filePath: 'nightwatch/Dockerfile' })

  const jenkinsfileData = await inquirer.prompt([
    {
      type: 'input',
      name: 'defaultLaunchUrl',
      message: 'Адрес стенда по умолчанию',
    },
    // TODO: get from project's package.json
    {
      type: 'input',
      name: 'projectName',
      message: 'Название проекта',
    },
    // TODO: get from project's package.json
    {
      type: 'input',
      name: 'repoSshAddress',
      message: 'Адрес GitHub-репозитория (ssh):',
    },
  ])

  createFromTemplate({
    filePath: 'nightwatch/Jenkinsfile',
    data: {
      ...jenkinsfileData,
      defaultLaunchUrl: normalizeUrl(jenkinsfileData.defaultLaunchUrl),
    },
  })

  updateToolConfig(packageName, createToolConfig)
}

module.exports = {
  getCommands,
  initScript,
}
