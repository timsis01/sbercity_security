"""Маршруты служебных эндпоинтов."""

from django.urls import URLPattern, path

from apps.core.views import CsrfView, HealthView, SiteInfoView

app_name = "core"

urlpatterns: list[URLPattern] = [
    path("health/", HealthView.as_view(), name="health"),
    path("site/", SiteInfoView.as_view(), name="site-info"),
    path("csrf/", CsrfView.as_view(), name="csrf"),
]
