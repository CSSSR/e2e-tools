const { Volume, createFsFromVolume } = require('memfs')
const yargs = require('yargs')
const { main } = require('../src')

/**
 *
 * @param {string} cmd command to run
 * @returns {Promise<{ fs: import('fs'), files: { [filePath: string]: string } }>}
 */
exports.run = async cmd => {
  yargs.reset()

  const volume = new Volume()
  /** @type {any} */
  const fs = createFsFromVolume(volume)
  process.chdir('/')

  main({
    yargs: yargs(['/bin/node', '/bin/eto']),
    fs,
  })

  yargs.parse(cmd)

  return { fs, files: volume.toJSON() }
}
