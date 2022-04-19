# Добавление тестов в проект

## Требования к системе

- [Git LFS](https://git-lfs.github.com)
- [Node.js](https://nodejs.org/en/) минимум 14 версии
- [Yarn](https://yarnpkg.com/lang/en/docs/install/)

## Добавление e2e-tools в проект

1. Перейти в папку проекта `cd ./some-project`.
1. Выполнить первичную инициализацию `npx -p @csssr/e2e-tools et init`.
1. Добавить Nightwatch или Codecept в зависимости от стека: `yarn et add-tool @csssr/e2e-tools-nightwatch` или `yarn et add-tool @csssr/e2e-tools-codecept`.
1. Проверить, что тесты запускаются `yarn et nightwatch:run` или `yarn et codecept:run`.
1. Перейти в сгенерированную папку `cd e2e-tests/`.
1. Изолировать папку `e2e-tests/` от остального проекта: добавить её в `.eslintignore`, `.prettierignore`, в `coverageIgnore` в конфиге jest и т. д.

После добавления тестов необходимо решить следующие организационные вопросы:

- Настроить прогоны тестов в [GitHub Actions](../docs/GA_CONFIGS.md)
- Попросить всех разработчиков тестов установить себе [Git LFS](https://git-lfs.github.com)
- Если на проекте используется Codecept в связке с Allure TestOps, то необходимо настроить их интеграцию.
- Попросить всех разработчиков тестов прочитать [документацию к данной библиотеке e2e тестов](https://github.com/CSSSR/e2e-tools/tree/master/docs).
- Дать доступ к репозиторию на запись QA в команде и на чтение команде [QA (e2e)](https://github.com/orgs/CSSSR/teams/qa-e2e/repositories), чтобы можно было приходить посмотреть на наработки друг друга.
- Посмотреть, какие еще можно настройки сделать в [библиотеке](../docs/CONFIGURATION.md).

## Обновление e2e-tools и e2e-tools-nightwatch

Чтобы обновить пакеты до последней версии и исправить файлы в проекте, выполните `yarn et upgrade`. После выполнения нужно проверить, что всё работает, закоммитить и запустить тесты в GitHub Actions.

Также в репозиторий каждую среду будет приходить PR с обновлениями зависимостей e2e-tools.
