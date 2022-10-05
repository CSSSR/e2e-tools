# Настройка локального selenium для отладки тестов

Установка selenium и драйверов для chrome и firefox автоматизирована для windows и macos.
При первом запуске запросит задать переменную окружения LOCAL_SELENIUM_PATH. Нужно указать папку в которую будет устанавливаться selenium.
Папка будет создана и в нее загрузятся все необходимые зависимости для запуска selenium.

При последующих запусках тестов будет использоваться уже ранее запущенный selenium.

Важно чтобы порт 4444 в системе был свободен, иначе selenium не сможет запуститься.

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
