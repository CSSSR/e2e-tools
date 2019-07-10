const prettier = require('prettier')
const prettierConfig = require('../prettier')
const { run, runInInitedProject } = require('./run')

function toFilesArray(files, ext) {
  return Object.entries(files).map(([filePath, fileContent]) => ({ filePath, fileContent }))
}

function getParser(filePath) {
  if (filePath.endsWith('.js')) {
    return 'babel'
  } else if (filePath.endsWith('.json')) {
    return 'json'
  }
}

function checkFilesWithPrettier(files) {
  toFilesArray(files).forEach(({ fileContent, filePath }) => {
    const parser = getParser(filePath)

    if (parser) {
      expect(fileContent).toBe(prettier.format(fileContent, { parser, ...prettierConfig }))
    }
  })
}

describe('prettier', () => {
  it('all files in projects should be prettified after init', async () => {
    const { files } = await run('init')
    checkFilesWithPrettier(files)
  })

  it('all files in projects should be prettified after nightwatch:add', async () => {
    const { files } = await runInInitedProject('nightwatch:add')
    checkFilesWithPrettier(files)
  })
})
