"""Эндпоинты регистрации, входа, выхода и профиля."""

from typing import cast

from django.contrib.auth import login, logout
from drf_spectacular.utils import extend_schema
from rest_framework import generics, permissions, status
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.models import User
from apps.accounts.serializers import LoginSerializer, RegisterSerializer, UserSerializer
from apps.core.throttling import FormsRateThrottle


class RegisterView(generics.CreateAPIView[User]):
    """Регистрирует покупателя и сразу открывает для него сессию."""

    serializer_class = RegisterSerializer
    permission_classes = (permissions.AllowAny,)
    throttle_classes = (FormsRateThrottle,)

    @extend_schema(responses={201: UserSerializer})
    def create(self, request: Request, *args: object, **kwargs: object) -> Response:
        """Создаёт пользователя и выполняет вход.

        Args:
            request: Запрос с регистрационными данными.
            *args: Позиционные аргументы маршрута.
            **kwargs: Именованные аргументы маршрута.

        Returns:
            Профиль созданного пользователя со статусом ``201``.
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        login(request._request, user, backend="django.contrib.auth.backends.ModelBackend")
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    """Вход по email и паролю с созданием сессии."""

    permission_classes = (permissions.AllowAny,)
    throttle_classes = (FormsRateThrottle,)

    @extend_schema(request=LoginSerializer, responses={200: UserSerializer})
    def post(self, request: Request) -> Response:
        """Проверяет учётные данные и открывает сессию.

        Args:
            request: Запрос с email и паролем.

        Returns:
            Профиль пользователя.
        """
        serializer = LoginSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        user = cast(User, serializer.validated_data["user"])
        login(request._request, user)
        return Response(UserSerializer(user).data)


class LogoutView(APIView):
    """Завершение текущей сессии."""

    permission_classes = (permissions.AllowAny,)

    @extend_schema(request=None, responses={204: None})
    def post(self, request: Request) -> Response:
        """Выполняет выход пользователя.

        Args:
            request: Входящий запрос.

        Returns:
            Пустой ответ со статусом ``204``.
        """
        logout(request._request)
        return Response(status=status.HTTP_204_NO_CONTENT)


class MeView(generics.RetrieveUpdateAPIView[User]):
    """Просмотр и редактирование профиля текущего пользователя."""

    serializer_class = UserSerializer
    permission_classes = (permissions.IsAuthenticated,)
    http_method_names = ["get", "patch", "head", "options"]

    def get_object(self) -> User:
        """Возвращает текущего аутентифицированного пользователя."""
        return cast(User, self.request.user)
