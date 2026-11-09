"""Фильтры списка товаров."""

import django_filters

from apps.catalog.models import Category, Product, ProductQuerySet


class ProductFilter(django_filters.FilterSet):
    """Фильтрация по категории (с подкатегориями), цене, бренду и меткам."""

    category = django_filters.CharFilter(method="filter_category", label="Слаг категории")
    price_min = django_filters.NumberFilter(field_name="price", lookup_expr="gte", label="Цена от")
    price_max = django_filters.NumberFilter(field_name="price", lookup_expr="lte", label="Цена до")
    brand = django_filters.CharFilter(field_name="brand", lookup_expr="iexact", label="Бренд")
    is_bestseller = django_filters.BooleanFilter(label="Лидер продаж")
    is_new = django_filters.BooleanFilter(label="Новинка")
    in_stock = django_filters.BooleanFilter(label="В наличии")

    class Meta:
        """Модель и доступные поля фильтрации."""

        model = Product
        fields = ("category", "price_min", "price_max", "brand", "is_bestseller", "is_new", "in_stock")

    def filter_category(self, queryset: ProductQuerySet, name: str, value: str) -> ProductQuerySet:
        """Оставляет товары категории и всех её подкатегорий.

        Args:
            queryset: Исходный набор товаров.
            name: Имя фильтра.
            value: Слаг категории.

        Returns:
            Отфильтрованный набор; пустой, если категория не найдена.
        """
        category = Category.objects.filter(slug=value, is_active=True).first()
        if category is None:
            return queryset.none()
        return queryset.filter(category_id__in=category.descendant_ids())
