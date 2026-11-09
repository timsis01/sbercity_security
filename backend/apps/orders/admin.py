"""Административный интерфейс заказов и промокодов."""

from django.contrib import admin

from apps.orders.models import Order, OrderItem, PromoCode


class OrderItemInline(admin.TabularInline[OrderItem, Order]):
    """Позиции заказа внутри карточки заказа."""

    model = OrderItem
    extra = 0
    readonly_fields = ("product", "title", "sku", "price", "quantity", "line_total")
    can_delete = False


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin[Order]):
    """Обработка заказов менеджерами."""

    list_display = ("number", "created_at", "customer_name", "phone", "total", "delivery_method", "status")
    list_editable = ("status",)
    list_filter = ("status", "delivery_method", "payment_method", "created_at")
    search_fields = ("number", "customer_name", "phone", "email", "company", "inn")
    date_hierarchy = "created_at"
    inlines = (OrderItemInline,)
    readonly_fields = (
        "number",
        "user",
        "subtotal",
        "discount",
        "delivery_cost",
        "total",
        "promo_code",
        "created_at",
        "updated_at",
    )
    fieldsets = (
        (None, {"fields": ("number", "status", "user", "created_at", "updated_at")}),
        ("Покупатель", {"fields": ("customer_name", "phone", "email", "company", "inn")}),
        ("Получение и оплата", {"fields": ("delivery_method", "address", "payment_method", "comment")}),
        ("Суммы", {"fields": ("promo_code", "subtotal", "discount", "delivery_cost", "total")}),
    )


@admin.register(PromoCode)
class PromoCodeAdmin(admin.ModelAdmin[PromoCode]):
    """Управление промокодами."""

    list_display = ("code", "discount_percent", "is_active", "valid_until", "used_count", "max_uses")
    list_editable = ("is_active",)
    search_fields = ("code",)
