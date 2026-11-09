"""Бизнес-логика оформления заказа."""

import logging
import secrets
from collections.abc import Mapping, Sequence
from dataclasses import dataclass
from datetime import datetime
from decimal import Decimal
from typing import Any

from django.conf import settings
from django.core.mail import send_mail
from django.db import transaction
from django.db.models import F
from django.utils import timezone

from apps.accounts.models import User
from apps.catalog.models import Product
from apps.orders.models import DeliveryMethod, Order, OrderItem, PromoCode
from apps.orders.pricing import OrderTotals, PricedLine, calculate_totals

logger = logging.getLogger(__name__)

ORDER_NUMBER_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"


class OrderError(Exception):
    """Ошибка бизнес-правил оформления заказа."""

    def __init__(self, field: str, message: str) -> None:
        """Создаёт ошибку, привязанную к полю запроса.

        Args:
            field: Имя поля, к которому относится ошибка.
            message: Текст ошибки для пользователя.
        """
        super().__init__(message)
        self.field = field
        self.message = message


@dataclass(frozen=True, slots=True)
class CartEntry:
    """Товар из корзины с количеством."""

    product: Product
    quantity: int


def delivery_cost_for(method: str) -> Decimal:
    """Возвращает стоимость доставки для выбранного способа.

    Args:
        method: Значение ``DeliveryMethod``.

    Returns:
        Стоимость доставки в рублях.
    """
    if method == DeliveryMethod.COURIER:
        return Decimal(int(settings.SITE_INFO["delivery_cost"]))
    return Decimal("0")


def find_promo_code(code: str | None) -> PromoCode | None:
    """Ищет действующий промокод.

    Args:
        code: Введённый пользователем код или ``None``.

    Returns:
        Промокод либо ``None``, если код пустой.

    Raises:
        OrderError: Если код не найден или недействителен.
    """
    if not code or not code.strip():
        return None
    promo = PromoCode.objects.filter(code=code.strip().upper()).first()
    if promo is None or not promo.is_usable():
        raise OrderError("promo_code", "Промокод не найден или срок его действия истёк.")
    return promo


def resolve_cart(items: Sequence[Mapping[str, Any]]) -> list[CartEntry]:
    """Превращает позиции запроса в товары каталога, объединяя дубликаты.

    Args:
        items: Последовательность словарей с ключами ``product`` (слаг) и ``quantity``.

    Returns:
        Список позиций корзины в порядке первого появления.

    Raises:
        OrderError: Если корзина пуста, товар не найден или его нельзя купить.
    """
    if not items:
        raise OrderError("items", "Корзина пуста.")
    quantities: dict[str, int] = {}
    for item in items:
        slug = str(item["product"])
        quantities[slug] = quantities.get(slug, 0) + int(item["quantity"])
    products = {product.slug: product for product in Product.objects.published().filter(slug__in=quantities)}
    entries: list[CartEntry] = []
    for slug, quantity in quantities.items():
        product = products.get(slug)
        if product is None:
            raise OrderError("items", f"Товар «{slug}» не найден.")
        if not product.is_purchasable:
            raise OrderError("items", f"Цена товара «{product.title}» сообщается по запросу — оставьте заявку.")
        entries.append(CartEntry(product=product, quantity=quantity))
    return entries


def quote(entries: Sequence[CartEntry], promo: PromoCode | None, delivery_method: str) -> OrderTotals:
    """Рассчитывает итоги корзины по актуальным ценам каталога.

    Args:
        entries: Позиции корзины.
        promo: Применяемый промокод.
        delivery_method: Способ доставки.

    Returns:
        Итоговые суммы.
    """
    lines = [PricedLine(price=entry.product.price or Decimal("0"), quantity=entry.quantity) for entry in entries]
    return calculate_totals(
        lines,
        discount_percent=promo.discount_percent if promo else 0,
        delivery_cost=delivery_cost_for(delivery_method),
    )


