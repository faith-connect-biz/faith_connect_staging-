# Generated migration to add subcategories support

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('business', '0004_update_currency_kes_to_ksh'),
    ]

    operations = [
        migrations.AddField(
            model_name='category',
            name='subcategories',
            field=models.JSONField(blank=True, default=list, help_text='List of subcategories for this main category'),
        ),
        migrations.AddField(
            model_name='category',
            name='icon',
            field=models.CharField(blank=True, help_text='Emoji icon for the category', max_length=10, null=True),
        ),
        migrations.AddField(
            model_name='category',
            name='is_active',
            field=models.BooleanField(default=True),
        ),
        migrations.AddField(
            model_name='category',
            name='sort_order',
            field=models.IntegerField(default=0, help_text='Order for displaying categories'),
        ),
        migrations.AddField(
            model_name='business',
            name='subcategory',
            field=models.CharField(blank=True, help_text='Specific subcategory within the main category', max_length=100, null=True),
        ),
        migrations.AlterModelOptions(
            name='category',
            options={'ordering': ['sort_order', 'name'], 'verbose_name_plural': 'Categories'},
        ),
    ]