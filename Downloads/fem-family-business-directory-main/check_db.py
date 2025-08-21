#!/usr/bin/env python
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings.railway')
django.setup()

from django.db import connection

# Check database connection
try:
    with connection.cursor() as cursor:
        cursor.execute("SELECT COUNT(*) FROM user_auth_user")
        count = cursor.fetchone()[0]
        print(f"Users in user_auth_user table: {count}")
        
        if count > 0:
            cursor.execute("SELECT partnership_number, username, is_staff, is_superuser FROM user_auth_user")
            users = cursor.fetchall()
            for user in users:
                print(f"Partnership: {user[0]}, Username: {user[1]}, Staff: {user[2]}, Superuser: {user[3]}")
        
except Exception as e:
    print(f"Database error: {e}")
