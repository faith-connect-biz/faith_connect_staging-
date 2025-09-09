# Generated migration for address and church affiliation updates

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('business', '0011_merge_20250908_1233'),
    ]

    operations = [
        # Create FEMChurch model
        migrations.CreateModel(
            name='FEMChurch',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(help_text='Name of the FEM Church or Branch', max_length=200, unique=True)),
                ('location', models.CharField(blank=True, help_text='Location of the church', max_length=200, null=True)),
                ('country', models.CharField(default='Kenya', help_text='Country where the church is located', max_length=100)),
                ('city', models.CharField(blank=True, help_text='City where the church is located', max_length=100, null=True)),
                ('pastor_name', models.CharField(blank=True, help_text='Name of the pastor', max_length=200, null=True)),
                ('contact_phone', models.CharField(blank=True, help_text='Church contact phone', max_length=20, null=True)),
                ('contact_email', models.EmailField(blank=True, help_text='Church contact email', max_length=254, null=True)),
                ('is_active', models.BooleanField(default=True, help_text='Whether this church is active')),
                ('sort_order', models.IntegerField(default=0, help_text='Order for displaying churches in dropdowns')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name': 'FEM Church',
                'verbose_name_plural': 'FEM Churches',
                'ordering': ['sort_order', 'name'],
            },
        ),
        # Add new address fields to Business model
        migrations.AddField(
            model_name='business',
            name='office_address',
            field=models.TextField(blank=True, help_text='Optional separate office or shop address', null=True),
        ),
        migrations.AddField(
            model_name='business',
            name='country',
            field=models.CharField(default='Kenya', help_text='Country', max_length=100),
        ),
        migrations.AddField(
            model_name='business',
            name='fem_church',
            field=models.ForeignKey(blank=True, help_text='FEM Church or Branch affiliation', null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='businesses', to='business.femchurch'),
        ),
        # Update address field help text
        migrations.AlterField(
            model_name='business',
            name='address',
            field=models.TextField(help_text='Street address or physical location'),
        ),
        # Remove old address fields
        migrations.RemoveField(
            model_name='business',
            name='county',
        ),
        migrations.RemoveField(
            model_name='business',
            name='state',
        ),
        migrations.RemoveField(
            model_name='business',
            name='zip_code',
        ),
    ]