# СберСити — безопасность

Интернет-магазин систем видеоаналитики, безопасности и пожаротушения.
Структура и содержание — как у [Сигуртех](https://sigurtech.com/), визуальный стиль — как у [СберСити](https://sbercity.ru/).

| Слой | Технологии |
|------|------------|
| Бэкенд | Python 3.13, Django 5.2 LTS, Django REST Framework, django-filter, drf-spectacular, PostgreSQL 17 |
| Фронтенд | React 19, TypeScript (strict), React Router 7, CSS Modules, Vite |
| Инфраструктура | Docker, docker compose, nginx (раздаёт SPA и проксирует API), gunicorn |
| Тесты | pytest + pytest-django, Vitest + Testing Library, Playwright |

## Быстрый старт в Docker

```bash
cp .env.example .env
docker compose up -d --build
```

После запуска:

- сайт — <http://localhost:8080>
- API — <http://localhost:8080/api/>, документация Swagger — <http://localhost:8080/api/docs/>
- админка — <http://localhost:8080/admin/> (логин и пароль — `DJANGO_SUPERUSER_EMAIL` / `DJANGO_SUPERUSER_PASSWORD` из `.env`)

При первом старте контейнер бэкенда сам ждёт PostgreSQL, применяет миграции, загружает демо-каталог (41 товар, 13 категорий, 8 новостей, промокоды `SBERCITY10` и `VOLUME15`) и создаёт администратора.

## Архитектура

```
браузер ──► nginx (frontend, :8080)
              ├── /            → статика React (SPA, fallback на index.html)
              ├── /api/, /admin/, /django-static/ → gunicorn + Django (backend:8000) ──► PostgreSQL (db)
              └── /media/      → общий том media
```

Фронтенд и API работают с одного origin, поэтому используется сессионная аутентификация Django с CSRF-защитой.
CSRF-токен обязателен для **всех** небезопасных запросов, в том числе от гостей (форма заказа, заявки, вход).

### Бэкенд (`backend/`)

| Приложение | Назначение |
|------------|------------|
| `core` | health-check, сведения о компании, CSRF, пагинация, троттлинг форм, команды `wait_for_db`, `ensure_superuser` |
| `accounts` | пользователь с входом по email, регистрация, вход/выход, профиль |
| `catalog` | дерево категорий, товары, поиск/фильтры/сортировка, команда `seed_demo` |
| `news` | новости |
| `orders` | корзина-расчёт (`quote`), промокоды, заказы с фиксацией цен, письма покупателю и менеджеру |
| `feedback` | обратный звонок / запрос цены / быстрый заказ, сообщения, отзывы с модерацией, подписка |

Изображения товаров — объёмные SVG-модели (`frontend/src/components/catalog/ProductRender.tsx`): камера, касса с маяком,
терминал распознавания лиц, HASP-ключ, блок реле, огнетушитель и т. д. Модель выбирается полем «Модель иллюстрации»
(`visual`) в админке товара; если загрузить фото, вместо модели показывается оно.

Фото города на первом экране (`frontend/public/images/hero-city.*`) взято с сайта СберСити — для публичного запуска
нужно разрешение правообладателя.

Расчёт стоимости вынесен в чистый модуль `apps/orders/pricing.py`; итоговую сумму всегда считает сервер по актуальным ценам.

### Фронтенд (`frontend/`)

- `src/api` — типизированный клиент (CSRF, разбор ошибок DRF по полям) и функции эндпоинтов;
- `src/context` — сайт, авторизация, корзина (localStorage + синхронизация вкладок), UI (модалка «Связаться», уведомления);
- `src/hooks` — `useAsync`, `useForm` (клиентская валидация + ошибки сервера по полям);
- `src/components`, `src/pages` — интерфейс; стили — CSS Modules и токены в `src/styles/global.css`.

Страницы: главная, каталог и разделы, карточка товара, корзина, оформление, подтверждение заказа, личный кабинет,
новости, «Как купить», «Доставка», «Гарантия», «О нас» (с отзывами), «Контакты», политика конфиденциальности, 404.

## API

| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/api/health/` | состояние сервиса и БД |
| GET | `/api/site/` | контакты и реквизиты компании |
| GET | `/api/csrf/` | выдаёт cookie `csrftoken` |
| GET | `/api/catalog/categories/` | дерево категорий со счётчиками |
| GET | `/api/catalog/categories/{slug}/` | категория с хлебными крошками |
| GET | `/api/catalog/products/` | товары: `category`, `search`, `ordering`, `price_min`, `price_max`, `brand`, `is_bestseller`, `is_new`, `in_stock`, `page`, `page_size` |
| GET | `/api/catalog/products/{slug}/` | карточка товара |
| GET | `/api/catalog/products/{slug}/related/` | похожие товары |
| GET | `/api/news/`, `/api/news/{slug}/` | новости |
| POST | `/api/orders/quote/` | расчёт корзины (скидка, доставка, итог) |
| POST | `/api/orders/promo/` | проверка промокода |
| POST | `/api/orders/` | оформление заказа |
| GET | `/api/orders/` | история заказов (только авторизованным) |
| GET | `/api/orders/{number}/` | заказ (владелец или та же сессия) |
| POST | `/api/auth/register/`, `/api/auth/login/`, `/api/auth/logout/` | регистрация, вход, выход |
| GET, PATCH | `/api/auth/me/` | профиль |
| POST | `/api/feedback/callback/` | заявка: `callback`, `price`, `quick_order`, `consultation` |
| POST | `/api/feedback/contact/` | сообщение со страницы контактов |
| POST | `/api/feedback/subscribe/` | подписка на скидки |
| GET, POST | `/api/feedback/reviews/` | отзывы (новые — на модерацию) |
| GET | `/api/feedback/reviews/summary/` | средняя оценка и число отзывов |
| GET | `/api/schema/`, `/api/docs/` | OpenAPI-схема и Swagger UI |

Публичные формы ограничены по частоте (`FORMS_THROTTLE_RATE`, по умолчанию 30 в час с IP).

## Локальная разработка без Docker

Бэкенд (без `POSTGRES_HOST` используется SQLite):

```bash
cd backend
py -3.13 -m venv .venv
.venv/Scripts/pip install -r requirements-dev.txt
set DJANGO_DEBUG=1
.venv/Scripts/python manage.py migrate
.venv/Scripts/python manage.py seed_demo
.venv/Scripts/python manage.py runserver
```

Фронтенд (Vite проксирует `/api` и `/admin` на `127.0.0.1:8000`):

```bash
cd frontend
npm install
npm run dev
```

## Тесты — пирамида

| Уровень | Бэкенд | Фронтенд |
|---------|--------|----------|
| Статика | `ruff check`, `ruff format --check`, `mypy --strict` | `eslint` (обязательные JSDoc, запрет комментариев), `tsc --noEmit` |
| Модульные | `tests/unit`: расчёт цен, валидаторы, модели, сервисы заказа, команды | `src/lib/*.test.ts`, `src/api/client.test.ts`, `src/hooks/useForm.test.ts` |
| Интеграционные | `tests/integration`: все эндпоинты API на реальной БД, CSRF, троттлинг, письма, админка, OpenAPI без предупреждений | `src/**/forms.test.tsx`, `src/pages/shop.test.tsx`: формы и страницы с провайдерами |
| E2E | — | `e2e/*.spec.ts` (Playwright): API-контракты, навигация (десктоп + мобильный), покупка, кабинет, все формы |

```bash
cd backend && .venv/Scripts/ruff check . && .venv/Scripts/mypy apps config tests && .venv/Scripts/pytest --cov
cd frontend && npm run lint && npm run typecheck && npm run test:coverage
cd frontend && npx playwright test
```

E2E сами поднимают Django на отдельной SQLite-базе и собранный фронтенд. Переменные:

- `E2E_CHANNEL=msedge` (или `chrome`) — использовать установленный браузер вместо скачиваемого Chromium (`npx playwright install chromium`);
- `E2E_BASE_URL=http://localhost:8080` — прогнать E2E против Docker-стенда.

Тесты в контейнерах (бэкенд — на PostgreSQL):

```bash
docker compose --profile test run --rm backend-tests
docker compose --profile test run --rm frontend-tests
```

## Переменные окружения

См. `.env.example`. Основные: `DJANGO_SECRET_KEY`, `DJANGO_DEBUG`, `DJANGO_ALLOWED_HOSTS`, `DJANGO_CSRF_TRUSTED_ORIGINS`,
`POSTGRES_*`, `DJANGO_SUPERUSER_EMAIL/PASSWORD`, `SEED_DEMO_DATA`, `FORMS_THROTTLE_RATE`, `SITE_*` (контакты на сайте),
`DELIVERY_COURIER_COST`, `DJANGO_EMAIL_BACKEND`.
В Docker заданы `DJANGO_CACHE=database` (общий для всех воркеров gunicorn кэш в PostgreSQL — на нём держится ограничение частоты форм)
и `NUM_PROXIES=1` (IP клиента берётся из `X-Forwarded-For`, который выставляет nginx; подделанные клиентом значения игнорируются).
Если перед nginx стоит ещё один прокси или балансировщик, увеличьте `NUM_PROXIES`. За HTTPS-прокси включите `DJANGO_BEHIND_HTTPS_PROXY=1` и `DJANGO_SECURE_COOKIES=1`.

## Соглашения по коду

- у всех модулей, классов и функций есть докстринги (Python — Google style, TypeScript — JSDoc);
- комментариев в коде нет — пояснения только в докстрингах;
- всё типизировано: `mypy --strict` с плагинами Django/DRF, TypeScript `strict` + `noUncheckedIndexedAccess`.

Контакты, телефоны и ИНН на сайте — заглушки, задаются через `SITE_*` в `.env`.
