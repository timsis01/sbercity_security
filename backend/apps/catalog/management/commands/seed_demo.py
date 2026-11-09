"""Команда наполнения базы демонстрационными данными."""

import json
from decimal import Decimal
from pathlib import Path
from typing import Any

from django.core.management.base import BaseCommand, CommandParser
from django.db import transaction
from django.utils.dateparse import parse_datetime

from apps.catalog.models import Category, Product
from apps.news.models import Article
from apps.orders.models import PromoCode

DATA_DIR = Path(__file__).resolve().parent.parent.parent / "data"

DEMO_PROMO_CODES: tuple[tuple[str, int], ...] = (("SBERCITY10", 10), ("VOLUME15", 15))


class Command(BaseCommand):
    """Загружает каталог, новости и промокоды; повторный запуск обновляет записи."""

    help = "Наполняет базу демонстрационным каталогом, новостями и промокодами"

    def add_arguments(self, parser: CommandParser) -> None:
        """Регистрирует флаг ``--if-empty``.

        Args:
            parser: Парсер аргументов команды.
        """
        parser.add_argument(
            "--if-empty",
            action="store_true",
            help="Пропустить загрузку, если в каталоге уже есть товары",
        )

    def handle(self, *args: Any, **options: Any) -> None:
        """Выполняет загрузку данных.

        Args:
            *args: Позиционные аргументы.
            **options: Разобранные параметры командной строки.
        """
        if options.get("if_empty") and Product.objects.exists():
            self.stdout.write("Каталог уже заполнен — пропускаю.")
            return
        with transaction.atomic():
            categories, products = self._load_catalog()
            articles = self._load_news()
            promos = self._load_promos()
        self.stdout.write(
            self.style.SUCCESS(
                f"Готово: категорий {categories}, товаров {products}, новостей {articles}, промокодов {promos}."
            )
        )

    def _load_catalog(self) -> tuple[int, int]:
        """Создаёт или обновляет категории и товары из ``catalog.json``.

        Returns:
            Количество обработанных категорий и товаров.
        """
        payload: dict[str, list[dict[str, Any]]] = json.loads((DATA_DIR / "catalog.json").read_text(encoding="utf-8"))
        by_slug: dict[str, Category] = {}
        for item in payload["categories"]:
            parent_slug = item.get("parent")
            category, _ = Category.objects.update_or_create(
                slug=item["slug"],
                defaults={
                    "name": item["name"],
                    "description": item.get("description", ""),
                    "position": item.get("position", 0),
                    "parent": by_slug[parent_slug] if parent_slug else None,
                    "is_active": True,
                },
            )
            by_slug[category.slug] = category
        for item in payload["products"]:
            price = item.get("price")
            old_price = item.get("old_price")
            Product.objects.update_or_create(
                slug=item["slug"],
                defaults={
                    "category": by_slug[item["category"]],
                    "title": item["title"],
                    "sku": item.get("sku", ""),
                    "brand": item.get("brand", ""),
                    "manufacturer": item.get("manufacturer", ""),
                    "description": item.get("description", ""),
                    "requirements": item.get("requirements", ""),
                    "specs": item.get("specs", []),
                    "visual": item.get("visual", ""),
                    "price": Decimal(price) if price is not None else None,
                    "old_price": Decimal(old_price) if old_price is not None else None,
                    "is_bestseller": item.get("is_bestseller", False),
                    "is_new": item.get("is_new", False),
                    "popularity": item.get("popularity", 0),
                    "in_stock": True,
                    "is_published": True,
                },
            )
        return len(payload["categories"]), len(payload["products"])

    def _load_news(self) -> int:
        """Создаёт или обновляет новости из ``news.json``.

        Returns:
            Количество обработанных новостей.
        """
        items: list[dict[str, str]] = json.loads((DATA_DIR / "news.json").read_text(encoding="utf-8"))
        for item in items:
            published_at = parse_datetime(item["published_at"])
            if published_at is None:
                raise ValueError(f"Некорректная дата новости: {item['published_at']}")
            Article.objects.update_or_create(
                slug=item["slug"],
                defaults={
                    "title": item["title"],
                    "excerpt": item["excerpt"],
                    "body": item["body"],
                    "published_at": published_at,
                    "is_published": True,
                },
            )
        return len(items)

    def _load_promos(self) -> int:
        """Создаёт демонстрационные промокоды, не меняя уже существующие.

        Returns:
            Количество промокодов.
        """
        for code, percent in DEMO_PROMO_CODES:
            PromoCode.objects.get_or_create(code=code, defaults={"discount_percent": percent})
        return len(DEMO_PROMO_CODES)
