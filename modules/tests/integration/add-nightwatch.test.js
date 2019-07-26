const path = require('path')
const spawnSync = require('cross-spawn').sync
const { setupEnvironment } = require('./helpers')

function checks({ readFile, rootDir }) {
  it('should add nightwatch with default config to e2e-tools.json', async () => {
    const configFile = JSON.parse(readFile('e2e-tests/e2e-tools.json'))
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
            host: 'chromedriver.csssr.ru',
            basicAuth: {
              username_env: 'CHROMEDRIVER_BASIC_AUTH_USERNAME',
              password_env: 'CHROMEDRIVER_BASIC_AUTH_PASSWORD',
            },

            desiredCapabilities: {
              browserName: 'chrome',
              'goog:chromeOptions': {
                w3c: false,
                args: ['--headless', '--disable-gpu', '--window-size=1200,800'],
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
    const packageJson = JSON.parse(readFile('e2e-tests/package.json'))
    expect(packageJson.devDependencies).toHaveProperty('@csssr/e2e-tools-nightwatch')
  })

  it.todo('should add tool with specific version')

  it('should be prettified', () => {
    const { stderr } = spawnSync('yarn', ['prettier', '--check', '**/*.{js,json}'], {
      cwd: path.join(rootDir, 'e2e-tests'),
    })

    const err = stderr && stderr.toString()
    expect(err).toBe('')
  })
}

describe('add-tool command', () => {
  describe(`Inside root dir`, () => {
    const { run, readFile, rootDir } = setupEnvironment('add-tool-cwd-root')
    run('init')
    run('add-tool @csssr/e2e-tools-nightwatch')
    checks({ readFile, rootDir })
  })

  describe(`Inside e2e-tests dir`, () => {
    const { run, readFile, rootDir } = setupEnvironment('add-tool-cwd-e2e-tests')

    run('init')
    process.chdir(path.join(rootDir, 'e2e-tests'))

    run('add-tool @csssr/e2e-tools-nightwatch')
    checks({ readFile, rootDir })
  })
})
