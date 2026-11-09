"""Миграция 0001_initial приложения news."""

import django.utils.timezone
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Article',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=255, verbose_name='Заголовок')),
                ('slug', models.SlugField(max_length=200, unique=True, verbose_name='Слаг')),
                ('excerpt', models.TextField(max_length=500, verbose_name='Анонс')),
                ('body', models.TextField(verbose_name='Текст')),
                ('cover', models.ImageField(blank=True, upload_to='news/', verbose_name='Обложка')),
                ('published_at', models.DateTimeField(default=django.utils.timezone.now, verbose_name='Дата публикации')),
                ('is_published', models.BooleanField(default=True, verbose_name='Опубликована')),
            ],
            options={
                'verbose_name': 'Новость',
                'verbose_name_plural': 'Новости',
                'ordering': ('-published_at', '-id'),
            },
        ),
    ]
