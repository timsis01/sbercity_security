"""Модели обращений, заявок, отзывов и подписок."""

from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models


class ContactMessage(models.Model):
    """Сообщение со страницы «Контакты»."""

    name = models.CharField("Имя", max_length=150)
    email = models.EmailField("Email")
    phone = models.CharField("Телефон", max_length=32, blank=True)
    message = models.TextField("Сообщение", max_length=3000)
    is_processed = models.BooleanField("Обработано", default=False)
    created_at = models.DateTimeField("Получено", auto_now_add=True)

    class Meta:
        """Новые обращения первыми."""

        verbose_name = "Сообщение"
        verbose_name_plural = "Сообщения"
        ordering = ("-created_at",)

    def __str__(self) -> str:
        """Возвращает имя и email отправителя."""
        return f"{self.name} <{self.email}>"


class CallbackRequest(models.Model):
    """Заявка на обратный звонок, расчёт цены или быстрый заказ."""

    class Topic(models.TextChoices):
        """Повод обращения."""

        CALLBACK = "callback", "Обратный звонок"
        PRICE = "price", "Запрос цены"
        QUICK_ORDER = "quick_order", "Быстрый заказ"
        CONSULTATION = "consultation", "Консультация"

    topic = models.CharField("Тема", max_length=20, choices=Topic.choices, default=Topic.CALLBACK)
    name = models.CharField("Имя", max_length=150)
    phone = models.CharField("Телефон", max_length=32)
    product = models.ForeignKey(
        "catalog.Product",
        verbose_name="Товар",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="callback_requests",
    )
    comment = models.TextField("Комментарий", max_length=2000, blank=True)
    is_processed = models.BooleanField("Обработано", default=False)
    created_at = models.DateTimeField("Получено", auto_now_add=True)

    class Meta:
        """Новые заявки первыми."""

        verbose_name = "Заявка"
        verbose_name_plural = "Заявки"
        ordering = ("-created_at",)

    def __str__(self) -> str:
        """Возвращает тему, имя и телефон."""
        return f"{self.get_topic_display()}: {self.name}, {self.phone}"


class Review(models.Model):
    """Отзыв о магазине; публикуется после модерации."""

    author_name = models.CharField("Имя", max_length=100)
    rating = models.PositiveSmallIntegerField(
        "Оценка",
        validators=[MinValueValidator(1), MaxValueValidator(5)],
    )
    text = models.TextField("Текст", max_length=2000)
    is_approved = models.BooleanField("Одобрен", default=False)
    created_at = models.DateTimeField("Создан", auto_now_add=True)

    class Meta:
        """Новые отзывы первыми."""

        verbose_name = "Отзыв"
        verbose_name_plural = "Отзывы"
        ordering = ("-created_at",)

    def __str__(self) -> str:
        """Возвращает автора и оценку."""
        return f"{self.author_name}: {self.rating}/5"


class Subscription(models.Model):
    """Подписка на новости и скидки."""

    email = models.EmailField("Email", unique=True)
    is_active = models.BooleanField("Активна", default=True)
    created_at = models.DateTimeField("Создана", auto_now_add=True)

    class Meta:
        """Новые подписки первыми."""

        verbose_name = "Подписка"
        verbose_name_plural = "Подписки"
        ordering = ("-created_at",)

    def __str__(self) -> str:
        """Возвращает email подписчика."""
        return self.email
