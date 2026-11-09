# СберСити - безопасность

Интернет-магазин систем видеоаналитики, безопасности и пожаротушения. Бэкенд на Django и PostgreSQL, фронтенд на React и TypeScript, запуск в Docker.

## Запуск

```bash
cp .env.example .env
docker compose up -d --build
```

После запуска:

- сайт: <http://localhost:8080>
- документация API (Swagger): <http://localhost:8080/api/docs/>
- админка: <http://localhost:8080/admin/>, логин и пароль задаются в `.env` (`DJANGO_SUPERUSER_EMAIL`, `DJANGO_SUPERUSER_PASSWORD`)

При первом старте применяются миграции, загружается демо-каталог и создаётся администратор.

Остановить:

```bash
docker compose down
```

## API

| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/api/health/` | состояние сервиса и базы данных |
| GET | `/api/site/` | контакты и реквизиты компании |
| GET | `/api/csrf/` | выдаёт cookie `csrftoken` |
| GET | `/api/catalog/categories/` | дерево категорий |
| GET | `/api/catalog/categories/{slug}/` | категория с хлебными крошками |
| GET | `/api/catalog/products/` | товары; параметры: `category`, `search`, `ordering`, `price_min`, `price_max`, `brand`, `is_bestseller`, `is_new`, `in_stock`, `page`, `page_size` |
| GET | `/api/catalog/products/{slug}/` | карточка товара |
| GET | `/api/catalog/products/{slug}/related/` | похожие товары |
| GET | `/api/news/` | список новостей |
| GET | `/api/news/{slug}/` | новость |
| POST | `/api/orders/quote/` | расчёт корзины: скидка, доставка, итог |
| POST | `/api/orders/promo/` | проверка промокода |
| POST | `/api/orders/` | оформление заказа |
| GET | `/api/orders/` | история заказов (только для авторизованных) |
| GET | `/api/orders/{number}/` | заказ |
| POST | `/api/auth/register/` | регистрация |
| POST | `/api/auth/login/` | вход |
| POST | `/api/auth/logout/` | выход |
| GET, PATCH | `/api/auth/me/` | профиль |
| POST | `/api/feedback/callback/` | заявка: обратный звонок, запрос цены, быстрый заказ, консультация |
| POST | `/api/feedback/contact/` | сообщение со страницы контактов |
| POST | `/api/feedback/subscribe/` | подписка на скидки |
| GET, POST | `/api/feedback/reviews/` | отзывы |
| GET | `/api/feedback/reviews/summary/` | средняя оценка и число отзывов |
| GET | `/api/schema/` | OpenAPI-схема |

Небезопасные запросы (POST, PATCH) требуют заголовок `X-CSRFToken` со значением cookie `csrftoken`.
