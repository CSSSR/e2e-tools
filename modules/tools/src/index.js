const fs = require('fs')
const path = require('path')
const spawn = require('cross-spawn')
const {
  getTestsRootDir,
  getProjectRootDir,
  createJsonFile,
  updateJsonFile,
  getConfigSafe,
  initTemplate,
} = require('./utils')

const createFromTemplate = initTemplate({
  root: 'e2e-tests',
  templatesRoot: path.join(__dirname, '../templates'),
})

const initCommand = ({ config }) => ({
  command: 'init',
  describe: 'Setup tests in current project',
  handler() {
    if (fs.existsSync('e2e-tests')) {
      throw new Error('Already inited')
    }

    createFromTemplate({ filePath: '.gitignore' })
    createFromTemplate({
      filePath: 'package.json',
      data: { toolsVersion: config.version },
    })

    createFromTemplate({ filePath: '.eslintrc.js' })
    createFromTemplate({ filePath: '.eslintignore' })

    createJsonFile({ filePath: 'e2e-tests/e2e-tools.json', fileContent: {} })

    spawn.sync('yarn', ['install'], {
      stdio: 'inherit',
      cwd: getTestsRootDir(),
    })
  },
})

const addToolCommand = context => ({
  command: 'add-tool <package-name>',
  describe: 'Add new tool',
  handler({ packageName }) {
    updateJsonFile({
      filePath: 'e2e-tests/e2e-tools.json',
      update(config) {
        return {
          ...config,
          tools: {
            ...config.tools,
            [packageName]: true,
          },
        }
      },
    })

    updateJsonFile({
      filePath: 'e2e-tests/package.json',
      update(packageJson) {
        return {
          ...packageJson,
          devDependencies: {
            ...packageJson.devDependencies,
            [packageName]: '*',
          },
        }
      },
    })

    const tool = require(packageName)

    spawn.sync('yarn', ['install'], {
      stdio: 'inherit',
      cwd: getTestsRootDir(),
    })

    tool.initScript(context)
  },
})

exports.main = context => {
  process.chdir(getProjectRootDir())
  const config = getConfigSafe()

  context.yargs.command(initCommand(context)).command(addToolCommand(context))

  if (config && config.tools) {
    Object.keys(config.tools).forEach(toolName => {
      const tool = require(toolName)
      if (typeof tool.getCommands === 'function') {
        tool.getCommands(context).forEach(command => {
          context.yargs.command(command)
        })
      }
    })
  }

  context.yargs.demandCommand().help().argv
}
