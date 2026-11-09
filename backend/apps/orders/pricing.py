"""Чистые функции расчёта стоимости заказа.

Модуль не обращается к базе данных, поэтому легко покрывается модульными тестами.
"""

from collections.abc import Iterable
from dataclasses import dataclass
from decimal import ROUND_HALF_UP, Decimal

KOPECK = Decimal("0.01")


@dataclass(frozen=True, slots=True)
class PricedLine:
    """Строка расчёта: цена за единицу и количество."""

    price: Decimal
    quantity: int

    @property
    def total(self) -> Decimal:
        """Стоимость строки с округлением до копеек."""
        return money(self.price * self.quantity)


@dataclass(frozen=True, slots=True)
class OrderTotals:
    """Итоговые суммы заказа."""

    subtotal: Decimal
    discount: Decimal
    delivery_cost: Decimal
    total: Decimal


def money(value: Decimal) -> Decimal:
    """Округляет сумму до копеек по правилам бухгалтерского округления вверх от половины.

    Args:
        value: Исходная сумма.

    Returns:
        Сумма с двумя знаками после запятой.
    """
    return value.quantize(KOPECK, rounding=ROUND_HALF_UP)


def calculate_totals(
    lines: Iterable[PricedLine],
    discount_percent: int = 0,
    delivery_cost: Decimal = Decimal("0"),
) -> OrderTotals:
    """Рассчитывает сумму товаров, скидку, доставку и итог.

    Скидка применяется только к стоимости товаров, доставка не скидывается.

    Args:
        lines: Строки заказа.
        discount_percent: Процент скидки от 0 до 100.
        delivery_cost: Стоимость доставки.

    Returns:
        Итоговые суммы заказа.

    Raises:
        ValueError: Если процент скидки вне диапазона, количество неположительное
            или цена/стоимость доставки отрицательная.
    """
    if not 0 <= discount_percent <= 100:
        raise ValueError("Процент скидки должен быть в диапазоне 0–100")
    if delivery_cost < 0:
        raise ValueError("Стоимость доставки не может быть отрицательной")
    subtotal = Decimal("0")
    for line in lines:
        if line.quantity <= 0:
            raise ValueError("Количество должно быть положительным")
        if line.price < 0:
            raise ValueError("Цена не может быть отрицательной")
        subtotal += line.total
    subtotal = money(subtotal)
    discount = money(subtotal * Decimal(discount_percent) / Decimal(100))
    delivery = money(delivery_cost)
    return OrderTotals(
        subtotal=subtotal,
        discount=discount,
        delivery_cost=delivery,
        total=money(subtotal - discount + delivery),
    )
