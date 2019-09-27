# Настройка дженкинса для e2e тестов

## Для запуска Nightwatch тестов

1. Создаём multibranch pipeline [в дженкинсе](https://jenkins.csssr.ru/view/all/newJob), называем `{название проекта}-nightwatch-e2e`
1. В последнем поле «Copy from» указываем professionals-nightwatch-e2e, нажимаем OK
1. Меняем Display Name на `{читаемое название проекта}: Тесты Nightwatch`
1. Заполняем Repository HTTPS URL, сохраняем
1. Даём людям доступ ко всем джобам с префиксом `{название проекта}`
