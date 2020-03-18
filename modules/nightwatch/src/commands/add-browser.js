const { updateToolConfig } = require('@csssr/e2e-tools/utils')
const readlineSync = require('readline-sync')
const axios = require('axios').default
const JSONWithComments = require('comment-json')
const packageName = require('../../package.json').name
const chalk = require('chalk')

function isValidBrowserConfig(config) {
  return !!(config && config.desiredCapabilities)
}

async function getConfigByUrl(url) {
  const parsingError = 'Ошибка парсинга файла. Убедитесь, что конфиг браузера валиден'
  const downloadError =
    'Невозможно скачать файл по ссылке. Проверьте, что ссылка правильная и файл доступен без авторизации'

  try {
    const res = await axios.get(url)

    if (isValidBrowserConfig(res.data)) {
      return res.data
    }

    if (typeof res.data === 'string') {
      try {
        const parsed = JSONWithComments.parse(res.data)

        if (isValidBrowserConfig(parsed)) {
          return parsed
        }
      } catch (error) {
        throw new Error(parsingError)
      }
    }

    throw new Error(parsingError)
  } catch (err) {
    throw new Error(downloadError)
  }
}

/**
 * @returns {import('yargs').CommandModule | undefined}
 */
const addNightwatchAddBrowserCommand = context => {
  return {
    builder: {
      name: {
        describe: 'имя браузера',
        demandOption: true,
      },
      configUrl: {
        describe: 'URL с конфигом браузера',
        demandOption: true,
      },
    },
    command: 'nightwatch:add-browser',
    describe: 'Run nightwatch',
    async handler({ name, configUrl }) {
      try {
        const newBrowserConfig = await getConfigByUrl(configUrl)

        updateToolConfig(packageName, config => {
          if (config.browsers && config.browsers[name]) {
            const value = readlineSync.question(
              'Браузер с таким именем уже добавлен. Заменить его? (yes/no) '
            )

            if (value !== 'yes') {
              throw new Error('Отменено')
            }
          }

          return {
            ...config,
            browsers: {
              ...config.browsers,
              [name]: newBrowserConfig,
            },
          }
        })

        console.log(
          chalk.green('Готово! Запуск тестов в добавленном браузере:'),
          chalk.cyan(`yarn et nightwatch:run --browser ${name}`)
        )
      } catch (err) {
        console.error(chalk.red((err && err.message) || err))
      }
    },
  }
}

module.exports = { addNightwatchAddBrowserCommand }
