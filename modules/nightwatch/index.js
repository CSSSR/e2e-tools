const uniqBy = require('lodash/uniqBy')
const path = require('path')
const isCI = require('is-ci')
const {
  getConfig,
  updateJsonFile,
  updateToolConfig,
  getTestsRootDir,
  getParentProjectPackageJsonSafe,
  getRepoNameByAddress,
  validateRepoAddress,
  validatePackageName,
  createFilesFromTemplates,
  getProjectRootDir,
} = require('@csssr/e2e-tools/utils')
const packageName = require('./package.json').name

function createArgsArrayFromMap(argsMap) {
  return Object.keys(argsMap)
    .map(arg => {
      const value = argsMap[arg]
      return value ? [`--${arg}`, value] : []
    })
    .reduce((acc, x) => acc.concat(x), [])
}

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
      test: {
        describe: 'Test file',
      },
      publishResults: {
        boolean: true,
        default: isCI,
        describe:
          'Publish test run results to TestRail. This option is on by default in most popular CI environments',
      },
    },
    command: 'nightwatch:run',
    describe: 'Run nightwatch',
    handler(args) {
      context.spawnSync('yarn', ['install', '--frozen-lockfile'], { stdio: 'inherit' })

      const result = context.spawnSync(
        'yarn',
        [
          'nightwatch',
          ...createArgsArrayFromMap({
            env: args.browser,
            test: args.test,
            config: require.resolve('@csssr/e2e-tools-nightwatch/config'),
            publishResults: args.publishResults,
          }),
        ],
        { stdio: 'inherit' }
      )

      if (result.status) {
        process.exit(result.status)
      }
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

function getDefaultRepoSshAddress(packageJson) {
  if (packageJson.repository) {
    if (typeof packageJson.repository === 'string') {
      return packageJson.repository
    }

    if (typeof packageJson.repository.url === 'string') {
      return packageJson.repository.url
    }
  }

  return undefined
}

function updateVsCodeTasks() {
  updateJsonFile({
    filePath: path.join(getTestsRootDir(), '.vscode/tasks.json'),
    update(config) {
      return {
        ...config,
        tasks: uniqBy(
          [
            ...config.tasks,
            {
              type: 'shell',
              label: 'Nightwatch: запустить текущий файл в Chrome локально',
              command: "yarn et nightwatch:run --browser local_chrome --test='${file}'",
              problemMatcher: [],
              presentation: {
                showReuseMessage: false,
              },
              group: 'build',
            },
            {
              type: 'shell',
              label: 'Nightwatch: запустить текущий файл в Chrome на удалённом сервере',
              command: "yarn et nightwatch:run --browser remote_chrome --test='${file}'",
              problemMatcher: [],
              presentation: {
                showReuseMessage: false,
              },
              group: 'build',
            },
            {
              type: 'shell',
              label: 'Nightwatch: запустить все тесты в Chrome на удалённом сервере',
              command: 'yarn et nightwatch:run --browser remote_chrome',
              problemMatcher: [],
              presentation: { showReuseMessage: false },
              group: 'build',
            },
            {
              type: 'shell',
              label: 'Nightwatch: Открыть HTML отчёт о последнем прогоне',
              command: 'open nightwatch/report/mochawesome.html',
              windows: {
                command: 'explorer nightwatch/report\\mochawesome.html',
              },
              problemMatcher: [],
              group: 'build',
            },
            {
              type: 'shell',
              label: 'Обновить @csssr/e2e-tools',
              command: 'yarn et upgrade',
              problemMatcher: [],
              group: 'build',
            },
          ],
          task => task.label
        ),
      }
    },
  })
}

async function initScript({ inquirer }) {
  const parentProjectPackageJson = getParentProjectPackageJsonSafe() || {}

  async function prompt(question) {
    const answers = await inquirer.prompt([question])

    return answers[question.name]
  }
  const config = getConfig()

  const launchUrl =
    config.defaultLaunchUrl ||
    (await prompt({
      type: 'input',
      name: 'launchUrl',
      message: 'Адрес стенда по умолчанию',
    }))

  const repositorySshAddress =
    config.repositorySshAddress ||
    (await prompt({
      type: 'input',
      name: 'repositorySshAddress',
      default: getDefaultRepoSshAddress(parentProjectPackageJson),
      message: 'Адрес GitHub-репозитория (ssh):',
      validate: validateRepoAddress,
    }))

  const projectName =
    config.projectName ||
    (await prompt({
      type: 'input',
      name: 'projectName',
      default: parentProjectPackageJson.name || getRepoNameByAddress(repositorySshAddress),
      message: 'Название проекта (маленькими буквами без пробелов)',
      validate: validatePackageName,
    }))

  const configNewFields = {
    projectName,
    repositorySshAddress,
    defaultLaunchUrl: normalizeUrl(launchUrl),
  }

  updateJsonFile({
    filePath: path.join(getTestsRootDir(), 'e2e-tools.json'),
    update(prevConfig) {
      return {
        ...prevConfig,
        ...configNewFields,
      }
    },
  })

  createFilesFromTemplates({
    templatesGlob: '**/*.hbs',
    templatesData: {
      config: { ...config, ...configNewFields },
    },
    templatesRoot: path.join(__dirname, 'templates'),
    destinationRoot: getProjectRootDir(),
  })

  updateToolConfig(packageName, createToolConfig)

  updateVsCodeTasks()
}

function upgrade() {
  createFilesFromTemplates({
    templatesGlob: '**/*.autogenerated.hbs',
    templatesData: { config: getConfig() },
    templatesRoot: path.join(__dirname, 'templates'),
    destinationRoot: getProjectRootDir(),
  })

  updateVsCodeTasks()
}

module.exports = {
  getCommands,
  initScript,
  upgrade,
}
