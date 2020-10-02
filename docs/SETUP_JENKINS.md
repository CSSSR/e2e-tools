# Настройка Jenkins для e2e тестов

1. Создать multibranch pipeline [в Jenkins](https://jenkins.csssr.ru/view/all/newJob) с именем `{название проекта}-nightwatch-e2e`.
1. Указать в последнем поле «Copy from» `professionals-nightwatch-e2e`, нажимать OK.
1. Изменить Display Name на `{читаемое название проекта}: Тесты Nightwatch`.
1. Заполнить Repository HTTPS URL.
1. Если у пользователя csssr-team нет доступа к репозиторию, выдать его (проверить можно кнопкой Validate).
1. Сохранить форму.
1. Дать людям доступ ко всем джобам с префиксом `{название проекта}`.
1. Добавить в репозиторий jenkins-вебхук ([пример](https://github.com/CSSSR/gazprom/settings/hooks/91717034), секрет в 1Password).
