"""Команда создания администратора из переменных окружения."""

import os
from typing import Any

from django.core.management.base import BaseCommand

from apps.accounts.models import User


class Command(BaseCommand):
    """Создаёт суперпользователя, если заданы ``DJANGO_SUPERUSER_EMAIL`` и ``DJANGO_SUPERUSER_PASSWORD``.

    Существующий пользователь не изменяется, поэтому команду безопасно
    выполнять при каждом запуске контейнера.
    """

    help = "Создаёт администратора из переменных окружения, если его ещё нет"

    def handle(self, *args: Any, **options: Any) -> None:
        """Проверяет переменные окружения и создаёт администратора.

        Args:
            *args: Позиционные аргументы.
            **options: Параметры командной строки.
        """
        email = os.environ.get("DJANGO_SUPERUSER_EMAIL", "").strip().lower()
        password = os.environ.get("DJANGO_SUPERUSER_PASSWORD", "")
        if not email or not password:
            self.stdout.write("DJANGO_SUPERUSER_EMAIL/PASSWORD не заданы — администратор не создаётся.")
            return
        if User.objects.filter(email=email).exists():
            self.stdout.write(f"Администратор {email} уже существует.")
            return
        User.objects.create_superuser(email=email, password=password, first_name="Администратор")
        self.stdout.write(self.style.SUCCESS(f"Создан администратор {email}."))
