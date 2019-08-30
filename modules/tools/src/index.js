const path = require('path')
const spawn = require('cross-spawn')
const {
  getTestsRootDir,
  getProjectRootDir,
  updateJsonFile,
  getConfigSafe,
  createFilesFromTemplates,
} = require('./utils')

const initCommand = ({ config }) => ({
  command: 'init',
  describe: 'Setup tests in current project',
  handler() {
    if (path.basename(process.cwd()) === 'e2e-tests') {
      throw new Error('Already inited')
    }

    createFilesFromTemplates({
      templatesData: { toolsVersion: config.version },
      templatesRoot: path.join(__dirname, '../templates'),
      destinationRoot: getProjectRootDir(),
    })

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

    // TODO: find a better way
    const package =
      process.env.NODE_ENV === 'test'
        ? `file:${__dirname.replace('tools/src', 'nightwatch')}`
        : packageName

    spawn.sync('yarn', ['add', '--dev', '--tilde', package], {
      stdio: 'inherit',
      cwd: getTestsRootDir(),
    })

    const tool = require(packageName)

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
