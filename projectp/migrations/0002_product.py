import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('projectp', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Product',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=120)),
                ('description', models.TextField()),
                ('image', models.FileField(upload_to='products/')),
                ('hero', models.CharField(blank=True, max_length=80)),
                ('rarity', models.CharField(choices=[('Common', 'Common'), ('Uncommon', 'Uncommon'), ('Rare', 'Rare'), ('Mythical', 'Mythical'), ('Legendary', 'Legendary'), ('Immortal', 'Immortal'), ('Arcana', 'Arcana'), ('Ancient', 'Ancient')], max_length=20)),
                ('item_type', models.CharField(choices=[('одежда', 'одежда'), ('курьеры', 'курьеры'), ('варды', 'варды'), ('ключи', 'ключи'), ('руны', 'руны'), ('интерфейс', 'интерфейс'), ('комментаторы', 'комментаторы'), ('другое', 'другое')], max_length=30)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('seller', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='products', to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
