#!/usr/bin/env python
"""
Railway Categories Seeding Script

This script seeds the Railway database with business categories.
Run this script from the backend directory.

Usage:
    python seed_railway_categories.py
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
    print("🚀 Seeding Categories to Railway Database")
    print("=" * 50)
    
    try:
        # Create superuser first
        print("👤 Creating superuser...")
        try:
            call_command('create_superuser_local', 
                        username='admin', 
                        password='admin123',
                        email='admin@femfamily.com')
            print("✅ Superuser created successfully!")
        except Exception as e:
            if "already exists" in str(e):
                print("ℹ️  Superuser already exists, skipping...")
            else:
                print(f"⚠️  Superuser creation failed: {e}")
        
        # Seed categories
        print("\n📂 Seeding business categories...")
        call_command('seed_categories')
        print("✅ Categories seeded successfully!")
        
        print("\n🎉 Railway Categories Seeding Complete!")
        print("\n📋 Next Steps:")
        print("   1. Your categories are now available in the database")
        print("   2. The frontend should now display category descriptions")
        print("   3. You can add more categories through the admin panel")
        print("   4. Admin access: username: admin, password: admin123")
        
    except Exception as e:
        print(f"\n❌ Seeding failed with error: {e}")
        print("\n🔍 Troubleshooting:")
        print("   1. Make sure you're in the backend directory")
        print("   2. Check that Django is properly configured")
        print("   3. Verify database connection")
        print("   4. Check environment variables")
        return 1
    
    return 0

if __name__ == "__main__":
    exit(main())