def generate_order_number(moment: datetime | None = None) -> str:
    """Генерирует уникальный человекочитаемый номер заказа.

    Формат: ``SC-ГГММДД-XXXXX``, где суффикс — случайные символы без похожих букв и цифр.

    Args:
        moment: Дата для префикса; по умолчанию текущая.

    Returns:
        Номер заказа, ещё не занятый в базе.
    """
    date_part = timezone.localtime(moment or timezone.now()).strftime("%y%m%d")
    while True:
        suffix = "".join(secrets.choice(ORDER_NUMBER_ALPHABET) for _ in range(5))
        number = f"SC-{date_part}-{suffix}"
        if not Order.objects.filter(number=number).exists():
            return number


@transaction.atomic
def create_order(data: Mapping[str, Any], user: User | None) -> Order:
    """Создаёт заказ с позициями, фиксирует цены и учитывает промокод.

    Args:
        data: Провалидированные данные формы оформления заказа.
        user: Аутентифицированный покупатель или ``None`` для гостя.

    Returns:
        Сохранённый заказ.

    Raises:
        OrderError: Если корзина или промокод некорректны.
    """
    entries = resolve_cart(data["items"])
    promo = find_promo_code(data.get("promo_code"))
    totals = quote(entries, promo, data["delivery_method"])
    order = Order.objects.create(
        number=generate_order_number(),
        user=user,
        customer_name=data["customer_name"],
        phone=data["phone"],
        email=data["email"],
        company=data.get("company", ""),
        inn=data.get("inn", ""),
        delivery_method=data["delivery_method"],
        address=data.get("address", ""),
        payment_method=data["payment_method"],
        comment=data.get("comment", ""),
        promo_code=promo,
        subtotal=totals.subtotal,
        discount=totals.discount,
        delivery_cost=totals.delivery_cost,
        total=totals.total,
    )
    OrderItem.objects.bulk_create(
        [
            OrderItem(
                order=order,
                product=entry.product,
                title=entry.product.title,
                sku=entry.product.sku,
                price=entry.product.price or Decimal("0"),
                quantity=entry.quantity,
                line_total=PricedLine(entry.product.price or Decimal("0"), entry.quantity).total,
            )
            for entry in entries
        ]
    )
    for entry in entries:
        Product.objects.filter(pk=entry.product.pk).update(popularity=F("popularity") + entry.quantity)
    if promo is not None:
        PromoCode.objects.filter(pk=promo.pk).update(used_count=F("used_count") + 1)
    transaction.on_commit(lambda: send_order_emails(order.pk))
    return order


def send_order_emails(order_id: int) -> None:
    """Отправляет копию заказа покупателю и уведомление менеджерам.

    Ошибки почтового сервера логируются и не прерывают оформление заказа.

    Args:
        order_id: Идентификатор заказа.
    """
    order = Order.objects.prefetch_related("items").get(pk=order_id)
    lines = "\n".join(f"• {item.title} × {item.quantity} = {item.line_total} ₽" for item in order.items.all())
    body = (
        f"Здравствуйте, {order.customer_name}!\n\n"
        f"Ваш заказ {order.number} принят. Менеджер свяжется с вами для подтверждения.\n\n"
        f"{lines}\n\n"
        f"Товары: {order.subtotal} ₽\nСкидка: {order.discount} ₽\n"
        f"Доставка: {order.delivery_cost} ₽\nИтого: {order.total} ₽\n\n"
        f"{settings.SITE_INFO['company_name']}"
    )
    try:
        send_mail(
            subject=f"Заказ {order.number} — {settings.SITE_INFO['company_name']}",
            message=body,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[order.email],
        )
        send_mail(
            subject=f"Новый заказ {order.number}",
            message=f"Покупатель: {order.customer_name}, {order.phone}, {order.email}\n\n{body}",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[settings.MANAGERS_EMAIL],
        )
    except Exception:
        logger.exception("Не удалось отправить письма по заказу %s", order.number)
