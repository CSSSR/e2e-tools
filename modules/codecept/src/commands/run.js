const { getConfig, getTestsRootDir } = require('@csssr/e2e-tools/utils')
const packageName = require('../../package.json').name

function createArgsArrayFromMap(argsMap) {
  return Object.keys(argsMap)
    .map((arg) => {
      const value = argsMap[arg]
      if (value === undefined) return []

      if (Array.isArray(value)) {
        return value.map((v) => [`--${arg}`, v]).reduce((acc, x) => acc.concat(x), [])
      }

      return [`--${arg}`, value]
    })
    .reduce((acc, x) => acc.concat(x), [])
}

/**
 * @returns {import('yargs').CommandModule | undefined}
 */
const addRunCommand = (context) => {
  const config = getConfig()
  const browsersConfig = config.tools[packageName].browsers

  if (!browsersConfig) {
    return undefined
  }

  const defaultBrowser =
    process.env.BROWSER || Object.entries(browsersConfig).find(([_, browser]) => browser.default)[0]
  const browsers = Object.keys(browsersConfig)

  return {
    aliases: ['codecept', 'ct'],
    builder: {
      browser: {
        alias: 'b',
        describe: 'Browser, defined in your e2e-tools.json file',
        default: defaultBrowser,
        choices: browsers,
      },
    },
    command: 'codecept:run',
    describe: 'Run CodeceptJS tests',
    handler(args) {
      context.spawnSync('yarn', ['install', '--frozen-lockfile'], { stdio: 'inherit' })

      const result = context.spawnSync(
        'yarn',
        [
          'codeceptjs',
          'run',
          ...createArgsArrayFromMap({
            config: 'codecept/codecept.conf.js',
          }),
        ],
        {
          stdio: 'inherit',
          cwd: getTestsRootDir(),
          env: { ...process.env, BROWSER: args.browser },
        }
      )

      if (result.status) {
        process.exit(result.status)
      }

      if (result.error) {
        console.error(result.error)
        process.exit(0)
      }
    },
  }
}

module.exports = { addRunCommand }
