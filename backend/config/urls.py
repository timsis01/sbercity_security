"""Корневые маршруты проекта.

Все эндпоинты API находятся под префиксом ``/api/``, административная панель — ``/admin/``.
"""

from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import URLPattern, URLResolver, include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

admin.site.site_header = "СберСити — безопасность"
admin.site.site_title = "СберСити — безопасность"
admin.site.index_title = "Управление магазином"

api_patterns: list[URLPattern | URLResolver] = [
    path("", include("apps.core.urls")),
    path("auth/", include("apps.accounts.urls")),
    path("catalog/", include("apps.catalog.urls")),
    path("news/", include("apps.news.urls")),
    path("orders/", include("apps.orders.urls")),
    path("feedback/", include("apps.feedback.urls")),
    path("schema/", SpectacularAPIView.as_view(), name="schema"),
    path("docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="docs"),
]

urlpatterns: list[URLPattern | URLResolver] = [
    path("admin/", admin.site.urls),
    path("api/", include(api_patterns)),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
