const path = require('path')
const spawnSync = require('cross-spawn').sync
const { setupEnvironment } = require('./helpers')

describe('init command', () => {
  const { run, readFile, rootDir } = setupEnvironment('init')
  run('init')

  it('should create config file', () => {
    expect(readFile('e2e-tests/e2e-tools.json')).toMatchInlineSnapshot(`
      "{}
      "
    `)
  })

  it('should create .gitignore', () => {
    expect(readFile('e2e-tests/.gitignore')).toMatchInlineSnapshot(`
      "# Этот файл сгенерирован автоматически, не редактируйте его вручную

      node_modules/
      .env
      *.log
      package-lock.json
      !/.vscode/
      "
    `)
  })

  it('should create package.json', async () => {
    expect(readFile('e2e-tests/package.json')).toMatchInlineSnapshot(`
      "{
        \\"private\\": true,
        \\"prettier\\": \\"@csssr/e2e-tools/prettier\\",
        \\"devDependencies\\": {
          \\"@csssr/e2e-tools\\": \\"file:/Users/nitive/Work/e2e-tools/modules/tools\\"
        }
      }
      "
    `)
  })

  it('should create eslint files', async () => {
    const eslintFile = readFile('e2e-tests/.eslintrc.js')
    expect(eslintFile).toMatchInlineSnapshot(`
      "// Этот файл сгенерирован автоматически, не редактируйте его вручную

      module.exports = {
        root: true,
        extends: [require.resolve('@csssr/e2e-tools/eslint')],
      }
      "
    `)

    const eslintIgnoreFile = readFile('e2e-tests/.eslintignore')
    expect(eslintIgnoreFile).toMatchInlineSnapshot(`
      "# Этот файл сгенерирован автоматически, не редактируйте его вручную

      !.eslintrc.js
      "
    `)
  })

  it('should create .vscode/settings.json file', async () => {
    expect(readFile('e2e-tests/.vscode/settings.json')).toMatchInlineSnapshot(`
      "// Этот файл сгенерирован автоматически, не редактируйте его вручную
      {
        \\"editor.formatOnSave\\": true,
        \\"git.ignoreLimitWarning\\": true
      }
      "
    `)
  })

  it('should create .vscode/tasks.json file', async () => {
    expect(readFile('e2e-tests/.vscode/tasks.json')).toMatchInlineSnapshot(`
      "// Этот файл сгенерирован автоматически, не удаляйте дефолтные таски, только добавляйте
      // Удалённые таски будут заново добавлены при следующем обновлении
      {
        \\"version\\": \\"2.0.0\\",
        \\"tasks\\": []
      }
      "
    `)
  })

  it('should be prettified', () => {
    const { stderr } = spawnSync('yarn', ['prettier', '--check', '**/*.{js,json}'], {
      cwd: path.join(rootDir, 'e2e-tests'),
    })

    const err = stderr && stderr.toString()
    expect(err).toBe('')
  })
})
