"""Интеграционные тесты оформления заказов, расчёта корзины и промокодов."""

from decimal import Decimal
from typing import Any

import pytest
from django.core import mail
from rest_framework.test import APIClient

from apps.accounts.models import User
from apps.catalog.models import Product
from apps.orders.models import Order, PromoCode
from tests.factories import ProductFactory, PromoCodeFactory

pytestmark = [pytest.mark.integration, pytest.mark.django_db]


@pytest.fixture
def product() -> Product:
    """Товар за 8000 ₽."""
    return ProductFactory.create(slug="hasp", title="HASP ключ", price=Decimal("8000"))


def order_payload(**overrides: Any) -> dict[str, Any]:
    """Собирает корректные данные формы заказа.

    Args:
        **overrides: Поля, которые нужно заменить.

    Returns:
        Тело запроса оформления заказа.
    """
    payload: dict[str, Any] = {
        "items": [{"product": "hasp", "quantity": 2}],
        "customer_name": "Иван  Петров",
        "phone": "8 (916) 123-45-67",
        "email": "Ivan@Example.com",
        "delivery_method": "pickup",
        "payment_method": "cash",
        "personal_data_consent": True,
    }
    payload.update(overrides)
    return payload


def test_quote_with_promo_and_courier(api_client: APIClient, product: Product) -> None:
    """Расчёт корзины учитывает скидку и стоимость курьера."""
    PromoCodeFactory.create(code="SALE10", discount_percent=10)
    response = api_client.post(
        "/api/orders/quote/",
        {"items": [{"product": "hasp", "quantity": 2}], "delivery_method": "courier", "promo_code": "sale10"},
        format="json",
    )
    assert response.status_code == 200
    assert response.json() == {
        "subtotal": "16000.00",
        "discount": "1600.00",
        "delivery_cost": "2500.00",
        "total": "16900.00",
        "discount_percent": 10,
    }


def test_promo_validation(api_client: APIClient) -> None:
    """Проверка промокода возвращает скидку или ошибку."""
    PromoCodeFactory.create(code="SALE10", discount_percent=10)
    ok = api_client.post("/api/orders/promo/", {"code": "sale10"}, format="json")
    assert ok.status_code == 200 and ok.json() == {"code": "SALE10", "discount_percent": 10}
    bad = api_client.post("/api/orders/promo/", {"code": "NOPE"}, format="json")
    assert bad.status_code == 400 and "promo_code" in bad.json()


def test_guest_creates_order(api_client: APIClient, product: Product) -> None:
    """Гость оформляет заказ: цены фиксируются, данные нормализуются, письма отправляются."""
    PromoCodeFactory.create(code="SALE10", discount_percent=10)
    with pytest.MonkeyPatch.context() as patch:
        patch.setattr("django.db.transaction.on_commit", lambda func, *args, **kwargs: func())
        response = api_client.post("/api/orders/", order_payload(promo_code="SALE10"), format="json")
    assert response.status_code == 201, response.json()
    data = response.json()
    assert data["number"].startswith("SC-")
    assert data["customer_name"] == "Иван Петров"
    assert data["phone"] == "+79161234567"
    assert data["email"] == "ivan@example.com"
    assert data["total"] == "14400.00"
    assert data["promo_code"] == "SALE10"
    assert data["items"][0] == {
        "id": data["items"][0]["id"],
        "product_slug": "hasp",
        "title": "HASP ключ",
        "sku": product.sku,
        "price": "8000.00",
        "quantity": 2,
        "line_total": "16000.00",
    }
    product.refresh_from_db()
    assert product.popularity == 2
    assert PromoCode.objects.get(code="SALE10").used_count == 1
    assert len(mail.outbox) == 2
    assert data["number"] in mail.outbox[0].subject
    assert api_client.get(f"/api/orders/{data['number']}/").status_code == 200


