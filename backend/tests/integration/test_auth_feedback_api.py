"""Интеграционные тесты аутентификации, форм обратной связи и админки."""

import pytest
from django.conf import settings
from django.test import override_settings
from rest_framework.test import APIClient

from apps.accounts.models import User
from apps.core.throttling import FormsRateThrottle
from apps.feedback.models import CallbackRequest, ContactMessage, Review, Subscription
from tests.factories import TEST_PASSWORD, ProductFactory, ReviewFactory

pytestmark = [pytest.mark.integration, pytest.mark.django_db]


def test_register_logs_in(api_client: APIClient) -> None:
    """Регистрация создаёт пользователя и открывает сессию."""
    response = api_client.post(
        "/api/auth/register/",
        {"email": "New@Example.com", "password": "Sber-City-2026!", "first_name": "Анна", "phone": "89160000000"},
        format="json",
    )
    assert response.status_code == 201, response.json()
    assert response.json()["email"] == "new@example.com"
    assert response.json()["phone"] == "+79160000000"
    assert "password" not in response.json()
    assert api_client.get("/api/auth/me/").json()["email"] == "new@example.com"


@pytest.mark.parametrize(
    ("payload", "field"),
    [
        ({"email": "user0@example.com", "password": "Sber-City-2026!", "first_name": "А"}, "email"),
        ({"email": "x@example.com", "password": "12345678", "first_name": "А"}, "password"),
        ({"email": "x@example.com", "password": "short", "first_name": "А"}, "password"),
        ({"email": "x@example.com", "password": "Sber-City-2026!"}, "first_name"),
    ],
)
def test_register_validation(api_client: APIClient, user: User, payload: dict[str, str], field: str) -> None:
    """Дубликат email, слабый пароль и отсутствие имени отклоняются."""
    User.objects.filter(pk=user.pk).update(email="user0@example.com")
    response = api_client.post("/api/auth/register/", payload, format="json")
    assert response.status_code == 400
    assert field in response.json()


def test_login_logout_flow(api_client: APIClient, user: User) -> None:
    """Вход по email без учёта регистра, выход закрывает сессию."""
    bad = api_client.post("/api/auth/login/", {"email": user.email, "password": "wrong"}, format="json")
    assert bad.status_code == 400
    ok = api_client.post("/api/auth/login/", {"email": user.email.upper(), "password": TEST_PASSWORD}, format="json")
    assert ok.status_code == 200
    assert api_client.get("/api/auth/me/").status_code == 200
    assert api_client.post("/api/auth/logout/").status_code == 204
    assert api_client.get("/api/auth/me/").status_code == 403


def test_profile_update(auth_client: APIClient) -> None:
    """Профиль редактируется, email изменить нельзя."""
    response = auth_client.patch(
        "/api/auth/me/", {"company": "ООО Ромашка", "phone": "+7 916 111-22-33", "email": "x@y.ru"}, format="json"
    )
    assert response.status_code == 200
    assert response.json()["company"] == "ООО Ромашка"
    assert response.json()["phone"] == "+79161112233"
    assert response.json()["email"] != "x@y.ru"
    assert auth_client.put("/api/auth/me/", {}, format="json").status_code == 405


def test_contact_message(api_client: APIClient) -> None:
    """Сообщение с контактов сохраняется, согласие обязательно."""
    payload = {
        "name": "Иван",
        "email": "ivan@example.com",
        "message": "Нужна консультация по видеоаналитике",
        "personal_data_consent": True,
    }
    assert api_client.post("/api/feedback/contact/", payload, format="json").status_code == 201
    assert ContactMessage.objects.get().phone == ""
    rejected = api_client.post("/api/feedback/contact/", {**payload, "personal_data_consent": False}, format="json")
    assert rejected.status_code == 400
    short = api_client.post("/api/feedback/contact/", {**payload, "message": "коротко"}, format="json")
    assert "message" in short.json()


def test_callback_request_with_product(api_client: APIClient) -> None:
    """Запрос цены сохраняется с привязкой к товару."""
    ProductFactory.create(slug="fire", price=None)
    response = api_client.post(
        "/api/feedback/callback/",
        {
            "topic": "price",
            "name": "Пётр",
            "phone": "+7 916 000 11 22",
            "product": "fire",
            "personal_data_consent": True,
        },
        format="json",
    )
    assert response.status_code == 201, response.json()
    request = CallbackRequest.objects.get()
    assert request.product is not None and request.product.slug == "fire"
    assert request.phone == "+79160001122"
    bad = api_client.post(
        "/api/feedback/callback/",
        {"name": "Пётр", "phone": "+7 916 000 11 22", "product": "missing", "personal_data_consent": True},
        format="json",
    )
    assert "product" in bad.json()


