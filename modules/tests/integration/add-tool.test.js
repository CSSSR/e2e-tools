const path = require('path')
const spawnSync = require('cross-spawn').sync
const { setupEnvironment } = require('./helpers')

describe('add-tool command', () => {
  const { run, readFile, rootDir } = setupEnvironment('add-tool')
  run('init')
  run('add-tool @csssr/e2e-tools-nightwatch')

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
})