def test_guest_cannot_see_foreign_order(api_client: APIClient, product: Product) -> None:
    """Заказ из другой сессии недоступен."""
    number = api_client.post("/api/orders/", order_payload(), format="json").json()["number"]
    stranger = APIClient()
    assert stranger.get(f"/api/orders/{number}/").status_code == 404
    assert stranger.get("/api/orders/").status_code == 403


def test_price_change_after_order_does_not_affect_it(api_client: APIClient, product: Product) -> None:
    """Цена в заказе фиксируется на момент оформления."""
    number = api_client.post("/api/orders/", order_payload(), format="json").json()["number"]
    Product.objects.filter(pk=product.pk).update(price=Decimal("1"))
    assert api_client.get(f"/api/orders/{number}/").json()["items"][0]["price"] == "8000.00"


@pytest.mark.parametrize(
    ("overrides", "error_field"),
    [
        ({"items": []}, "items"),
        ({"items": [{"product": "missing", "quantity": 1}]}, "items"),
        ({"items": [{"product": "hasp", "quantity": 0}]}, "items"),
        ({"phone": "12345"}, "phone"),
        ({"email": "not-an-email"}, "email"),
        ({"customer_name": "И"}, "customer_name"),
        ({"personal_data_consent": False}, "personal_data_consent"),
        ({"delivery_method": "courier", "address": ""}, "address"),
        ({"payment_method": "invoice"}, "company"),
        ({"payment_method": "invoice", "company": "ООО", "inn": "123"}, "inn"),
        ({"delivery_method": "teleport"}, "delivery_method"),
        ({"promo_code": "NOPE"}, "promo_code"),
    ],
)
def test_order_validation_errors(
    api_client: APIClient, product: Product, overrides: dict[str, Any], error_field: str
) -> None:
    """Некорректные данные формы заказа отклоняются с ошибкой у нужного поля."""
    response = api_client.post("/api/orders/", order_payload(**overrides), format="json")
    assert response.status_code == 400
    assert error_field in response.json()
    assert Order.objects.count() == 0


def test_price_on_request_product_cannot_be_ordered(api_client: APIClient) -> None:
    """Товар с ценой по запросу нельзя заказать через корзину."""
    ProductFactory.create(slug="fire", price=None)
    response = api_client.post("/api/orders/", order_payload(items=[{"product": "fire", "quantity": 1}]), format="json")
    assert response.status_code == 400
    assert "по запросу" in response.json()["items"][0]


def test_invoice_order_with_company(api_client: APIClient, product: Product) -> None:
    """Заказ по счёту принимается с организацией и корректным ИНН."""
    response = api_client.post(
        "/api/orders/",
        order_payload(payment_method="invoice", company="ООО «Ромашка»", inn="7701234567"),
        format="json",
    )
    assert response.status_code == 201
    assert response.json()["payment_method_display"] == "Безналичный расчёт по счёту"


def test_user_order_history(auth_client: APIClient, user: User, product: Product) -> None:
    """Авторизованный покупатель видит свои заказы в истории."""
    number = auth_client.post("/api/orders/", order_payload(), format="json").json()["number"]
    assert Order.objects.get(number=number).user == user
    history = auth_client.get("/api/orders/").json()
    assert [order["number"] for order in history["results"]] == [number]
    other = APIClient()
    other.force_login(User.objects.create_user("other@example.com", "Pass-12345!"))
    assert other.get("/api/orders/").json()["count"] == 0
    assert other.get(f"/api/orders/{number}/").status_code == 404


def test_order_requires_csrf_token(csrf_client: APIClient, product: Product) -> None:
    """Без CSRF-токена браузерный клиент не может оформить заказ."""
    response = csrf_client.post("/api/orders/", order_payload(), format="json")
    assert response.status_code == 403
    csrf_client.get("/api/csrf/")
    token = csrf_client.cookies["csrftoken"].value
    response = csrf_client.post("/api/orders/", order_payload(), format="json", HTTP_X_CSRFTOKEN=token)
    assert response.status_code == 201
