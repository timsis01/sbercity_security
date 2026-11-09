"""Конфигурация приложения news."""

from django.apps import AppConfig


class NewsConfig(AppConfig):
    """Регистрирует новости компании."""

    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.news"
    verbose_name = "Новости"
