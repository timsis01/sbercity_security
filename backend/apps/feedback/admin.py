"""Административный интерфейс обратной связи."""

from django.contrib import admin
from django.db.models import QuerySet
from django.http import HttpRequest

from apps.feedback.models import CallbackRequest, ContactMessage, Review, Subscription


@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin[ContactMessage]):
    """Обработка сообщений с сайта."""

    list_display = ("name", "email", "phone", "created_at", "is_processed")
    list_editable = ("is_processed",)
    list_filter = ("is_processed",)
    search_fields = ("name", "email", "phone", "message")
    readonly_fields = ("created_at",)


@admin.register(CallbackRequest)
class CallbackRequestAdmin(admin.ModelAdmin[CallbackRequest]):
    """Обработка заявок на звонок и запросов цены."""

    list_display = ("topic", "name", "phone", "product", "created_at", "is_processed")
    list_editable = ("is_processed",)
    list_filter = ("topic", "is_processed")
    search_fields = ("name", "phone", "comment")
    readonly_fields = ("created_at",)


@admin.action(description="Одобрить выбранные отзывы")
def approve_reviews(modeladmin: admin.ModelAdmin[Review], request: HttpRequest, queryset: QuerySet[Review]) -> None:
    """Массово публикует отзывы.

    Args:
        modeladmin: Админ-класс отзывов.
        request: Текущий запрос.
        queryset: Выбранные отзывы.
    """
    queryset.update(is_approved=True)


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin[Review]):
    """Модерация отзывов."""

    list_display = ("author_name", "rating", "created_at", "is_approved")
    list_editable = ("is_approved",)
    list_filter = ("is_approved", "rating")
    search_fields = ("author_name", "text")
    actions = (approve_reviews,)


@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin[Subscription]):
    """Список подписчиков."""

    list_display = ("email", "is_active", "created_at")
    list_filter = ("is_active",)
    search_fields = ("email",)
