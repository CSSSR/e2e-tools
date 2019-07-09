const { Volume, createFsFromVolume } = require('memfs')
const yargs = require('yargs')
const { main } = require('../src')

async function run(cmd) {
  yargs.reset()

  const volume = new Volume()
  process.chdir('/')

  main({
    yargs: yargs(['/bin/node', '/bin/eto']),
    fs: createFsFromVolume(volume),
  })

  yargs.parse(cmd)

  return {
    fs: volume.toJSON(),
  }
}

describe('init', () => {
  it('should create e2e-tests/ directory', async () => {
    const { fs } = await run('init')

    expect(fs).toHaveProperty('/e2e-tests')
  })
})
