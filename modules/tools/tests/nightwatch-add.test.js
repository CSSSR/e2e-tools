const { runInInitedProject } = require('./run')

describe('init command', () => {
  it('should create e2e-tests/nightwatch/ directory', async () => {
    const { fs } = await runInInitedProject('nightwatch:add')

    expect(fs.existsSync('/e2e-tests/nightwatch')).toBe(true)
  })

  it('should add @csssr/e2e-tools-nightwatch to dependencies', async () => {
    const { fs } = await runInInitedProject('nightwatch:add')

    const packageJsonFile = fs.readFileSync('/e2e-tests/package.json', { encoding: 'utf8' })
    expect(JSON.parse(packageJsonFile).devDependencies).toHaveProperty(
      '@csssr/e2e-tools-nightwatch'
    )
  })
})
