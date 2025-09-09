# Data migration to update currency from KES to KSH

from django.db import migrations


def update_currency_kes_to_ksh(apps, schema_editor):
    """
    Update existing Product records that have price_currency='KES' to 'KSH'
    """
    Product = apps.get_model('business', 'Product')
    
    # Update all products with KES currency to KSH
    updated_count = Product.objects.filter(price_currency='KES').update(price_currency='KSH')
    
    if updated_count > 0:
        print(f"Updated {updated_count} product records from KES to KSH")


def reverse_update_currency_ksh_to_kes(apps, schema_editor):
    """
    Reverse migration: Update KSH back to KES
    """
    Product = apps.get_model('business', 'Product')
    
    # Update all products with KSH currency back to KES
    updated_count = Product.objects.filter(price_currency='KSH').update(price_currency='KES')
    
    if updated_count > 0:
        print(f"Reverted {updated_count} product records from KSH to KES")


class Migration(migrations.Migration):

    dependencies = [
        ('business', '0003_product'),
    ]

    operations = [
        migrations.RunPython(
            update_currency_kes_to_ksh,
            reverse_update_currency_ksh_to_kes,
        ),
    ]