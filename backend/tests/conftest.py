"""Общие фикстуры тестов."""

from collections.abc import Iterator

import pytest
from django.conf import settings
from django.core.cache import cache
from django.test import override_settings
from rest_framework.test import APIClient

from apps.accounts.models import User
from apps.core.throttling import FormsRateThrottle
from tests.factories import UserFactory


@pytest.fixture(autouse=True)
def isolated_infrastructure() -> Iterator[None]:
    """Отключает манифест статики и переводит кэш в память, чтобы тесты не зависели от окружения."""
    storages = {
        **settings.STORAGES,
        "staticfiles": {"BACKEND": "django.contrib.staticfiles.storage.StaticFilesStorage"},
    }
    caches = {"default": {"BACKEND": "django.core.cache.backends.locmem.LocMemCache"}}
    with override_settings(STORAGES=storages, CACHES=caches):
        yield


@pytest.fixture(autouse=True)
def relaxed_throttling() -> Iterator[None]:
    """Поднимает лимит частоты форм и очищает счётчики между тестами."""
    original = FormsRateThrottle.THROTTLE_RATES
    FormsRateThrottle.THROTTLE_RATES = {**original, "forms": "1000/minute"}
    cache.clear()
    yield
    FormsRateThrottle.THROTTLE_RATES = original
    cache.clear()


@pytest.fixture
def api_client() -> APIClient:
    """Клиент API без проверки CSRF (поведение по умолчанию тестового клиента DRF)."""
    return APIClient()


@pytest.fixture
def csrf_client() -> APIClient:
    """Клиент API, который, как браузер, обязан передавать CSRF-токен."""
    return APIClient(enforce_csrf_checks=True)


@pytest.fixture
def user() -> User:
    """Зарегистрированный покупатель."""
    return UserFactory.create()


@pytest.fixture
def auth_client(user: User) -> APIClient:
    """Клиент API с открытой сессией покупателя."""
    client = APIClient()
    client.force_login(user)
    return client
