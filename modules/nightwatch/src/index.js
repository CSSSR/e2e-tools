const uniqBy = require('lodash/uniqBy')
const path = require('path')
const {
  getConfig,
  updateJsonFile,
  updateToolConfig,
  getTestsRootDir,
  getParentProjectPackageJsonSafe,
  getRepoNameByAddress,
  isValidRepoSshAddress,
  validatePackageName,
  createFilesFromTemplates,
  getProjectRootDir,
  getRepoSshAddress,
} = require('@csssr/e2e-tools/utils')
const { getCommands } = require('./commands')
const packageName = require('../package.json').name

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

function normalizeUrl(input) {
  if (input.startsWith('http')) {
    return input
  }

  return `http://${input}`
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

function falseToError(error, func) {
  return str => (func(str) ? true : error)
}

async function initScript({ inquirer }) {
  const parentProjectPackageJson = getParentProjectPackageJsonSafe() || {}

  async function prompt(question) {
    const answers = await inquirer.prompt([question])

    return answers[question.name]
  }
  const config = getConfig()

  const launchUrl = await prompt({
    type: 'input',
    name: 'launchUrl',
    default: config.defaultLaunchUrl,
    message: 'Адрес стенда по умолчанию',
  })

  const repositorySshAddress = await prompt({
    type: 'input',
    name: 'repositorySshAddress',
    default: config.repositorySshAddress || getRepoSshAddress(parentProjectPackageJson.repository),
    message: 'Адрес GitHub-репозитория (ssh):',
    validate: falseToError('Невалидный адрес репозитория', isValidRepoSshAddress),
  })

  const projectName = await prompt({
    type: 'input',
    name: 'projectName',
    default:
      config.projectName ||
      parentProjectPackageJson.name ||
      getRepoNameByAddress(repositorySshAddress),
    message: 'Название проекта (маленькими буквами без пробелов)',
    validate: falseToError('Навалидное название пакета', validatePackageName),
  })

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