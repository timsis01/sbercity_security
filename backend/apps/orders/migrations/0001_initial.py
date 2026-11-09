"""Миграция 0001_initial приложения orders."""

import django.core.validators
import django.db.models.deletion
from decimal import Decimal
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('catalog', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='PromoCode',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('code', models.CharField(max_length=40, unique=True, verbose_name='Код')),
                ('discount_percent', models.PositiveSmallIntegerField(validators=[django.core.validators.MinValueValidator(1), django.core.validators.MaxValueValidator(90)], verbose_name='Скидка, %')),
                ('is_active', models.BooleanField(default=True, verbose_name='Активен')),
                ('valid_until', models.DateTimeField(blank=True, null=True, verbose_name='Действует до')),
                ('max_uses', models.PositiveIntegerField(blank=True, null=True, verbose_name='Лимит использований')),
                ('used_count', models.PositiveIntegerField(default=0, verbose_name='Использован раз')),
            ],
            options={
                'verbose_name': 'Промокод',
                'verbose_name_plural': 'Промокоды',
                'ordering': ('code',),
            },
        ),
        migrations.CreateModel(
            name='Order',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('number', models.CharField(editable=False, max_length=32, unique=True, verbose_name='Номер')),
                ('status', models.CharField(choices=[('new', 'Новый'), ('confirmed', 'Подтверждён'), ('shipped', 'Передан в доставку'), ('completed', 'Выполнен'), ('cancelled', 'Отменён')], default='new', max_length=16, verbose_name='Статус')),
                ('customer_name', models.CharField(max_length=200, verbose_name='ФИО получателя')),
                ('phone', models.CharField(max_length=32, verbose_name='Телефон')),
                ('email', models.EmailField(max_length=254, verbose_name='Email')),
                ('company', models.CharField(blank=True, max_length=255, verbose_name='Организация')),
                ('inn', models.CharField(blank=True, max_length=12, verbose_name='ИНН')),
                ('delivery_method', models.CharField(choices=[('pickup', 'Самовывоз'), ('courier', 'Курьером')], max_length=16, verbose_name='Доставка')),
                ('address', models.CharField(blank=True, max_length=500, verbose_name='Адрес доставки')),
                ('payment_method', models.CharField(choices=[('cash', 'Наличными при получении'), ('card', 'Картой при получении'), ('invoice', 'Безналичный расчёт по счёту')], max_length=16, verbose_name='Оплата')),
                ('comment', models.TextField(blank=True, verbose_name='Комментарий')),
                ('subtotal', models.DecimalField(decimal_places=2, default=Decimal('0'), max_digits=12, verbose_name='Сумма товаров')),
                ('discount', models.DecimalField(decimal_places=2, default=Decimal('0'), max_digits=12, verbose_name='Скидка')),
                ('delivery_cost', models.DecimalField(decimal_places=2, default=Decimal('0'), max_digits=12, verbose_name='Доставка')),
                ('total', models.DecimalField(decimal_places=2, default=Decimal('0'), max_digits=12, verbose_name='Итого')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Создан')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Изменён')),
                ('user', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='orders', to=settings.AUTH_USER_MODEL, verbose_name='Пользователь')),
                ('promo_code', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='orders', to='orders.promocode', verbose_name='Промокод')),
            ],
            options={
                'verbose_name': 'Заказ',
                'verbose_name_plural': 'Заказы',
                'ordering': ('-created_at',),
            },
        ),
        migrations.CreateModel(
            name='OrderItem',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=300, verbose_name='Название')),
                ('sku', models.CharField(blank=True, max_length=100, verbose_name='Артикул')),
                ('price', models.DecimalField(decimal_places=2, max_digits=12, verbose_name='Цена')),
                ('quantity', models.PositiveIntegerField(validators=[django.core.validators.MinValueValidator(1)], verbose_name='Количество')),
                ('line_total', models.DecimalField(decimal_places=2, max_digits=12, verbose_name='Сумма')),
                ('order', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='items', to='orders.order', verbose_name='Заказ')),
                ('product', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='order_items', to='catalog.product', verbose_name='Товар')),
            ],
            options={
                'verbose_name': 'Позиция заказа',
                'verbose_name_plural': 'Позиции заказа',
                'ordering': ('id',),
            },
        ),
    ]
