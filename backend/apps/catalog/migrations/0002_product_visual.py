"""Миграция: модель иллюстрации товара и её заполнение для уже загруженного каталога."""

import json
from pathlib import Path

from django.apps.registry import Apps
from django.db import migrations, models
from django.db.backends.base.schema import BaseDatabaseSchemaEditor

CATALOG_JSON = Path(__file__).resolve().parent.parent / "data" / "catalog.json"


def fill_visuals(apps: Apps, schema_editor: BaseDatabaseSchemaEditor) -> None:
    """Проставляет модели иллюстраций товарам демо-каталога, у которых поле ещё пустое.

    Args:
        apps: Реестр исторических моделей.
        schema_editor: Редактор схемы текущей базы.
    """
    product_model = apps.get_model("catalog", "Product")
    items = json.loads(CATALOG_JSON.read_text(encoding="utf-8"))["products"]
    for item in items:
        if item.get("visual"):
            product_model.objects.filter(slug=item["slug"], visual="").update(visual=item["visual"])


class Migration(migrations.Migration):
    """Добавляет поле ``visual`` и заполняет его для демо-каталога."""

    dependencies = [
        ('catalog', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='product',
            name='visual',
            field=models.CharField(blank=True, choices=[('dome-camera', 'Купольная камера'), ('bullet-camera', 'Цилиндрическая камера'), ('server', 'Сервер'), ('monitor-grid', 'Монитор с раскладкой камер'), ('monitor-settings', 'Монитор с настройками'), ('monitor-filmstrip', 'Монитор с лентой скриншотов'), ('monitor-map', 'Монитор с планом этажа'), ('monitor-dashboard', 'Монитор с отчётами'), ('monitor-pos', 'Монитор с кассовыми титрами'), ('monitor-faces', 'Монитор с базой лиц'), ('kiosk-lamp', 'Касса самообслуживания с маяком'), ('pos-register', 'Кассовый терминал'), ('hand-wash', 'Раковина под камерой'), ('face-terminal', 'Терминал распознавания лиц'), ('face-repeat', 'Повторный визит'), ('face-clock', 'Учёт рабочего времени'), ('face-search', 'Поиск лица в архиве'), ('face-database', 'База лиц'), ('e-acts', 'Планшет с электронным актом'), ('smart-lock', 'Умный замок'), ('camera-mast', 'Стойка с камерой'), ('mobile-tower', 'Мобильная вышка видеоаналитики'), ('relay-4', 'Блок реле на 4 канала'), ('relay-8', 'Блок реле на 8 каналов'), ('relay-16', 'Блок реле на 16 каналов'), ('usb-key', 'USB-ключ'), ('board-game', 'Настольная игра'), ('certificate', 'Сертификат'), ('service-kit', 'Выезд инженера'), ('fire-cable', 'Пожаротушение кабельной линии'), ('fire-socket', 'Пожаротушение розетки'), ('fire-panel', 'Пожаротушение электрощита'), ('aerosol-generator', 'Генератор аэрозоля'), ('hand-extinguisher', 'Ручной огнетушитель')], help_text='Используется, если фото не загружено.', max_length=40, verbose_name='Модель иллюстрации'),
        ),
        migrations.RunPython(fill_visuals, migrations.RunPython.noop),
    ]
