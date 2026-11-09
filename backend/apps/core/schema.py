"""Расширения OpenAPI-схемы для собственных компонентов проекта."""

from drf_spectacular.authentication import SessionScheme


class CsrfEnforcedSessionScheme(SessionScheme):
    """Описывает в схеме сессионную аутентификацию с обязательным CSRF как стандартную cookie-сессию."""

    target_class = "apps.core.authentication.CsrfEnforcedSessionAuthentication"
    name = "cookieAuth"
