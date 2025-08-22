#!/usr/bin/env python
"""
Test Database Connection Script
Run this to verify your Railway PostgreSQL connection is working.
"""

import os
import sys
import django
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

# Set Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings.railway')

# Setup Django
django.setup()

from django.db import connection
from django.conf import settings

def test_database_connection():
    """Test the database connection and show connection details."""
    print("🔍 Testing Database Connection...")
    print("=" * 50)
    
    try:
        # Get database settings
        db_settings = settings.DATABASES['default']
        print(f"📊 Database Engine: {db_settings.get('ENGINE', 'Not set')}")
        print(f"📊 Database Name: {db_settings.get('NAME', 'Not set')}")
        print(f"📊 Database Host: {db_settings.get('HOST', 'Not set')}")
        print(f"📊 Database Port: {db_settings.get('PORT', 'Not set')}")
        print(f"📊 Database User: {db_settings.get('USER', 'Not set')}")
        
        # Test connection
        with connection.cursor() as cursor:
            cursor.execute("SELECT version();")
            version = cursor.fetchone()
            print(f"✅ PostgreSQL Version: {version[0]}")
            
            # Test a simple query
            cursor.execute("SELECT current_database(), current_user, current_timestamp;")
            db_info = cursor.fetchone()
            print(f"✅ Current Database: {db_info[0]}")
            print(f"✅ Current User: {db_info[1]}")
            print(f"✅ Current Timestamp: {db_info[2]}")
            
            # Test table creation (if it doesn't exist)
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS connection_test (
                    id SERIAL PRIMARY KEY,
                    test_message TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            """)
            
            # Insert test data
            cursor.execute("""
                INSERT INTO connection_test (test_message) 
                VALUES ('Database connection test successful!')
                RETURNING id, test_message, created_at;
            """)
            
            test_result = cursor.fetchone()
            print(f"✅ Test Record Created: ID={test_result[0]}, Message='{test_result[1]}', Time={test_result[2]}")
            
            # Clean up test data
            cursor.execute("DELETE FROM connection_test WHERE test_message = 'Database connection test successful!';")
            print("🧹 Test data cleaned up")
            
        print("\n🎉 Database connection test PASSED!")
        return True
        
    except Exception as e:
        print(f"\n❌ Database connection test FAILED!")
        print(f"Error: {str(e)}")
        print(f"Error Type: {type(e).__name__}")
        return False

def test_django_models():
    """Test if Django models can be imported and accessed."""
    print("\n🔍 Testing Django Models...")
    print("=" * 50)
    
    try:
        # Try to import and access models
        from user_auth.models import User
        from business.models import Business, Category
        
        print("✅ User model imported successfully")
        print("✅ Business model imported successfully")
        print("✅ Category model imported successfully")
        
        # Try to count records (this will test actual database queries)
        user_count = User.objects.count()
        business_count = Business.objects.count()
        category_count = Category.objects.count()
        
        print(f"📊 Total Users: {user_count}")
        print(f"📊 Total Businesses: {business_count}")
        print(f"📊 Total Categories: {category_count}")
        
        print("\n🎉 Django models test PASSED!")
        return True
        
    except Exception as e:
        print(f"\n❌ Django models test FAILED!")
        print(f"Error: {str(e)}")
        print(f"Error Type: {type(e).__name__}")
        return False

if __name__ == "__main__":
    print("🚀 FEM Family Business Directory - Database Connection Test")
    print("=" * 70)
    
    # Test database connection
    db_test = test_database_connection()
    
    # Test Django models
    models_test = test_django_models()
    
    print("\n" + "=" * 70)
    if db_test and models_test:
        print("🎉 ALL TESTS PASSED! Your database is working correctly.")
    else:
        print("❌ Some tests failed. Check the error messages above.")
    
    print("=" * 70)
