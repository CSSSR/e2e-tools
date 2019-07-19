const { runInInitedProject } = require('./run')

describe('nightwatch:add command', () => {
  it('should create e2e-tests/nightwatch/ directory', async () => {
    const { fs } = await runInInitedProject('nightwatch:add')

    expect(fs.existsSync('/e2e-tests/nightwatch')).toBe(true)
  })

  it('should add @csssr/e2e-tools-nightwatch to dependencies', async () => {
    const spawnSync = jest.fn()
    await runInInitedProject('nightwatch:add', { spawnSync })

    expect(spawnSync).toBeCalledWith('yarn', ['add', '--dev', '@csssr/e2e-tools-nightwatch'], {
      cwd: '/e2e-tests',
      stdio: 'inherit',
    })
  })
})
