# Generated by Django 5.2.1 on 2025-06-27 20:36

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('games', '0003_alter_games_timestamp'),
        ('users', '0003_alter_users_username'),
    ]

    operations = [
        migrations.AlterField(
            model_name='users',
            name='top_cps_game_id',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='games.games'),
        ),
    ]
