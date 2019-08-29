# Добавление тестов в проект

## Требования к системе
- Установленный [Git LFS](https://git-lfs.github.com)
- [Node.js](https://nodejs.org/en/) минимум 10 версии
- [Yarn](https://yarnpkg.com/lang/en/docs/install/)

## Добавление тестов
1. Переходим в папку проекта `cd ./some-project`
1. Скачиваем e2e-tools и выполняем первичную инициализацию `npx -p @nitive/e2e-tools et init`
1. Переходим в сгенерированную папку `cd e2e-tests/`
1. Добавляем Nightwatch `yarn et add-tool @nitive/e2e-tools-nightwatch`
1. Проверяем, что тесты запускаются `yarn et nightwatch:run`

## Обновление e2e-tools и e2e-tools-nightwatch
Есть специальная команда `yarn et upgrade`, которая обновляет пакеты до последней версии
и автоматически фиксит файлы в проекте. После её прогона нужно проверить, что всё работает,
закоммитить и запустить тесты в дженкинсе.

### Версионирование
Major: Ломающие изменения  
Minor: Ломающие изменения, которые можно автоматически пофиксить командой `yarn et upgrade`  
Patch: Неломающие изменения
