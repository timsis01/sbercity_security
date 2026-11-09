"""Настройки Django-проекта «СберСити — безопасность».

Все параметры окружения читаются из переменных среды. Если ``POSTGRES_HOST``
не задан, используется SQLite — это удобно для быстрого локального запуска тестов,
в Docker всегда работает PostgreSQL.
"""

from pathlib import Path
from typing import Any

import django_stubs_ext

from config.env import env_bool, env_int, env_list, env_str

django_stubs_ext.monkeypatch()

BASE_DIR: Path = Path(__file__).resolve().parent.parent

SECRET_KEY: str = env_str("DJANGO_SECRET_KEY", "dev-insecure-secret-key-change-me")
DEBUG: bool = env_bool("DJANGO_DEBUG", False)
ALLOWED_HOSTS: list[str] = env_list("DJANGO_ALLOWED_HOSTS", ["localhost", "127.0.0.1", "backend"])
CSRF_TRUSTED_ORIGINS: list[str] = env_list(
    "DJANGO_CSRF_TRUSTED_ORIGINS",
    ["http://localhost", "http://localhost:8080", "http://localhost:5173", "http://127.0.0.1:5173"],
)

INSTALLED_APPS: list[str] = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "rest_framework",
    "django_filters",
    "drf_spectacular",
    "apps.core",
    "apps.accounts",
    "apps.catalog",
    "apps.news",
    "apps.orders",
    "apps.feedback",
]

MIDDLEWARE: list[str] = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF: str = "config.urls"

TEMPLATES: list[dict[str, Any]] = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION: str = "config.wsgi.application"

POSTGRES_HOST: str = env_str("POSTGRES_HOST")

DATABASES: dict[str, dict[str, Any]]
if POSTGRES_HOST:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.postgresql",
            "NAME": env_str("POSTGRES_DB", "sbercity_security"),
            "USER": env_str("POSTGRES_USER", "sbercity"),
            "PASSWORD": env_str("POSTGRES_PASSWORD", "sbercity"),
            "HOST": POSTGRES_HOST,
            "PORT": env_int("POSTGRES_PORT", 5432),
            "CONN_MAX_AGE": env_int("POSTGRES_CONN_MAX_AGE", 60),
        }
    }
else:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": env_str("SQLITE_PATH", str(BASE_DIR / "db.sqlite3")),
        }
    }

CACHES: dict[str, dict[str, Any]]
if env_str("DJANGO_CACHE", "locmem") == "database":
    CACHES = {
        "default": {
            "BACKEND": "django.core.cache.backends.db.DatabaseCache",
            "LOCATION": "django_cache",
        }
    }
else:
    CACHES = {"default": {"BACKEND": "django.core.cache.backends.locmem.LocMemCache"}}

AUTH_USER_MODEL: str = "accounts.User"

AUTH_PASSWORD_VALIDATORS: list[dict[str, str]] = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

LANGUAGE_CODE: str = "ru-ru"
TIME_ZONE: str = "Europe/Moscow"
USE_I18N: bool = True
USE_TZ: bool = True

STATIC_URL: str = "/django-static/"
STATIC_ROOT: Path = BASE_DIR / "staticfiles"
MEDIA_URL: str = "/media/"
MEDIA_ROOT: Path = Path(env_str("DJANGO_MEDIA_ROOT", str(BASE_DIR / "media")))

STORAGES: dict[str, dict[str, str]] = {
    "default": {"BACKEND": "django.core.files.storage.FileSystemStorage"},
    "staticfiles": {"BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage"},
}

DEFAULT_AUTO_FIELD: str = "django.db.models.BigAutoField"

