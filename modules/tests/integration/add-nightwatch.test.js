const fs = require('fs')
const path = require('path')
const spawnSync = require('cross-spawn').sync
const uniqBy = require('lodash/uniqBy')
const JSONWithComments = require('comment-json')
const { setupEnvironment } = require('./helpers')

function checks({ readFile, rootDir }) {
  it('should add nightwatch with default config to e2e-tools.json', async () => {
    const configFile = JSONWithComments.parse(readFile('e2e-tests/e2e-tools.json'), null, true)
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
            url: 'https://chrome.selenium.csssr.cloud',
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
    expect(readFile('e2e-tests/package.json')).toMatchSnapshot()
  })

  it('should be prettified', () => {
    const { stderr } = spawnSync('yarn', ['prettier', '--check', '**/*.{js,json}'], {
      cwd: path.join(rootDir, 'e2e-tests'),
    })

    const err = stderr && stderr.toString()
    expect(err).toBe('')
  })

  it('should add eslint config file', async () => {
    const eslintConfig = readFile('e2e-tests/nightwatch/.eslintrc.js')
    expect(eslintConfig).toMatchSnapshot()
  })

  it('should add .gitignore file', async () => {
    const gitignore = readFile('e2e-tests/nightwatch/.gitignore')
    expect(gitignore).toMatchSnapshot()
  })

  it('should add screenshots/.gitignore file', async () => {
    const gitignore = readFile('e2e-tests/nightwatch/screenshots/.gitignore')
    expect(gitignore).toMatchSnapshot()
  })

  it('should add tsconfig.json', async () => {
    expect(readFile('e2e-tests/nightwatch/tsconfig.json')).toMatchSnapshot()
  })

  it('should add example file', async () => {
    const exist = fs.existsSync(
      path.join(
        rootDir,
        'e2e-tests/nightwatch/tests/Примеры/Переход на страницу авторизации.test.js'
      )
    )
    expect(exist).toBe(true)
  })

  it('should add Jenkinsfile', async () => {
    const jenkinsfile = readFile('e2e-tests/nightwatch/Jenkinsfile')
    expect(jenkinsfile).toMatchSnapshot()
  })

  it('should add tasks', async () => {
    const vscodeTasks = JSONWithComments.parse(readFile('e2e-tests/.vscode/tasks.json'), null, true)

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

    expect(uniqBy(vscodeTasks.tasks, (task) => task.label)).toHaveLength(vscodeTasks.tasks.length)
  })
}

const promptResults = {
  launchUrl: 'github.com',
  projectName: 'github',
}

describe('add-tool command', () => {
  describe('Inside root dir', () => {
    const { run, readFile, rootDir } = setupEnvironment('add-tool-cwd-root')
    run('init')
    run('add-tool @csssr/e2e-tools-nightwatch', { promptResults })
    checks({ readFile, rootDir })
  })

  describe(`Inside e2e-tests dir`, () => {
    const { run, readFile, rootDir } = setupEnvironment('add-tool-cwd-e2e-tests')

    run('init')
    process.chdir(path.join(rootDir, 'e2e-tests'))

    run('add-tool @csssr/e2e-tools-nightwatch', { promptResults })
    checks({ readFile, rootDir })
  })

  describe('Adding nightwatch two times should be okey', () => {
    const { run, readFile, rootDir } = setupEnvironment('add-tool-two-times')

    run('init')
    process.chdir(path.join(rootDir, 'e2e-tests'))

    run('add-tool @csssr/e2e-tools-nightwatch', { promptResults })
    run('add-tool @csssr/e2e-tools-nightwatch', { promptResults })
    checks({ readFile, rootDir })
  })
})
