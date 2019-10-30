# Настройка окружения

Обязательно нужно сделать только две вещи:

1. Установить [Git LFS](https://git-lfs.github.com/)
1. Установить [Yarn](https://yarnpkg.com/lang/en/docs/install/)

## Рекомендации

1. При изменении тестов стоит открывать в редакторе директорию e2e-tests, а не основной проект, чтобы подтянулись настройки.

1. Для разработки рекомендуется использовать [VSCode](https://code.visualstudio.com) и следующий список расширений:

- [Автоматический форматер кода Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
- [Линтер ESLint для поиска частых ошибок в коде](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- [EditorConfig, чтобы подхватить настройки редактора для проекта](https://marketplace.visualstudio.com/items?itemName=EditorConfig.EditorConfig)

Быстро установить все экстеншены можно, скопировав и запустив эти команды

```
code --install-extension esbenp.prettier-vscode
code --install-extension dbaeumer.vscode-eslint
code --install-extension EditorConfig.EditorConfig
```
