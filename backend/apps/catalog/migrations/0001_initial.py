"""Миграция 0001_initial приложения catalog."""

import django.core.validators
import django.db.models.deletion
from decimal import Decimal
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Category',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=150, verbose_name='Название')),
                ('slug', models.SlugField(max_length=150, unique=True, verbose_name='Слаг')),
                ('description', models.TextField(blank=True, verbose_name='Описание')),
                ('position', models.PositiveIntegerField(default=0, verbose_name='Порядок')),
                ('is_active', models.BooleanField(default=True, verbose_name='Показывать')),
                ('parent', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='children', to='catalog.category', verbose_name='Родительская категория')),
            ],
            options={
                'verbose_name': 'Категория',
                'verbose_name_plural': 'Категории',
                'ordering': ('position', 'name'),
            },
        ),
        migrations.CreateModel(
            name='Product',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=300, verbose_name='Название')),
                ('slug', models.SlugField(max_length=200, unique=True, verbose_name='Слаг')),
                ('sku', models.CharField(blank=True, max_length=100, verbose_name='Артикул')),
                ('brand', models.CharField(blank=True, max_length=100, verbose_name='Бренд')),
                ('manufacturer', models.CharField(blank=True, max_length=150, verbose_name='Производитель')),
                ('description', models.TextField(blank=True, verbose_name='Описание')),
                ('requirements', models.TextField(blank=True, verbose_name='Обязательные компоненты')),
                ('specs', models.JSONField(blank=True, default=list, verbose_name='Характеристики')),
                ('price', models.DecimalField(blank=True, decimal_places=2, help_text='Пустое значение означает «Цена по запросу».', max_digits=12, null=True, validators=[django.core.validators.MinValueValidator(Decimal('0'))], verbose_name='Цена, ₽')),
                ('old_price', models.DecimalField(blank=True, decimal_places=2, max_digits=12, null=True, validators=[django.core.validators.MinValueValidator(Decimal('0'))], verbose_name='Старая цена, ₽')),
                ('image', models.ImageField(blank=True, upload_to='products/', verbose_name='Изображение')),
                ('is_bestseller', models.BooleanField(default=False, verbose_name='Лидер продаж')),
                ('is_new', models.BooleanField(default=False, verbose_name='Новинка')),
                ('in_stock', models.BooleanField(default=True, verbose_name='В наличии')),
                ('is_published', models.BooleanField(default=True, verbose_name='Опубликован')),
                ('popularity', models.PositiveIntegerField(default=0, verbose_name='Популярность')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Создан')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Изменён')),
                ('category', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='products', to='catalog.category', verbose_name='Категория')),
            ],
            options={
                'verbose_name': 'Товар',
                'verbose_name_plural': 'Товары',
                'ordering': ('-popularity', 'title'),
            },
        ),
    ]
