#!/usr/bin/env python
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings.railway')
django.setup()

from user_auth.models import User

try:
    # Create superuser manually
    superuser = User.objects.create_superuser(
        partnership_number='ADMIN123',
        first_name='Admin',
        last_name='User',
        user_type='community',
        email='admin@example.com'
    )
    
    # Set password
    superuser.set_password('admin123456')
    superuser.save()
    
    print("✅ Superuser created successfully!")
    print(f"Partnership Number: {superuser.partnership_number}")
    print(f"Password: admin123456")
    print(f"Is Staff: {superuser.is_staff}")
    print(f"Is Superuser: {superuser.is_superuser}")
    
except Exception as e:
    print(f"❌ Error creating superuser: {e}")
    
    # Check if user already exists
    try:
        existing_user = User.objects.get(partnership_number='ADMIN123')
        print(f"User already exists: {existing_user.partnership_number}")
        print(f"Is Staff: {existing_user.is_staff}")
        print(f"Is Superuser: {existing_user.is_superuser}")
    except User.DoesNotExist:
        print("No existing user found")
