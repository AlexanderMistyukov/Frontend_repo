# Клиент: мониторинг благотворительных средств

React 18 + TypeScript (create-react-app), React Router, Redux Toolkit, Axios, SCSS.

## Запуск

1. Запустите бэкенд (`Backend_lab`), по умолчанию он слушает `http://localhost:5164`.
2. В папке `client`:
   ```
   npm install
   npm start
   ```
   Приложение откроется на `http://localhost:3000` (этот адрес разрешён в CORS бэкенда).

## Страницы

| Адрес | Описание | Доступ |
|---|---|---|
| `/login`, `/registration` | вход и регистрация | все |
| `/main` | категории, транзакции, поступления, расходы, файлы, статистика | любой вошедший (запись — admin и manager, удаление — admin) |
| `/administration` | список пользователей и назначение ролей | admin |
| `/no-permissions` | страница «нет прав» | все |
