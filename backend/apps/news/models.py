"""Модель новости."""

from django.db import models
from django.utils import timezone


class ArticleQuerySet(models.QuerySet["Article"]):
    """Наборы новостей для сайта."""

    def published(self) -> "ArticleQuerySet":
        """Возвращает опубликованные новости с датой не позже текущего момента."""
        return self.filter(is_published=True, published_at__lte=timezone.now())


class Article(models.Model):
    """Новость или статья в блоге компании."""

    title = models.CharField("Заголовок", max_length=255)
    slug = models.SlugField("Слаг", max_length=200, unique=True)
    excerpt = models.TextField("Анонс", max_length=500)
    body = models.TextField("Текст")
    cover = models.ImageField("Обложка", upload_to="news/", blank=True)
    published_at = models.DateTimeField("Дата публикации", default=timezone.now)
    is_published = models.BooleanField("Опубликована", default=True)

    objects = ArticleQuerySet.as_manager()

    class Meta:
        """Свежие новости первыми."""

        verbose_name = "Новость"
        verbose_name_plural = "Новости"
        ordering = ("-published_at", "-id")

    def __str__(self) -> str:
        """Возвращает заголовок новости."""
        return self.title
