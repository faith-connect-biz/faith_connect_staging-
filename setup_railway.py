#!/usr/bin/env python
"""
Railway Production Database Setup Script for FEM Family Business Directory

This script helps you set up your Railway production database by creating
a superuser and seeding comprehensive test data.

Usage:
    python setup_railway.py
"""

import os
import sys
import django
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

# Set Django settings for Railway production
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings.prod')

# Setup Django
django.setup()

from django.core.management import call_command
from django.core.management.base import CommandError

def main():
    print("🚀 FEM Family Business Directory - Railway Production Setup")
    print("=" * 70)
    
    try:
        # Step 1: Create superuser
        print("\n1️⃣ Creating superuser for Railway...")
        print("   Default credentials: admin / admin123")
        print("   You can change these later in the admin panel.")
        
        try:
            call_command('create_superuser_local', 
                        username='admin', 
                        password='admin123',
                        email='admin@femfamily.com')
            print("   ✅ Superuser created successfully!")
        except CommandError as e:
            if "already exists" in str(e):
                print("   ℹ️  Superuser already exists, skipping...")
            else:
                print(f"   ❌ Error creating superuser: {e}")
        
        # Step 2: Seed categories only (initial setup)
        print("\n2️⃣ Seeding business categories...")
        try:
            call_command('seed_railway_data', '--categories-only')
            print("   ✅ Categories seeded successfully!")
        except CommandError as e:
            print(f"   ❌ Error seeding categories: {e}")
            return
        
        # Step 3: Ask user if they want to seed full data
        print("\n3️⃣ Full data seeding...")
        print("   This will create:")
        print("   - 10 test users")
        print("   - 15 test businesses")
        print("   - 3 services per business")
        print("   - 2 products per business")
        print("   - 5 reviews per business")
        print("   - Business hours and favorites")
        
        response = input("\n   Do you want to seed full test data? (yes/no): ").lower().strip()
        
        if response in ['yes', 'y']:
            print("\n   🌱 Seeding full test data...")
            try:
                call_command('seed_railway_data', 
                            '--users', '10',
                            '--businesses', '15',
                            '--services-per-business', '3',
                            '--products-per-business', '2',
                            '--reviews-per-business', '5')
                print("   ✅ Full data seeded successfully!")
            except CommandError as e:
                print(f"   ❌ Error seeding full data: {e}")
        else:
            print("   ℹ️  Skipping full data seeding. You can run it later with:")
            print("   python manage.py seed_railway_data")
        
        # Step 4: Final instructions
        print("\n" + "=" * 70)
        print("🎉 Railway Production Setup Complete!")
        print("\n📋 Next Steps:")
        print("   1. Access your admin panel at: /admin")
        print("   2. Login with: admin / admin123")
        print("   3. Change the default password")
        print("   4. Customize categories and data as needed")
        print("\n🔧 Useful Commands:")
        print("   # Seed only categories:")
        print("   python manage.py seed_railway_data --categories-only")
        print("\n   # Seed full data:")
        print("   python manage.py seed_railway_data")
        print("\n   # Clear and reseed everything:")
        print("   python manage.py seed_railway_data --clear")
        print("\n   # Custom data amounts:")
        print("   python manage.py seed_railway_data --users 20 --businesses 30")
        
    except Exception as e:
        print(f"\n❌ Setup failed with error: {e}")
        print("\n🔍 Troubleshooting:")
        print("   1. Make sure you're in the backend directory")
        print("   2. Check that Django is properly configured")
        print("   3. Verify database connection")
        print("   4. Check environment variables")
        return 1
    
    return 0

if __name__ == "__main__":
    exit(main())
