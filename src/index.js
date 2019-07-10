const path = require('path')
const realFs = require('fs')
const { compile } = require('handlebars')
const e2eToolsPackage = require('../package.json')

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
 * @param {object=} templateContext
 */
function createByTemplate(pathToFile, { fs }, templateContext) {
  const pathToTemplate = path.join(__dirname, '../templates', pathToFile + '.hbs')
  const render = compile(realFs.readFileSync(pathToTemplate, { encoding: 'utf8' }))
  fs.writeFileSync(pathToFile, render(templateContext))
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
    createByTemplate(
      './e2e-tests/package.json',
      { fs },
      { toolsVersion: '~' + e2eToolsPackage.version }
    )
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
