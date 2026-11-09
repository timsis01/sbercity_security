"""Маршруты заказов."""

from rest_framework.routers import DefaultRouter

from apps.orders.views import OrderViewSet

app_name = "orders"

router = DefaultRouter(trailing_slash=True)
router.include_root_view = False
router.register("", OrderViewSet, basename="order")

urlpatterns = router.urls
