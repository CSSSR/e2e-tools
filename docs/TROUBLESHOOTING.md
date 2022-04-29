# Проблемы и подсказки

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

<details>
  <summary>Пример: &lt;input> перекрывался &lt;span></summary>

![](http://s.csssr.ru/UGFKUFRBL/2021-11-16-14-11-36-eZM2a.jpg)
![](http://s.csssr.ru/UGFKUFRBL/2021-11-16-14-12-28-jsO5V.jpg)

</details>

## Как сквошить (oбъединить) коммиты

1. Смотришь какое у тебя количество коммитов
1. Выполняешь `git rebase -i HEAD~7` (вместо циферки своё количество). Должен открыться редактор со списком всех коммитов
1. У всех кроме первого меняешь pick на `squash`. Сохраняешь изменения. Закрываешь редактор.
1. Должен потом открыться редактор со списком названий коммитов. Тут удаляешь лишнее и пишешь название, которое тебе нравится. Сохраняешь, закрываешь. Должно написать `Successfully rebased`
1. Далее в консольке выполняешь `git push --force-with-lease` Ивсе

## Зафризить страницу, чтобы проинспектировать

`setTimeout(() => { debugger }, 5000)` (эту команду необходимо ввести в консоль и нажать enter)

## Особенности работы Codecept

- Для запуска тестов обязательно сохранять структуру тестов: Feature — Scenario. Без этого тесты запускаться не будут.
- Оператор [within](https://codecept.io/basics/#within) работает очень криво. Возможная замена — писать вместо этого `locator(someContainerLocator).find(someInnerElementLocator)`
- Метод `I.seeElement(elemSelector)` упадет, если элемент на странице есть, но не виден для юзера (даже если скрыт через css-свойство opacity).
