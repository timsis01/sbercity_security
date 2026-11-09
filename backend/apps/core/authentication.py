"""Сессионная аутентификация с обязательной проверкой CSRF."""

from rest_framework.authentication import SessionAuthentication
from rest_framework.request import Request

from apps.accounts.models import User


class CsrfEnforcedSessionAuthentication(SessionAuthentication):
    """Проверяет CSRF-токен для небезопасных запросов, в том числе от гостей.

    Стандартная ``SessionAuthentication`` проверяет CSRF только для вошедших
    пользователей. Здесь проверка распространяется на анонимные формы
    (заказ, вход, регистрация, обратная связь), чтобы сторонний сайт не мог
    отправить их от имени посетителя.
    """

    def authenticate(self, request: Request) -> tuple[User, None] | None:
        """Возвращает пользователя сессии и проверяет CSRF.

        Args:
            request: Входящий запрос DRF.

        Returns:
            Пару ``(пользователь, None)`` для активной сессии или ``None`` для гостя.
        """
        self.enforce_csrf(request)
        user = getattr(request._request, "user", None)
        if user is None or not user.is_active:
            return None
        return (user, None)
