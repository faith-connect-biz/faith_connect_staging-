# Generated manually for adding slug fields to Product and Service models

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('business', '0016_alter_businesslike_user'),
    ]

    operations = [
        migrations.AddField(
            model_name='product',
            name='slug',
            field=models.SlugField(blank=True, unique=True),
        ),
        migrations.AddField(
            model_name='service',
            name='slug',
            field=models.SlugField(blank=True, unique=True),
        ),
    ]








