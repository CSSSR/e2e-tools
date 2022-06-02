# Настройка локального selenium для отладки тестов

Установка selenium и драйверов для chrome и firefox автоматизирована.
Запуск selenium также выполняется через скрипт.

## Windows

Необходимо выполнить сприпт `./scripts/local-selenium/win.ps1` в powershell с правами администратора. В случае если не установлена java может понадобиться выполнить его два раза.

## Mac

Необходимо выполнить сприпт `./scripts/local-selenium/mac.sh`.

## Правка e2e-tools.json

Чтобы использовать локальный selenium нужно изменить `local_chrome` и `local_firefox` в e2e-tools.json:

```json
"local_chrome": {
    "type": "selenium",
    "url": "http://localhost",
    "port": 4444,
    "browser": "chrome",
    "windowSize": "1920x1680",
    "desiredCapabilities": {
    "goog:chromeOptions": {
        "args": [
        "--no-sandbox",
        "--disable-gpu",
        "--window-size=1200,800"
        ]
    }
    }
},
"local_firefox": {
  "default": true,
  "type": "selenium",
  "url": "http://localhost",
  "port": 4444,
  "browser": "firefox",
  "windowSize": "1920x1680",
  "desiredCapabilities": {
    "browserName": "firefox",
    "moz:firefoxOptions": {
      "args": [
        "--window-size=1200,800"
      ]
    }
  }
},
```
