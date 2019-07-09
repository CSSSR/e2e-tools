/**
 * @typedef {'mkdirSync' | 'statSync'} UsedFsMethods
 * @typedef {Pick<typeof import('fs'), UsedFsMethods>} Fs
 *
 * @typedef {{
 *   fs: Fs,
 *   yargs: typeof import('yargs'),
 * }} Context
 */

/**
 * @param {Context} context
 */
const initCommand = ({ fs }) => ({
  command: 'init',
  describe: 'Setup tests in current project',
  handler() {
    fs.mkdirSync('./e2e-tests')
  },
})

/**
 * @param {Context} context
 */
exports.main = context => {
  context.yargs
    .command(initCommand(context))
    .demandCommand()
    .help().argv
}
