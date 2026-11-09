"""Маршруты аутентификации."""

from django.urls import URLPattern, path

from apps.accounts.views import LoginView, LogoutView, MeView, RegisterView

app_name = "accounts"

urlpatterns: list[URLPattern] = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("me/", MeView.as_view(), name="me"),
]
