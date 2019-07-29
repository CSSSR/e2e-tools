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

const initCommand = ({ config }) => ({
  command: 'init',
  describe: 'Setup tests in current project',
  handler() {
    if (path.basename(process.cwd()) === 'e2e-tests') {
      throw new Error('Already inited')
    }
    const root = getProjectRootDir()

    const createFromTemplate = initTemplate({
      root,
      templatesRoot: path.join(__dirname, '../templates'),
    })

    createFromTemplate({ filePath: 'e2e-tests/.gitignore' })
    createFromTemplate({
      filePath: 'e2e-tests/package.json',
      data: { toolsVersion: config.version },
    })

    createFromTemplate({ filePath: 'e2e-tests/.eslintrc.js' })
    createFromTemplate({ filePath: 'e2e-tests/.eslintignore' })
    createFromTemplate({ filePath: 'e2e-tests/.env' })

    createJsonFile({ filePath: path.join(root, 'e2e-tests/e2e-tools.json'), fileContent: {} })

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
      filePath: path.join(getTestsRootDir(), 'e2e-tools.json'),
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
      filePath: path.join(getTestsRootDir(), 'package.json'),
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
  process.chdir(getTestsRootDir())
  const config = getConfigSafe()

  context.yargs.command(addToolCommand(context)).command(initCommand(context))

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
