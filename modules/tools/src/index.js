const path = require('path')
const spawn = require('cross-spawn')
const getPackageInfo = require('package-json')
const {
  getTestsRootDir,
  getProjectRootDir,
  updateJsonFile,
  getConfigSafe,
  getConfig,
  createFilesFromTemplates,
} = require('./utils')
const { generatePeriodicRunsCommand } = require('./commands/generate-periodic-runs')
const toolsPackageInfo = require('../package.json')

const initCommand = ({ config }) => ({
  command: 'init',
  describe: 'Setup tests in current project',
  handler() {
    if (path.basename(process.cwd()) === 'e2e-tests') {
      throw new Error('Already inited')
    }

    createFilesFromTemplates({
      templatesGlob: '**/*.hbs',
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

const addToolCommand = (context) => ({
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
    const config = getConfig()

    // TODO: find a better way
    const package =
      process.env.NODE_ENV === 'test'
        ? `file:${__dirname.replace('tools/src', 'nightwatch')}`
        : `${packageName}@${config.releaseChannel || 'latest'}`

    spawn.sync('yarn', ['add', '--dev', '--tilde', package], {
      stdio: 'inherit',
      cwd: getTestsRootDir(),
    })

    spawn.sync('yarn', ['install'], {
      stdio: 'inherit',
      cwd: getTestsRootDir(),
    })

    const tool = require(packageName)

    tool.initScript(context).catch(console.error)
  },
})

async function updateTool(context, packageName, shouldUpdatePackages, releaseChannel) {
  if (shouldUpdatePackages) {
    spawn.sync('yarn', ['add', '--dev', '--tilde', `${packageName}@${releaseChannel}`], {
      stdio: 'inherit',
      cwd: getTestsRootDir(),
    })
  }

  const tool = require(packageName)

  if (tool.upgrade) {
    await tool.upgrade(context)
  }
}

// Removes commit from version
// 1.4.3-alpha.19+25774ce → 1.4.3-alpha.19
// Idenpotent: dropCommit('1.4.3-alpha') → 1.4.3-alpha.19
function dropCommit(version) {
  return version.split('+')[0]
}

const upgradeCommand = (context) => ({
  command: 'upgrade',
  describe: 'Upgrades all packages',
  builder: {
    updatePackageJson: {
      boolean: true,
      default: true,
      describe:
        'Whether update package versions in package.json on just regenerate files. Useful to for beta versions',
    },
    updateSubdependencies: {
      boolean: true,
      default: true,
      describe: 'Whether update subdependencies such as chromedriver',
    },
  },
  async handler(args) {
    const config = getConfig()
    const releaseChannel = config.releaseChannel || 'latest'
    const info = await getPackageInfo(toolsPackageInfo.name, {
      version: releaseChannel,
    })

    if (args.updateSubdependencies) {
      spawn.sync('yarn', [], {
        stdio: 'inherit',
        cwd: getTestsRootDir(),
      })

      spawn.sync('yarn', ['upgrade'], {
        stdio: 'inherit',
        cwd: getTestsRootDir(),
      })
    }

    if (args.updatePackageJson && dropCommit(toolsPackageInfo.version) !== info.version) {
      spawn.sync(
        'yarn',
        ['add', '--dev', '--tilde', `${toolsPackageInfo.name}@${releaseChannel}`],
        {
          stdio: 'inherit',
          cwd: getTestsRootDir(),
        }
      )

      // Если прошло обновление основного пакета, запускаем новую версию кода и выходим
      spawn.sync('yarn', ['et', 'upgrade'], {
        stdio: 'inherit',
        cwd: getTestsRootDir(),
      })

      process.exit(0)
      return
    }

    createFilesFromTemplates({
      templatesGlob: '**/*.autogenerated.hbs',
      templatesData: { toolsVersion: context.config.version },
      templatesRoot: path.join(__dirname, '../templates'),
      destinationRoot: getProjectRootDir(),
    })

    if (!config.tools) {
      return
    }

    const toolNames = Object.keys(config.tools)

    for (const toolName of toolNames) {
      await updateTool(context, toolName, args.updatePackageJson, releaseChannel)
    }

    spawn.sync('yarn', ['install'], {
      stdio: 'inherit',
      cwd: getTestsRootDir(),
    })

    createPeriodicRunsWorkflows(config)
  },
})

exports.main = (context) => {
  process.chdir(getTestsRootDir())
  const config = getConfigSafe()

  context.yargs
    .command(addToolCommand(context))
    .command(initCommand(context))
    .command(upgradeCommand(context))
    .command(generatePeriodicRunsCommand(context))

  if (config && config.tools) {
    Object.keys(config.tools).forEach((toolName) => {
      const tool = require(toolName)
      if (typeof tool.getCommands === 'function') {
        tool.getCommands(context).forEach((command) => {
          context.yargs.command(command)
        })
      }
    })
  }

  context.yargs.demandCommand().help().argv
}
