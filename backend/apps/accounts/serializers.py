"""Сериализаторы регистрации, входа и профиля."""

from typing import Any

from django.contrib.auth import authenticate, password_validation
from rest_framework import serializers

from apps.accounts.models import User
from apps.core.validators import normalize_optional_phone


class UserSerializer(serializers.ModelSerializer[User]):
    """Публичное представление профиля текущего пользователя."""

    class Meta:
        """Поля профиля; email изменить нельзя."""

        model = User
        fields = ("id", "email", "first_name", "last_name", "phone", "company", "date_joined")
        read_only_fields = ("id", "email", "date_joined")

    def validate_phone(self, value: str) -> str:
        """Нормализует телефон.

        Args:
            value: Введённый телефон.

        Returns:
            Нормализованный телефон или пустая строка.
        """
        return normalize_optional_phone(value)


class RegisterSerializer(serializers.ModelSerializer[User]):
    """Регистрация нового покупателя."""

    password = serializers.CharField(write_only=True, min_length=8, style={"input_type": "password"})

    class Meta:
        """Поля, заполняемые при регистрации."""

        model = User
        fields = ("email", "password", "first_name", "last_name", "phone", "company")
        extra_kwargs = {"first_name": {"required": True}}

    def validate_phone(self, value: str) -> str:
        """Нормализует телефон.

        Args:
            value: Введённый телефон.

        Returns:
            Нормализованный телефон или пустая строка.
        """
        return normalize_optional_phone(value)

    def validate_email(self, value: str) -> str:
        """Нормализует email и проверяет его уникальность.

        Args:
            value: Введённый адрес.

        Returns:
            Адрес в нижнем регистре.

        Raises:
            serializers.ValidationError: Если пользователь с таким email уже есть.
        """
        normalized = value.strip().lower()
        if User.objects.filter(email__iexact=normalized).exists():
            raise serializers.ValidationError("Пользователь с таким email уже зарегистрирован.")
        return normalized

    def validate(self, attrs: dict[str, Any]) -> dict[str, Any]:
        """Проверяет пароль стандартными валидаторами Django.

        Args:
            attrs: Провалидированные поля.

        Returns:
            Те же поля без изменений.

        Raises:
            serializers.ValidationError: Если пароль слишком простой.
        """
        candidate = User(
            email=attrs.get("email", ""),
            first_name=attrs.get("first_name", ""),
            last_name=attrs.get("last_name", ""),
        )
        try:
            password_validation.validate_password(attrs["password"], candidate)
        except Exception as error:
            messages = getattr(error, "messages", [str(error)])
            raise serializers.ValidationError({"password": list(messages)}) from error
        return attrs

    def create(self, validated_data: dict[str, Any]) -> User:
        """Создаёт пользователя с захешированным паролем.

        Args:
            validated_data: Провалидированные поля.

        Returns:
            Новый пользователь.
        """
        password: str = validated_data.pop("password")
        email: str = validated_data.pop("email")
        return User.objects.create_user(email=email, password=password, **validated_data)


class LoginSerializer(serializers.Serializer[User]):
    """Проверка учётных данных при входе."""

    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, style={"input_type": "password"})

    def validate(self, attrs: dict[str, Any]) -> dict[str, Any]:
        """Аутентифицирует пользователя.

        Args:
            attrs: Email и пароль.

        Returns:
            Поля, дополненные ключом ``user``.

        Raises:
            serializers.ValidationError: Если учётные данные неверны.
        """
        user = authenticate(
            request=self.context.get("request"),
            email=attrs["email"].strip().lower(),
            password=attrs["password"],
        )
        if user is None:
            raise serializers.ValidationError("Неверный email или пароль.")
        attrs["user"] = user
        return attrs
