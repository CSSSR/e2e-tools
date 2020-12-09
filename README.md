# Инструмент для e2e тестирования

## Настройка окружения для разработки e2e

1. Установить [Git LFS](https://git-lfs.github.com)
1. Установить [Node.js LTS](https://nodejs.org/en/)
1. Установить [Yarn](https://yarnpkg.com/lang/en/docs/install/)
1. Склонировать репозиторий вашего проекта (e2e-tools должны быть уже настроены по [инструкции](./docs/SETUP.md))
1. Перейти в терминале в папку `e2e-tests`
1. Установить зависимости `yarn install` в `e2e-tests`

Параметры запуска и настройки браузера заданы в файле `/e2e-tests/e2e-tools.json`

Дополнительные [рекомендации по настройке окружения](./docs/ENVIRONMENT_SETUP.md).

## Написание тест-кейсов

### Синтаксис

- Файлы тестов должны располагаться в папке `e2e-tests\nightwatch\tests` (группировка по папкам допускается)
- Файлы тестов должны иметь название формата `<Наименование файла>.test.js`
- Формат тест-кейса:

```javascript
testcase('Наименование кейса', () => {
  <тело кейса>
})
```

- Формат шагов:

```javascript
step('наименование шага', () => {
	<команды, которые необходимо выполнить>
})
```

- Формат ожидания:

```javascript
expected('наименование ожидаемого результата', () => {
	 <команды, которые необходимо выполнить>
})
```

**Пример**

```javascript
testcase('Логаут', () => {
  step('кликаем на Аватар', () => {
    browser.click('[data-testid="AccountMenu:avatar"]')
  })
  step('кликаем на Выйти', () => {
    browser.click('[data-testid="AccountMenu:logout"]')
  })
  expected('отображается кнопка Войти', () => {
    browser.waitForElementPresent('[data-testid="Header:authLink"]')
  })
})
```

**Важно:** `step` и `expected` вне `testcase` выполняться не будут.

При создании тест-кейса рекомендуется использовать [атрибуты для поиска элементов (data-testid)](./docs/DATA_TESTID.md).

### Частые и кастомные команды

Все команды указаны в [документации Nightwatch](https://nightwatchjs.org/api/). В таблице ниже перечислены самые частые из них.

| Команда                                                                                           | Что делает                                                                                                                                                                                                                                               | Пример                                                                                                                                              |
| ------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| **browser.url()**                                                                                 | Открывает страницу по URL                                                                                                                                                                                                                                | `browser.url(browser.launch_url)`                                                                                                                   |
| **browser.click()**                                                                               | Нажимает на элемент                                                                                                                                                                                                                                      | `browser.click('[data-testid="Header:authLink"]')`                                                                                                  |
| **browser.waitForElementPresent()**                                                               | Проверяет, что элемент находится на странице                                                                                                                                                                                                             | `browser.waitForElementPresent('[data-testid="AuthForm:form"]')`                                                                                    |
| **browser.waitForElementNotPresent()**                                                            | Проверяет, что элемент отсутствует на странице                                                                                                                                                                                                           | `browser.waitForElementNotPresent('[data-testid="AuthForm:form"]')`                                                                                 |
| **browser.setValue()**                                                                            | Вводит значение в поле                                                                                                                                                                                                                                   | `browser.setValue('[data-testid="AuthForm:email"]', 'zakaz1@zakaz.ru')`                                                                             |
| **browser.pause()**                                                                               | Ожидает указанное время в мс                                                                                                                                                                                                                             | `browser.pause(5000)`                                                                                                                               |
| **browser.assert.containsText()**                                                                 | Проверяет текст внутри элемента с необходимым id                                                                                                                                                                                                         | `browser.assert.containsText('[data-testid="PasswordEditForm:informer"]','Пароль успешно изменён')`                                                 |
| **browser.moveToElement()**                                                                       | Наводит курсор на элемент                                                                                                                                                                                                                                | `browser.moveToElement('[data-testid="EditForm"]', 1, 1)`                                                                                           |
| **browser.assert.screenshotElement()**                                                            | Сравнивает скриншот объекта с эталонным скриншотом. Как работает: при самом первом запуске делает эталонный скриншот, при последующих сравнивает новый скриншот с эталоном.                                                                              | `browser.assert.screenshotElement('[data-testid="EditForm"]','форма редактирования')`                                                               |
| **browser.execute(dragAndDrop, ['селектор первого элемента','селектор элемента, куда двигаем'])** | Предоставляет функцию darg-and-drop. Как использовать: выполнить в терминале (достаточно один раз) `yarn add --dev html-dnd` и в начале теста объявить `var dragAndDrop = require('html-dnd').codeForSelectors`. После этого можно пользоваться командой |
| **.assert.screenshotElement()**                                                                   | Скрывает элементы страницы на скриншоте                                                                                                                                                                                                                  | `.assert.screenshotElement('[data-test-id="Card:root"]','вид карточки талант отказался',{ hideSelectors: ['[data-test-id="CardResponse:date"]'] })` |

### Полезное

- Браузер стартует в начале каждого тест-кейса и закрывается после его выполнения.
- Изменить время ожидания по умолчанию можно в файле `/e2e-test/e2e-tools` в строке `"waitForConditionTimeout": 10000`.
- После тестового прогона результат запуска сохраняется в отчет (адрес отчета доступен в конце лога запуска).

### Ошибки

| Ошибка                                                                               | Объяснение                                                                                                                |
| ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| `Error while running .clickElement() protocol action: An unknown error has occurred` | Возникает при попытке кликнуть на элемент, который есть на странице, но вне видимой части                                 |
| `Error while running "screenshotElement" command: Error: Unsupported image type`     | Возникает при попытке сделать скриншот элемента, которого нет на странице, или если эталонный скриншот не удалось считать |

## Документация

Для тимлидов:

- [Добавление тестов в проект](./docs/SETUP.md)
- [Конфигурирование e2e-tools](./docs/CONFIGURATION.md)

Для всех:

- [Как ревьюить e2e тесты](./docs/REVIEW.md)
- [Атрибуты для поиска элементов (data-testid)](./docs/DATA_TESTID.md)
- [Частые проблемы](./docs/TROUBLESHOOTING.md)
