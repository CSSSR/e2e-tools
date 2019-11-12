const { createInitedApp, checkThatFilesPrettified } = require('./test-utils')

describe('init command', () => {
  it('should create config file', async () => {
    const app = await createInitedApp()
    expect(app.fs.readFileSync('/project/e2e-tests/e2e-tools.json', 'utf8')).toBe('{}\n')
  })

  it('should create .gitignore', async () => {
    const app = await createInitedApp()
    expect(app.fs.readFileSync('/project/e2e-tests/.gitignore', 'utf8')).toMatchInlineSnapshot(`
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
    const app = await createInitedApp()
    expect(app.fs.readFileSync('/project/e2e-tests/package.json', 'utf8')).toMatchInlineSnapshot(`
      "{
        \\"private\\": true,
        \\"prettier\\": \\"@csssr/e2e-tools/prettier\\",
        \\"devDependencies\\": {
          \\"@csssr/e2e-tools\\": \\"0.0.0\\"
        }
      }
      "
    `)
  })

  it('should create eslint files', async () => {
    const app = await createInitedApp()
    const eslintFile = app.fs.readFileSync('/project/e2e-tests/.eslintrc.js', 'utf8')
    expect(eslintFile).toMatchInlineSnapshot(`
      "// Этот файл сгенерирован автоматически, не редактируйте его вручную

      module.exports = {
        extends: ['@csssr/e2e-tools/eslint'],
      }
      "
    `)

    const eslintIgnoreFile = app.fs.readFileSync('/project/e2e-tests/.eslintignore', 'utf8')
    expect(eslintIgnoreFile).toMatchInlineSnapshot(`
      "# Этот файл сгенерирован автоматически, не редактируйте его вручную

      !.eslintrc.js
      "
    `)
  })

  it('should create .vscode/settings.json file', async () => {
    const app = await createInitedApp()
    expect(app.fs.readFileSync('/project/e2e-tests/.vscode/settings.json', 'utf8'))
      .toMatchInlineSnapshot(`
      "// Этот файл сгенерирован автоматически, не редактируйте его вручную
      {
        \\"editor.formatOnSave\\": true,
        \\"eslint.autoFixOnSave\\": true,
        \\"eslint.validate\\": [
          { \\"language\\": \\"javascript\\", \\"autoFix\\": true },
          { \\"language\\": \\"javascriptreact\\", \\"autoFix\\": true }
        ],
        \\"git.ignoreLimitWarning\\": true
      }
      "
    `)
  })

  it('should create .vscode/tasks.json file', async () => {
    const app = await createInitedApp()
    expect(app.fs.readFileSync('/project/e2e-tests/.vscode/tasks.json', 'utf8'))
      .toMatchInlineSnapshot(`
      "// Этот файл сгенерирован автоматически, не удаляйте дефолтные таски, только добавляйте
      // Удалённые таски будут заново добавлены при следующем обновлении
      {
        \\"version\\": \\"2.0.0\\",
        \\"tasks\\": []
      }
      "
    `)
  })

  it('files should be prettified', async () => {
    const app = await createInitedApp()
    await checkThatFilesPrettified(app.volume.toJSON())
  })
})
