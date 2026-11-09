"""Маршруты новостей."""

from rest_framework.routers import DefaultRouter

from apps.news.views import ArticleViewSet

app_name = "news"

router = DefaultRouter(trailing_slash=True)
router.include_root_view = False
router.register("", ArticleViewSet, basename="article")

urlpatterns = router.urls
