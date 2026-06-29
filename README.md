# Tea Pod Nebes

Интернет-магазин чая с каталогом, корзиной, личным кабинетом, блогом, админ-панелью и обработкой заказов через Telegram.

Проект разделен на два приложения:

- `src/`, `public/` - React-фронтенд на Create React App.
- `backend/tea-backend/` - Laravel API для каталога, заказов, пользователей, блога, админки и Telegram webhook.

## Возможности

- Каталог чая с категориями, карточками товара и детальной страницей.
- Корзина с выбором веса и количества.
- Регистрация, вход, профиль покупателя и история заказов.
- Оформление заказа с оплатой QR или наличными при получении.
- Скидки по статусу покупателя и событийные скидки из админки.
- Избранное и отзывы.
- Блог о чае.
- Админ-панель: товары, пользователи, роли, блог, скидочные события, складские остатки.
- Telegram-уведомления о заказах с inline-кнопками для подтверждения, отклонения и отметки оплаты.
- Деплой фронтенда и бэкенда на Railway отдельными сервисами.

## Технологии

Фронтенд:

- React 19
- React Router 7
- Axios
- Create React App / `react-scripts`

Бэкенд:

- PHP 8.2+
- Laravel 12
- Eloquent ORM
- SQLite для локальной разработки, PostgreSQL/MySQL через переменные окружения
- PHPUnit

## Структура

```text
.
├── public/                         # HTML, favicon, статические изображения
├── src/
│   ├── api/                        # Axios-клиент API
│   ├── components/                 # Общие React-компоненты
│   ├── contexts/                   # Auth, cart, favorites
│   ├── pages/                      # Страницы сайта и админки
│   ├── styles/                     # Глобальные стили
│   └── utils/                      # Расчеты веса и доставки
├── backend/tea-backend/
│   ├── app/Http/Controllers/Api/   # API-контроллеры
│   ├── app/Models/                 # Eloquent-модели
│   ├── app/Services/               # TelegramOrderService
│   ├── app/Support/                # Бизнес-правила статусов покупателей
│   ├── database/migrations/        # Схема БД
│   ├── database/seeders/           # Стартовые категории, чай, блог
│   └── routes/api.php              # API-маршруты
├── railway.json                    # Railway-конфиг фронтенда
└── package.json                    # Скрипты фронтенда
```

## Быстрый старт

### Требования

- Node.js 20.x
- npm
- PHP 8.2+
- Composer
- SQLite или внешняя база данных

### Фронтенд

```bash
npm install
cp .env.example .env
npm start
```

По умолчанию фронтенд использует `REACT_APP_API_URL` из `.env`. Если переменная не задана, клиент обращается к production API:

```env
REACT_APP_API_URL=https://teapodnebes-production.up.railway.app/api
```

Для локального бэкенда обычно нужно:

```env
REACT_APP_API_URL=http://127.0.0.1:8000/api
```

### Бэкенд

```bash
cd backend/tea-backend
composer install
cp .env.example .env
php artisan key:generate
```

Для локального SQLite укажите в `backend/tea-backend/.env`:

```env
DB_CONNECTION=sqlite
DB_DATABASE=database/tea_shop.sqlite
FRONTEND_URL=http://localhost:3000
```

Создайте файл базы, выполните миграции и сиды:

```bash
php artisan migrate --seed
php artisan serve
```

API будет доступно на `http://127.0.0.1:8000/api`.

## Скрипты

Корень проекта:

```bash
npm start       # dev-сервер React
npm run build   # production-сборка в build/
npm test        # тесты CRA в watch-режиме
```

Бэкенд (`backend/tea-backend`):

```bash
composer test            # Laravel/PHPUnit тесты
php artisan test         # то же напрямую
php artisan migrate      # применить миграции
php artisan db:seed      # заполнить стартовые данные
php artisan serve        # локальный API-сервер
```

## Переменные окружения

### Фронтенд

| Переменная | Назначение | Пример |
| --- | --- | --- |
| `REACT_APP_API_URL` | Base URL Laravel API | `http://127.0.0.1:8000/api` |

### Бэкенд

Основные переменные:

| Переменная | Назначение |
| --- | --- |
| `APP_URL` | URL бэкенда |
| `FRONTEND_URL` | Разрешенный origin для CORS |
| `DB_CONNECTION` | Тип базы: `sqlite`, `pgsql`, `mysql` и т.д. |
| `DB_DATABASE` | Путь к SQLite или имя базы |
| `DATABASE_URL` | URL внешней БД, удобно для Railway PostgreSQL |
| `TELEGRAM_BOT_TOKEN` | Токен Telegram-бота |
| `TELEGRAM_CHAT_ID` | ID чата, куда отправляются заказы |
| `TELEGRAM_WEBHOOK_SECRET` | Секрет в URL webhook |
| `TELEGRAM_WEBHOOK_URL` | Публичный URL webhook, если используется настройка через окружение |

## API

Все маршруты находятся в `backend/tea-backend/routes/api.php` и доступны с префиксом `/api`.

Публичные маршруты:

| Метод | Путь | Назначение |
| --- | --- | --- |
| `GET` | `/teas` | Список товаров |
| `GET` | `/teas/{slug}` | Детальная страница товара |
| `GET` | `/blog` | Список статей |
| `GET` | `/blog/{slug}` | Детальная страница статьи |
| `POST` | `/register` | Регистрация |
| `POST` | `/login` | Вход |
| `GET` | `/ping` | Проверка доступности API |

Маршруты с Bearer-токеном:

