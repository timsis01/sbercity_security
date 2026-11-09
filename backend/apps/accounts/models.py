"""Модель пользователя с входом по электронной почте."""

from typing import Any, ClassVar

from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.utils import timezone


class UserManager(BaseUserManager["User"]):
    """Менеджер пользователей, использующий email вместо логина."""

    use_in_migrations = True

    def _create_user(self, email: str, password: str | None, **extra_fields: Any) -> "User":
        """Создаёт и сохраняет пользователя.

        Args:
            email: Адрес электронной почты, используется как логин.
            password: Пароль в открытом виде или ``None``.
            **extra_fields: Дополнительные поля модели.

        Returns:
            Сохранённый пользователь.

        Raises:
            ValueError: Если email не указан.
        """
        if not email:
            raise ValueError("Email обязателен")
        user = self.model(email=self.normalize_email(email).lower(), **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, email: str, password: str | None = None, **extra_fields: Any) -> "User":
        """Создаёт обычного пользователя.

        Args:
            email: Адрес электронной почты.
            password: Пароль.
            **extra_fields: Дополнительные поля модели.

        Returns:
            Сохранённый пользователь.
        """
        extra_fields.setdefault("is_staff", False)
        extra_fields.setdefault("is_superuser", False)
        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email: str, password: str | None = None, **extra_fields: Any) -> "User":
        """Создаёт администратора.

        Args:
            email: Адрес электронной почты.
            password: Пароль.
            **extra_fields: Дополнительные поля модели.

        Returns:
            Сохранённый суперпользователь.

        Raises:
            ValueError: Если флаги ``is_staff`` или ``is_superuser`` переданы как ложные.
        """
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        if extra_fields.get("is_staff") is not True or extra_fields.get("is_superuser") is not True:
            raise ValueError("Суперпользователь должен иметь is_staff=True и is_superuser=True")
        return self._create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    """Покупатель или сотрудник магазина."""

    email = models.EmailField("Email", unique=True)
    first_name = models.CharField("Имя", max_length=150, blank=True)
    last_name = models.CharField("Фамилия", max_length=150, blank=True)
    phone = models.CharField("Телефон", max_length=32, blank=True)
    company = models.CharField("Организация", max_length=255, blank=True)
    is_staff = models.BooleanField("Доступ в админку", default=False)
    is_active = models.BooleanField("Активен", default=True)
    date_joined = models.DateTimeField("Дата регистрации", default=timezone.now)

    USERNAME_FIELD = "email"
    EMAIL_FIELD = "email"
    REQUIRED_FIELDS: ClassVar[list[str]] = []

    objects = UserManager()

    class Meta:
        """Метаданные модели пользователя."""

        verbose_name = "Пользователь"
        verbose_name_plural = "Пользователи"

    def __str__(self) -> str:
        """Возвращает email пользователя."""
        return self.email

    def get_full_name(self) -> str:
        """Возвращает имя и фамилию через пробел или email, если они не заполнены."""
        full_name = f"{self.first_name} {self.last_name}".strip()
        return full_name or self.email

    def get_short_name(self) -> str:
        """Возвращает имя пользователя или email."""
        return self.first_name or self.email
