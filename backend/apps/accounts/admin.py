"""Административный интерфейс пользователей."""

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.forms import AdminUserCreationForm, UserChangeForm

from apps.accounts.models import User


class UserCreateForm(AdminUserCreationForm[User]):
    """Форма создания пользователя в админке по email."""

    class Meta:
        """Создание по email вместо логина."""

        model = User
        fields = ("email",)


class UserEditForm(UserChangeForm[User]):
    """Форма редактирования пользователя в админке."""

    class Meta:
        """Все поля модели пользователя."""

        model = User
        fields = "__all__"


@admin.register(User)
class UserAdmin(BaseUserAdmin[User]):
    """Управление пользователями с входом по email."""

    add_form = UserCreateForm
    form = UserEditForm
    ordering = ("-date_joined",)
    list_display = ("email", "first_name", "last_name", "phone", "company", "is_staff", "is_active")
    list_filter = ("is_staff", "is_superuser", "is_active")
    search_fields = ("email", "first_name", "last_name", "phone", "company")
    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Персональные данные", {"fields": ("first_name", "last_name", "phone", "company")}),
        ("Права", {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")}),
        ("Даты", {"fields": ("last_login", "date_joined")}),
    )
    add_fieldsets = ((None, {"classes": ("wide",), "fields": ("email", "password1", "password2")}),)
