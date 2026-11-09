"""Модели заказов и промокодов."""

from datetime import datetime
from decimal import Decimal
from typing import Any

from django.conf import settings
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from django.utils import timezone


class DeliveryMethod(models.TextChoices):
    """Способ получения заказа."""

    PICKUP = "pickup", "Самовывоз"
    COURIER = "courier", "Курьером"


class PaymentMethod(models.TextChoices):
    """Способ оплаты заказа."""

    CASH = "cash", "Наличными при получении"
    CARD = "card", "Картой при получении"
    INVOICE = "invoice", "Безналичный расчёт по счёту"


class OrderStatus(models.TextChoices):
    """Этапы обработки заказа."""

    NEW = "new", "Новый"
    CONFIRMED = "confirmed", "Подтверждён"
    SHIPPED = "shipped", "Передан в доставку"
    COMPLETED = "completed", "Выполнен"
    CANCELLED = "cancelled", "Отменён"


class PromoCode(models.Model):
    """Код скидки, применяемый к сумме товаров."""

    code = models.CharField("Код", max_length=40, unique=True)
    discount_percent = models.PositiveSmallIntegerField(
        "Скидка, %",
        validators=[MinValueValidator(1), MaxValueValidator(90)],
    )
    is_active = models.BooleanField("Активен", default=True)
    valid_until = models.DateTimeField("Действует до", null=True, blank=True)
    max_uses = models.PositiveIntegerField("Лимит использований", null=True, blank=True)
    used_count = models.PositiveIntegerField("Использован раз", default=0)

    class Meta:
        """Сортировка по коду."""

        verbose_name = "Промокод"
        verbose_name_plural = "Промокоды"
        ordering = ("code",)

    def __str__(self) -> str:
        """Возвращает код и размер скидки."""
        return f"{self.code} (−{self.discount_percent}%)"

    def save(self, *args: Any, **kwargs: Any) -> None:
        """Сохраняет код в верхнем регистре без пробелов.

        Args:
            *args: Позиционные аргументы ``Model.save``.
            **kwargs: Именованные аргументы ``Model.save``.
        """
        self.code = self.code.strip().upper()
        super().save(*args, **kwargs)

    def is_usable(self, at: datetime | None = None) -> bool:
        """Проверяет, можно ли применить промокод.

        Args:
            at: Момент проверки; по умолчанию текущее время.

        Returns:
            ``True``, если код активен, не просрочен и лимит не исчерпан.
        """
        moment = at or timezone.now()
        if not self.is_active:
            return False
        if self.valid_until is not None and self.valid_until < moment:
            return False
        return self.max_uses is None or self.used_count < self.max_uses


class Order(models.Model):
    """Заказ покупателя."""

    number = models.CharField("Номер", max_length=32, unique=True, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        verbose_name="Пользователь",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="orders",
    )
    status = models.CharField("Статус", max_length=16, choices=OrderStatus.choices, default=OrderStatus.NEW)
    customer_name = models.CharField("ФИО получателя", max_length=200)
    phone = models.CharField("Телефон", max_length=32)
    email = models.EmailField("Email")
    company = models.CharField("Организация", max_length=255, blank=True)
    inn = models.CharField("ИНН", max_length=12, blank=True)
    delivery_method = models.CharField("Доставка", max_length=16, choices=DeliveryMethod.choices)
    address = models.CharField("Адрес доставки", max_length=500, blank=True)
    payment_method = models.CharField("Оплата", max_length=16, choices=PaymentMethod.choices)
    comment = models.TextField("Комментарий", blank=True)
    promo_code = models.ForeignKey(
        PromoCode,
        verbose_name="Промокод",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="orders",
    )
    subtotal = models.DecimalField("Сумма товаров", max_digits=12, decimal_places=2, default=Decimal("0"))
    discount = models.DecimalField("Скидка", max_digits=12, decimal_places=2, default=Decimal("0"))
    delivery_cost = models.DecimalField("Доставка", max_digits=12, decimal_places=2, default=Decimal("0"))
    total = models.DecimalField("Итого", max_digits=12, decimal_places=2, default=Decimal("0"))
    created_at = models.DateTimeField("Создан", auto_now_add=True)
    updated_at = models.DateTimeField("Изменён", auto_now=True)

    class Meta:
        """Новые заказы первыми."""

        verbose_name = "Заказ"
        verbose_name_plural = "Заказы"
        ordering = ("-created_at",)

    def __str__(self) -> str:
        """Возвращает номер заказа."""
        return f"Заказ {self.number}"


class OrderItem(models.Model):
    """Позиция заказа с зафиксированной ценой."""

    order = models.ForeignKey(Order, verbose_name="Заказ", on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(
        "catalog.Product",
        verbose_name="Товар",
        on_delete=models.SET_NULL,
        null=True,
        related_name="order_items",
    )
    title = models.CharField("Название", max_length=300)
    sku = models.CharField("Артикул", max_length=100, blank=True)
    price = models.DecimalField("Цена", max_digits=12, decimal_places=2)
    quantity = models.PositiveIntegerField("Количество", validators=[MinValueValidator(1)])
    line_total = models.DecimalField("Сумма", max_digits=12, decimal_places=2)

    class Meta:
        """Порядок добавления позиций."""

        verbose_name = "Позиция заказа"
        verbose_name_plural = "Позиции заказа"
        ordering = ("id",)

    def __str__(self) -> str:
        """Возвращает название и количество."""
        return f"{self.title} × {self.quantity}"
