const uniqBy = require('lodash/uniqBy')
const JSONWithComments = require('comment-json')
const { createInitedApp, checkThatFilesPrettified } = require('./test-utils')

function checks(appPromise) {
  it('should add nightwatch with default config to e2e-tools.json', async () => {
    const app = await appPromise
    const configFile = JSONWithComments.parse(
      app.fs.readFileSync('/project/e2e-tests/e2e-tools.json', 'utf8')
    )

    expect(configFile.tools).toEqual({
      '@csssr/e2e-tools-nightwatch': {
        browsers: {
          local_chrome: {
            default: true,
            type: 'webdriver',
            desiredCapabilities: {
              browserName: 'chrome',
              'goog:chromeOptions': {
                args: ['--window-size=1200,800'],
              },
            },
            globals: {
              skipScreenshotAssertions: true,
            },
          },
          remote_chrome: {
            type: 'selenium',
            host: 'selenium-linux.csssr.ru',
            remote: true,
            basicAuth: {
              credentialsId: 'chromedriver',
              username_env: 'CHROMEDRIVER_USERNAME',
              password_env: 'CHROMEDRIVER_PASSWORD',
            },

            desiredCapabilities: {
              browserName: 'chrome',
              'goog:chromeOptions': {
                w3c: false,
                args: ['--headless', '--no-sandbox', '--disable-gpu', '--window-size=1200,800'],
              },
            },
            globals: {
              skipScreenshotAssertions: false,
            },
          },
        },
      },
    })
  })

  it('should add package to devDependencies', async () => {
    const app = await appPromise
    expect(app.fs.readFileSync('/project/e2e-tests/package.json', 'utf8')).toMatchSnapshot()
  })

  // it.todo('should add tool with specific version')

  it('should be prettified', async () => {
    const app = await appPromise
    checkThatFilesPrettified(app.volume.toJSON())
  })

  it('should add eslint config file', async () => {
    const app = await appPromise
    const eslintConfig = app.fs.readFileSync('/project/e2e-tests/nightwatch/.eslintrc.js', 'utf8')
    expect(eslintConfig).toMatchSnapshot()
  })

  it('should add .gitignore file', async () => {
    const app = await appPromise
    const gitignore = app.fs.readFileSync('/project/e2e-tests/nightwatch/.gitignore', 'utf8')
    expect(gitignore).toMatchSnapshot()
  })

  it('should add screenshots/.gitignore file', async () => {
    const app = await appPromise
    const gitignore = app.fs.readFileSync(
      '/project/e2e-tests/nightwatch/screenshots/.gitignore',
      'utf8'
    )
    expect(gitignore).toMatchSnapshot()
  })

  it('should add tsconfig.json', async () => {
    const app = await appPromise
    expect(
      app.fs.readFileSync('/project/e2e-tests/nightwatch/tsconfig.json', 'utf8')
    ).toMatchSnapshot()
  })

  it('should add example file', async () => {
    const app = await appPromise
    const exists = app.fs.existsSync(
      '/project/e2e-tests/nightwatch/tests/Примеры/Переход на страницу авторизации.test.js'
    )
    expect(exists).toBe(true)
  })

  it('should add Jenkinsfile', async () => {
    const app = await appPromise
    const jenkinsfile = app.fs.readFileSync('/project/e2e-tests/nightwatch/Jenkinsfile', 'utf8')
    expect(jenkinsfile).toMatchSnapshot()
  })

  it('should add Dockerfile', async () => {
    const app = await appPromise
    const dockerfile = app.fs.readFileSync('/project/e2e-tests/nightwatch/Dockerfile', 'utf8')
    expect(dockerfile).toMatchSnapshot()
  })

  it('should add tasks', async () => {
    const app = await appPromise
    const vscodeTasks = JSONWithComments.parse(
      app.fs.readFileSync('/project/e2e-tests/.vscode/tasks.json', 'utf8')
    )

    expect(vscodeTasks.tasks).toContainEqual({
      type: 'shell',
      label: 'Nightwatch: запустить текущий файл в Chrome локально',
      command: "yarn et nightwatch:run --browser local_chrome --test='${file}'",
      problemMatcher: [],
      presentation: {
        showReuseMessage: false,
      },
      group: 'build',
    })

    expect(vscodeTasks.tasks).toContainEqual({
      type: 'shell',
      label: 'Nightwatch: запустить текущий файл в Chrome на удалённом сервере',
      command: "yarn et nightwatch:run --browser remote_chrome --test='${file}'",
      problemMatcher: [],
      presentation: {
        showReuseMessage: false,
      },
      group: 'build',
    })

    expect(vscodeTasks.tasks).toContainEqual({
      type: 'shell',
      label: 'Nightwatch: запустить все тесты в Chrome на удалённом сервере',
      command: 'yarn et nightwatch:run --browser remote_chrome',
      problemMatcher: [],
      presentation: { showReuseMessage: false },
      group: 'build',
    })

    expect(vscodeTasks.tasks).toContainEqual({
      type: 'shell',
      label: 'Nightwatch: Открыть HTML отчёт о последнем прогоне',
      command: 'open nightwatch/report/mochawesome.html',
      windows: {
        command: 'explorer nightwatch/report\\mochawesome.html',
      },
      problemMatcher: [],
      group: 'build',
    })

    expect(uniqBy(vscodeTasks.tasks, task => task.label)).toHaveLength(vscodeTasks.tasks.length)
  })
}

const answers = {
  launchUrl: 'github.com',
  projectName: 'github',
}

describe('add-tool command', () => {
  describe('Inside e2e-tests dir', () => {
    const appP = createInitedApp({ answers }).then(app =>
      app.run('add-tool @csssr/e2e-tools-nightwatch')
    )

    checks(appP)
  })

  describe('Adding nightwatch two times should be okey', () => {
    const appP = createInitedApp({ answers })
      .then(app => app.run('add-tool @csssr/e2e-tools-nightwatch'))
      .then(app => app.run('add-tool @csssr/e2e-tools-nightwatch'))

    checks(appP)
  })
})
