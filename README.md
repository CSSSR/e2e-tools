# Инструмент для e2e тестирования

Библиотека e2e-tools позволяет:

- Развернуть и настроить [CodeceptJS](https://codecept.io/) для написания тестов.
- Развернуть и настроить [Nightwatch.js](https://nightwatchjs.org/) для написания тестов.
- Настроить прогон тестов через GitHub Actions.
- Настроить связку с [Allure TestOps](https://qameta.io/): выгрузка отчетности, запуск автотестов (только для CodeceptJS).

## Настройка окружения для запуска тестов

1. Установить [Git LFS](https://git-lfs.github.com)
1. Установить [Node.js LTS](https://nodejs.org/en/)
1. Установить [Yarn](https://yarnpkg.com/lang/en/docs/install/)
1. Склонировать репозиторий вашего проекта (e2e-tools должны быть уже настроены по [инструкции](./docs/SETUP.md))
1. Перейти в терминале в папку `e2e-tests`
1. Установить зависимости `yarn install` в `e2e-tests`

Параметры запуска и настройки браузера заданы в файле `/e2e-tests/e2e-tools.json`

Дополнительные [рекомендации по настройке окружения](./docs/ENVIRONMENT_SETUP.md).

> Обратите внимание, что все команды, касающиеся тестов, необходимо выполнять, находясь в папке e2e-tests.

## Документация

Для тимлидов:

- [Добавление e2e-tools в проект](./docs/SETUP.md)
- [Конфигурирование e2e-tools](./docs/CONFIGURATION.md)
- [Настройка GitHub Actions для тестов](./docs/GA_CONFIGS.md)

Для всех:

- [Как писать тесты на Nightwatch](./docs/NIGHTWATCH_HINTS.md)
- [Как ревьюить e2e тесты](./docs/REVIEW.md)
- [Атрибуты для поиска элементов (data-testid)](./docs/DATA_TESTID.md)
- [Проблемы и подсказки](./docs/TROUBLESHOOTING.md)
