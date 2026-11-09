"""Модульные тесты расчёта стоимости заказа."""

from decimal import Decimal

import pytest

from apps.orders.pricing import OrderTotals, PricedLine, calculate_totals, money

pytestmark = pytest.mark.unit


def test_money_rounds_half_up() -> None:
    """Половина копейки округляется вверх."""
    assert money(Decimal("10.005")) == Decimal("10.01")
    assert money(Decimal("10.004")) == Decimal("10.00")


def test_priced_line_total() -> None:
    """Стоимость строки равна цене, умноженной на количество."""
    assert PricedLine(Decimal("13977.60"), 3).total == Decimal("41932.80")


def test_calculate_totals_without_discount_and_delivery() -> None:
    """Без скидки и доставки итог равен сумме товаров."""
    totals = calculate_totals([PricedLine(Decimal("288"), 2), PricedLine(Decimal("960"), 1)])
    assert totals == OrderTotals(
        subtotal=Decimal("1536.00"),
        discount=Decimal("0.00"),
        delivery_cost=Decimal("0.00"),
        total=Decimal("1536.00"),
    )


def test_discount_applies_to_goods_only() -> None:
    """Скидка считается от товаров, доставка не скидывается."""
    totals = calculate_totals([PricedLine(Decimal("8000"), 2)], discount_percent=10, delivery_cost=Decimal("2500"))
    assert totals.subtotal == Decimal("16000.00")
    assert totals.discount == Decimal("1600.00")
    assert totals.delivery_cost == Decimal("2500.00")
    assert totals.total == Decimal("16900.00")


def test_discount_is_rounded_to_kopecks() -> None:
    """Скидка с дробной частью округляется до копеек."""
    totals = calculate_totals([PricedLine(Decimal("13977.60"), 1)], discount_percent=15)
    assert totals.discount == Decimal("2096.64")
    assert totals.total == Decimal("11880.96")


def test_empty_lines_give_zero() -> None:
    """Пустой список строк даёт нулевые суммы."""
    assert calculate_totals([]).total == Decimal("0.00")


@pytest.mark.parametrize("percent", [-1, 101])
def test_invalid_discount_percent(percent: int) -> None:
    """Процент скидки вне 0–100 отклоняется."""
    with pytest.raises(ValueError, match="скидки"):
        calculate_totals([PricedLine(Decimal("1"), 1)], discount_percent=percent)


def test_non_positive_quantity_rejected() -> None:
    """Нулевое количество недопустимо."""
    with pytest.raises(ValueError, match="Количество"):
        calculate_totals([PricedLine(Decimal("1"), 0)])


def test_negative_price_rejected() -> None:
    """Отрицательная цена недопустима."""
    with pytest.raises(ValueError, match="Цена"):
        calculate_totals([PricedLine(Decimal("-1"), 1)])


def test_negative_delivery_rejected() -> None:
    """Отрицательная стоимость доставки недопустима."""
    with pytest.raises(ValueError, match="доставки"):
        calculate_totals([], delivery_cost=Decimal("-1"))
