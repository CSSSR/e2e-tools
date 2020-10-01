# Инструмент для e2e тестирования

## Добавление инструмента для e2e в проект

- [Добавление тестов в проект](./docs/SETUP.md)

## Настройка окружения для начала разработки E2E (для QA)

1. Установить [Git LFS](https://git-lfs.github.com)
1. Установить [Node.js LTS](https://nodejs.org/en/)
1. Установить [Yarn](https://yarnpkg.com/lang/en/docs/install/)
1. Склонировать репозиторий вашего проекта (e2e-tools должны быть уже настроены по [инструкции](./docs/SETUP.md)) и перейти в терминале в папку `e2e-tests`
1. Установить зависимости `yarn install` (именно в `e2e-tests`)
1. Параметры запуска и настройки браузера заданы в файле `/e2e-tests/e2e-tools.json`  

## Синтаксис

- Файлы тестов должны распологаться в папке `e2e-tests\nightwatch\tests` (группировка по папкам допускается)
- Файлы тестов должны иметь название формата `<Наименование файла>.test.js`
- Формат тесткейса:

```javascript
testcase('Наименование кейса', () => {
  <тело кейса>
})
```

- формат шагов:

```javascript
step('наименование шага', () => {
	<команды которые необходимо выполнить>
})
```

- формат ожидания:

```javascript
expected('наименование ожидаемого результата', () => {
	 <команды которые необходимо выполнить>
})
```

**Пример:**

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

## Частые и кастомные команды

| Команда | Что делает | Пример |
| ------ | ------ | -  |
| **browser.url()** | 	Открытие страницы | `browser.url(browser.launch_url)` |
| **browser.click()** | Клик на элемент | `browser.click('[data-testid="Header:authLink"]')` |
| **browser.waitForElementPresent()** | Проверить, что элемент находится на странице | `browser.waitForElementPresent('[data-testid="AuthForm:form"]')` |
| **browser.waitForElementNotPresent()** | Проверить что элемент отсутствует на странице | `browser.waitForElementNotPresent('[data-testid="AuthForm:form"]')` |
| **browser.setValue()** | Ввести значение в поле | `browser.setValue('[data-testid="AuthForm:email"]', 'zakaz1@zakaz.ru')` |
| **browser.pause()** | Пауза | `browser.pause(5000)` |
| **browser.assert.containsText()** | Сравнить текст внутри элемента с необходимым id | `browser.assert.containsText('[data-testid="PasswordEditForm:informer"]','Пароль успешно изменён')` |
| **browser.moveToElement()** | Навести курсор на элемент | `browser.moveToElement('[data-testid="EditForm"]', 1, 1)` |
| **browser.assert.screenshotElement(**) | Сравнить скриншот объекта. Как работает: при самом первом запуске делает скриншот, при последующих сравнивает новый скриншот со скриншотом сделанным в самый первый раз.  | `browser.assert.screenshotElement('[data-testid="EditForm"]','форма редактирования')` |

Остальные команды можно посмотреть в [документации Nightwatch](https://nightwatchjs.org/api/).

| Дополнительно |   |
| - | - |
| **drag-and-drop** | Выполнить в терминале(достаточно один раз выполнить на проекте): `yarn add --dev html-dnd` В начале в тесте объявить: `var dragAndDrop = require('html-dnd').codeForSelectors` Далее можно пользоваться командой: `browser.execute(dragAndDrop, ['селектор  первого элемента','селектор элемента куда двигаем'])` |
| **Скрытие элементов страницы на скриншоте** | `.assert.screenshotElement('[data-test-id="Card:root"]','вид карточки талант отказался',{ hideSelectors: ['[data-test-id="CardResponse:date"]'] })` |

## Полезное

- браузер стартует в начале каждого testcase и закрывается после его выполнения соответственно 
- изменить время ожадания по умолчанию можно в файле `/e2e-test/e2e-tools` в строке `"waitForConditionTimeout": 10000`
- после тестового прогона результат запуска сохраняется в отчет (адрес отчета доступен в конце лога запуска)

## Об ошибках
| Ошибка | Объяснение |
| - | - |
| `Error while running .clickElement() protocol action: An unknown error has occurred` | при попытке кликнуть на элемент который есть на странице, но вне видимой части |
| `Error while running "screenshotElement" command: Error: Unsupported image type` | при попытке сделать скриншот элемента которого нет на странице или же в случае когда шаблонное изображение побилось |



## Документация

- [Как разработчикам работать с тестами: ревью, настройка окружения](./docs/DEVELOPERS_DOC.md)
