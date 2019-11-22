# Конфигурирование

## Добавление браузеров в проект

Firefox, запуск локально

```bash
yarn et nightwatch:add-browser --name local_firefox --configUrl https://csssr-team.github.io/selenium-servers/browsers/local_firefox.json
```

Firefox, запуск на удалённом Линукс-сервере

```bash
yarn et nightwatch:add-browser --name remote_firefox --configUrl https://csssr-team.github.io/selenium-servers/browsers/remote_firefox.json
```

## Смена языка браузера

Язык браузера можно задать в файле `e2e-tools.json`

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

Логин и пароль от стенда можно задать прямо в URL стенда

```json
{
  ...,
  "defaultLaunchUrl": "https://user:password@my.site.ru/"
}
```
