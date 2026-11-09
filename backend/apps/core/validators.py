"""Общие валидаторы пользовательского ввода."""

import re

from rest_framework import serializers

NON_DIGITS_RE = re.compile(r"\D")


def normalize_phone(value: str) -> str:
    """Проверяет российский номер телефона и приводит его к виду ``+7XXXXXXXXXX``.

    Args:
        value: Номер в произвольном формате.

    Returns:
        Нормализованный номер.

    Raises:
        serializers.ValidationError: Если номер не похож на российский.
    """
    digits = NON_DIGITS_RE.sub("", value)
    if len(digits) == 11 and digits[0] in {"7", "8"}:
        digits = digits[1:]
    if len(digits) != 10:
        raise serializers.ValidationError("Введите телефон в формате +7 (XXX) XXX-XX-XX.")
    return f"+7{digits}"


def normalize_optional_phone(value: str) -> str:
    """Нормализует необязательный телефон.

    Args:
        value: Введённый телефон или пустая строка.

    Returns:
        Телефон в формате ``+7XXXXXXXXXX`` либо пустая строка.
    """
    return normalize_phone(value) if value.strip() else ""
