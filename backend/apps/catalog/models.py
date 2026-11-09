"""Модели каталога: дерево категорий и товары."""

from decimal import Decimal

from django.core.validators import MinValueValidator
from django.db import models


class ProductVisual(models.TextChoices):
    """Модель иллюстрации товара, по которой витрина рисует его изображение."""

    DOME_CAMERA = "dome-camera", "Купольная камера"
    BULLET_CAMERA = "bullet-camera", "Цилиндрическая камера"
    SERVER = "server", "Сервер"
    MONITOR_GRID = "monitor-grid", "Монитор с раскладкой камер"
    MONITOR_SETTINGS = "monitor-settings", "Монитор с настройками"
    MONITOR_FILMSTRIP = "monitor-filmstrip", "Монитор с лентой скриншотов"
    MONITOR_MAP = "monitor-map", "Монитор с планом этажа"
    MONITOR_DASHBOARD = "monitor-dashboard", "Монитор с отчётами"
    MONITOR_POS = "monitor-pos", "Монитор с кассовыми титрами"
    MONITOR_FACES = "monitor-faces", "Монитор с базой лиц"
    KIOSK_LAMP = "kiosk-lamp", "Касса самообслуживания с маяком"
    POS_REGISTER = "pos-register", "Кассовый терминал"
    HAND_WASH = "hand-wash", "Раковина под камерой"
    FACE_TERMINAL = "face-terminal", "Терминал распознавания лиц"
    FACE_REPEAT = "face-repeat", "Повторный визит"
    FACE_CLOCK = "face-clock", "Учёт рабочего времени"
    FACE_SEARCH = "face-search", "Поиск лица в архиве"
    FACE_DATABASE = "face-database", "База лиц"
    E_ACTS = "e-acts", "Планшет с электронным актом"
    SMART_LOCK = "smart-lock", "Умный замок"
    CAMERA_MAST = "camera-mast", "Стойка с камерой"
    MOBILE_TOWER = "mobile-tower", "Мобильная вышка видеоаналитики"
    RELAY_4 = "relay-4", "Блок реле на 4 канала"
    RELAY_8 = "relay-8", "Блок реле на 8 каналов"
    RELAY_16 = "relay-16", "Блок реле на 16 каналов"
    USB_KEY = "usb-key", "USB-ключ"
    BOARD_GAME = "board-game", "Настольная игра"
    CERTIFICATE = "certificate", "Сертификат"
    SERVICE_KIT = "service-kit", "Выезд инженера"
    FIRE_CABLE = "fire-cable", "Пожаротушение кабельной линии"
    FIRE_SOCKET = "fire-socket", "Пожаротушение розетки"
    FIRE_PANEL = "fire-panel", "Пожаротушение электрощита"
    AEROSOL_GENERATOR = "aerosol-generator", "Генератор аэрозоля"
    HAND_EXTINGUISHER = "hand-extinguisher", "Ручной огнетушитель"


class Category(models.Model):
    """Раздел каталога; поддерживает вложенность через ``parent``."""

    parent = models.ForeignKey(
        "self",
        verbose_name="Родительская категория",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="children",
    )
    name = models.CharField("Название", max_length=150)
    slug = models.SlugField("Слаг", max_length=150, unique=True)
    description = models.TextField("Описание", blank=True)
    position = models.PositiveIntegerField("Порядок", default=0)
    is_active = models.BooleanField("Показывать", default=True)

    class Meta:
        """Сортировка по порядку и названию."""

        verbose_name = "Категория"
        verbose_name_plural = "Категории"
        ordering = ("position", "name")

    def __str__(self) -> str:
        """Возвращает полный путь категории через «/»."""
        if self.parent_id is not None and self.parent is not None:
            return f"{self.parent} / {self.name}"
        return self.name

    def descendant_ids(self) -> list[int]:
        """Собирает идентификаторы категории и всех её потомков.

        Returns:
            Список идентификаторов, начиная с текущей категории.
        """
        result: list[int] = [self.pk]
        frontier: list[int] = [self.pk]
        while frontier:
            children = list(
                Category.objects.filter(parent_id__in=frontier, is_active=True).values_list("id", flat=True)
            )
            result.extend(children)
            frontier = children
        return result


class ProductQuerySet(models.QuerySet["Product"]):
    """Наборы товаров для витрины."""

    def published(self) -> "ProductQuerySet":
        """Возвращает только опубликованные товары активных категорий."""
        return self.filter(is_published=True, category__is_active=True)


class Product(models.Model):
    """Товар или услуга магазина."""

    category = models.ForeignKey(
        Category,
        verbose_name="Категория",
        on_delete=models.PROTECT,
        related_name="products",
    )
    title = models.CharField("Название", max_length=300)
    slug = models.SlugField("Слаг", max_length=200, unique=True)
    sku = models.CharField("Артикул", max_length=100, blank=True)
    brand = models.CharField("Бренд", max_length=100, blank=True)
    manufacturer = models.CharField("Производитель", max_length=150, blank=True)
    description = models.TextField("Описание", blank=True)
    requirements = models.TextField("Обязательные компоненты", blank=True)
    specs = models.JSONField("Характеристики", default=list, blank=True)
    price = models.DecimalField(
        "Цена, ₽",
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(Decimal("0"))],
        help_text="Пустое значение означает «Цена по запросу».",
    )
    old_price = models.DecimalField(
        "Старая цена, ₽",
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(Decimal("0"))],
    )
    image = models.ImageField("Изображение", upload_to="products/", blank=True)
    visual = models.CharField(
        "Модель иллюстрации",
        max_length=40,
        choices=ProductVisual.choices,
        blank=True,
        help_text="Используется, если фото не загружено.",
    )
    is_bestseller = models.BooleanField("Лидер продаж", default=False)
    is_new = models.BooleanField("Новинка", default=False)
    in_stock = models.BooleanField("В наличии", default=True)
    is_published = models.BooleanField("Опубликован", default=True)
    popularity = models.PositiveIntegerField("Популярность", default=0)
    created_at = models.DateTimeField("Создан", auto_now_add=True)
    updated_at = models.DateTimeField("Изменён", auto_now=True)

    objects = ProductQuerySet.as_manager()

    class Meta:
        """Сортировка по популярности."""

        verbose_name = "Товар"
        verbose_name_plural = "Товары"
        ordering = ("-popularity", "title")

    def __str__(self) -> str:
        """Возвращает название товара."""
        return self.title

    @property
    def is_price_on_request(self) -> bool:
        """Признак того, что цена не указана и сообщается менеджером."""
        return self.price is None

    @property
    def is_purchasable(self) -> bool:
        """Можно ли добавить товар в заказ."""
        return self.is_published and self.price is not None
