"""Эндпоинты заказов, расчёта корзины и промокодов."""

from typing import Any, cast

from django.db.models import Q, QuerySet
from drf_spectacular.utils import extend_schema
from rest_framework import mixins, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.throttling import BaseThrottle

from apps.core.throttling import FormsRateThrottle
from apps.orders.models import Order
from apps.orders.serializers import (
    OrderCreateSerializer,
    OrderSerializer,
    PromoResultSerializer,
    PromoValidateSerializer,
    QuoteRequestSerializer,
    QuoteResponseSerializer,
)
from apps.orders.services import OrderError, create_order, find_promo_code, quote, resolve_cart

SESSION_ORDERS_KEY = "order_numbers"


def as_validation_error(error: OrderError) -> ValidationError:
    """Преобразует бизнес-ошибку в ошибку валидации DRF с привязкой к полю.

    Args:
        error: Ошибка оформления заказа.

    Returns:
        Исключение, которое DRF превратит в ответ ``400``.
    """
    return ValidationError({error.field: [error.message]})


class OrderViewSet(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet[Order],
):
    """Оформление заказа, история заказов и просмотр заказа.

    Гость видит только заказы, оформленные в текущей сессии;
    авторизованный покупатель — все свои заказы.
    """

    lookup_field = "number"
    serializer_class = OrderSerializer

    def get_permissions(self) -> list[permissions.BasePermission]:
        """Список заказов доступен только авторизованным пользователям."""
        if self.action == "list":
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def get_throttles(self) -> list[BaseThrottle]:
        """Ограничивает частоту оформления заказов и проверки промокодов."""
        if self.action in {"create", "validate_promo"}:
            return [FormsRateThrottle()]
        return []

    def get_queryset(self) -> QuerySet[Order]:
        """Возвращает заказы, доступные текущему посетителю."""
        queryset = Order.objects.prefetch_related("items", "items__product").select_related("promo_code")
        if getattr(self, "swagger_fake_view", False):
            return queryset.none()
        user = self.request.user
        session_numbers = cast(list[str], self.request.session.get(SESSION_ORDERS_KEY, []))
        if user.is_authenticated:
            if self.action == "list":
                return queryset.filter(user_id=user.pk)
            return queryset.filter(Q(user_id=user.pk) | Q(number__in=session_numbers))
        return queryset.filter(number__in=session_numbers)

    @extend_schema(request=OrderCreateSerializer, responses={201: OrderSerializer})
    def create(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        """Оформляет заказ по данным формы и корзины.

        Args:
            request: Запрос с данными формы.
            *args: Позиционные аргументы маршрута.
            **kwargs: Именованные аргументы маршрута.

        Returns:
            Созданный заказ со статусом ``201``.
        """
        serializer = OrderCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = request.user if request.user.is_authenticated else None
        try:
            order = create_order(serializer.validated_data, user)
        except OrderError as error:
            raise as_validation_error(error) from error
        numbers = cast(list[str], request.session.get(SESSION_ORDERS_KEY, []))
        request.session[SESSION_ORDERS_KEY] = [*numbers[-19:], order.number]
        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)

    @extend_schema(request=QuoteRequestSerializer, responses={200: QuoteResponseSerializer})
    @action(detail=False, methods=["post"])
    def quote(self, request: Request) -> Response:
        """Пересчитывает корзину по актуальным ценам и промокоду.

        Args:
            request: Запрос с позициями корзины.

        Returns:
            Суммы заказа и применённый процент скидки.
        """
        serializer = QuoteRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        try:
            entries = resolve_cart(data["items"])
            promo = find_promo_code(data.get("promo_code"))
        except OrderError as error:
            raise as_validation_error(error) from error
        totals = quote(entries, promo, data["delivery_method"])
        payload = {
            "subtotal": totals.subtotal,
            "discount": totals.discount,
            "delivery_cost": totals.delivery_cost,
            "total": totals.total,
            "discount_percent": promo.discount_percent if promo else 0,
        }
        return Response(QuoteResponseSerializer(payload).data)

    @extend_schema(request=PromoValidateSerializer, responses={200: PromoResultSerializer})
    @action(detail=False, methods=["post"], url_path="promo")
    def validate_promo(self, request: Request) -> Response:
        """Проверяет промокод.

        Args:
            request: Запрос с кодом.

        Returns:
            Код и процент скидки либо ``400``, если код недействителен.
        """
        serializer = PromoValidateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            promo = find_promo_code(serializer.validated_data["code"])
        except OrderError as error:
            raise as_validation_error(error) from error
        if promo is None:
            raise ValidationError({"code": ["Введите промокод."]})
        return Response(PromoResultSerializer({"code": promo.code, "discount_percent": promo.discount_percent}).data)
