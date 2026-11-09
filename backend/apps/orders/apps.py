"""Конфигурация приложения orders."""

from django.apps import AppConfig


class OrdersConfig(AppConfig):
    """Регистрирует заказы и промокоды."""

    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.orders"
    verbose_name = "Заказы"
