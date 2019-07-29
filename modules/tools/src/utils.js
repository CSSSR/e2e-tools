const fs = require('fs')
const path = require('path')
const findRoot = require('find-root')
const prettier = require('prettier')
const { compile } = require('handlebars')

const getTestsRootDir = () => {
  const foundRoot = findRoot(process.cwd())
  const testsPackagePath = path.join(foundRoot, 'e2e-tests')
  if (fs.existsSync(testsPackagePath)) {
    return testsPackagePath
  }

  return foundRoot
}

function getProjectRootDir() {
  return getTestsRootDir().replace(/\/e2e-tests$/, '')
}

function getConfigPath() {
  return path.join(getTestsRootDir(), 'e2e-tools.json')
}

function getConfig() {
  try {
    const configFile = fs.readFileSync(getConfigPath(), {
      encoding: 'utf-8',
    })

    return JSON.parse(configFile)
  } catch (err) {
    if (err && err.code === 'ENOENT') {
      throw new Error(`Config file ${err.path} was not found`)
    }

    throw err
  }
}

function getConfigSafe() {
  try {
    return getConfig()
  } catch {
    return undefined
  }
}

function createJsonFile({ filePath, fileContent }) {
  const formattedContent = prettier.format(JSON.stringify(fileContent), { parser: 'json' })
  fs.writeFileSync(filePath, formattedContent)
}

function updateJsonFile({ filePath, update }) {
  const file = fs.readFileSync(filePath, { encoding: 'utf-8' })
  const fileContent = JSON.parse(file)
  createJsonFile({ filePath, fileContent: update(fileContent) })
}

function updateToolConfig(tool, update) {
  updateJsonFile({
    filePath: getConfigPath(),
    update(config) {
      const toolSettings = config.tools[tool]

      if (!toolSettings) {
        throw new Error(`Tool ${tool} was not found`)
      }

      const updatedToolSettings = update(toolSettings === true ? {} : toolSettings)

      return {
        ...config,
        tools: {
          ...config.tools,
          [tool]: Object.keys(updatedToolSettings).length === 0 ? true : updatedToolSettings,
        },
      }
    },
  })
}

function initTemplate({ templatesRoot, root }) {
  return options => {
    const { data } = options
    const filePath = options.filePath
    const fileFullPath = path.join(root, options.filePath)
    const templatePath = path.join(templatesRoot, options.templatePath || `${filePath}.hbs`)

    fs.mkdirSync(path.dirname(fileFullPath), { recursive: true })
    const render = compile(fs.readFileSync(templatePath, 'utf8'))
    fs.writeFileSync(fileFullPath, render(data))
  }
}

module.exports = {
  getTestsRootDir,
  getProjectRootDir,
  getConfig,
  getConfigSafe,
  createJsonFile,
  updateJsonFile,
  updateToolConfig,
  initTemplate,
}
