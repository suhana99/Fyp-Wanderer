# Generated by Django 5.1.4 on 2025-01-14 12:54

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('package', '0012_remove_package_hotels'),
    ]

    operations = [
        migrations.AddField(
            model_name='package',
            name='hotels',
            field=models.ManyToManyField(blank=True, related_name='packages', through='package.PackageHotel', to='package.hotel'),
        ),
    ]
