"""Модульные тесты моделей и сервисов, не требующих HTTP."""

import re
from datetime import timedelta
from decimal import Decimal

import pytest
from django.utils import timezone

from apps.accounts.models import User
from apps.catalog.models import Category, Product
from apps.orders.models import DeliveryMethod, PromoCode
from apps.orders.services import OrderError, delivery_cost_for, find_promo_code, generate_order_number, resolve_cart
from tests.factories import CategoryFactory, ProductFactory, PromoCodeFactory

pytestmark = pytest.mark.unit


def test_promo_code_usable_rules() -> None:
    """Промокод недействителен, если выключен, просрочен или исчерпан."""
    now = timezone.now()
    assert PromoCode(code="A", discount_percent=5).is_usable(now)
    assert not PromoCode(code="A", discount_percent=5, is_active=False).is_usable(now)
    assert not PromoCode(code="A", discount_percent=5, valid_until=now - timedelta(days=1)).is_usable(now)
    assert not PromoCode(code="A", discount_percent=5, max_uses=3, used_count=3).is_usable(now)
    assert PromoCode(code="A", discount_percent=5, max_uses=3, used_count=2).is_usable(now)


def test_product_price_flags() -> None:
    """Товар без цены — «по запросу» и не продаётся."""
    on_request = Product(title="X", price=None)
    priced = Product(title="Y", price=Decimal("10"))
    assert on_request.is_price_on_request and not on_request.is_purchasable
    assert not priced.is_price_on_request and priced.is_purchasable


def test_delivery_cost() -> None:
    """Самовывоз бесплатный, курьер стоит 2500 ₽."""
    assert delivery_cost_for(DeliveryMethod.PICKUP) == Decimal("0")
    assert delivery_cost_for(DeliveryMethod.COURIER) == Decimal("2500")


@pytest.mark.django_db
def test_order_number_format() -> None:
    """Номер заказа имеет вид SC-ГГММДД-XXXXX без похожих символов."""
    number = generate_order_number()
    assert re.fullmatch(r"SC-\d{6}-[A-HJ-NP-Z2-9]{5}", number)


@pytest.mark.django_db
def test_user_manager_normalizes_email() -> None:
    """Email пользователя сохраняется в нижнем регистре, пароль хешируется."""
    user = User.objects.create_user("Mixed@Example.COM", "Pass-12345!")
    assert user.email == "mixed@example.com"
    assert user.check_password("Pass-12345!")
    assert not user.is_staff
    assert user.get_full_name() == "mixed@example.com"


@pytest.mark.django_db
def test_create_superuser_flags() -> None:
    """Суперпользователь получает права администратора; неверные флаги запрещены."""
    admin = User.objects.create_superuser("admin@example.com", "Pass-12345!")
    assert admin.is_staff and admin.is_superuser
    with pytest.raises(ValueError):
        User.objects.create_superuser("bad@example.com", "Pass-12345!", is_staff=False)
    with pytest.raises(ValueError):
        User.objects.create_user("", "x")


@pytest.mark.django_db
def test_category_descendants_and_str() -> None:
    """Потомки категории собираются рекурсивно, строковое представление — путь."""
    root = CategoryFactory.create(name="Корень")
    child = CategoryFactory.create(parent=root, name="Ребёнок")
    grandchild = CategoryFactory.create(parent=child)
    CategoryFactory.create(parent=child, is_active=False)
    assert set(root.descendant_ids()) == {root.pk, child.pk, grandchild.pk}
    assert str(child) == "Корень / Ребёнок"


@pytest.mark.django_db
def test_resolve_cart_merges_duplicates() -> None:
    """Повторяющиеся товары в корзине объединяются."""
    product = ProductFactory.create()
    entries = resolve_cart([{"product": product.slug, "quantity": 1}, {"product": product.slug, "quantity": 2}])
    assert len(entries) == 1
    assert entries[0].quantity == 3


@pytest.mark.django_db
def test_resolve_cart_errors() -> None:
    """Пустая корзина, неизвестный и неопубликованный товар — ошибки."""
    hidden = ProductFactory.create(is_published=False)
    on_request = ProductFactory.create(price=None)
    for items in ([], [{"product": "missing", "quantity": 1}], [{"product": hidden.slug, "quantity": 1}]):
        with pytest.raises(OrderError):
            resolve_cart(items)
    with pytest.raises(OrderError, match="по запросу"):
        resolve_cart([{"product": on_request.slug, "quantity": 1}])


@pytest.mark.django_db
def test_find_promo_code() -> None:
    """Код ищется без учёта регистра; пустой код — без скидки."""
    PromoCodeFactory.create(code="SALE5", discount_percent=5)
    promo = find_promo_code(" sale5 ")
    assert promo is not None and promo.discount_percent == 5
    assert find_promo_code("") is None
    with pytest.raises(OrderError):
        find_promo_code("NOPE")


@pytest.mark.django_db
def test_published_queryset_hides_inactive_categories() -> None:
    """Товары скрытой категории не попадают на витрину."""
    hidden_category: Category = CategoryFactory.create(is_active=False)
    ProductFactory.create(category=hidden_category)
    visible = ProductFactory.create()
    assert list(Product.objects.published()) == [visible]
