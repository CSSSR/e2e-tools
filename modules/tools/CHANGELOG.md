# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [1.6.9](https://github.com/CSSSR/e2e-tools/compare/@csssr/e2e-tools@1.6.8...@csssr/e2e-tools@1.6.9) (2022-10-05)

**Note:** Version bump only for package @csssr/e2e-tools





## [1.6.8](https://github.com/CSSSR/e2e-tools/compare/@csssr/e2e-tools@1.6.6...@csssr/e2e-tools@1.6.8) (2022-03-31)


### Bug Fixes

* Изменёна опция в вызове yarn upgrade с tilde на exact ([22fe570](https://github.com/CSSSR/e2e-tools/commit/22fe57002c589dbd5c605cc3722c2c2e6bae2cd2))
* Исправлена работа с зависимостями и каналами canary и alpha ([cc210b5](https://github.com/CSSSR/e2e-tools/commit/cc210b50b25964123c366b5cd49f17203e6393af))


### Features

* В генерируемые GitHub Actions добавлены настройки для запуска тестов из Allure TestOps ([31b000e](https://github.com/CSSSR/e2e-tools/commit/31b000e8b3d8ace1c3fb3cd6ab331ed339a4e4b5))
* Селективный запуск тестов в codecept через Test Plan из Allure TestOps ([759c316](https://github.com/CSSSR/e2e-tools/commit/759c316c7926e9c48ef8d07886490e89c9d568b9))





## [1.6.6](https://github.com/CSSSR/e2e-tools/compare/@csssr/e2e-tools@1.6.4...@csssr/e2e-tools@1.6.6) (2022-01-28)

### Bug Fixes

- Всегда генерируем Allure отчёт, а не только когда тесты прошли успешно ([896498f](https://github.com/CSSSR/e2e-tools/commit/896498f910af7ee0056d3d81ac4cb24c4e940fc7))
- Добавлен забытый import ([49905fd](https://github.com/CSSSR/e2e-tools/commit/49905fdf0a3c85250f874587fea97a19dfd41fdf))
- Добавлена пропущенная запятая ([f5259ea](https://github.com/CSSSR/e2e-tools/commit/f5259ea38c2d94eadb03fdd1a9a6e045a5cf8fe7))
- Исправлена авторизация в Selenium в GitHub Actions с Nightwatch ([e6de454](https://github.com/CSSSR/e2e-tools/commit/e6de454882e3bef026c4f3e28e5a80e68d61733d))
- Исправлена загрузка Allure отчёта ([140b112](https://github.com/CSSSR/e2e-tools/commit/140b1129a669f96716e58bf4cd82297e8be9e1f1))
- Исправлена картинка при падении тестов ([79b728b](https://github.com/CSSSR/e2e-tools/commit/79b728b739e5f3f6f3beec662505bb5a5dc4ce5d))
- Исправлена отправка уведомлений о запуске теста в Slack ([a48008f](https://github.com/CSSSR/e2e-tools/commit/a48008f7537447cae872e85f1d4fdd74e78e4b8a))
- Исправлена ссылка на логи в Slack нотификации ([577ba7a](https://github.com/CSSSR/e2e-tools/commit/577ba7a9d11c4dae932bd7f101e561332d5bf86a))
- исправлена формула расчёта процента успешно завершённых тестов ([641752e](https://github.com/CSSSR/e2e-tools/commit/641752e89e6e9be74a8984fb328d3914f9d961f8))
- Исправлено обрезание всех строк, кроме первых двух в отчёте по тестам в Slack сообщении ([d790a39](https://github.com/CSSSR/e2e-tools/commit/d790a399f1252953cab4ccabb3b6430522013d98))
- Исправлено отображение emoji при успешном завершении тестов ([5f620c6](https://github.com/CSSSR/e2e-tools/commit/5f620c6e0b0be135f982680ac0a170d492c6d569))
- Исправлено отображение времени прогона тестов ([8489127](https://github.com/CSSSR/e2e-tools/commit/8489127c75a2baa2d0eac78e8c2bd0521068096a))
- Исправлено отображение количества упавших тестов в title ([42c2b25](https://github.com/CSSSR/e2e-tools/commit/42c2b25fdfc29bfcca37d6af7a42f634745836a5))
- Исправлено получение переменных окружения для авторизации Selenium в Jenkins ([947e1af](https://github.com/CSSSR/e2e-tools/commit/947e1af7f7d2a29be901e8505825e3b0616f55d2))
- Исправлено склонение слов при выводе продолжительности теста ([fc8ed4a](https://github.com/CSSSR/e2e-tools/commit/fc8ed4a2526c45d2ba261b6a9167796bfce9df5b))
- Исправлено удаление старый переодических workflows ([14a8bd4](https://github.com/CSSSR/e2e-tools/commit/14a8bd44390ca106d021d8f9e1c2254b38c4f1c2))
- Исправлено форматирования процентов в Slack сообщении ([6ae6196](https://github.com/CSSSR/e2e-tools/commit/6ae6196a1b3e700e80b905c291886b5cc9d76a95))
- Исправлены отступы в отчёте о количестве тестов ([9f3dda6](https://github.com/CSSSR/e2e-tools/commit/9f3dda6fee5c676dd60a50787ef421e3cea5e10a))
- Исправлены перепутанные статусы сообщения в Slack ([cd490d4](https://github.com/CSSSR/e2e-tools/commit/cd490d4339d136ee6db6e819c421293560031e62))
- Не учитываем пропущенные тесты в статистике для Slack сообщения ([52649f0](https://github.com/CSSSR/e2e-tools/commit/52649f0d22059bbbc8baad517a0c8541c74b4628))
- проверка на абсолютный путь некорректно работает в GithubActions ([887a9fe](https://github.com/CSSSR/e2e-tools/commit/887a9fe95c8e49edf491d5f69d9a9b98f1742d5f))
- Сохраняем html отчёты в общую директорию, так как у них есть уникальный ID ([1f083b1](https://github.com/CSSSR/e2e-tools/commit/1f083b15031d795e3ffd1d7194ccbbe4def4a43c))

### Features

- Добавлен вывод длительности тестов в Slack уведомлении ([e1f5ba1](https://github.com/CSSSR/e2e-tools/commit/e1f5ba1334c2f97c0fc82a4acba70de3db1c69af))
- Добавлено количество тестов (упавших и прошедших в Slack сообщение ([347d79a](https://github.com/CSSSR/e2e-tools/commit/347d79a5e252114b948d91cb9e82f6d2505f2eeb))
- Добавлено предупреждение, что версия Node.js слишком низкая ([c7c0bbd](https://github.com/CSSSR/e2e-tools/commit/c7c0bbd16ed5e0380e8c811d0e313cade79cb76b))
- Обновляем workflow для переодических запусков во время yarn et upgrade ([821385a](https://github.com/CSSSR/e2e-tools/commit/821385a7f80d999e5cf535d176f46d79a23356a8))
- Улучшен вывод слак уведомления о прогоне тестов ([e9fe318](https://github.com/CSSSR/e2e-tools/commit/e9fe31855a10189600ede7b504a27894d20133ca))

## [1.6.4](https://github.com/CSSSR/e2e-tools/compare/@csssr/e2e-tools@1.6.3...@csssr/e2e-tools@1.6.4) (2022-01-27)

**Note:** Version bump only for package @csssr/e2e-tools

## [1.6.3](https://github.com/CSSSR/e2e-tools/compare/@csssr/e2e-tools@1.6.2...@csssr/e2e-tools@1.6.3) (2021-11-23)

**Note:** Version bump only for package @csssr/e2e-tools

## [1.6.2](https://github.com/CSSSR/e2e-tools/compare/@csssr/e2e-tools@1.6.0...@csssr/e2e-tools@1.6.2) (2021-09-16)

**Note:** Version bump only for package @csssr/e2e-tools

# [1.6.0](https://github.com/CSSSR/e2e-tools/compare/@csssr/e2e-tools@1.5.0...@csssr/e2e-tools@1.6.0) (2021-09-16)

### Features

- Добавлена возможность генерировать GitHub Workflows для переодичных запусков тестов ([588d061](https://github.com/CSSSR/e2e-tools/commit/588d061d5231747f578d35d1b0f0a66c418bd204))
- Добавлены таймауты для генерируемых GitHub workflow. 30 минут для Codecept тестов, 90 минут для переодических запусков (`periodicRuns`) ([b3dc17b](https://github.com/CSSSR/e2e-tools/commit/b3dc17b94d02d157b7fc51acdd802d659b0744a3))
- Используем node@14 и кэширование зависимостей при еженедельном обновлении e2e-tools ([9c82b2b](https://github.com/CSSSR/e2e-tools/commit/9c82b2bc88591d9dfd7734682a3cff7e6bc43417))

# [1.5.0](https://github.com/CSSSR/e2e-tools/compare/@csssr/e2e-tools@1.4.2...@csssr/e2e-tools@1.5.0) (2021-09-14)

### Bug Fixes

- Исправлен запуск конкретного теста в VSCode на Windows ([d682bbc](https://github.com/CSSSR/e2e-tools/commit/d682bbc6d69a6081c8f25afdc31fc0c5da801db4))

### Features

- Добавлена поддержка запуска тестов на CodeceptJS локально ([559cabb](https://github.com/CSSSR/e2e-tools/commit/559cabbdb243cd728b48b4cbde907da5e18e836a))
- Добавлены каналы релизов ([3c85ba7](https://github.com/CSSSR/e2e-tools/commit/3c85ba7893253210c465951681c5a311624b8f25))
- Настроен запуск тестов из VSCode ([59ce0f0](https://github.com/CSSSR/e2e-tools/commit/59ce0f0ca7c30cb6e60b00aa826dcf1180d7113b))

## [1.4.2](https://github.com/CSSSR/e2e-tools/compare/@csssr/e2e-tools@1.4.1...@csssr/e2e-tools@1.4.2) (2021-05-07)

**Note:** Version bump only for package @csssr/e2e-tools

## [1.4.1](https://github.com/CSSSR/e2e-tools/compare/@csssr/e2e-tools@1.4.0...@csssr/e2e-tools@1.4.1) (2020-12-09)

**Note:** Version bump only for package @csssr/e2e-tools

# [1.4.0](https://github.com/CSSSR/e2e-tools/compare/@csssr/e2e-tools@1.3.4...@csssr/e2e-tools@1.4.0) (2020-09-07)

### Features

- update dependencies ([#11](https://github.com/CSSSR/e2e-tools/issues/11)) ([c658cb4](https://github.com/CSSSR/e2e-tools/commit/c658cb4c2b49e80c024f133e0491a4d9db1119b4))

## [1.3.4](https://github.com/CSSSR/e2e-tools/compare/@csssr/e2e-tools@1.3.3...@csssr/e2e-tools@1.3.4) (2020-07-08)

### Bug Fixes

- Добавил .npmrc файл, чтобы зависимости не брались из github registry ([ee8ad6a](https://github.com/CSSSR/e2e-tools/commit/ee8ad6a2316eb9d86b6f0a5a12c587d3f8faa734))

## [1.3.3](https://github.com/CSSSR/e2e-tools/compare/@csssr/e2e-tools@1.3.1...@csssr/e2e-tools@1.3.3) (2020-04-29)

**Note:** Version bump only for package @csssr/e2e-tools

## [1.3.1](https://github.com/CSSSR/e2e-tools/compare/@csssr/e2e-tools@1.3.0...@csssr/e2e-tools@1.3.1) (2020-04-24)

**Note:** Version bump only for package @csssr/e2e-tools

# [1.3.0](https://github.com/CSSSR/e2e-tools/compare/@csssr/e2e-tools@1.2.0...@csssr/e2e-tools@1.3.0) (2020-03-23)

### Features

- Добавил eslint ([e72f13c](https://github.com/CSSSR/e2e-tools/commit/e72f13cbb3d6b0eaadaf32e3cd3eed3aedb85105))
- Обновляем обычные зависимости в рамках yarn et upgrade ([9d702b1](https://github.com/CSSSR/e2e-tools/commit/9d702b165b4c228c911294daddd19af5398b0e34))

# [1.2.0](https://github.com/CSSSR/e2e-tools/compare/@csssr/e2e-tools@1.1.6...@csssr/e2e-tools@1.2.0) (2020-03-17)

### Features

- Обновление зависимостей ([#5](https://github.com/CSSSR/e2e-tools/issues/5)) ([493ad12](https://github.com/CSSSR/e2e-tools/commit/493ad12fdf0346f44d98cb874257b30d6000c442))

## [1.1.6](https://github.com/CSSSR/e2e-tools/compare/@csssr/e2e-tools@1.1.5...@csssr/e2e-tools@1.1.6) (2020-03-17)

### Bug Fixes

- Пофиксил запуск github action для обновления e2e tools ([56dd035](https://github.com/CSSSR/e2e-tools/commit/56dd0350e06dac6328535bd41f944b034418ca3e))

## [1.1.5](https://github.com/CSSSR/e2e-tools/compare/@csssr/e2e-tools@1.1.4...@csssr/e2e-tools@1.1.5) (2020-03-16)

### Bug Fixes

- Автообновление через github actions ([#4](https://github.com/CSSSR/e2e-tools/issues/4)) ([89fdedd](https://github.com/CSSSR/e2e-tools/commit/89fdedd45100dd3fd0bd3f58b8175135d563327c))

## [1.1.4](https://github.com/csssr-team/e2e-tools/compare/@csssr/e2e-tools@1.1.1...@csssr/e2e-tools@1.1.4) (2019-12-19)

### Bug Fixes

- add indent_style = tab for Makefile ([2ba894b](https://github.com/csssr-team/e2e-tools/commit/2ba894b6d0465cb23b03b980a9e0f8c6438d5617))
- Удалил неиспользуемые настройки eslint и vscode конфига ([1b6e7e8](https://github.com/csssr-team/e2e-tools/commit/1b6e7e8e1887b8f93078983ed188bf52061cbcd8))

## [1.1.1](https://github.com/csssr-team/e2e-tools/compare/@csssr/e2e-tools@1.1.0...@csssr/e2e-tools@1.1.1) (2019-12-09)

### Bug Fixes

- Remove deep-extend package usage because of security issue ([801ea5e](https://github.com/csssr-team/e2e-tools/commit/801ea5e0ab9e34c00b718b0bd1ca9e2374f8cddb))

# [1.1.0](https://github.com/csssr-team/e2e-tools/compare/@csssr/e2e-tools@1.0.4...@csssr/e2e-tools@1.1.0) (2019-10-11)

### Features

- добавил генерацию editorconfig ([df13a11](https://github.com/csssr-team/e2e-tools/commit/df13a11))

## [1.0.4](https://github.com/csssr-team/e2e-tools/compare/@csssr/e2e-tools@1.0.3...@csssr/e2e-tools@1.0.4) (2019-10-07)

### Bug Fixes

- Иногда создавались вложенные папки e2e-tests/, поправил ([bfb1b46](https://github.com/csssr-team/e2e-tools/commit/bfb1b46))

## [1.0.3](https://github.com/csssr-team/e2e-tools/compare/@csssr/e2e-tools@1.0.2...@csssr/e2e-tools@1.0.3) (2019-09-27)

### Bug Fixes

- Улучшение UX при инициализации проекта ([f0da514](https://github.com/csssr-team/e2e-tools/commit/f0da514))

## [1.0.2](https://github.com/csssr-team/e2e-tools/compare/@csssr/e2e-tools@1.0.1...@csssr/e2e-tools@1.0.2) (2019-09-25)

### Bug Fixes

- Добавил потерянную папку .vscode ([327a5d8](https://github.com/csssr-team/e2e-tools/commit/327a5d8))

## [1.0.1](https://github.com/csssr-team/e2e-tools/compare/@csssr/e2e-tools@1.0.0...@csssr/e2e-tools@1.0.1) (2019-09-05)

### Bug Fixes

- Если не удалось получить переменную окружения, выводим об этом сообщение в терминал ([f365a27](https://github.com/csssr-team/e2e-tools/commit/f365a27))

# 1.0.0 (2019-09-03)

### Bug Fixes

- Required e2e tool package after it was installed ([fb87280](https://github.com/csssr-team/e2e-tools/commit/fb87280))
- **add-tool:** install package with `yarn add` ([7dfb405](https://github.com/csssr-team/e2e-tools/commit/7dfb405))

- chore!: Rename to @csssr/e2e-tools, and autopublishing (#1) ([7931d7f](https://github.com/csssr-team/e2e-tools/commit/7931d7f)), closes [#1](https://github.com/csssr-team/e2e-tools/issues/1)

### BREAKING CHANGES

- Renamed into @csssr/e2e-tools

GAZ-1946

## 0.2.2 (2019-09-03)

### Bug Fixes

- Required e2e tool package after it was installed ([fb87280](https://github.com/csssr-team/e2e-tools/commit/fb87280))
- **add-tool:** install package with `yarn add` ([7dfb405](https://github.com/csssr-team/e2e-tools/commit/7dfb405))

## 0.2.1 (2019-09-02)

### Bug Fixes

- Required e2e tool package after it was installed ([fb87280](https://github.com/csssr-team/e2e-tools/commit/fb87280))
- **add-tool:** install package with `yarn add` ([7dfb405](https://github.com/csssr-team/e2e-tools/commit/7dfb405))
