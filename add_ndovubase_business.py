#!/usr/bin/env python3
"""
Script to add Ndovubase Solutions business to the FEM Family Business Directory
NOTE: This business has already been added to the database.
To add another business, create a new script with different data.
"""

import os
import sys
import django

# Add the project directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings.dev')
django.setup()

from business.models import Category, Business, Service
from user_auth.models import User

def check_ndovubase():
    print("=" * 60)
    print("Checking Ndovubase Solutions in Database")
    print("=" * 60)
    
    business = Business.objects.filter(business_name__icontains='Ndovubase').first()
    
    if business:
        print(f"\n✅ Ndovubase Solutions found:")
        print(f"   ID: {business.id}")
        print(f"   Name: {business.business_name}")
        print(f"   Email: {business.email}")
        print(f"   Is Active: {business.is_active}")
        print(f"   Is Verified: {business.is_verified}")
        print(f"   Is Featured: {business.is_featured}")
        
        services = Service.objects.filter(business=business)
        print(f"\n🛠️  Services: {services.count()}")
        for s in services:
            print(f"   - {s.name}: {s.description}")
    else:
        print("\n❌ Ndovubase Solutions not found in database")

if __name__ == "__main__":
    check_ndovubase()