def test_reviews_moderation_and_summary(api_client: APIClient) -> None:
    """Новый отзыв уходит на модерацию; сводка считает только одобренные."""
    ReviewFactory.create(rating=5)
    ReviewFactory.create(rating=4)
    ReviewFactory.create(rating=1, is_approved=False)
    created = api_client.post(
        "/api/feedback/reviews/",
        {"author_name": "Анна", "rating": 5, "text": "Всё отлично, рекомендую."},
        format="json",
    )
    assert created.status_code == 201
    assert Review.objects.get(author_name="Анна").is_approved is False
    assert api_client.get("/api/feedback/reviews/").json()["count"] == 2
    assert api_client.get("/api/feedback/reviews/summary/").json() == {"average": 4.5, "count": 2}
    invalid = api_client.post("/api/feedback/reviews/", {"author_name": "А", "rating": 6, "text": "x"}, format="json")
    assert set(invalid.json()) == {"author_name", "rating", "text"}


def test_empty_reviews_summary(api_client: APIClient) -> None:
    """Без отзывов средняя оценка отсутствует."""
    assert api_client.get("/api/feedback/reviews/summary/").json() == {"average": None, "count": 0}


def test_subscription_is_idempotent(api_client: APIClient) -> None:
    """Повторная подписка не создаёт дубликат и не считается ошибкой."""
    for email in ("Sub@Example.com", "sub@example.com"):
        assert api_client.post("/api/feedback/subscribe/", {"email": email}, format="json").status_code == 201
    assert Subscription.objects.count() == 1
    assert api_client.post("/api/feedback/subscribe/", {"email": "bad"}, format="json").status_code == 400


def test_forms_are_throttled(api_client: APIClient) -> None:
    """После превышения лимита формы отвечают 429."""
    FormsRateThrottle.THROTTLE_RATES = {**FormsRateThrottle.THROTTLE_RATES, "forms": "2/minute"}
    codes = [
        api_client.post("/api/feedback/subscribe/", {"email": f"s{i}@example.com"}, format="json").status_code
        for i in range(3)
    ]
    assert codes == [201, 201, 429]


def test_throttling_behind_proxy_uses_client_ip(api_client: APIClient) -> None:
    """За одним прокси лимит считается по IP клиента, а подделанное начало X-Forwarded-For игнорируется."""
    FormsRateThrottle.THROTTLE_RATES = {**FormsRateThrottle.THROTTLE_RATES, "forms": "1/minute"}

    def subscribe(forwarded_for: str, index: int) -> int:
        """Отправляет подписку от имени клиента за прокси и возвращает код ответа."""
        response = api_client.post(
            "/api/feedback/subscribe/",
            {"email": f"p{index}@example.com"},
            format="json",
            HTTP_X_FORWARDED_FOR=forwarded_for,
            REMOTE_ADDR="172.18.0.5",
        )
        return response.status_code

    with override_settings(REST_FRAMEWORK={**settings.REST_FRAMEWORK, "NUM_PROXIES": 1}):
        assert subscribe("10.0.0.1", 1) == 201
        assert subscribe("10.0.0.2", 2) == 201
        assert subscribe("10.0.0.1", 3) == 429
        assert subscribe("1.2.3.4, 10.0.0.1", 4) == 429


def test_admin_pages_open_for_staff(api_client: APIClient) -> None:
    """Страницы админки всех моделей открываются у администратора."""
    admin = User.objects.create_superuser("admin@example.com", "Admin-Pass-2026!")
    api_client.force_login(admin)
    for url in (
        "/admin/",
        "/admin/accounts/user/",
        "/admin/accounts/user/add/",
        "/admin/catalog/product/",
        "/admin/catalog/product/add/",
        "/admin/catalog/category/",
        "/admin/news/article/",
        "/admin/orders/order/",
        "/admin/orders/promocode/",
        "/admin/feedback/contactmessage/",
        "/admin/feedback/callbackrequest/",
        "/admin/feedback/review/",
        "/admin/feedback/subscription/",
    ):
        assert api_client.get(url).status_code == 200, url
