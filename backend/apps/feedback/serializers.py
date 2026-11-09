"""Сериализаторы форм обратной связи."""

from typing import Any

from rest_framework import serializers

from apps.catalog.models import Product
from apps.core.validators import normalize_optional_phone, normalize_phone
from apps.feedback.models import CallbackRequest, ContactMessage, Review, Subscription


class ConsentMixin(serializers.Serializer[Any]):
    """Обязательное согласие на обработку персональных данных."""

    personal_data_consent = serializers.BooleanField(write_only=True)

    def validate_personal_data_consent(self, value: bool) -> bool:
        """Требует отметку согласия.

        Args:
            value: Отметка согласия.

        Returns:
            ``True``.

        Raises:
            serializers.ValidationError: Если согласие не дано.
        """
        if not value:
            raise serializers.ValidationError("Необходимо согласие на обработку персональных данных.")
        return value


class ContactMessageSerializer(ConsentMixin, serializers.ModelSerializer[ContactMessage]):
    """Форма «Отправить сообщение»."""

    class Meta:
        """Поля формы."""

        model = ContactMessage
        fields = ("id", "name", "email", "phone", "message", "personal_data_consent", "created_at")
        read_only_fields = ("id", "created_at")
        extra_kwargs = {"message": {"min_length": 10}, "name": {"min_length": 2}}

    def validate_phone(self, value: str) -> str:
        """Нормализует необязательный телефон.

        Args:
            value: Введённый телефон или пустая строка.

        Returns:
            Нормализованный телефон или пустая строка.
        """
        return normalize_optional_phone(value)

    def create(self, validated_data: dict[str, Any]) -> ContactMessage:
        """Сохраняет сообщение без служебного поля согласия.

        Args:
            validated_data: Провалидированные поля.

        Returns:
            Сохранённое сообщение.
        """
        validated_data.pop("personal_data_consent", None)
        return ContactMessage.objects.create(**validated_data)


class CallbackRequestSerializer(ConsentMixin, serializers.ModelSerializer[CallbackRequest]):
    """Форма обратного звонка, запроса цены или быстрого заказа."""

    product = serializers.SlugRelatedField(
        slug_field="slug",
        queryset=Product.objects.published(),
        required=False,
        allow_null=True,
    )

    class Meta:
        """Поля формы."""

        model = CallbackRequest
        fields = ("id", "topic", "name", "phone", "product", "comment", "personal_data_consent", "created_at")
        read_only_fields = ("id", "created_at")
        extra_kwargs = {"name": {"min_length": 2}}

    def validate_phone(self, value: str) -> str:
        """Нормализует телефон.

        Args:
            value: Введённый телефон.

        Returns:
            Телефон в формате ``+7XXXXXXXXXX``.
        """
        return normalize_phone(value)

    def create(self, validated_data: dict[str, Any]) -> CallbackRequest:
        """Сохраняет заявку без служебного поля согласия.

        Args:
            validated_data: Провалидированные поля.

        Returns:
            Сохранённая заявка.
        """
        validated_data.pop("personal_data_consent", None)
        return CallbackRequest.objects.create(**validated_data)


class ReviewSerializer(serializers.ModelSerializer[Review]):
    """Отзыв о магазине."""

    class Meta:
        """Поля отзыва; модерация выполняется в админке."""

        model = Review
        fields = ("id", "author_name", "rating", "text", "created_at")
        read_only_fields = ("id", "created_at")
        extra_kwargs = {"text": {"min_length": 10}, "author_name": {"min_length": 2}}


class ReviewSummarySerializer(serializers.Serializer[dict[str, Any]]):
    """Сводный рейтинг магазина."""

    average = serializers.FloatField(allow_null=True)
    count = serializers.IntegerField()


class SubscriptionSerializer(serializers.Serializer[Subscription]):
    """Подписка на новости и скидки."""

    email = serializers.EmailField()

    def create(self, validated_data: dict[str, Any]) -> Subscription:
        """Создаёт или повторно активирует подписку.

        Args:
            validated_data: Email подписчика.

        Returns:
            Активная подписка.
        """
        email = str(validated_data["email"]).strip().lower()
        subscription, _ = Subscription.objects.update_or_create(email=email, defaults={"is_active": True})
        return subscription
