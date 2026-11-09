"""Сериализаторы оформления и просмотра заказов."""

import re
from typing import Any

from drf_spectacular.utils import extend_schema_field
from rest_framework import serializers

from apps.core.validators import normalize_phone
from apps.orders.models import DeliveryMethod, Order, OrderItem, PaymentMethod

INN_RE = re.compile(r"^\d{10}(\d{2})?$")


class CartItemSerializer(serializers.Serializer[dict[str, Any]]):
    """Позиция корзины: слаг товара и количество."""

    product = serializers.SlugField(max_length=200)
    quantity = serializers.IntegerField(min_value=1, max_value=999)


class QuoteRequestSerializer(serializers.Serializer[dict[str, Any]]):
    """Запрос предварительного расчёта корзины."""

    items = CartItemSerializer(many=True, allow_empty=False)
    delivery_method = serializers.ChoiceField(choices=DeliveryMethod.choices, default=DeliveryMethod.PICKUP)
    promo_code = serializers.CharField(max_length=40, required=False, allow_blank=True)


class QuoteResponseSerializer(serializers.Serializer[dict[str, Any]]):
    """Результат расчёта корзины."""

    subtotal = serializers.DecimalField(max_digits=12, decimal_places=2)
    discount = serializers.DecimalField(max_digits=12, decimal_places=2)
    delivery_cost = serializers.DecimalField(max_digits=12, decimal_places=2)
    total = serializers.DecimalField(max_digits=12, decimal_places=2)
    discount_percent = serializers.IntegerField()


class PromoValidateSerializer(serializers.Serializer[dict[str, Any]]):
    """Проверка промокода."""

    code = serializers.CharField(max_length=40)


class PromoResultSerializer(serializers.Serializer[dict[str, Any]]):
    """Сведения о действующем промокоде."""

    code = serializers.CharField()
    discount_percent = serializers.IntegerField()


class OrderCreateSerializer(serializers.Serializer[dict[str, Any]]):
    """Данные формы оформления заказа."""

    items = CartItemSerializer(many=True, allow_empty=False)
    customer_name = serializers.CharField(max_length=200, min_length=2)
    phone = serializers.CharField(max_length=32)
    email = serializers.EmailField()
    company = serializers.CharField(max_length=255, required=False, allow_blank=True, default="")
    inn = serializers.CharField(max_length=12, required=False, allow_blank=True, default="")
    delivery_method = serializers.ChoiceField(choices=DeliveryMethod.choices)
    address = serializers.CharField(max_length=500, required=False, allow_blank=True, default="")
    payment_method = serializers.ChoiceField(choices=PaymentMethod.choices)
    comment = serializers.CharField(max_length=2000, required=False, allow_blank=True, default="")
    promo_code = serializers.CharField(max_length=40, required=False, allow_blank=True, default="")
    personal_data_consent = serializers.BooleanField()

    def validate_customer_name(self, value: str) -> str:
        """Убирает лишние пробелы в ФИО.

        Args:
            value: Введённое ФИО.

        Returns:
            ФИО с одиночными пробелами.
        """
        return " ".join(value.split())

    def validate_phone(self, value: str) -> str:
        """Нормализует телефон.

        Args:
            value: Введённый телефон.

        Returns:
            Телефон в формате ``+7XXXXXXXXXX``.
        """
        return normalize_phone(value)

    def validate_email(self, value: str) -> str:
        """Приводит email к нижнему регистру.

        Args:
            value: Введённый email.

        Returns:
            Email в нижнем регистре.
        """
        return value.strip().lower()

    def validate_personal_data_consent(self, value: bool) -> bool:
        """Требует согласия на обработку персональных данных.

        Args:
            value: Отметка согласия.

        Returns:
            ``True``.

        Raises:
            serializers.ValidationError: Если согласие не дано.
        """
        if not value:
            raise serializers.ValidationError("Необходимо согласие на обработку персональных данных.")
        return value

    def validate(self, attrs: dict[str, Any]) -> dict[str, Any]:
        """Проверяет взаимозависимые поля: адрес для курьера и реквизиты для счёта.

        Args:
            attrs: Провалидированные поля.

        Returns:
            Поля без изменений.

        Raises:
            serializers.ValidationError: Если обязательные для выбранных опций поля не заполнены.
        """
        errors: dict[str, str] = {}
        if attrs["delivery_method"] == DeliveryMethod.COURIER and len(attrs.get("address", "").strip()) < 5:
            errors["address"] = "Укажите адрес доставки."
        if attrs["payment_method"] == PaymentMethod.INVOICE:
            if not attrs.get("company", "").strip():
                errors["company"] = "Для оплаты по счёту укажите организацию."
            if not INN_RE.match(attrs.get("inn", "").strip()):
                errors["inn"] = "ИНН должен содержать 10 или 12 цифр."
        if errors:
            raise serializers.ValidationError(errors)
        return attrs


class OrderItemSerializer(serializers.ModelSerializer[OrderItem]):
    """Позиция оформленного заказа."""

    product_slug = serializers.SerializerMethodField()

    class Meta:
        """Зафиксированные на момент заказа данные позиции."""

        model = OrderItem
        fields = ("id", "product_slug", "title", "sku", "price", "quantity", "line_total")

    @extend_schema_field(serializers.CharField(allow_null=True))
    def get_product_slug(self, obj: OrderItem) -> str | None:
        """Возвращает слаг товара, если он ещё есть в каталоге.

        Args:
            obj: Позиция заказа.

        Returns:
            Слаг товара или ``None``, если товар удалён.
        """
        return obj.product.slug if obj.product is not None else None


class OrderSerializer(serializers.ModelSerializer[Order]):
    """Оформленный заказ."""

    items = OrderItemSerializer(many=True, read_only=True)
    status_display = serializers.CharField(source="get_status_display", read_only=True)
    delivery_method_display = serializers.CharField(source="get_delivery_method_display", read_only=True)
    payment_method_display = serializers.CharField(source="get_payment_method_display", read_only=True)
    promo_code = serializers.SerializerMethodField()

    class Meta:
        """Все данные заказа только для чтения."""

        model = Order
        fields = (
            "number",
            "status",
            "status_display",
            "customer_name",
            "phone",
            "email",
            "company",
            "inn",
            "delivery_method",
            "delivery_method_display",
            "address",
            "payment_method",
            "payment_method_display",
            "comment",
            "promo_code",
            "subtotal",
            "discount",
            "delivery_cost",
            "total",
            "items",
            "created_at",
        )
        read_only_fields = fields

    @extend_schema_field(serializers.CharField(allow_null=True))
    def get_promo_code(self, obj: Order) -> str | None:
        """Возвращает применённый промокод.

        Args:
            obj: Заказ.

        Returns:
            Код или ``None``, если промокод не применялся.
        """
        return obj.promo_code.code if obj.promo_code is not None else None
