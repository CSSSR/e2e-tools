require('core-js/features/string/replace-all')
const fs = require('fs')
const path = require('path')
const spawn = require('cross-spawn')

function setupEnvironment(name) {
  const sandboxDir = path.join(__dirname, '../sandbox', name)

  if (fs.existsSync(sandboxDir)) {
    throw new Error('Sandbox dir already exists')
  }

  fs.mkdirSync(sandboxDir, { recursive: true })
  process.chdir(sandboxDir)

  fs.writeFileSync(
    path.join(sandboxDir, '/package.json'),
    JSON.stringify(
      {
        name: `@sandbox/${name}`,
        version: '1.0.0',
        license: 'MIT',
      },
      null,
      2
    ) + '\n'
  )

  return {
    rootDir: sandboxDir,
    readFile(filePath) {
      return fs
        .readFileSync(path.join(sandboxDir, filePath), 'utf-8')
        .replaceAll(path.join(__dirname, '../../../..'), '<root>')
    },
    run(command, { promptResults = {} } = {}) {
      spawn.sync(
        path.join(__dirname, 'bin.js'),
        [...command.split(' '), '--promptResults', JSON.stringify(promptResults)],
        {
          cwd: process.cwd(),
          stdio: 'inherit',
        }
      )
    },
  }
}

module.exports = {
  setupEnvironment,
}
