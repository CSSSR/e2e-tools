# Рекомендации по настройке окружения

1. При изменении тестов необходимо открывать в редакторе директорию e2e-tests, а не основной проект, чтобы подтянулись настройки.

1. Для разработки рекомендуется использовать [VSCode](https://code.visualstudio.com) и следующий список расширений:

- [Автоматический форматер кода Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
- [Линтер ESLint для поиска частых ошибок в коде](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- [EditorConfig, чтобы подхватить настройки редактора для проекта](https://marketplace.visualstudio.com/items?itemName=EditorConfig.EditorConfig)

Быстро установить все экстеншены можно, выполнив команды:

```
code --install-extension esbenp.prettier-vscode
code --install-extension dbaeumer.vscode-eslint
code --install-extension EditorConfig.EditorConfig
```
