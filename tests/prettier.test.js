const prettier = require('prettier')
const prettierConfig = require('../prettier')
const { run } = require('./run')

function getFilesWithExtension(files, ext) {
  return Object.entries(files)
    .filter(([filePath, fileContent]) => filePath.endsWith(ext))
    .map(([filePath, fileContent]) => ({ filePath, fileContent }))
}

function checkFilesWithPrettier(files, parser) {
  files.forEach(({ fileContent }) => {
    expect(fileContent).toBe(prettier.format(fileContent, { parser, ...prettierConfig }))
  })
}

describe('prettier', () => {
  it('all js files in projects should be prettified after init', async () => {
    const { files } = await run('init')
    checkFilesWithPrettier(getFilesWithExtension(files, '.js'), 'babel')
  })

  it('all json files in projects should be prettified after init', async () => {
    const { files } = await run('init')

    checkFilesWithPrettier(getFilesWithExtension(files, '.json'), 'json')
  })
})
