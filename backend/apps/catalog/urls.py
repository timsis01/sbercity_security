"""Маршруты каталога."""

from rest_framework.routers import DefaultRouter

from apps.catalog.views import CategoryViewSet, ProductViewSet

app_name = "catalog"

router = DefaultRouter(trailing_slash=True)
router.include_root_view = False
router.register("categories", CategoryViewSet, basename="category")
router.register("products", ProductViewSet, basename="product")

urlpatterns = router.urls
