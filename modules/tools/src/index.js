const path = require('path')
const realFs = require('fs')
const { compile } = require('handlebars')
const prettier = require('prettier')
const e2eToolsPackage = require('../package.json')

/**
 * @typedef {'mkdirSync' | 'statSync' | 'writeFileSync' | 'readFileSync'} UsedFsMethods
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
 * @param {{ fs: FileSystem }} options
 * @param {object=} templateContext
 */
function createWithTemplate(pathToFile, { fs }, templateContext) {
  fs.mkdirSync(path.dirname(pathToFile), { recursive: true })

  const pathToTemplate = path.join(__dirname, '../templates', pathToFile + '.hbs')
  const render = compile(realFs.readFileSync(pathToTemplate, { encoding: 'utf8' }))

  fs.writeFileSync(pathToFile, render(templateContext))
}

/**
 * @param {{ fs: FileSystem }} templateOptions
 * @param {(packageJsonContent: object) => object} update function which updates package.json content
 */
function updatePackageJson({ fs }, update) {
  const packageJsonFile = fs.readFileSync('/e2e-tests/package.json', { encoding: 'utf8' })
  const newPackageJsonFile = prettier.format(JSON.stringify(update(JSON.parse(packageJsonFile))), {
    parser: 'json',
  })
  fs.writeFileSync('e2e-tests/package.json', newPackageJsonFile, { encoding: 'utf-8' })
}

/**
 * @param {Context} context
 */
const initCommand = ({ fs }) => ({
  command: 'init',
  describe: 'Setup tests in current project',
  handler() {
    createWithTemplate('e2e-tests/.gitignore', { fs })
    createWithTemplate(
      'e2e-tests/package.json',
      { fs },
      { toolsVersion: '~' + e2eToolsPackage.version }
    )

    createWithTemplate('e2e-tests/.eslintrc.js', { fs })
    createWithTemplate('e2e-tests/.eslintignore', { fs })
  },
})

/**
 * @param {Context} context
 */
const addNightwatchCommand = ({ fs }) => ({
  command: 'nightwatch:add',
  describe: 'Setup nightwatch and add test example',
  handler() {
    createWithTemplate('e2e-tests/nightwatch/.eslintrc.js', { fs })

    createWithTemplate(
      'e2e-tests/nightwatch/tests/Примеры/Переход на страницу авторизации.test.js',
      { fs }
    )

    createWithTemplate('e2e-tests/nightwatch/screenshots/.gitignore', { fs })
    updatePackageJson({ fs }, content => ({
      ...content,
      devDependencies: {
        ...content.devDependencies,
        '@csssr/e2e-tools-nightwatch': '*',
      },
    }))
  },
})

/**
 * @param {Context} context
 */
exports.main = context => {
  context.yargs
    .command(initCommand(context))
    .command(addNightwatchCommand(context))
    .demandCommand()
    .help().argv
}
