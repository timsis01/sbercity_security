"""Маршруты обратной связи."""

from django.urls import URLPattern, URLResolver, path
from rest_framework.routers import DefaultRouter

from apps.feedback.views import (
    CallbackRequestCreateView,
    ContactMessageCreateView,
    ReviewViewSet,
    SubscriptionCreateView,
)

app_name = "feedback"

router = DefaultRouter(trailing_slash=True)
router.include_root_view = False
router.register("reviews", ReviewViewSet, basename="review")

urlpatterns: list[URLPattern | URLResolver] = [
    path("contact/", ContactMessageCreateView.as_view(), name="contact"),
    path("callback/", CallbackRequestCreateView.as_view(), name="callback"),
    path("subscribe/", SubscriptionCreateView.as_view(), name="subscribe"),
    *router.urls,
]
