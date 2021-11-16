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


## Ошибка «element not interactable»
Ошибка `An error occurred while running .... element not interactable`
Причины: 
1. Элемент за пределами вьюпорта (до него надо скролить)
2. Элемент 0 пикселей в высоту и ширину
3. Элемент перекрывается другим элементом
4. Клик отменяется через JS (не уверен, насколько это возможно)

Пример: 
`<input>` перекрывался `<span>` 
http://s.csssr.ru/UGFKUFRBL/2021-11-16-14-11-36-eZM2a.jpg
http://s.csssr.ru/UGFKUFRBL/2021-11-16-14-12-28-jsO5V.jpg
  
  
