"""Интеграционные тесты каталога, новостей и служебных эндпоинтов."""

import os
from datetime import timedelta
from decimal import Decimal

import pytest
from django.core.management import call_command
from django.utils import timezone
from rest_framework.test import APIClient

from apps.catalog.models import Category, Product
from apps.news.models import Article
from apps.orders.models import PromoCode
from tests.factories import ArticleFactory, CategoryFactory, ProductFactory

pytestmark = [pytest.mark.integration, pytest.mark.django_db]


def test_health(api_client: APIClient) -> None:
    """Проверка здоровья сообщает о доступной базе."""
    response = api_client.get("/api/health/")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_site_info(api_client: APIClient) -> None:
    """Сведения о компании содержат название и стоимость доставки."""
    data = api_client.get("/api/site/").json()
    assert data["company_name"] == "СберСити — безопасность"
    assert data["delivery_cost"] == 2500
    assert data["phones"]


def test_csrf_endpoint_sets_cookie(api_client: APIClient) -> None:
    """Эндпоинт CSRF устанавливает cookie."""
    response = api_client.get("/api/csrf/")
    assert response.status_code == 200
    assert "csrftoken" in response.cookies


def test_openapi_schema(api_client: APIClient) -> None:
    """OpenAPI-схема генерируется без ошибок и описывает ключевые пути."""
    response = api_client.get("/api/schema/", HTTP_ACCEPT="application/json")
    assert response.status_code == 200
    content = response.content.decode()
    for path in ("/api/catalog/products/", "/api/orders/", "/api/feedback/contact/"):
        assert path in content


def test_openapi_schema_has_no_warnings() -> None:
    """Генерация схемы проходит валидацию без предупреждений."""
    call_command("spectacular", "--validate", "--fail-on-warn", "--file", os.devnull)


def test_category_tree_and_counts(api_client: APIClient) -> None:
    """Список категорий — только корни с вложенными детьми и счётчиком товаров."""
    root = CategoryFactory.create(name="Видео", slug="video")
    child = CategoryFactory.create(name="Камеры", slug="cams", parent=root)
    ProductFactory.create(category=child)
    ProductFactory.create(category=root)
    data = api_client.get("/api/catalog/categories/").json()
    assert [item["slug"] for item in data] == ["video"]
    assert data[0]["product_count"] == 2
    assert data[0]["children"][0]["slug"] == "cams"


def test_category_detail_breadcrumbs(api_client: APIClient) -> None:
    """Детальная категория содержит путь от корня."""
    root = CategoryFactory.create(name="Видео", slug="video")
    CategoryFactory.create(name="Камеры", slug="cams", parent=root)
    data = api_client.get("/api/catalog/categories/cams/").json()
    assert [crumb["slug"] for crumb in data["breadcrumbs"]] == ["video", "cams"]
    assert api_client.get("/api/catalog/categories/unknown/").status_code == 404


def test_product_list_filters_and_search(api_client: APIClient) -> None:
    """Фильтры по категории с потомками, цене, меткам и поиск работают."""
    root = CategoryFactory.create(slug="root")
    child = CategoryFactory.create(slug="child", parent=root)
    ProductFactory.create(category=child, title="HASP ключ", price=Decimal("8000"), is_bestseller=True)
    ProductFactory.create(category=root, title="Ядро", price=Decimal("75000"))
    ProductFactory.create(title="Огнетушитель", price=None)
    ProductFactory.create(title="Скрытый", is_published=False)

    assert api_client.get("/api/catalog/products/").json()["count"] == 3
    assert api_client.get("/api/catalog/products/?category=root").json()["count"] == 2
    assert api_client.get("/api/catalog/products/?category=missing").json()["count"] == 0
    assert api_client.get("/api/catalog/products/?price_max=10000").json()["count"] == 1
    assert api_client.get("/api/catalog/products/?is_bestseller=true").json()["count"] == 1
    results = api_client.get("/api/catalog/products/?search=hasp").json()["results"]
    assert [item["title"] for item in results] == ["HASP ключ"]


def test_product_ordering_and_pagination(api_client: APIClient) -> None:
    """Сортировка по цене и размер страницы задаются параметрами."""
    for price in ("300", "100", "200"):
        ProductFactory.create(price=Decimal(price))
    data = api_client.get("/api/catalog/products/?ordering=price&page_size=2").json()
    assert [item["price"] for item in data["results"]] == ["100.00", "200.00"]
    assert data["next"] is not None


def test_product_detail_and_related(api_client: APIClient) -> None:
    """Карточка товара содержит характеристики и крошки; похожие — из той же категории."""
    category = CategoryFactory.create(slug="cat")
    product = ProductFactory.create(
        category=category, slug="main", specs=[{"name": "Тип", "value": "Ключ"}], price=None
    )
    ProductFactory.create(category=category, slug="sibling")
    ProductFactory.create(slug="other")
    data = api_client.get("/api/catalog/products/main/").json()
    assert data["is_price_on_request"] is True
    assert data["specs"] == [{"name": "Тип", "value": "Ключ"}]
    assert data["breadcrumbs"][-1]["slug"] == "cat"
    related = api_client.get(f"/api/catalog/products/{product.slug}/related/").json()
    assert [item["slug"] for item in related] == ["sibling"]
    assert api_client.get("/api/catalog/products/missing/").status_code == 404


def test_catalog_is_read_only(api_client: APIClient) -> None:
    """Каталог нельзя изменить через API."""
    assert api_client.post("/api/catalog/products/", {}, format="json").status_code == 405


def test_news_list_hides_drafts_and_future(api_client: APIClient) -> None:
    """В ленте только опубликованные новости с наступившей датой, свежие первыми."""
    ArticleFactory.create(slug="old", published_at=timezone.now() - timedelta(days=2))
    ArticleFactory.create(slug="new", published_at=timezone.now() - timedelta(hours=1))
    ArticleFactory.create(slug="draft", is_published=False)
    ArticleFactory.create(slug="future", published_at=timezone.now() + timedelta(days=1))
    data = api_client.get("/api/news/").json()
    assert [item["slug"] for item in data["results"]] == ["new", "old"]
    assert "body" not in data["results"][0]
    assert api_client.get("/api/news/new/").json()["body"] == "Текст новости"
    assert api_client.get("/api/news/draft/").status_code == 404


def test_seed_demo_command_is_idempotent() -> None:
    """Команда наполнения загружает данные и не дублирует их при повторе."""
    call_command("seed_demo")
    call_command("seed_demo")
    call_command("seed_demo", "--if-empty")
    assert Category.objects.count() == 13
    assert Product.objects.count() == 41
    assert Article.objects.count() == 8
    assert PromoCode.objects.filter(code="SBERCITY10").exists()
    assert Product.objects.filter(price__isnull=True).count() == 8
    assert not Product.objects.filter(visual="").exists()


def test_product_exposes_visual(api_client: APIClient) -> None:
    """Список и карточка товара отдают модель иллюстрации."""
    ProductFactory.create(slug="key", visual="usb-key")
    assert api_client.get("/api/catalog/products/").json()["results"][0]["visual"] == "usb-key"
    assert api_client.get("/api/catalog/products/key/").json()["visual"] == "usb-key"
