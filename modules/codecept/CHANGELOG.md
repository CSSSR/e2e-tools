# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [1.1.8](https://github.com/CSSSR/e2e-tools/compare/@csssr/e2e-tools-codecept@1.1.6...@csssr/e2e-tools-codecept@1.1.8) (2022-03-31)


### Bug Fixes

* Add read permission for actions in codecept manual GitHub Action ([f79e0de](https://github.com/CSSSR/e2e-tools/commit/f79e0de38f1ee04a9b6bf86f81ff0a0b1de46d4e))
* Исправлена работа с зависимостями и каналами canary и alpha ([cc210b5](https://github.com/CSSSR/e2e-tools/commit/cc210b50b25964123c366b5cd49f17203e6393af))


### Features

* В генерируемые GitHub Actions добавлены настройки для запуска тестов из Allure TestOps ([31b000e](https://github.com/CSSSR/e2e-tools/commit/31b000e8b3d8ace1c3fb3cd6ab331ed339a4e4b5))
* Селективный запуск тестов в codecept через Test Plan из Allure TestOps ([759c316](https://github.com/CSSSR/e2e-tools/commit/759c316c7926e9c48ef8d07886490e89c9d568b9))





## [1.1.6](https://github.com/CSSSR/e2e-tools/compare/@csssr/e2e-tools-codecept@1.1.5...@csssr/e2e-tools-codecept@1.1.6) (2022-01-28)


### Bug Fixes

* Исправлена авторизация в Selenium в GitHub Actions с Nightwatch ([e6de454](https://github.com/CSSSR/e2e-tools/commit/e6de454882e3bef026c4f3e28e5a80e68d61733d))
* Исправлено форматирование по рекомендациям Prettier ([3637b87](https://github.com/CSSSR/e2e-tools/commit/3637b87877b5a25123e11a232745a90004b33ca0))





## [1.1.5](https://github.com/CSSSR/e2e-tools/compare/@csssr/e2e-tools-codecept@1.1.4...@csssr/e2e-tools-codecept@1.1.5) (2022-01-27)

**Note:** Version bump only for package @csssr/e2e-tools-codecept





## [1.1.4](https://github.com/CSSSR/e2e-tools/compare/@csssr/e2e-tools-codecept@1.1.3...@csssr/e2e-tools-codecept@1.1.4) (2021-11-23)

**Note:** Version bump only for package @csssr/e2e-tools-codecept





## [1.1.3](https://github.com/CSSSR/e2e-tools/compare/@csssr/e2e-tools-codecept@1.1.1...@csssr/e2e-tools-codecept@1.1.3) (2021-09-16)

**Note:** Version bump only for package @csssr/e2e-tools-codecept





## [1.1.1](https://github.com/CSSSR/e2e-tools/compare/@csssr/e2e-tools-codecept@1.1.0...@csssr/e2e-tools-codecept@1.1.1) (2021-09-16)


### Bug Fixes

* Исправлен варнинг о неправильном поле main ([6bbabf4](https://github.com/CSSSR/e2e-tools/commit/6bbabf4cba1f004724c47f94d9cddb2ca62055f4))


### Features

* Добавлена возможность генерировать GitHub Workflows для переодичных запусков тестов ([588d061](https://github.com/CSSSR/e2e-tools/commit/588d061d5231747f578d35d1b0f0a66c418bd204))
* Добавлены таймауты для генерируемых GitHub workflow. 30 минут для Codecept тестов, 90 минут для переодических запусков (`periodicRuns`) ([b3dc17b](https://github.com/CSSSR/e2e-tools/commit/b3dc17b94d02d157b7fc51acdd802d659b0744a3))





# 1.1.0 (2021-09-14)


### Bug Fixes

* Исправлен запуск конкретного теста в VSCode на Windows ([d682bbc](https://github.com/CSSSR/e2e-tools/commit/d682bbc6d69a6081c8f25afdc31fc0c5da801db4))
* Исправлена ссылка на документацию к тестам ([80fb3cf](https://github.com/CSSSR/e2e-tools/commit/80fb3cf741e4b28f2b14bdbefcdef455ecc04f7e))
* Исправлено использование Codecept с webdriver на case sensitive файловых системах ([5ab3665](https://github.com/CSSSR/e2e-tools/commit/5ab366522aaa6fc0241e7f908f671edcc41ee253))


### Features

* Генерация GitHub Workflow для запуска CodeceptJS тестов ([b6278b4](https://github.com/CSSSR/e2e-tools/commit/b6278b42597a6d0dc840ecd814ceb2a1034fea0f))
* Добавлена возможность запускать Codecept тесты на Selenium серверах ([8786852](https://github.com/CSSSR/e2e-tools/commit/8786852736c5fe3f115d450e41efe9d7d5363d16))
* Добавлена поддержка запуска тестов на CodeceptJS локально ([559cabb](https://github.com/CSSSR/e2e-tools/commit/559cabbdb243cd728b48b4cbde907da5e18e836a))
* Настроен запуск тестов из VSCode ([59ce0f0](https://github.com/CSSSR/e2e-tools/commit/59ce0f0ca7c30cb6e60b00aa826dcf1180d7113b))
