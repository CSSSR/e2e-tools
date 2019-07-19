const path = require('path')
const realFs = require('fs')
const prettier = require('prettier')
const { compile } = require('handlebars')

const getTestsRootDir = () => {
  return path.join(process.cwd(), 'e2e-tests').replace('e2e-tests/e2e-tests', 'e2e-tests')
}
const getConfig = () => {
  try {
    const configFile = realFs.readFileSync(path.join(getTestsRootDir(), 'e2e-tools.json'), {
      encoding: 'utf-8',
    })

    return JSON.parse(configFile)
  } catch (err) {
    if (err && err.code === 'ENOENT') {
      throw new Error(`Config file ${err.path} was not found`)
    }

    throw err
  }
}
const isTest = true

/**
 * @typedef {'mkdirSync' | 'statSync' | 'writeFileSync' | 'readFileSync' | 'existsSync'} UsedFsMethods
 * @typedef {Pick<typeof import('fs'), UsedFsMethods>} FileSystem
 *
 * @typedef {{
 *   fs: FileSystem,
 *   yargs: typeof import('yargs'),
 *   spawnSync: typeof import('child_process').spawnSync
 *   config: { version: string }
 * }} Context
 *
 * @typedef {import('yargs').CommandModule} Command
 */

/**
 *
 * @param {string} pathToFile Path to destination file
 * @param {{ fs: FileSystem }} options
 * @param {object=} templateContext
 */
function createWithTemplate(pathToFile, { fs }, templateContext) {
  fs.mkdirSync(path.dirname(pathToFile), { recursive: true })

  const pathToTemplate = path.join(__dirname, '../templates', pathToFile + '.hbs')
  const render = compile(realFs.readFileSync(pathToTemplate, { encoding: 'utf8' }))

  fs.writeFileSync(pathToFile, render(templateContext))
}

function createJsonFile({ fs, filePath, fileContent }) {
  const formattedContent = prettier.format(JSON.stringify(fileContent), { parser: 'json' })
  fs.writeFileSync(filePath, formattedContent)
}

function updateJsonFile({ fs, filePath, update }) {
  const file = fs.readFileSync(filePath, { encoding: 'utf-8' })
  const fileContent = JSON.parse(file)
  createJsonFile({ fs, filePath, fileContent: update(fileContent) })
}

/**
 * @param {Context} context
 */
const initCommand = ({ fs, spawnSync, config }) => ({
  command: 'init',
  describe: 'Setup tests in current project',
  handler() {
    createWithTemplate('e2e-tests/.gitignore', { fs })
    createWithTemplate('e2e-tests/package.json', { fs }, { toolsVersion: config.version })

    createWithTemplate('e2e-tests/.eslintrc.js', { fs })
    createWithTemplate('e2e-tests/.eslintignore', { fs })

    createJsonFile({ fs, filePath: 'e2e-tests/e2e-tools.json', fileContent: {} })

    spawnSync('yarn', ['install'], {
      stdio: 'inherit',
      cwd: getTestsRootDir(),
    })
  },
})

/**
 * @param {Context} context
 * @returns {Command}
 */
const addNightwatchCommand = ({ fs, spawnSync }) => ({
  command: 'nightwatch:add',
  describe: 'Setup nightwatch and add test example',
  handler() {
    createWithTemplate('e2e-tests/.env', { fs })
    createWithTemplate('e2e-tests/nightwatch/.eslintrc.js', { fs })

    createWithTemplate(
      'e2e-tests/nightwatch/tests/Примеры/Переход на страницу авторизации.test.js',
      { fs }
    )

    createWithTemplate('e2e-tests/nightwatch/screenshots/.gitignore', { fs })
    spawnSync('yarn', ['add', '--dev', `@csssr/e2e-tools-nightwatch`], {
      stdio: 'inherit',
      cwd: getTestsRootDir(),
    })

    updateJsonFile({
      fs,
      filePath: 'e2e-tests/e2e-tools.json',
      update(config) {
        return {
          ...config,
          nightwatch: {
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
              // remote_chrome: {
              //   type: 'selenium',
              //   host: 'chromedriver.csssr.ru',
              //   basicAuth: {
              //     username_env: 'CHROMEDRIVER_BASIC_AUTH_USERNAME',
              //     password_env: 'CHROMEDRIVER_BASIC_AUTH_PASSWORD',
              //   },

              //   desiredCapabilities: {
              //     browserName: 'chrome',
              //     'goog:chromeOptions': {
              //       w3c: false,
              //       args: ['--headless', '--disable-gpu', '--window-size=1200,800'],
              //     },
              //   },
              //   globals: {
              //     skipScreenshotAssertions: false,
              //   },
              // },
            },
          },
        }
      },
    })
  },
})

/**
 * @param {Context} context
 * @returns {Command}
 */
const addNightwatchRunCommand = context => {
  const config = getConfig()
  const defaultBrowser = Object.entries(config.nightwatch.browsers).find(
    ([browserName, browser]) => browser.default
  )[0]
  const browsers = Object.keys(config.nightwatch.browsers)

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
          require.resolve('@csssr/e2e-tools-nightwatch/config'),
        ],
        { stdio: 'inherit' }
      )
    },
  }
}

/**
 * @param {Context} context
 */
exports.main = context => {
  context.yargs.command(initCommand(context)).command(addNightwatchCommand(context))

  const isNightwatchInited = context.fs.existsSync('nightwatch')
  if (isNightwatchInited) {
    context.yargs.command(addNightwatchRunCommand(context))
  }

  context.yargs.demandCommand().help().argv
}
