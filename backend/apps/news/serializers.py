"""Сериализаторы новостей."""

from drf_spectacular.utils import extend_schema_field
from rest_framework import serializers

from apps.news.models import Article


class ArticleListSerializer(serializers.ModelSerializer[Article]):
    """Новость в ленте."""

    cover = serializers.SerializerMethodField()

    class Meta:
        """Поля карточки новости."""

        model = Article
        fields: tuple[str, ...] = ("id", "title", "slug", "excerpt", "cover", "published_at")

    @extend_schema_field(serializers.CharField(allow_null=True))
    def get_cover(self, obj: Article) -> str | None:
        """Возвращает URL обложки, если она загружена.

        Args:
            obj: Новость.

        Returns:
            Относительный URL или ``None``.
        """
        return obj.cover.url if obj.cover else None


class ArticleDetailSerializer(ArticleListSerializer):
    """Полный текст новости."""

    class Meta(ArticleListSerializer.Meta):
        """Поля карточки плюс текст."""

        fields = (*ArticleListSerializer.Meta.fields, "body")
