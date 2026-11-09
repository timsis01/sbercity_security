"""Служебные эндпоинты: проверка здоровья, сведения о компании, CSRF."""

from typing import Any

from django.conf import settings
from django.db import connection
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import ensure_csrf_cookie
from drf_spectacular.utils import extend_schema, inline_serializer
from rest_framework import serializers, status
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView


class HealthView(APIView):
    """Проверка доступности приложения и базы данных."""

    authentication_classes: list[type] = []

    @extend_schema(
        responses=inline_serializer(
            "Health",
            {"status": serializers.CharField(), "database": serializers.CharField()},
        )
    )
    def get(self, request: Request) -> Response:
        """Выполняет простой запрос к БД и сообщает статус сервиса.

        Args:
            request: Входящий запрос.

        Returns:
            ``200`` со статусом ``ok`` либо ``503``, если база недоступна.
        """
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
                cursor.fetchone()
        except Exception:
            return Response(
                {"status": "error", "database": "unavailable"},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        return Response({"status": "ok", "database": connection.vendor})


class SiteInfoView(APIView):
    """Контактные и юридические сведения о компании для шапки и подвала сайта."""

    @extend_schema(
        responses=inline_serializer(
            "SiteInfo",
            {
                "company_name": serializers.CharField(),
                "legal_name": serializers.CharField(),
                "inn": serializers.CharField(),
                "phones": serializers.ListField(child=serializers.CharField()),
                "sales_email": serializers.EmailField(),
                "info_email": serializers.EmailField(),
                "address": serializers.CharField(),
                "working_hours": serializers.CharField(),
                "office_hours": serializers.CharField(),
                "telegram": serializers.URLField(),
                "delivery_cost": serializers.IntegerField(),
            },
        )
    )
    def get(self, request: Request) -> Response:
        """Возвращает настройки ``SITE_INFO``.

        Args:
            request: Входящий запрос.

        Returns:
            Словарь со сведениями о компании.
        """
        info: dict[str, Any] = dict(settings.SITE_INFO)
        return Response(info)


@method_decorator(ensure_csrf_cookie, name="dispatch")
class CsrfView(APIView):
    """Выдаёт CSRF-cookie для последующих небезопасных запросов SPA."""

    @extend_schema(responses=inline_serializer("Csrf", {"detail": serializers.CharField()}))
    def get(self, request: Request) -> Response:
        """Устанавливает cookie ``csrftoken``.

        Args:
            request: Входящий запрос.

        Returns:
            Подтверждение установки cookie.
        """
        return Response({"detail": "CSRF cookie set"})
