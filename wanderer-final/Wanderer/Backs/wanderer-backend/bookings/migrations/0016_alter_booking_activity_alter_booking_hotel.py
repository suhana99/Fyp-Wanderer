# Generated by Django 5.1.2 on 2025-01-24 19:10

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('bookings', '0015_booking_unique_booking'),
    ]

    operations = [
        migrations.AlterField(
            model_name='booking',
            name='activity',
            field=models.JSONField(default=list),
        ),
        migrations.AlterField(
            model_name='booking',
            name='hotel',
            field=models.JSONField(default=list),
        ),
    ]
