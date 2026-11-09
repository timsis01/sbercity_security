"""Административный интерфейс каталога."""

from django.contrib import admin

from apps.catalog.models import Category, Product


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin[Category]):
    """Управление деревом категорий."""

    list_display = ("name", "parent", "slug", "position", "is_active")
    list_editable = ("position", "is_active")
    list_filter = ("is_active", "parent")
    search_fields = ("name", "slug")
    prepopulated_fields = {"slug": ("name",)}


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin[Product]):
    """Управление товарами, ценами и метками."""

    list_display = ("title", "category", "sku", "price", "is_bestseller", "in_stock", "is_published")
    list_editable = ("price", "is_bestseller", "in_stock", "is_published")
    list_filter = ("category", "brand", "is_bestseller", "is_new", "in_stock", "is_published")
    search_fields = ("title", "sku", "brand")
    list_select_related = ("category",)
    readonly_fields = ("created_at", "updated_at")
    fieldsets = (
        (None, {"fields": ("category", "title", "slug", "sku", "brand", "manufacturer", "image", "visual")}),
        ("Цена и наличие", {"fields": ("price", "old_price", "in_stock", "is_published")}),
        ("Метки", {"fields": ("is_bestseller", "is_new", "popularity")}),
        ("Описание", {"fields": ("description", "requirements", "specs")}),
        ("Служебное", {"fields": ("created_at", "updated_at")}),
    )
