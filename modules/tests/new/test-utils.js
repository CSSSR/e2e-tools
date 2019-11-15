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
  answers = {},
  globalMocks = {
    console: {
      log: jest.fn(),
      error: jest.fn(),
    },
    process: {
      exit: jest.fn(),
    },
    nightwatch: jest.fn(() => ({ status: 0 })),
  },
} = {}) {
  const volume = Volume.fromJSON(initialFileSystemState)
  const fs = createFsFromVolume(volume)

  const yarn = {
    install() {},
    add() {},
    run() {},
  }

  const context = {
    ...globalMocks,
    cwd,
    fs,
    require: {
      resolve(packageName) {
        return `/node_modules/${packageName}`
      },
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
        yarn,
        prompt,
        volume,
        yargs: yargs(cmd.split(' ')),
        async getPackageInfo() {
          return { version: '0.0.0' }
        },
        getLocalPackageInfo(packageName) {
          return {
            '@csssr/e2e-tools': {
              name: '@csssr/e2e-tools',
              version: '0.0.0',
            },
          }[packageName]
        },
      })

      await waitMiscotasksToComplete()

      return createEmptyProject({
        cwd,
        initialFileSystemState: volume.toJSON(),
        answers,
        ...options,
        globalMocks,
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
