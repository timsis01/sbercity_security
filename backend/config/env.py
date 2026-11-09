"""Типизированное чтение переменных окружения."""

import os


def env_str(name: str, default: str = "") -> str:
    """Возвращает строковое значение переменной окружения.

    Args:
        name: Имя переменной.
        default: Значение по умолчанию, если переменная не задана.

    Returns:
        Значение переменной или значение по умолчанию.
    """
    return os.environ.get(name, default)


def env_bool(name: str, default: bool = False) -> bool:
    """Возвращает логическое значение переменной окружения.

    Истинными считаются значения ``1``, ``true``, ``yes``, ``on`` без учёта регистра.

    Args:
        name: Имя переменной.
        default: Значение по умолчанию, если переменная не задана.

    Returns:
        Распознанное логическое значение.
    """
    raw = os.environ.get(name)
    if raw is None:
        return default
    return raw.strip().lower() in {"1", "true", "yes", "on"}


def env_int(name: str, default: int) -> int:
    """Возвращает целочисленное значение переменной окружения.

    Args:
        name: Имя переменной.
        default: Значение по умолчанию, если переменная не задана или пуста.

    Returns:
        Целое число.
    """
    raw = os.environ.get(name, "").strip()
    return int(raw) if raw else default


def env_list(name: str, default: list[str] | None = None) -> list[str]:
    """Возвращает список строк из переменной окружения, разделённой запятыми.

    Args:
        name: Имя переменной.
        default: Список по умолчанию, если переменная не задана.

    Returns:
        Список непустых значений без пробелов по краям.
    """
    raw = os.environ.get(name)
    if raw is None:
        return list(default or [])
    return [item.strip() for item in raw.split(",") if item.strip()]
