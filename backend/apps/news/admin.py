"""Административный интерфейс новостей."""

from django.contrib import admin

from apps.news.models import Article


@admin.register(Article)
class ArticleAdmin(admin.ModelAdmin[Article]):
    """Публикация и редактирование новостей."""

    list_display = ("title", "published_at", "is_published")
    list_editable = ("is_published",)
    list_filter = ("is_published",)
    search_fields = ("title", "excerpt", "body")
    date_hierarchy = "published_at"
    prepopulated_fields = {"slug": ("title",)}
