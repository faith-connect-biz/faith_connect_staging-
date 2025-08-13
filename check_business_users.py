#!/usr/bin/env python
import os
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from business.models import Business
from user_auth.models import User

def check_business_users():
    print("🔍 Checking business user associations...")
    print("=" * 50)
    
    # Check all businesses
    businesses = Business.objects.all().select_related('user')
    print(f"Total businesses: {businesses.count()}")
    
    for business in businesses:
        user_info = f"User ID: {business.user.id}, Name: {business.user.first_name} {business.user.last_name}" if business.user else "NO USER"
        print(f"Business: {business.business_name} | {user_info}")
    
    print("\n" + "=" * 50)
    
    # Check users with businesses
    users_with_businesses = User.objects.filter(user_type='business').prefetch_related('businesses')
    print(f"Business users: {users_with_businesses.count()}")
    
    for user in users_with_businesses:
        business_count = user.businesses.count()
        print(f"User: {user.first_name} {user.last_name} (ID: {user.id}) | Businesses: {business_count}")
    
    print("\n" + "=" * 50)
    
    # Check orphaned businesses
    orphaned = Business.objects.filter(user__isnull=True)
    if orphaned.exists():
        print(f"⚠️  Found {orphaned.count()} businesses without users:")
        for business in orphaned:
            print(f"  - {business.business_name} (ID: {business.id})")
    else:
        print("✅ All businesses have user associations")

if __name__ == "__main__":
    check_business_users()
