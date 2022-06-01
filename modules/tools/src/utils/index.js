const fs = require('fs')
const path = require('path')
const yaml = require('js-yaml')
const dotenv = require('dotenv')
const readlineSync = require('readline-sync')
const findRoot = require('find-root')
const prettier = require('prettier')
const validateNpmPackageName = require('validate-npm-package-name')
const { compile } = require('handlebars')
const glob = require('fast-glob')
const JSONWithComments = require('comment-json')
const prettierConfig = require('../../prettier')
const { isValidRepoSshAddress, getRepoSshAddress } = require('./repo-address')
const {
  allurectlWatch,
  allurectlUploadStep,
  allureEnv,
  downloadAllurectlStep,
  allureJobUidStep,
  allureTestPlanStep,
} = require('./allure')

const getTestsRootDir = () => {
  const foundRoot = findRoot(process.cwd())
  if (foundRoot.endsWith('e2e-tests')) {
    return foundRoot
  }

  const testsPackagePath = path.join(foundRoot, 'e2e-tests')

  if (fs.existsSync(testsPackagePath)) {
    return testsPackagePath
  }

  return foundRoot
}

function getProjectRootDir() {
  return getTestsRootDir().replace(/[\/\\]e2e-tests$/, '')
}

function getConfigPath() {
  return path.join(getTestsRootDir(), 'e2e-tools.json')
}

function getConfig() {
  try {
    const configFile = fs.readFileSync(getConfigPath(), {
      encoding: 'utf-8',
    })

    return JSONWithComments.parse(configFile, null, true)
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
  } catch (e) {
    return undefined
  }
}

function getParentProjectPackageJsonSafe() {
  try {
    return require(path.join(getProjectRootDir(), 'package.json'))
  } catch (e) {
    return undefined
  }
}

function createJsonFile({ filePath, fileContent }) {
  const formattedContent = prettier.format(JSONWithComments.stringify(fileContent), {
    parser: 'json',
  })
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, formattedContent)
}

function formatFile(filePath) {
  const ext = path.extname(filePath)
  const parser = {
    '.js': 'babel',
    '.json': 'json',
  }[ext]

  if (!parser) {
    return
  }

  const fileContent = fs.readFileSync(filePath, 'utf8')
  const formattedContent = prettier.format(fileContent, { ...prettierConfig, parser })
  fs.writeFileSync(filePath, formattedContent)
}

function updateJsonFile({ filePath, update }) {
  const file = fs.readFileSync(filePath, { encoding: 'utf-8' })
  const fileContent = JSONWithComments.parse(file, null, true)
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
  return (options) => {
    const { data } = options
    const filePath = options.filePath
    const fileFullPath = path.join(root, options.filePath)
    const templatePath = path.join(templatesRoot, options.templatePath || `${filePath}.hbs`)

    fs.mkdirSync(path.dirname(fileFullPath), { recursive: true })
    const render = compile(fs.readFileSync(templatePath, 'utf8'))
    fs.writeFileSync(fileFullPath, render(data))
  }
}

function getRepoNameByAddress(str) {
  const matched = str.match(/\/(.*).git$/)

  if (!matched) {
    return undefined
  }

  return matched[1]
}

function validatePackageName(name) {
  if (name.startsWith('@')) {
    return false
  }

  return validateNpmPackageName(name).validForNewPackages
}

function getEnvVariable(variable, description) {
  try {
    const envFilePath = path.join(getTestsRootDir(), '.env')

    if (!fs.existsSync(envFilePath)) {
      fs.writeFileSync(envFilePath, '\n')
    }

    const config = dotenv.config({ path: envFilePath })
    if (process.env[variable]) {
      return process.env[variable]
    }

    const value = readlineSync.question(`${description} (${variable}) `)

    const newConfig = { ...config.parsed, [variable]: value }

    const envFileContent =
      Object.keys(newConfig)
        .map((key) => `${key}=${newConfig[key]}`)
        .join('\n') + '\n'

    fs.writeFileSync(envFilePath, envFileContent)

    return newConfig[variable]
  } catch (err) {
    console.log(`Произошла ошибка при получении ${variable}`)
    throw err
  }
}

function getSeleniumBasicAuthEnv(browserName, env, description) {
  const envValue = process.env[`${browserName.toUpperCase()}_${env}`] || process.env[env]
  return envValue || getEnvVariable(env, description)
}

function defaultGetDestinationPath(templatePath) {
  return templatePath.replace(/\.hbs$/, '').replace(/\.autogenerated$/, '')
}

function createFilesFromTemplates({
  templatesGlob,
  templatesData,
  templatesRoot,
  destinationRoot,
  getDestinationPath = defaultGetDestinationPath,
}) {
  const templatesPaths = glob.sync(templatesGlob, {
    dot: true,
    cwd: templatesRoot,
  })

  templatesPaths.forEach((templatePath) => {
    const templateAbsolutePath = path.join(templatesRoot, templatePath)
    const destinationPath = getDestinationPath(templatePath)
    const destinationAbsolutePath = path.join(destinationRoot, destinationPath)

    fs.mkdirSync(path.dirname(destinationAbsolutePath), { recursive: true })
    const render = compile(fs.readFileSync(templateAbsolutePath, 'utf8'))
    fs.writeFileSync(destinationAbsolutePath, render(templatesData))
    formatFile(destinationAbsolutePath)
  })
}

