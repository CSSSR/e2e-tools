# Частые проблемы

## Ошибка «An error occurred while retrieving a new session»

Ошибка `Error: An error occurred while retrieving a new session` часто возникает по одной из двух причин:

1. Версия chromedriver не совпадает с версией установленного chrome. Выполните `yarn et upgrade`, чтобы обновить её
2. В файле .env могут быть указаны неправильные логин и пароль. Как проверить: зайдите на https://chrome.selenium.csssr.cloud в режиме инкогнито и введите их

Если ничего не помогло, напишите в #e2e-tests в слаке.

## Ошибка «No tests defined! using source folder» при запуске конкретного файла

Ошибка `No tests defined! using source folder` возникает на Windows из-за пробелов в названиях файлов.

**Как исправить**

1. Нажимаем Ctrl+Shift+P
2. Вводим «Terminal: Select Default Shell»
3. Выбираем Powershell или Git Bash
