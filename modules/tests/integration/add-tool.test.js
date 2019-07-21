const path = require('path')
const spawnSync = require('cross-spawn').sync
const { setupEnvironment } = require('./helpers')

function checks({ readFile, rootDir }) {
  it('should add tool to e2e-tools.json', async () => {
    const configFile = JSON.parse(readFile('e2e-tests/e2e-tools.json'))
    expect(configFile.tools).toContain('@csssr/e2e-tools-nightwatch')
  })

  it('should add tool to package.json', async () => {
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
    const { run, readFile, rootDir } = setupEnvironment(`add-tool-cwd-root`)
    run('init')
    run('add-tool @csssr/e2e-tools-nightwatch')
    checks({ readFile, rootDir })
  })

  describe(`Inside e2e-tests dir`, () => {
    const { run, readFile, rootDir } = setupEnvironment(`add-tool-cwd-e2e-tests`)

    run('init')
    process.chdir(path.join(rootDir, 'e2e-tests'))

    run('add-tool @csssr/e2e-tools-nightwatch')
    checks({ readFile, rootDir })
  })
})
