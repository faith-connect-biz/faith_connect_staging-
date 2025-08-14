#!/usr/bin/env python
"""
Local Development Setup Script for FEM Family Business Directory

This script helps you quickly set up your local development environment
by creating a superuser and seeding sample data.

Usage:
    python setup_local_dev.py
"""

import os
import sys
import django
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

# Set Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings.dev')

# Setup Django
django.setup()

from django.core.management import call_command
from django.core.management.base import CommandError

def main():
    print("🚀 FEM Family Business Directory - Local Development Setup")
    print("=" * 70)
    
    try:
        # Step 1: Create superuser
        print("\n1️⃣  Creating superuser...")
        call_command('create_superuser_local', 
                    username='admin',
                    password='admin123',
                    email='admin@femfamily.com',
                    first_name='Admin',
                    last_name='User',
                    force=True)
        
        print("✅ Superuser created successfully!")
        
        # Step 2: Seed categories only first
        print("\n2️⃣  Seeding business categories...")
        call_command('seed_local_data', categories_only=True)
        
        print("✅ Categories seeded successfully!")
        
        # Step 3: Ask user if they want to seed more data
        print("\n3️⃣  Data seeding options:")
        print("   - Quick setup: Categories only (already done)")
        print("   - Full setup: Categories + Sample users, businesses, services, etc.")
        
        while True:
            choice = input("\nDo you want to seed full sample data? (y/n): ").lower().strip()
            if choice in ['y', 'yes']:
                print("\n🌱 Seeding full sample data...")
                call_command('seed_local_data', 
                           users=5,      # Start with fewer users for quick setup
                           businesses=10) # Start with fewer businesses for quick setup
                print("✅ Full sample data seeded successfully!")
                break
            elif choice in ['n', 'no']:
                print("✅ Setup completed with categories only!")
                break
            else:
                print("Please enter 'y' or 'n'")
        
        # Step 4: Show next steps
        print("\n🎉 Local development setup completed!")
        print("\n📋 Next steps:")
        print("   1. Start your Django server: python manage.py runserver")
        print("   2. Access Django admin: http://localhost:8000/admin/")
        print("   3. Login with: admin / admin123")
        print("   4. Access your API: http://localhost:8000/api/")
        
        print("\n🔧 Additional commands:")
        print("   - Create superuser: python manage.py create_superuser_local")
        print("   - Seed categories only: python manage.py seed_local_data --categories-only")
        print("   - Seed full data: python manage.py seed_local_data")
        print("   - Clear and reseed: python manage.py seed_local_data --clear")
        
    except CommandError as e:
        print(f"❌ Error during setup: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()
