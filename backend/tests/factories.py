"""Фабрики тестовых данных."""

from decimal import Decimal
from typing import Any

from factory.declarations import PostGenerationMethodCall, Sequence, SubFactory
from factory.django import DjangoModelFactory

from apps.accounts.models import User
from apps.catalog.models import Category, Product
from apps.feedback.models import Review
from apps.news.models import Article
from apps.orders.models import PromoCode

TEST_PASSWORD = "Str0ng-Test-Pass!"


class UserFactory(DjangoModelFactory[User]):
    """Покупатель с известным паролем ``TEST_PASSWORD``."""

    class Meta:
        """Модель фабрики."""

        model = User
        skip_postgeneration_save = True

    email = Sequence(lambda n: f"user{n}@example.com")
    first_name = "Тест"
    password = PostGenerationMethodCall("set_password", TEST_PASSWORD)

    @classmethod
    def _after_postgeneration(cls, instance: User, create: bool, results: Any = None) -> None:
        """Сохраняет пользователя после установки пароля."""
        if create:
            instance.save()


class CategoryFactory(DjangoModelFactory[Category]):
    """Категория каталога."""

    class Meta:
        """Модель фабрики."""

        model = Category

    name = Sequence(lambda n: f"Категория {n}")
    slug = Sequence(lambda n: f"category-{n}")


class ProductFactory(DjangoModelFactory[Product]):
    """Опубликованный товар с ценой."""

    class Meta:
        """Модель фабрики."""

        model = Product

    category = SubFactory(CategoryFactory)
    title = Sequence(lambda n: f"Товар {n}")
    slug = Sequence(lambda n: f"product-{n}")
    sku = Sequence(lambda n: f"SKU-{n}")
    brand = "VIDEOSAPIENS"
    price = Decimal("1000.00")


class ArticleFactory(DjangoModelFactory[Article]):
    """Опубликованная новость."""

    class Meta:
        """Модель фабрики."""

        model = Article

    title = Sequence(lambda n: f"Новость {n}")
    slug = Sequence(lambda n: f"news-{n}")
    excerpt = "Анонс новости"
    body = "Текст новости"


class PromoCodeFactory(DjangoModelFactory[PromoCode]):
    """Действующий промокод."""

    class Meta:
        """Модель фабрики."""

        model = PromoCode

    code = Sequence(lambda n: f"PROMO{n}")
    discount_percent = 10


class ReviewFactory(DjangoModelFactory[Review]):
    """Одобренный отзыв."""

    class Meta:
        """Модель фабрики."""

        model = Review

    author_name = "Покупатель"
    rating = 5
    text = "Отличный магазин, всё быстро."
    is_approved = True
