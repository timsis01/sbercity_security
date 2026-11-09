"""Конфигурация приложения feedback."""

from django.apps import AppConfig


class FeedbackConfig(AppConfig):
    """Регистрирует формы обратной связи."""

    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.feedback"
    verbose_name = "Обратная связь"