function createArgsArrayFromMap(argsMap) {
  return Object.keys(argsMap)
    .map((arg) => {
      const value = argsMap[arg]
      if (value === undefined) return []

      if (Array.isArray(value)) {
        return value.map((v) => [`--${arg}`, v]).reduce((acc, x) => acc.concat(x), [])
      }

      return [`--${arg}`, value]
    })
    .reduce((acc, x) => acc.concat(x), [])
}

function normalizeUrl(input) {
  if (input.startsWith('http')) {
    return input
  }

  return `http://${input}`
}

function falseToError(error, func) {
  return (str) => (func(str) ? true : error)
}

async function addAnyProjectFields(ctx, opts) {
  const parentProjectPackageJson = getParentProjectPackageJsonSafe() || {}

  async function prompt(question) {
    const answers = await ctx.inquirer.prompt([question])

    return answers[question.name]
  }
  const config = getConfig()

  const launchUrl = await prompt({
    type: 'input',
    name: 'launchUrl',
    default: config.defaultLaunchUrl,
    message: 'Адрес стенда по умолчанию',
  })

  const projectName = await prompt({
    type: 'input',
    name: 'projectName',
    default: config.projectName || parentProjectPackageJson.name,
    message: 'Название проекта (маленькими буквами без пробелов)',
    validate: falseToError('Навалидное название пакета', validatePackageName),
  })

  const configNewFields = {
    projectName,
    defaultLaunchUrl: normalizeUrl(launchUrl),
  }

  updateJsonFile({
    filePath: path.join(getTestsRootDir(), 'e2e-tools.json'),
    update(prevConfig) {
      return {
        ...prevConfig,
        ...configNewFields,
      }
    },
  })

  createFilesFromTemplates({
    templatesGlob: '**/*.hbs',
    templatesData: {
      config: { ...config, ...configNewFields },
    },
    templatesRoot: opts.templatesRoot,
    destinationRoot: getProjectRootDir(),
  })
}

// VSCode на Windows прокидывает название директории с диском в нижнем регистре,
// а process.cwd() возвращает название диска в верхнем регистре. Поэтому обрезаем
// название пути не учитывая регистра
function stripDirectoryNameCaseInsensitive(filePath, directoryName) {
  if (filePath.toLowerCase().slice(0, directoryName.length) === directoryName.toLowerCase()) {
    return filePath.slice(directoryName.length)
  }

  return filePath
}

function createWorkflow(workflowPath, content) {
  const githubWorkflowContent =
    '# Этот файл сгенерирован автоматически, не редактируйте его вручную\n\n' +
    yaml.dump(content, { noCompatMode: true, noRefs: true, lineWidth: -1 })

  fs.mkdirSync(path.dirname(workflowPath), { recursive: true })
  fs.writeFileSync(workflowPath, githubWorkflowContent, { encoding: 'utf-8' })
}

function getGitHubSecretEnv(env) {
  return Object.entries(env || {}).reduce((acc, [envName, env]) => {
    return {
      ...acc,
      [envName]: `\${{ secrets.${envName} || '${env.default}' }}`,
    }
  }, {})
}

function getGitHubEnv(env) {
  return Object.entries(env || {}).reduce((acc, [envName, env]) => {
    return {
      ...acc,
      [envName]: `\${{ github.event.inputs.${envName} }}`,
    }
  }, {})
}

function getGitHubEnvInputs(env) {
  return Object.entries(env || {}).reduce((acc, [envName, env]) => {
    return {
      ...acc,
      [envName]: {
        description: env.description,
        default: env.default,
        required: true,
      },
    }
  }, {})
}

function getGitHubBrowserSecretEnv(browsers) {
  return Object.entries(browsers || {})
    .filter(
      ([_, browserConfig]) => browserConfig.type === 'selenium' && browserConfig.seleniumBasicAuth
    )
    .reduce((acc, [browserName, browserConfig]) => {
      const sba = browserConfig.seleniumBasicAuth || browserConfig.basicAuth
      const usernameEnvName = `${browserName.toUpperCase()}_${sba.username_env}`
      const usernameGitHubSecret = sba.username_github_secret || sba.username_env
      const passwordEnvName = `${browserName.toUpperCase()}_${sba.password_env}`
      const passwordGitHubSecret = sba.password_github_secret || sba.password_env
      return {
        ...acc,
        [usernameEnvName]: `\${{ secrets.${usernameGitHubSecret} }}`,
        [passwordEnvName]: `\${{ secrets.${passwordGitHubSecret} }}`,
      }
    }, {})
}

function ensureNodeVersion() {
  const majorVersion = Number(process.versions.node.split('.')[0])
  if (majorVersion < 14) {
    throw new Error(
      'Node.js version is too old. Please update to latest version https://nodejs.org'
    )
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
  getParentProjectPackageJsonSafe,
  getRepoNameByAddress,
  validatePackageName,
  getEnvVariable,
  getSeleniumBasicAuthEnv,
  createFilesFromTemplates,
  isValidRepoSshAddress,
  getRepoSshAddress,
  createArgsArrayFromMap,
  normalizeUrl,
  falseToError,
  addAnyProjectFields,
  stripDirectoryNameCaseInsensitive,
  createWorkflow,
  getGitHubSecretEnv,
  getGitHubEnv,
  getGitHubEnvInputs,
  getGitHubBrowserSecretEnv,
  ensureNodeVersion,
  allurectlWatch,
  allurectlUploadStep,
  allureEnv,
  downloadAllurectlStep,
  allureJobUidStep,
  allureTestPlanStep,
}
