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

// const addCommands =
