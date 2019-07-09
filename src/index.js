const path = require('path')
const realFs = require('fs')
const { compile } = require('handlebars')

/**
 * @typedef {'mkdirSync' | 'statSync' | 'writeFileSync'} UsedFsMethods
 * @typedef {Pick<typeof import('fs'), UsedFsMethods>} FileSystem
 *
 * @typedef {{
 *   fs: FileSystem,
 *   yargs: typeof import('yargs'),
 * }} Context
 */

/**
 *
 * @param {string} pathToFile Path to destination file
 * @param {{ fs: FileSystem }} templateOptions
 */
function createByTemplate(pathToFile, { fs }) {
  const pathToTemplate = path.join(__dirname, '../templates', pathToFile + '.hbs')
  const render = compile(realFs.readFileSync(pathToTemplate, { encoding: 'utf8' }))
  fs.writeFileSync(pathToFile, render({}))
}

/**
 * @param {Context} context
 */
const initCommand = ({ fs }) => ({
  command: 'init',
  describe: 'Setup tests in current project',
  handler() {
    fs.mkdirSync('./e2e-tests')
    createByTemplate('./e2e-tests/.gitignore', { fs })
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
