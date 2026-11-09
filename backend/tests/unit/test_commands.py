"""Тесты служебных management-команд запуска контейнера."""

from io import StringIO

import pytest
from django.core.management import call_command

from apps.accounts.models import User

pytestmark = pytest.mark.django_db


def test_wait_for_db_succeeds_when_database_is_up() -> None:
    """Команда ожидания сразу сообщает о доступной базе."""
    output = StringIO()
    call_command("wait_for_db", "--timeout", "1", stdout=output)
    assert "База данных доступна" in output.getvalue()


def test_ensure_superuser_is_idempotent(monkeypatch: pytest.MonkeyPatch) -> None:
    """Администратор создаётся один раз и только при заданных переменных окружения."""
    output = StringIO()
    monkeypatch.delenv("DJANGO_SUPERUSER_EMAIL", raising=False)
    monkeypatch.delenv("DJANGO_SUPERUSER_PASSWORD", raising=False)
    call_command("ensure_superuser", stdout=output)
    assert not User.objects.exists()

    monkeypatch.setenv("DJANGO_SUPERUSER_EMAIL", "Admin@Example.com")
    monkeypatch.setenv("DJANGO_SUPERUSER_PASSWORD", "Admin-Pass-2026!")
    call_command("ensure_superuser", stdout=output)
    call_command("ensure_superuser", stdout=output)
    admin = User.objects.get()
    assert admin.email == "admin@example.com"
    assert admin.is_superuser and admin.check_password("Admin-Pass-2026!")
    assert "уже существует" in output.getvalue()