SESSION_COOKIE_HTTPONLY: bool = True
SESSION_COOKIE_SAMESITE: str = "Lax"
SESSION_COOKIE_SECURE: bool = env_bool("DJANGO_SECURE_COOKIES", False)
CSRF_COOKIE_SAMESITE: str = "Lax"
CSRF_COOKIE_SECURE: bool = env_bool("DJANGO_SECURE_COOKIES", False)
CSRF_COOKIE_HTTPONLY: bool = False
SECURE_CONTENT_TYPE_NOSNIFF: bool = True
if env_bool("DJANGO_BEHIND_HTTPS_PROXY", False):
    SECURE_PROXY_SSL_HEADER: tuple[str, str] = ("HTTP_X_FORWARDED_PROTO", "https")
X_FRAME_OPTIONS: str = "DENY"

FORMS_THROTTLE_RATE: str = env_str("FORMS_THROTTLE_RATE", "30/hour")

REST_FRAMEWORK: dict[str, Any] = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "apps.core.authentication.CsrfEnforcedSessionAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.AllowAny",
    ],
    "DEFAULT_RENDERER_CLASSES": [
        "rest_framework.renderers.JSONRenderer",
    ],
    "DEFAULT_FILTER_BACKENDS": [
        "django_filters.rest_framework.DjangoFilterBackend",
        "rest_framework.filters.SearchFilter",
        "rest_framework.filters.OrderingFilter",
    ],
    "DEFAULT_PAGINATION_CLASS": "apps.core.pagination.StandardPagination",
    "PAGE_SIZE": 12,
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
    "NUM_PROXIES": env_int("NUM_PROXIES", 0) or None,
    "DEFAULT_THROTTLE_RATES": {
        "forms": FORMS_THROTTLE_RATE,
    },
    "EXCEPTION_HANDLER": "rest_framework.views.exception_handler",
}

SPECTACULAR_SETTINGS: dict[str, Any] = {
    "TITLE": "СберСити — безопасность API",
    "DESCRIPTION": "REST API интернет-магазина систем безопасности и видеоаналитики.",
    "VERSION": "1.0.0",
    "SERVE_INCLUDE_SCHEMA": False,
    "COMPONENT_SPLIT_REQUEST": True,
}

EMAIL_BACKEND: str = env_str("DJANGO_EMAIL_BACKEND", "django.core.mail.backends.console.EmailBackend")
EMAIL_HOST: str = env_str("DJANGO_EMAIL_HOST", "localhost")
EMAIL_PORT: int = env_int("DJANGO_EMAIL_PORT", 25)
DEFAULT_FROM_EMAIL: str = env_str("DJANGO_DEFAULT_FROM_EMAIL", "no-reply@sbercity-security.ru")
MANAGERS_EMAIL: str = env_str("MANAGERS_EMAIL", "sales@sbercity-security.ru")

SITE_INFO: dict[str, Any] = {
    "company_name": "СберСити — безопасность",
    "legal_name": "ООО «СберСити — безопасность»",
    "inn": env_str("SITE_INN", "7700000000"),
    "phones": env_list("SITE_PHONES", ["+7 (495) 000-00-00", "+7 (900) 000-00-00"]),
    "sales_email": env_str("SITE_SALES_EMAIL", "sales@sbercity-security.ru"),
    "info_email": env_str("SITE_INFO_EMAIL", "info@sbercity-security.ru"),
    "address": env_str("SITE_ADDRESS", "г. Москва, СберСити, Рублёво-Архангельское, ул. Технологическая, д. 1"),
    "working_hours": env_str("SITE_WORKING_HOURS", "ПН-ВС 9:00–19:00"),
    "office_hours": env_str("SITE_OFFICE_HOURS", "ПН-ПТ 10:00–19:00"),
    "telegram": env_str("SITE_TELEGRAM", "https://t.me/sbercity_security"),
    "delivery_cost": env_int("DELIVERY_COURIER_COST", 2500),
}

LOGGING: dict[str, Any] = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {"console": {"class": "logging.StreamHandler"}},
    "root": {"handlers": ["console"], "level": env_str("DJANGO_LOG_LEVEL", "INFO")},
}
