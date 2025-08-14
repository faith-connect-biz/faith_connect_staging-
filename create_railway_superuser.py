#!/usr/bin/env python
"""
Railway Superuser Creation Script

This script creates ONLY a superuser for Railway.
Run this script from the backend directory.

Usage:
    python create_railway_superuser.py
"""

import os
import sys
import django
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

# Set Django settings for Railway
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings.railway')

# Setup Django
django.setup()

from django.core.management import call_command

def main():
    print("🚀 Creating Superuser for Railway Database")
    print("=" * 50)
    
    try:
        # Create superuser only
        print("👤 Creating superuser...")
        call_command('create_superuser_local', 
                    username='admin', 
                    password='admin4123',
                    email='admin@femconnect.com')
        print("✅ Superuser created successfully!")
        
        print("\n🎉 Railway Superuser Creation Complete!")
        print("\n📋 Admin Access Details:")
        print("   Username: admin")
        print("   Password: admin4123")
        print("   Email: admin@femconnect.com")
        print("\n🔗 Access your admin panel at: /admin")
        
    except Exception as e:
        print(f"\n❌ Superuser creation failed with error: {e}")
        if "already exists" in str(e):
            print("\nℹ️  Superuser already exists!")
            print("   You can use the existing admin account:")
            print("   Username: admin")
            print("   Password: admin4123")
        else:
            print("\n🔍 Troubleshooting:")
            print("   1. Make sure you're in the backend directory")
            print("   2. Check that Django is properly configured")
            print("   3. Verify database connection")
            print("   4. Check environment variables")
        return 1
    
    return 0

if __name__ == "__main__":
    exit(main())
