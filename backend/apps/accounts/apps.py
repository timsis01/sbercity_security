"""Конфигурация приложения accounts."""

from django.apps import AppConfig


class AccountsConfig(AppConfig):
    """Регистрирует модель пользователя и эндпоинты аутентификации."""

    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.accounts"
    verbose_name = "Пользователи"
