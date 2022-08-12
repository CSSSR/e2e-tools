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

Если указан параметр {{url}}, то можно также игнорировать отдельные URL.

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

### Передача переменных окружения через GitHub Secret

#### GitHub Action для ручного запуска тестов

Переменные окружения, доступные во время запуска тестов задаются в блоке `env` в файле `e2e-tools.json`

```json
  "env": {
    "API_URL": {
      "type": "string",
      "default": "https://api.project.csssr.cloud/",
      "description": "Адрес API, к которому обращается стенд"
    },
    "AUTH_LOGIN": {
      "type": "string",
      "default": "user.autotest",
      "description": "Логин пользователя для обращения напрямую к API"
    },
    "AUTH_PASSWORD": {
      "type": "string",
      "default": "123456",
      "description": "Пароль пользователя для обращения напрямую к API"
    }
  }
```

Если для переменной окружения `type` задан как `string` или `boolean`, в созданном GitHub Action переменные окружения задаются через `inputs`

```yaml
name: Run CodeceptJS e2e tests
concurrency: e2e-tests
on:
  workflow_dispatch:
    inputs:
      launchUrl:
        description: Базовый URL сайта
        default: 'https://master.project.csssr.cloud/'
        required: true
      browserName:
        description: Название браузера как в e2e-tools.json
        default: remote_chrome
        required: true
      ALLURE_JOB_RUN_ID:
        description: Inner parameter for Allure TestOps
        required: false
      API_URL:
        description: 'Адрес API, к которму обращается стенд'
        default: 'https://master.api.mpss.csssr.cloud/'
        required: true
      AUTH_LOGIN:
        description: Логин пользователя для обращения напрямую к API
        default: user.autotest
        required: true
      AUTH_PASSWORD:
        description: Пароль пользователя для обращения напрямую к API
        default: '123456'
        required: true
```

К сожалению GitHub ограничивает максимальное количество параметров, передаваемых через `inputs`. Можно передать не более 10 параметров.

Для обхода этого ограничения можно использовать передачу переменных окружения через GitHub Secrets

В настройках GitHub репозитория необходимо создать секрет, имя которого соответствуют имени переменной окружения
![GitHub Secret](https://s.csssr.com/U019SC8BZAB/2022-08-12-12-34-40-UfpavObozgpu.jpg)

![GitHub Secret](https://s.csssr.com/U019SC8BZAB/2022-08-12-12-36-12-IEjrsW3Cakw9.jpg)

И изменить `type` переменной на `github`

```json
  "env": {
    "API_URL": {
      "type": "string",
      "default": "https://api.project.csssr.cloud/",
      "description": "Адрес API, к которому обращается стенд"
    },
    "AUTH_LOGIN": {
      "type": "github",
      "default": "user.autotest",
      "description": "Логин пользователя для обращения напрямую к API"
    },
    "AUTH_PASSWORD": {
      "type": "github",
      "default": "123456",
      "description": "Пароль пользователя для обращения напрямую к API"
    }
  }
```

После этого необходимо пересоздать файлы GitHub Actions.
Теперь переменные окружения в GitHub Actions будут передаваться не через `inputs`, а через секреты GitHub репозитория.

Если секрет в репозитории не задан, то для переменной окружения будет использоваться значение параметра `default`

```yaml
- run: 'yarn et codecept:run --browser ${{ github.event.inputs.browserName }}'
  working-directory: e2e-tests
  env:
    API_URL: '${{ github.event.inputs.API_URL }}'
    AUTH_LOGIN: "${{ secrets.AUTH_LOGIN || 'user.autotest' }}"
    AUTH_PASSWORD: "${{ secrets.AUTH_PASSWORD || '123456' }}"
```

#### GitHub Action для регулярного запуска тестов

Для случая с GitHub Action для регулярного запуска тестов, который создаётся командой `yarn et generate-periodic-runs`, использовать `inputs` нельзя. Все переменные окружения будут передаваться только через секреты репозитория GitHub вне зависимости от указанного `type` в `e2e-tools.json`

> _Обратите внимание!_
>
> Если в файле e2e-tools.json тип браузера “selenium” ("type": "selenium",) [пример](https://github.com/CSSSR/csssr.com/blob/46f58b18d54b7bb7e3733b72b482a5b1c9f18f55/e2e-tests/e2e-tools.json#L26), необходимо исправить имена переменных
>
> БЫЛО:
>
> ```json
> "basicAuth": {
>           "credentialsId": "chromedriver",
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
>           "password_env": "SELENIUM_PASSWORD"
> },
> ```
