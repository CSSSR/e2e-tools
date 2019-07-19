const { Volume, createFsFromVolume } = require('memfs')
const yargs = require('yargs')
const { main } = require('../src')

/**
 *
 * @param {string} cmd command to run
 * @param {{ initialFileSystemState?: any, spawnSync?: Function }} options
 * @returns {Promise<{ fs: import('fs'), files: { [filePath: string]: string } }>}
 */
async function run(cmd, options = {}) {
  yargs.reset()

  const volume = Volume.fromJSON(options.initialFileSystemState)
  /** @type {any} */
  const fs = createFsFromVolume(volume)
  process.chdir('/')

  /** @type {any} */
  const spawnSync = options.spawnSync || (() => {})

  main({
    yargs: yargs(['/bin/node', '/bin/et']),
    fs,
    spawnSync,
    config: { version: '~1.0.0' },
  })

  yargs.parse(cmd)

  return { fs, files: volume.toJSON() }
}

async function runInInitedProject(cmd, options) {
  const { files } = await run('init')

  return run(cmd, { initialFileSystemState: files, ...options })
}

module.exports = {
  run,
  runInInitedProject,
}
