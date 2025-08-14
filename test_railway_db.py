#!/usr/bin/env python
"""
Test Railway Database Connection Locally
This script simulates the Railway environment to test database connectivity.
"""

import os
import sys
import django
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

def test_railway_environment():
    """Test if Railway environment variables are properly set."""
    print("🔍 Testing Railway Environment Variables...")
    print("=" * 60)
    
    # Check critical environment variables
    critical_vars = [
        'DATABASE_URL',
        'SECRET_KEY',
        'DJANGO_SETTINGS_MODULE'
    ]
    
    missing_vars = []
    for var in critical_vars:
        value = os.environ.get(var)
        if value:
            if var == 'DATABASE_URL':
                # Mask sensitive parts of DATABASE_URL
                masked_url = value.split('@')[0] + '@***:***/***'
                print(f"✅ {var}: {masked_url}")
            else:
                print(f"✅ {var}: {value[:20]}..." if len(value) > 20 else f"✅ {var}: {value}")
        else:
            print(f"❌ {var}: NOT SET")
            missing_vars.append(var)
    
    # Check optional but important variables
    optional_vars = [
        'AWS_ACCESS_KEY_ID',
        'AWS_SECRET_ACCESS_KEY',
        'AWS_STORAGE_BUCKET_NAME',
        'EMAIL_HOST',
        'EMAIL_HOST_USER',
        'SMS_API_KEY'
    ]
    
    print("\n🔍 Optional Environment Variables:")
    for var in optional_vars:
        value = os.environ.get(var)
        if value:
            print(f"✅ {var}: {value[:10]}..." if len(value) > 10 else f"✅ {var}: {value}")
        else:
            print(f"⚠️  {var}: NOT SET (optional)")
    
    if missing_vars:
        print(f"\n❌ Missing critical variables: {', '.join(missing_vars)}")
        return False
    else:
        print(f"\n✅ All critical environment variables are set!")
        return True

def test_django_settings():
    """Test Django settings configuration."""
    print("\n🔍 Testing Django Settings...")
    print("=" * 60)
    
    try:
        # Set Django settings
        os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings.railway')
        
        # Setup Django
        django.setup()
        
        from django.conf import settings
        
        print(f"✅ Django Settings Module: {settings.SETTINGS_MODULE}")
        print(f"✅ Debug Mode: {settings.DEBUG}")
        print(f"✅ Allowed Hosts: {settings.ALLOWED_HOSTS}")
        
        # Check database configuration
        db_settings = settings.DATABASES['default']
        print(f"✅ Database Engine: {db_settings.get('ENGINE', 'Not set')}")
        print(f"✅ Database Name: {db_settings.get('NAME', 'Not set')}")
        print(f"✅ Database Host: {db_settings.get('HOST', 'Not set')}")
        print(f"✅ Database Port: {db_settings.get('PORT', 'Not set')}")
        print(f"✅ Database User: {db_settings.get('USER', 'Not set')}")
        
        return True
        
    except Exception as e:
        print(f"❌ Django settings test failed: {str(e)}")
        return False

def test_database_connection():
    """Test the actual database connection."""
    print("\n🔍 Testing Database Connection...")
    print("=" * 60)
    
    try:
        from django.db import connection
        
        # Test connection
        with connection.cursor() as cursor:
            # Test PostgreSQL-specific functions
            cursor.execute("SELECT version();")
            version = cursor.fetchone()
            print(f"✅ PostgreSQL Version: {version[0]}")
            
            # Test basic queries
            cursor.execute("SELECT current_database(), current_user, current_timestamp;")
            db_info = cursor.fetchone()
            print(f"✅ Current Database: {db_info[0]}")
            print(f"✅ Current User: {db_info[1]}")
            print(f"✅ Current Timestamp: {db_info[2]}")
            
        print("🎉 Database connection test PASSED!")
        return True
        
    except Exception as e:
        print(f"❌ Database connection test failed: {str(e)}")
        print(f"Error Type: {type(e).__name__}")
        return False

def test_django_models():
    """Test Django models and database tables."""
    print("\n🔍 Testing Django Models...")
    print("=" * 60)
    
    try:
        from user_auth.models import User
        from business.models import Business, Category
        
        print("✅ User model imported successfully")
        print("✅ Business model imported successfully")
        print("✅ Category model imported successfully")
        
        # Check if tables exist by trying to count records
        user_count = User.objects.count()
        business_count = Business.objects.count()
        category_count = Category.objects.count()
        
        print(f"📊 Total Users: {user_count}")
        print(f"📊 Total Businesses: {business_count}")
        print(f"📊 Total Categories: {category_count}")
        
        print("🎉 Django models test PASSED!")
        return True
        
    except Exception as e:
        print(f"❌ Django models test failed: {str(e)}")
        print(f"Error Type: {type(e).__name__}")
        return False

if __name__ == "__main__":
    print("🚀 FEM Family Business Directory - Railway Database Connection Test")
    print("=" * 80)
    
    # Test environment variables
    env_test = test_railway_environment()
    
    if env_test:
        # Test Django settings
        settings_test = test_django_settings()
        
        if settings_test:
            # Test database connection
            db_test = test_database_connection()
            
            # Test Django models
            models_test = test_django_models()
            
            print("\n" + "=" * 80)
            if db_test and models_test:
                print("🎉 ALL TESTS PASSED! Your Railway database is working correctly.")
            else:
                print("❌ Some tests failed. Check the error messages above.")
        else:
            print("\n❌ Django settings test failed. Cannot proceed with database tests.")
    else:
        print("\n❌ Environment variables test failed. Please set up your Railway environment first.")
    
    print("=" * 80)
