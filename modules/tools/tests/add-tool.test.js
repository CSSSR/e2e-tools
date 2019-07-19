const { runInInitedProject } = require('./run')

describe('add-tool command', () => {
  it('should add tool to e2e-tools.json and package.json', async () => {
    const spawnSync = jest.fn()
    const { fs } = await runInInitedProject('add-tool @csssr/e2e-tools-nightwatch', { spawnSync })

    const configFile = fs.readFileSync('/e2e-tests/e2e-tools.json', 'utf8')
    expect(JSON.parse(configFile).tools).toContain('@csssr/e2e-tools-nightwatch')

    expect(spawnSync).toBeCalledWith('yarn', ['add', '--dev', '@csssr/e2e-tools-nightwatch'], {
      cwd: '/e2e-tests',
      stdio: 'inherit',
    })
  })
})
