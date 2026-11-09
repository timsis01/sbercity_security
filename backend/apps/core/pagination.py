"""Пагинация списков API."""

from rest_framework.pagination import PageNumberPagination


class StandardPagination(PageNumberPagination):
    """Постраничная выдача с настраиваемым размером страницы.

    Клиент может передать ``page_size`` (не более ``max_page_size``),
    что используется кнопкой «Показать ещё» на витрине.
    """

    page_size = 12
    page_size_query_param = "page_size"
    max_page_size = 100
