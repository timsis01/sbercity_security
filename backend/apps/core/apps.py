"""Конфигурация приложения core."""

from importlib import import_module

from django.apps import AppConfig


class CoreConfig(AppConfig):
    """Регистрирует общие компоненты проекта."""

    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.core"
    verbose_name = "Общее"

    def ready(self) -> None:
        """Подключает расширения OpenAPI-схемы при старте приложения."""
        import_module("apps.core.schema")
