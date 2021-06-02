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
