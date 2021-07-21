const path = require('path')
const { getConfig, getTestsRootDir, createArgsArrayFromMap } = require('@csssr/e2e-tools/utils')
const packageName = require('../../package.json').name

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
      test: {
        describe: 'Test file',
      },
      testcase: {
        describe: 'Testcase in test file (--grep option in codecept)',
      },
    },
    command: 'codecept:run',
    describe: 'Run CodeceptJS tests',
    handler(args) {
      context.spawnSync('yarn', ['install', '--frozen-lockfile'], { stdio: 'inherit' })
      const testRoot = getTestsRootDir()

      const result = context.spawnSync(
        'yarn',
        [
          'codeceptjs',
          'run',
          ...(args.test ? [args.test.replace(path.join(testRoot, 'codecept/'), '')] : []),
          ...createArgsArrayFromMap({
            config: 'codecept/codecept.conf.js',
            grep: args.testcase,
          }),
        ],
        {
          stdio: 'inherit',
          cwd: testRoot,
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
