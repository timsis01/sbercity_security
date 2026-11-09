"""Модульные тесты валидаторов и чтения окружения."""

import pytest
from rest_framework import serializers

from apps.core.validators import normalize_optional_phone, normalize_phone
from config.env import env_bool, env_int, env_list, env_str

pytestmark = pytest.mark.unit


@pytest.mark.parametrize(
    ("raw", "expected"),
    [
        ("+7 (916) 123-45-67", "+79161234567"),
        ("8 916 123 45 67", "+79161234567"),
        ("79161234567", "+79161234567"),
        ("9161234567", "+79161234567"),
    ],
)
def test_normalize_phone_accepts_russian_numbers(raw: str, expected: str) -> None:
    """Разные записи российского номера приводятся к единому виду."""
    assert normalize_phone(raw) == expected


@pytest.mark.parametrize("raw", ["123", "+1 202 555 0100 22", "", "телефон"])
def test_normalize_phone_rejects_invalid(raw: str) -> None:
    """Короткие, иностранные и пустые номера отклоняются."""
    with pytest.raises(serializers.ValidationError):
        normalize_phone(raw)


def test_normalize_optional_phone_allows_blank() -> None:
    """Пустой необязательный телефон остаётся пустым."""
    assert normalize_optional_phone("  ") == ""
    assert normalize_optional_phone("89161234567") == "+79161234567"


def test_env_helpers(monkeypatch: pytest.MonkeyPatch) -> None:
    """Переменные окружения разбираются в нужные типы."""
    monkeypatch.setenv("T_STR", "value")
    monkeypatch.setenv("T_BOOL", "Yes")
    monkeypatch.setenv("T_INT", "42")
    monkeypatch.setenv("T_LIST", "a, b,,c ")
    assert env_str("T_STR") == "value"
    assert env_bool("T_BOOL") is True
    assert env_int("T_INT", 0) == 42
    assert env_list("T_LIST") == ["a", "b", "c"]


def test_env_defaults(monkeypatch: pytest.MonkeyPatch) -> None:
    """При отсутствии переменных возвращаются значения по умолчанию."""
    for name in ("T_MISSING_STR", "T_MISSING_BOOL", "T_MISSING_INT", "T_MISSING_LIST"):
        monkeypatch.delenv(name, raising=False)
    assert env_str("T_MISSING_STR", "x") == "x"
    assert env_bool("T_MISSING_BOOL", True) is True
    assert env_int("T_MISSING_INT", 7) == 7
    assert env_list("T_MISSING_LIST", ["d"]) == ["d"]
