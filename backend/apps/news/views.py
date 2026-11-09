"""Эндпоинты новостей."""

from rest_framework import viewsets

from apps.news.models import Article, ArticleQuerySet
from apps.news.serializers import ArticleDetailSerializer, ArticleListSerializer


class ArticleViewSet(viewsets.ReadOnlyModelViewSet[Article]):
    """Лента новостей с постраничной выдачей и просмотр отдельной новости."""

    lookup_field = "slug"
    search_fields = ("title", "excerpt", "body")
    ordering_fields = ("published_at",)

    def get_queryset(self) -> ArticleQuerySet:
        """Возвращает только опубликованные новости."""
        return Article.objects.published()

    def get_serializer_class(self) -> type[ArticleListSerializer]:
        """Выбирает сериализатор в зависимости от действия."""
        if self.action == "retrieve":
            return ArticleDetailSerializer
        return ArticleListSerializer
