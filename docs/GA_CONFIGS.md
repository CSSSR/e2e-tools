# Настройка запусков в GitHub Actions

## Как настроить запуски в GitHub Actions

1. Откройте файл `e2e-tools.json`.
1. Добавьте настройки запусков в файл.

> В примерах ниже настройки приведены для Nightwatch. Они также применимы и к Codecept. Для этого нужно в командах изменить `nightwatch` на `codecept`.

Настройки для ежедневных автозапусков в 9 утра:

```json
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

Настройки для запуска при успешном обновлении стенда при помощи Кубереты:

```json
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

Настройки для запуска при успешном обновлении стенда при помощи GitHub Actions:

```json
"periodicRuns": [
  {
    "name": "Run Nightwatch tests when branch master is updated",
    "slackChannel": "C0129A519T8",
    "event": {
        "workflow_run": {
          "workflows": ["Deploy Workflow Name"],
          "types": ["completed"],
          "branches": ["master"]
        }
    },
    "urls": ["https://master.professionals.csssr.cloud"],
    "commands": ["yarn et nightwatch:run --browser remote_chrome"]
  }
],
```

Пример по [ссылке](https://github.com/CSSSR/s7/blob/aa47f1f94a3d9d5e2b7ad4441fd75a3fed1692e5/e2e-tests/e2e-tools.json#L3-L15).

3. Запустите любой тест на удаленном сервере. При первом прогоне будет запрос username и password, которые сразу запишутся в `.env`
4. Сгенерируйте файлы прогонов командой `yarn et generate-periodic-runs`.
5. Запушьте изменения в основную ветку.
6. Проверьте, что во вкладке репозитория Actions появились экшены для прогонов тестов. Настройки ручного запуска можно задать через [интерфейс GitHub](https://s.csssr.ru/UUK0K6P5F/2022-01-18-17-51-21-uyI9E.jpg)

## Пояснения к настройкам

Если указать `"slackChannel": "<channel-id>"`, то результат прогона будет отправляться в слак. ID канала можно найти в его настройках ([видеоинструкция](https://s.csssr.ru/U09LGPMEU/20210709142250.mp4)).

### Запуск по расписанию

Время запуска определяется строкой в формате CRON: `0 9 * * *`. Кастомизировать её удобно при помощи сайта [crontab.guru](https://crontab.guru/#0_9_*_*_*).

```json
"event": {
  "schedule": [{ "cron": "0 9 * * *" }]
}
```

### Запуск при успешном деплое через Куберту

Такой запуск работает только для тестовых стендов и только для деплоев при помощи [куберты](https://kuberta.csssr.cloud)

```json
"customEvent": "successful-deploy",
```

Можно запускать тесты на всех созданных стендах, если указать параметр {{url}}. В качестве URL будет использоваться URL стенда.

```json
"urls": ["{{url}}"],
```

Если указан параметр {{url}}, то можно также игнорировать отдельные URL/

```json
"ignoreUrls": ["cms"],
```

В таком случае, если в процессе деплоя создаётся два стенда:

- `https://test-branch.test.cluster`: основной стенд проекта для ветки `test-branch`
- `https://test-branch-cms.test.cluster`: стенд с CMS для ветки `test-branch`

То e2e тесты не будут запускаться для стенда с CMS

### Запуск при успешном деплое через GA

Только для деплоев при помощи GitHub Actions

```json
"event": {
  "workflow_run": {
    "workflows": ["Deploy Workflow Name"],
    "types": ["completed"],
    "branches": ["master"]
  }
}
```

По умолчанию периодические запуски используют тесты, которые расположены в `default` ветке репозитория. Исключением является ручной запуск Github Action, когда можно задать ветку в `Run workflow`.

Для того чтобы изменить ветку репозитория, тесты из которой будут использоваться, необходимо задать опцию `testsBranch`.

Использование тестов из ветки самого стенда доступно для события `"customEvent": "successful-deploy"`, необходимо указать `{{branch}}`.

```json
"testsBranch": "{{branch}}",
```

#### Пример

```json
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
    ],
    "testsBranch": "test"
  }
],
```

В таком случае при автоматическом запуске будут использоваться тесты из ветки, указанной в конфигурационном файле. При ручном запуске будут использоваться тесты из ветки, которая была указана в `Run workflow`.

Каждый URL, указанный в `urls`, и каждая команда, указанная в `commands`, создаёт отдельный файл, который можно запустить независимо.

Тесты не запускаются параллельно — если на момент запуска тестов другой запуск ещё идёт, то запуск попадёт в очередь и будет выполнен, когда первый запуск закончится

> _Обратите внимание!_
>
> Если в файле e2e-tools.json тип браузера “selenium” ("type": "selenium",) [пример](https://github.com/CSSSR/csssr.com/blob/46f58b18d54b7bb7e3733b72b482a5b1c9f18f55/e2e-tests/e2e-tools.json#L26), необходимо исправить имена переменных
>
> БЫЛО:
>
> ```json
> "basicAuth": {
>            "credentialsId": "chromedriver",
>           "username_env": "CHROMEDRIVER_USERNAME",
>           "password_env": "CHROMEDRIVER_PASSWORD"
>         },
> ```
>
> НЕОБХОДИМО ИСПРАВИТЬ НА:
>
> ```json
> "seleniumBasicAuth": {
>           "username_env": "SELENIUM_USERNAME",
>             "password_env": "SELENIUM_PASSWORD"
> },
> ```
