"""Ограничение частоты отправки публичных форм."""

from rest_framework.throttling import AnonRateThrottle


class FormsRateThrottle(AnonRateThrottle):
    """Ограничивает анонимные отправки форм по IP-адресу.

    Частота задаётся ключом ``forms`` в ``DEFAULT_THROTTLE_RATES``.
    """

    scope = "forms"
