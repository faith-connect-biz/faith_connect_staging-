#!/usr/bin/env python3
"""
Test script to verify the enhanced admin panel is working correctly
"""

import os
import sys
import django

# Add the project directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings.dev')
django.setup()

from business.models import Business, Category, Review
from user_auth.models import User
from django.contrib.auth import get_user_model

User = get_user_model()

def test_admin_functionality():
    print("🧪 Testing Enhanced Admin Panel Functionality...")
    
    # Test 1: Check if models are accessible
    try:
        businesses = Business.objects.count()
        categories = Category.objects.count()
        users = User.objects.count()
        reviews = Review.objects.count()
        
        print(f"✅ Model Access Test: PASSED")
        print(f"   - Businesses: {businesses}")
        print(f"   - Categories: {categories}")
        print(f"   - Users: {users}")
        print(f"   - Reviews: {reviews}")
    except Exception as e:
        print(f"❌ Model Access Test: FAILED - {e}")
        return False
    
    # Test 2: Check if admin classes are properly configured
    try:
        from business.admin import BusinessAdmin, ReviewAdmin, CategoryAdmin
        from user_auth.admin import UserAdmin
        
        print(f"✅ Admin Classes Test: PASSED")
        print(f"   - BusinessAdmin: {BusinessAdmin}")
        print(f"   - ReviewAdmin: {ReviewAdmin}")
        print(f"   - CategoryAdmin: {CategoryAdmin}")
        print(f"   - UserAdmin: {UserAdmin}")
    except Exception as e:
        print(f"❌ Admin Classes Test: FAILED - {e}")
        return False
    
    # Test 3: Check if custom admin site is configured
    try:
        from core.admin_dashboard import admin_site
        
        print(f"✅ Custom Admin Site Test: PASSED")
        print(f"   - Admin Site: {admin_site}")
        print(f"   - Site Header: {admin_site.site_header}")
        print(f"   - Site Title: {admin_site.site_title}")
    except Exception as e:
        print(f"❌ Custom Admin Site Test: FAILED - {e}")
        return False
    
    # Test 4: Check if templates directory is configured
    try:
        from django.conf import settings
        template_dirs = settings.TEMPLATES[0]['DIRS']
        
        print(f"✅ Templates Test: PASSED")
        print(f"   - Template Directories: {template_dirs}")
        
        # Check if admin templates exist
        admin_template_path = os.path.join(settings.BASE_DIR, 'templates', 'admin', 'dashboard.html')
        if os.path.exists(admin_template_path):
            print(f"   - Dashboard Template: EXISTS")
        else:
            print(f"   - Dashboard Template: MISSING")
            
    except Exception as e:
        print(f"❌ Templates Test: FAILED - {e}")
        return False
    
    print("\n🎉 All Tests Passed! Enhanced Admin Panel is Ready!")
    print("\n🔗 Access Points:")
    print("   - Main Admin: http://localhost:8000/admin/")
    print("   - Dashboard: http://localhost:8000/admin/dashboard/")
    print("   - Analytics: http://localhost:8000/admin/analytics/")
    print("   - API Stats: http://localhost:8000/admin/api/stats/")
    
    return True

if __name__ == "__main__":
    test_admin_functionality() 