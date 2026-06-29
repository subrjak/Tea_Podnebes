# Tea Pod Nebes API

Laravel API для интернет-магазина Tea Pod Nebes. Бэкенд отвечает за каталог чая, пользователей, авторизацию, корзину заказов, избранное, отзывы, блог, админку, скидки и Telegram-обработку заказов.

## Стек

- PHP 8.2+
- Laravel 12
- Composer
- SQLite для локальной разработки
- PostgreSQL/MySQL через `DATABASE_URL` или стандартные `DB_*` переменные
- PHPUnit

## Быстрый старт

```bash
composer install
cp .env.example .env
php artisan key:generate
```

Для локального SQLite:

```env
DB_CONNECTION=sqlite
DB_DATABASE=database/tea_shop.sqlite
FRONTEND_URL=http://localhost:3000
```

Создайте файл базы данных, затем примените миграции и сиды:

```bash
php artisan migrate --seed
php artisan serve
```

API будет доступно на `http://127.0.0.1:8000/api`.

## Команды

```bash
php artisan serve          # локальный сервер
php artisan migrate        # применить миграции
php artisan migrate:fresh --seed
php artisan db:seed        # заполнить стартовые данные
php artisan test           # тесты
composer test              # тесты через Composer script
```

## Важные директории

```text
app/Http/Controllers/Api/   # API-контроллеры
app/Models/                 # Eloquent-модели
app/Services/               # TelegramOrderService
app/Support/                # бизнес-правила статусов покупателей
database/migrations/        # схема БД
database/seeders/           # стартовые данные
routes/api.php              # API-маршруты
config/cors.php             # CORS для фронтенда
config/services.php         # Telegram и сторонние сервисы
```

## Окружение

| Переменная | Назначение |
| --- | --- |
| `APP_URL` | Публичный URL API |
| `FRONTEND_URL` | Origin фронтенда для CORS |
| `DB_CONNECTION` | Драйвер БД: `sqlite`, `pgsql`, `mysql` |
| `DB_DATABASE` | Путь к SQLite или имя базы |
| `DATABASE_URL` | URL внешней БД, например Railway PostgreSQL |
| `QUEUE_CONNECTION` | Драйвер очередей |
| `CACHE_STORE` | Драйвер кэша |
| `TELEGRAM_BOT_TOKEN` | Токен Telegram-бота |
| `TELEGRAM_CHAT_ID` | ID чата для заказов |
| `TELEGRAM_WEBHOOK_SECRET` | Секретный сегмент webhook URL |
| `TELEGRAM_WEBHOOK_URL` | Публичный webhook URL, если нужен в окружении |

## API

Все маршруты объявлены в `routes/api.php` и доступны с префиксом `/api`.

### Публичные

| Метод | Путь | Назначение |
| --- | --- | --- |
| `GET` | `/teas` | Каталог товаров |
| `GET` | `/teas/{slug}` | Товар по slug |
| `GET` | `/blog` | Статьи блога |
| `GET` | `/blog/{slug}` | Статья по slug |
| `POST` | `/register` | Регистрация |
| `POST` | `/login` | Вход |
| `GET` | `/ping` | Health check |

### Авторизованные

API возвращает токен при регистрации и входе. Клиент должен передавать его в заголовке:

```http
Authorization: Bearer <token>
```

| Метод | Путь | Назначение |
| --- | --- | --- |
| `GET` | `/me` | Текущий пользователь |
| `PUT` | `/profile` | Обновление профиля |
| `POST` | `/logout` | Выход |
| `GET` | `/orders` | Заказы пользователя |
| `POST` | `/orders` | Создание заказа |
| `GET` | `/favorites` | Избранное |
| `POST` | `/favorites/{tea}` | Добавить товар в избранное |
| `DELETE` | `/favorites/{tea}` | Удалить товар из избранного |
| `POST` | `/reviews` | Создать отзыв |

### Админка

| Метод | Путь | Назначение |
| --- | --- | --- |
| `GET` | `/admin/dashboard` | Сводка админки |
| `GET` | `/admin/teas` | Товары и категории |
| `POST` | `/admin/teas` | Добавить товар |
| `DELETE` | `/admin/teas/{tea}` | Удалить товар |
| `GET` | `/admin/users` | Пользователи |
| `PUT` | `/admin/users/{user}/role` | Назначить роль |
| `GET` | `/admin/blog` | Список статей для админки |
| `POST` | `/admin/blog` | Создать статью |
| `PUT` | `/admin/blog/{post}` | Обновить статью |
| `DELETE` | `/admin/blog/{post}` | Удалить статью |
| `GET` | `/admin/discount-events` | Скидочные события |
| `POST` | `/admin/discount-events` | Создать скидочное событие |

### Telegram webhook

```text
POST /api/telegram/webhook/{TELEGRAM_WEBHOOK_SECRET}
```

Webhook принимает callback-кнопки Telegram-сообщения заказа и меняет статус заказа:

- `confirm` - заказ подтвержден;
- `reject` - заказ отклонен;
- `paid` - заказ оплачен.

## Заказы

При создании заказа:

- пользователь определяется по Bearer-токену;
- товары блокируются на время транзакции через `lockForUpdate`;
- проверяются остатки;
- цена позиции считается от цены за 100 грамм;
- остаток товара уменьшается;
- заказ отправляется в Telegram, если интеграция настроена.

Разрешенные веса: `5`, `10`, `15`, `25`, `50`, `100`, `200`, `357`.

Доставка:

- `1000`, если сумма товаров после скидки меньше `6000`;
- бесплатно от `6000`.

Скидка заказа берется как максимум между скидкой статуса покупателя и активной событийной скидкой.

## Роли и доступы

Роли хранятся в `users.admin_status`.

| Роль | Доступ |
| --- | --- |
| Владелец | Полная админка, пользователи, скидки, каталог |
| Старший администратор | Полная админка, пользователи, скидки, каталог |
| Администратор | Админка и каталог |
| Заведующий складом | Управление каталогом и остатками |

## Telegram

Для включения Telegram-уведомлений заполните:

```env
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
TELEGRAM_WEBHOOK_SECRET=
```

Если токен или chat id пустые, заказ создается штатно, но Telegram-сообщение не отправляется.

Webhook URL должен указывать на:

```text
https://<api-domain>/api/telegram/webhook/<secret>
```

## Railway

`railway.json` в этой директории содержит команды для production:

```bash
composer install --no-dev --optimize-autoloader --no-interaction
php artisan storage:link --force
php artisan migrate --force --seed
php artisan serve --host=0.0.0.0 --port=$PORT
```

Для Railway PostgreSQL можно использовать:

```env
DB_CONNECTION=pgsql
DATABASE_URL=${{Postgres.DATABASE_URL}}
```

## Проверка

Перед деплоем:

```bash
php artisan test
php artisan route:list
```

После деплоя:

```bash
curl https://<api-domain>/api/ping
```

Ожидаемый ответ:

```json
{"pong":true}
```
