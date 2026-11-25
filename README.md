# Backend_lab — мониторинг поступлений и расходования благотворительных средств (вариант 22)

ASP.NET Core Web API (.NET 8) · EF Core (Code First) · PostgreSQL · JWT с ролями · Swagger

## Запуск

1. Создайте БД PostgreSQL `CharityDb` (или восстановите дамп `charity_db.sql`).
2. Проверьте `ConnectionStrings:DefaultConnection` и `Jwt:Key` в `Backend_lab/appsettings.json`.
   Для реальных паролей/ключей используйте user-secrets или переменные окружения
   (`ConnectionStrings__DefaultConnection`, `Jwt__Key`), а не коммит в git.
3. Если БД пустая: `dotnet ef database update` (из папки `Backend_lab`).
4. `dotnet run` → Swagger: `http://localhost:5164/swagger`.
   Кнопка **Authorize** → вставить токен из `/login` (слово `Bearer` писать не нужно).

CORS разрешён для адресов из `Cors:AllowedOrigins` (по умолчанию порты 3000, 5173, 4200).

## Роли

| Роль | Права |
|---|---|
| `user` | просмотр категорий, транзакций, статистики, скачивание файлов |
| `manager` | всё как `user` + создание транзакций, доходов, расходов, загрузка файлов |
| `admin` | всё как `manager` + изменение/удаление транзакций, доходов, расходов, категорий, файлов |

Регистрация (`/register`) всегда создаёт роль `user`. Роли назначает администратор на странице «Администрирование» (или `PUT /administration/userrole`); новая роль попадает в токен после следующего входа пользователя.

## Эндпоинты

Все, кроме `/register` и `/login`, требуют заголовок `Authorization: Bearer <token>`.
Ошибки приходят в виде `{ "errorText": "..." }` (ошибки валидации — стандартный `ProblemDetails`, 400).

| Метод | URL | Роли | Описание |
|---|---|---|---|
| POST | `/register` | все | `{ login, password }` |
| POST | `/login` | все | `{ username, password }` → `{ access_token, username, role, expires_in }` |
| GET | `/me` | любая | данные текущего пользователя |
| GET | `/categories` | любая | категории с транзакциями |
| POST / PUT / DELETE | `/categories/category` | admin | `{ name, description? }` / `{ id, name, description? }` / `?id=` |
| GET | `/administration/users` | admin | список пользователей `{ id, login, role }` |
| PUT | `/administration/userrole` | admin | `{ userId, role }`, роли: `admin`, `manager`, `user`; свою роль менять нельзя |
| GET | `/transactions/transactions` | любая | все транзакции (с доходами, расходами, файлами) |
| GET | `/transactions/transaction/{id}` | любая | одна транзакция |
| POST | `/transactions/transaction` | admin, manager | `{ categoryId, title, amount, transactionDate, counterparty, notes? }` |
| PUT | `/transactions/transaction?id=` | admin | то же тело, можно сменить категорию |
| DELETE | `/transactions/transaction?id=` | admin | вместе с доходами, расходами и файлами |
| POST | `/transactions/income` | admin, manager | `{ transactionId, source, purpose, amount, incomeDate }` |
| DELETE | `/transactions/income?id=` | admin | |
| POST | `/transactions/expense` | admin, manager | `{ transactionId, recipient, expensePurpose, amount, expenseDate }` |
| DELETE | `/transactions/expense?id=` | admin | |
| GET | `/transactions/statistics` | любая | итоги и разбивка по категориям |
| POST | `/files/upload-form` | admin, manager | multipart/form-data: `file`, `transactionId` |
| POST | `/files/upload` | admin, manager | JSON: `{ fileName, fileContentBase64, transactionId }` |
| GET | `/files/download/{id}` | любая | скачивание по id файла |
| POST | `/files/download` | любая | `{ fileName }` — по `systemName` (или единственному `displayName`) |
| DELETE | `/files/{id}` | admin | удаление по id |
| DELETE | `/files/delete` | admin | `{ fileName }` |
| GET | `/files/info/{systemName}` | любая | сведения о файле |
| GET | `/files/transaction/{transactionId}` | любая | файлы транзакции |

Суммы: `amount` транзакции — сумма самой операции, она не меняется при добавлении доходов и расходов.
Остаток считается автоматически: `balance = totalIncome − totalExpense` (поля есть в ответе по каждой транзакции).
`/transactions/statistics`: `totalBalance` — общий остаток, `transactionsAmount` — сумма `amount` всех транзакций,
в `categoriesStats` у каждой категории есть `incomesSum`, `expensesSum` и `balance`.
Ответы `POST /transactions/income|expense` и `DELETE` возвращают актуальный `balance` транзакции.

Файлы: до 10 МБ, расширения `.pdf .txt .png .jpg .jpeg .doc .docx .xls .xlsx .csv`.
Даты можно отправлять как `2026-06-01` или `2026-06-01T10:00:00Z` — на сервере они приводятся к UTC.

## Пример для фронтенда (скачивание файла)

```js
const res = await fetch(`${API}/files/download/${id}`, { headers: { Authorization: `Bearer ${token}` } });
const blob = await res.blob();
const url = URL.createObjectURL(blob);
Object.assign(document.createElement('a'), { href: url, download: fileName }).click();
```

## Клиентское приложение

Папка `client` — React + TypeScript (см. `client/README.md`).
