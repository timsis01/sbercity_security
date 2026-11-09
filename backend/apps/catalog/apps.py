"""Конфигурация приложения catalog."""

from django.apps import AppConfig


class CatalogConfig(AppConfig):
    """Регистрирует каталог товаров."""

    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.catalog"
    verbose_name = "Каталог"