| Метод | Путь | Назначение |
| --- | --- | --- |
| `GET` | `/me` | Текущий пользователь |
| `PUT` | `/profile` | Обновить профиль |
| `POST` | `/logout` | Выйти |
| `GET` | `/orders` | История заказов пользователя |
| `POST` | `/orders` | Создать заказ |
| `GET` | `/favorites` | Избранные товары |
| `POST` | `/favorites/{tea}` | Добавить товар в избранное |
| `DELETE` | `/favorites/{tea}` | Удалить товар из избранного |
| `POST` | `/reviews` | Создать отзыв |

Админские маршруты:

| Метод | Путь | Назначение |
| --- | --- | --- |
| `GET` | `/admin/dashboard` | Дашборд админки |
| `GET` | `/admin/teas` | Товары и категории для управления каталогом |
| `POST` | `/admin/teas` | Добавить товар |
| `DELETE` | `/admin/teas/{tea}` | Удалить товар |
| `GET` | `/admin/users` | Пользователи |
| `PUT` | `/admin/users/{user}/role` | Изменить роль |
| `GET` | `/admin/blog` | Управление блогом |
| `POST` | `/admin/blog` | Создать статью |
| `PUT` | `/admin/blog/{post}` | Обновить статью |
| `DELETE` | `/admin/blog/{post}` | Удалить статью |
| `GET` | `/admin/discount-events` | Скидочные события |
| `POST` | `/admin/discount-events` | Создать скидочное событие |

Telegram:

| Метод | Путь | Назначение |
| --- | --- | --- |
| `POST` | `/telegram/webhook/{secret}` | Обработка callback-кнопок заказа |

Авторизация устроена через токен, который API возвращает при регистрации или входе. Фронтенд хранит его в `localStorage` под ключом `token` и автоматически добавляет заголовок:

```http
Authorization: Bearer <token>
```

## Бизнес-правила

- Цена товара хранится как цена за 100 грамм.
- В заказе разрешены веса `5`, `10`, `15`, `25`, `50`, `100`, `200`, `357`.
- Доставка стоит `1000`, если сумма товаров после скидки меньше `6000`; от `6000` доставка бесплатна.
- Скидка заказа равна максимуму между скидкой статуса покупателя и активной событийной скидкой.
- Скидка статуса покупателя ограничивается 20%.
- При создании заказа остаток товара уменьшается внутри транзакции.
- Товар нельзя удалить, если он уже встречается в заказах; вместо этого остаток можно поставить `0`.

Статус покупателя зависит от количества купленных позиций в неотклоненных заказах:

| Куплено позиций | Скидка |
| --- | --- |
| 0-2 | 0% |
| 3-7 | 5% |
| 8-14 | 7% |
| 15-29 | 10% |
| 30-49 | 15% |
| 50+ | 20% |

## Роли

В модели пользователя есть роли админки:

- Владелец
- Старший администратор
- Администратор
- Заведующий складом

Доступ:

- Полная админка доступна владельцу, старшему администратору и администратору.
- Управление товарами доступно админам и заведующему складом.
- Управление ролями пользователей и событийными скидками доступно владельцу и старшему администратору.

## Telegram-заказы

Если `TELEGRAM_BOT_TOKEN` и `TELEGRAM_CHAT_ID` заполнены, новый заказ отправляется в Telegram. Сообщение содержит данные клиента, товары, вес, доставку, скидку и итоговую сумму.

Inline-кнопки позволяют:

- подтвердить заказ;
- отклонить заказ;
- отметить заказ как оплаченный.

Webhook принимает только URL с секретом:

```text
/api/telegram/webhook/{TELEGRAM_WEBHOOK_SECRET}
```

## Деплой на Railway

В проекте два `railway.json`:

- `railway.json` в корне - сборка и запуск React-фронтенда.
- `backend/tea-backend/railway.json` - сборка и запуск Laravel API.

Фронтенд:

```bash
npm install --include=dev --no-audit --no-fund
npm run build
npx --yes serve -s build -l $PORT
```

Бэкенд:

```bash
composer install --no-dev --optimize-autoloader --no-interaction
php artisan storage:link --force
php artisan migrate --force --seed
php artisan serve --host=0.0.0.0 --port=$PORT
```

Для production обычно нужны:

- `APP_ENV=production`
- `APP_DEBUG=false`
- `APP_KEY`
- `APP_URL`
- `FRONTEND_URL`
- `DB_CONNECTION=pgsql`
- `DATABASE_URL`
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`
- `TELEGRAM_WEBHOOK_SECRET`

## Проверка перед релизом

```bash
npm run build
cd backend/tea-backend
composer test
```

Также стоит вручную проверить:

- открытие каталога и карточки товара;
- регистрацию и вход;
- добавление товара в корзину;
- оформление заказа;
- админку и права ролей;
- отправку заказа в Telegram, если интеграция включена.

## Частые проблемы

### Фронтенд не видит API

Проверьте `REACT_APP_API_URL` в корневом `.env` и `FRONTEND_URL` в `.env` бэкенда. Для локального запуска обычно нужны:

```env
REACT_APP_API_URL=http://127.0.0.1:8000/api
FRONTEND_URL=http://localhost:3000
```

После изменения переменных окружения перезапустите dev-сервер React.

### Ошибка авторизации

Токен хранится в `localStorage`. Если API отвечает `401`, выйдите из профиля или очистите ключ `token` в браузере и войдите заново.

### Telegram не отправляет заказы

Проверьте `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` и доступность Telegram API с сервера. Если переменные пустые, заказ создается без Telegram-уведомления.

### Нет локальной SQLite базы

Создайте файл `backend/tea-backend/database/tea_shop.sqlite`, затем выполните:

```bash
cd backend/tea-backend
php artisan migrate --seed
```
