"""Команда ожидания готовности базы данных при старте контейнера."""

import time
from typing import Any

from django.core.management.base import BaseCommand, CommandError, CommandParser
from django.db import connections
from django.db.utils import OperationalError


class Command(BaseCommand):
    """Повторяет попытки подключения к БД, пока она не станет доступна."""

    help = "Ожидает готовности базы данных"

    def add_arguments(self, parser: CommandParser) -> None:
        """Регистрирует параметры таймаута и интервала.

        Args:
            parser: Парсер аргументов команды.
        """
        parser.add_argument("--timeout", type=float, default=60.0, help="Максимальное время ожидания, секунд")
        parser.add_argument("--interval", type=float, default=1.0, help="Пауза между попытками, секунд")

    def handle(self, *args: Any, **options: Any) -> None:
        """Пытается выполнить запрос к базе до успеха или истечения таймаута.

        Args:
            *args: Позиционные аргументы.
            **options: Разобранные параметры командной строки.

        Raises:
            CommandError: Если база не стала доступна за отведённое время.
        """
        timeout = float(options["timeout"])
        interval = float(options["interval"])
        deadline = time.monotonic() + timeout
        attempt = 0
        while True:
            attempt += 1
            try:
                with connections["default"].cursor() as cursor:
                    cursor.execute("SELECT 1")
            except OperationalError as error:
                if time.monotonic() >= deadline:
                    raise CommandError(f"База данных недоступна после {attempt} попыток: {error}") from error
                self.stdout.write(f"База данных ещё не готова (попытка {attempt}), жду {interval} с…")
                connections["default"].close()
                time.sleep(interval)
                continue
            self.stdout.write(self.style.SUCCESS(f"База данных доступна (попытка {attempt})."))
            return
