# Конфигурирование e2e-tools

## Добавление браузеров в проект

Firefox, запуск локально:

```bash
yarn et nightwatch:add-browser --name local_firefox --configUrl https://csssr.github.io/selenium-servers/browsers/local_firefox.json
```

Firefox, запуск на удалённом Линукс-сервере:

```bash
yarn et nightwatch:add-browser --name remote_firefox --configUrl https://csssr.github.io/selenium-servers/browsers/remote_firefox.json
```

Chrome, запуск на Browserstack:

```bash
yarn et nightwatch:add-browser --name browserstack_chrome --configUrl https://csssr.github.io/selenium-servers/browsers/browserstack_chrome.json
```

IE 11, запуск на Browserstack:

```bash
yarn et nightwatch:add-browser --name browserstack_ie --configUrl https://csssr.github.io/selenium-servers/browsers/browserstack_ie.json
```

[Дополнительные настройки запуска браузера на Browserstack](https://www.browserstack.com/automate/capabilities)

## Смена языка браузера

Язык браузера можно задать в файле `e2e-tools.json`:

```json
"desiredCapabilities": {
  "browserName": "chrome",
  "goog:chromeOptions": {
    "args": ["--window-size=1200,800"],
    "prefs": {
      "intl": { "accept_languages": "ru-RU" } // ← здесь
    }
  }
},
```

## Авторизация на стенде

Логин и пароль от стенда можно задать прямо в URL стенда:

```json
{
  ...,
  "defaultLaunchUrl": "https://user:password@my.site.ru/"
}
```

## Идентификация браузера при использовании одинаковых browserName

Заменяет имя файла скриншота с browserName на browserId
Id браузера можно задать в файле `e2e-tools.json`:

```json
"desiredCapabilities": {
  "browserId": "chrome-1",
  "browserName": "chrome",
  }
},
```

# Добавление периодических запусков автотестов в 3 шага!

## ШАГ 1. Необходимо открыть файл e2e-tools.json
## ШАГ 2. Добавить настройки для запусков

Добавить для ежедневного запуска в 9 утра: 
```json
"releaseChannel": "canary",
"periodicRuns": [
  {
    "name": "Run Nightwatch tests everyday at 9:00",
    "slackChannel": "C0129A519T8",
    "event": {
      "schedule": [{ "cron": "0 9 * * *" }]
    },
    "urls": ["https://master.professionals.csssr.cloud"],
    "commands": [
      "yarn et nightwatch:run --browser remote_chrome",
      "yarn et nightwatch:run --browser remote_firefox",
    ]
  },
],
```

Добавить для запуска при успешном обновлении стенда: 
```json
"releaseChannel": "canary",
"periodicRuns": [
  {
    "name": "Run Nightwatch tests when branch master is updated",
    "slackChannel": "C0129A519T8",
    "customEvent": "successful-deploy",
    "urls": ["https://master.professionals.csssr.cloud"],
    "commands": ["yarn et nightwatch:run --browser remote_chrome"]
  }
],
```

Пример по [ссылке](https://github.com/CSSSR/professionals-platform-e2e/blob/ee3f5c0ee319632caa1fcbabba1373cc6a232d53/e2e-tests/e2e-tools.json#L6-L14). 

### Подробности

Если указать `"slackChannel": "<channel-id>"`, то результат прогона будет отправляться в слак. ID канала можно найти в его настройках ([видеоинструкция](https://s.csssr.ru/U09LGPMEU/20210709142250.mp4)).

Способа запуска два:

1. Запуск по расписанию. Время запуска определяется строкой в формате CRON: `0 9 * * *`. Кастомизировать её удобно при помощи сайта [crontab.guru](https://crontab.guru/#0_9_*_*_*).

```json
"event": {
  "schedule": [{ "cron": "0 9 * * *" }]
}
```

2. Запуск при успешном деплое. Такой запуск работает только для тестовых стендов и только для деплоев при помощи [куберты](https://kuberta.csssr.cloud)

```json
"customEvent": "successful-deploy",
```

Также все переодичные запуски можно запустить вручную с вкладки «Actions» в репозитории.

Каждый URL, указанный в `urls` и каждая команда, указанныя в `commands`, создаёт отдельный файл, который можно запустить независимо.

Тесты не запускаются параллельно — если на момент запуска тестов другой запуск ещё идёт, то запуск попадёт в очередь и будет выполнен, когда первый запуск закончится

## ШАГ 3. Перегенерировать файлы
Перегенерировать файлы командой ```yarn et generate-periodic-runs```
