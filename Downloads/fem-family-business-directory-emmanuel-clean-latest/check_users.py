#!/usr/bin/env python
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings.railway')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()
users = User.objects.all()

print("Users in database:")
for user in users:
    print(f"Username: {user.username}")
    print(f"Partnership Number: {user.partnership_number}")
    print(f"Is Staff: {user.is_staff}")
    print(f"Is Superuser: {user.is_superuser}")
    print(f"Email: {user.email}")
    print("---")
