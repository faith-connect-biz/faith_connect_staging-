# Generated manually for BusinessLike and ReviewLike models

from django.db import migrations, models
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('business', '0006_add_description_to_category'),
    ]

    operations = [
        migrations.CreateModel(
            name='BusinessLike',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('business', models.ForeignKey(on_delete=models.deletion.CASCADE, related_name='likes', to='business.business')),
                ('user', models.ForeignKey(on_delete=models.deletion.CASCADE, related_name='business_likes', to='user_auth.user')),
            ],
            options={
                'ordering': ['-created_at'],
                'unique_together': {('user', 'business')},
            },
        ),
        migrations.CreateModel(
            name='ReviewLike',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('review', models.ForeignKey(on_delete=models.deletion.CASCADE, related_name='likes', to='business.review')),
                ('user', models.ForeignKey(on_delete=models.deletion.CASCADE, related_name='review_likes', to='user_auth.user')),
            ],
            options={
                'ordering': ['-created_at'],
                'unique_together': {('user', 'review')},
            },
        ),
    ]
