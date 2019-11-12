const prettier = require('prettier')
const prettierConfig = require('../../tools/prettier')
const yargs = require('yargs')
const { Volume, createFsFromVolume } = require('memfs')
const { main } = require('../../tools/src')

const defaultInitialFileSystemState = {
  '/project/package.json': '{ "name": "test-project" }',
}

function waitMiscotasksToComplete() {
  return new Promise(resolve => setTimeout(resolve))
}

function createEmptyProject({
  initialFileSystemState = defaultInitialFileSystemState,
  cwd = '/project',
  version = '0.0.0',
  answers = {},
} = {}) {
  const volume = Volume.fromJSON(initialFileSystemState)
  const fs = createFsFromVolume(volume)

  const yarn = {
    install() {},
    addPackage() {},
  }

  const context = {
    cwd,
    fs,
    volume,
    console: {
      log: jest.fn(),
      error: jest.fn(),
    },
  }

  async function prompt(question) {
    if (!Object.keys(answers).includes(question.name)) {
      throw new Error(`Answer for question ${question.name} is not defined`)
    }

    return answers[question.name]
  }

  return {
    ...context,
    async run(cmd, options) {
      main({
        ...context,
        version,
        yarn,
        prompt,
        yargs: yargs(cmd.split(' ')),
      })

      await waitMiscotasksToComplete()

      return createEmptyProject({
        cwd,
        initialFileSystemState: volume.toJSON(),
        answers,
        ...options,
      })
    },
  }
}

function createInitedApp(options) {
  return createEmptyProject(options).run('init', { cwd: '/project/e2e-tests' })
}

async function checkThatFilesPrettified(files) {
  await Promise.all(
    Object.keys(files).map(async filePath => {
      const fileInfo = await prettier.getFileInfo(filePath)
      if (fileInfo.inferredParser) {
        prettier.check(files[filePath], { ...prettierConfig, filepath: filePath })
      }
    })
  )
}

module.exports = { createEmptyProject, createInitedApp, checkThatFilesPrettified }
