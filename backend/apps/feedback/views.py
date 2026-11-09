"""Эндпоинты форм обратной связи."""

from typing import Any

from django.db.models import Avg, Count, QuerySet
from drf_spectacular.utils import extend_schema
from rest_framework import generics, mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.throttling import BaseThrottle

from apps.core.throttling import FormsRateThrottle
from apps.feedback.models import CallbackRequest, ContactMessage, Review
from apps.feedback.serializers import (
    CallbackRequestSerializer,
    ContactMessageSerializer,
    ReviewSerializer,
    ReviewSummarySerializer,
    SubscriptionSerializer,
)


class ContactMessageCreateView(generics.CreateAPIView[ContactMessage]):
    """Приём сообщений со страницы «Контакты»."""

    serializer_class = ContactMessageSerializer
    throttle_classes = (FormsRateThrottle,)


class CallbackRequestCreateView(generics.CreateAPIView[CallbackRequest]):
    """Приём заявок на звонок, запрос цены и быстрый заказ."""

    serializer_class = CallbackRequestSerializer
    throttle_classes = (FormsRateThrottle,)


class ReviewViewSet(mixins.ListModelMixin, mixins.CreateModelMixin, viewsets.GenericViewSet[Review]):
    """Опубликованные отзывы, сводный рейтинг и отправка нового отзыва."""

    serializer_class = ReviewSerializer

    def get_queryset(self) -> QuerySet[Review]:
        """Возвращает только одобренные модератором отзывы."""
        return Review.objects.filter(is_approved=True)

    def get_throttles(self) -> list[BaseThrottle]:
        """Ограничивает частоту отправки отзывов."""
        if self.action == "create":
            return [FormsRateThrottle()]
        return []

    def create(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        """Сохраняет отзыв на модерацию.

        Args:
            request: Запрос с текстом отзыва.
            *args: Позиционные аргументы маршрута.
            **kwargs: Именованные аргументы маршрута.

        Returns:
            Сохранённый отзыв со статусом ``201``; публикуется после одобрения.
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(is_approved=False)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @extend_schema(responses=ReviewSummarySerializer)
    @action(detail=False, methods=["get"])
    def summary(self, request: Request) -> Response:
        """Возвращает средний балл и количество одобренных отзывов.

        Args:
            request: Входящий запрос.

        Returns:
            Средняя оценка с точностью до десятых и число отзывов.
        """
        stats = self.get_queryset().aggregate(average=Avg("rating"), count=Count("id"))
        average = stats["average"]
        payload = {"average": round(float(average), 1) if average is not None else None, "count": stats["count"]}
        return Response(ReviewSummarySerializer(payload).data)


class SubscriptionCreateView(generics.GenericAPIView[Any]):
    """Подписка на новости и скидки."""

    serializer_class = SubscriptionSerializer
    throttle_classes = (FormsRateThrottle,)

    @extend_schema(request=SubscriptionSerializer, responses={201: SubscriptionSerializer})
    def post(self, request: Request) -> Response:
        """Оформляет подписку; повторная подписка не считается ошибкой.

        Args:
            request: Запрос с email.

        Returns:
            Email подписчика со статусом ``201``.
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        subscription = serializer.save()
        return Response({"email": subscription.email}, status=status.HTTP_201_CREATED)
