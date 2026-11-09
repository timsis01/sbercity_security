"""Эндпоинты каталога: категории и товары."""

from django.db.models import Prefetch, QuerySet
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.request import Request
from rest_framework.response import Response

from apps.catalog.filters import ProductFilter
from apps.catalog.models import Category, Product, ProductQuerySet
from apps.catalog.serializers import (
    CategoryDetailSerializer,
    CategoryTreeSerializer,
    ProductDetailSerializer,
    ProductListSerializer,
)


class CategoryViewSet(viewsets.ReadOnlyModelViewSet[Category]):
    """Дерево категорий каталога.

    Список возвращает только корневые категории с вложенными потомками.
    """

    lookup_field = "slug"
    pagination_class = None

    def get_queryset(self) -> QuerySet[Category]:
        """Возвращает категории: корневые для списка, любые активные для детального просмотра."""
        children = Prefetch("children", queryset=Category.objects.filter(is_active=True))
        queryset = Category.objects.filter(is_active=True).prefetch_related(children)
        if self.action == "list":
            return queryset.filter(parent__isnull=True)
        return queryset.select_related("parent")

    def get_serializer_class(self) -> type[CategoryTreeSerializer]:
        """Выбирает сериализатор в зависимости от действия."""
        if self.action == "retrieve":
            return CategoryDetailSerializer
        return CategoryTreeSerializer


class ProductViewSet(viewsets.ReadOnlyModelViewSet[Product]):
    """Товары каталога с поиском, фильтрацией, сортировкой и пагинацией."""

    lookup_field = "slug"
    filter_backends = (DjangoFilterBackend, SearchFilter, OrderingFilter)
    filterset_class = ProductFilter
    search_fields = ("title", "sku", "brand", "description")
    ordering_fields = ("price", "title", "popularity", "created_at")
    ordering = ("-popularity", "title")

    def get_queryset(self) -> ProductQuerySet:
        """Возвращает опубликованные товары вместе с категориями."""
        return Product.objects.published().select_related("category", "category__parent")

    def get_serializer_class(self) -> type[ProductListSerializer]:
        """Выбирает сериализатор в зависимости от действия."""
        if self.action == "retrieve":
            return ProductDetailSerializer
        return ProductListSerializer

    @extend_schema(responses=ProductListSerializer(many=True))
    @action(detail=True, methods=["get"])
    def related(self, request: Request, slug: str | None = None) -> Response:
        """Возвращает до четырёх товаров из той же категории.

        Args:
            request: Входящий запрос.
            slug: Слаг текущего товара.

        Returns:
            Список похожих товаров.
        """
        product = self.get_object()
        related = self.get_queryset().filter(category_id=product.category_id).exclude(pk=product.pk)[:4]
        return Response(ProductListSerializer(related, many=True, context={"request": request}).data)
