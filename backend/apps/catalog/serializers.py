"""Сериализаторы каталога."""

from typing import Any, TypedDict

from drf_spectacular.utils import extend_schema_field
from rest_framework import serializers

from apps.catalog.models import Category, Product


class BreadcrumbItem(TypedDict):
    """Элемент хлебных крошек."""

    name: str
    slug: str


def build_breadcrumbs(category: Category) -> list[BreadcrumbItem]:
    """Строит путь от корня каталога до категории.

    Args:
        category: Конечная категория.

    Returns:
        Список элементов от корня к текущей категории.
    """
    chain: list[BreadcrumbItem] = []
    node: Category | None = category
    while node is not None:
        chain.append({"name": node.name, "slug": node.slug})
        node = node.parent
    chain.reverse()
    return chain


class BreadcrumbSerializer(serializers.Serializer[BreadcrumbItem]):
    """Схема элемента хлебных крошек."""

    name = serializers.CharField()
    slug = serializers.CharField()


class CategoryTreeSerializer(serializers.ModelSerializer[Category]):
    """Категория с вложенными подкатегориями для меню каталога."""

    children = serializers.SerializerMethodField()
    product_count = serializers.SerializerMethodField()

    class Meta:
        """Поля узла дерева категорий."""

        model = Category
        fields: tuple[str, ...] = ("id", "name", "slug", "description", "children", "product_count")

    @extend_schema_field(serializers.ListField(child=serializers.DictField()))
    def get_children(self, obj: Category) -> list[dict[str, Any]]:
        """Сериализует активные дочерние категории.

        Args:
            obj: Текущая категория.

        Returns:
            Список сериализованных подкатегорий.
        """
        children = [child for child in obj.children.all() if child.is_active]
        return [dict(item) for item in CategoryTreeSerializer(children, many=True, context=self.context).data]

    def get_product_count(self, obj: Category) -> int:
        """Считает опубликованные товары в категории и её потомках.

        Args:
            obj: Текущая категория.

        Returns:
            Количество товаров.
        """
        return Product.objects.published().filter(category_id__in=obj.descendant_ids()).count()


class CategoryDetailSerializer(CategoryTreeSerializer):
    """Категория с хлебными крошками для страницы раздела."""

    breadcrumbs = serializers.SerializerMethodField()

    class Meta(CategoryTreeSerializer.Meta):
        """Поля дерева плюс путь до корня."""

        fields = (*CategoryTreeSerializer.Meta.fields, "breadcrumbs")

    @extend_schema_field(BreadcrumbSerializer(many=True))
    def get_breadcrumbs(self, obj: Category) -> list[BreadcrumbItem]:
        """Возвращает путь до категории.

        Args:
            obj: Текущая категория.

        Returns:
            Хлебные крошки.
        """
        return build_breadcrumbs(obj)


class CategoryShortSerializer(serializers.ModelSerializer[Category]):
    """Краткое представление категории внутри карточки товара."""

    class Meta:
        """Идентификатор, название и слаг."""

        model = Category
        fields = ("id", "name", "slug")


class ProductListSerializer(serializers.ModelSerializer[Product]):
    """Товар в списке каталога."""

    category = CategoryShortSerializer(read_only=True)
    is_price_on_request = serializers.BooleanField(read_only=True)
    image = serializers.SerializerMethodField()

    class Meta:
        """Поля плитки товара."""

        model = Product
        fields: tuple[str, ...] = (
            "id",
            "title",
            "slug",
            "sku",
            "brand",
            "price",
            "old_price",
            "is_price_on_request",
            "is_bestseller",
            "is_new",
            "in_stock",
            "image",
            "visual",
            "category",
        )

    @extend_schema_field(serializers.CharField(allow_null=True))
    def get_image(self, obj: Product) -> str | None:
        """Возвращает URL изображения, если оно загружено.

        Args:
            obj: Товар.

        Returns:
            Относительный URL или ``None``.
        """
        return obj.image.url if obj.image else None


class SpecSerializer(serializers.Serializer[dict[str, str]]):
    """Строка таблицы характеристик."""

    name = serializers.CharField()
    value = serializers.CharField()


class ProductDetailSerializer(ProductListSerializer):
    """Полная карточка товара."""

    specs = SpecSerializer(many=True, read_only=True)
    breadcrumbs = serializers.SerializerMethodField()

    class Meta(ProductListSerializer.Meta):
        """Поля плитки плюс описание и характеристики."""

        fields = (
            *ProductListSerializer.Meta.fields,
            "manufacturer",
            "description",
            "requirements",
            "specs",
            "breadcrumbs",
        )

    @extend_schema_field(BreadcrumbSerializer(many=True))
    def get_breadcrumbs(self, obj: Product) -> list[BreadcrumbItem]:
        """Возвращает путь до категории товара.

        Args:
            obj: Товар.

        Returns:
            Хлебные крошки категории.
        """
        return build_breadcrumbs(obj.category)
