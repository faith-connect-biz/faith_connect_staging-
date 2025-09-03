#!/usr/bin/env python
"""
Database Health Check Script

This script performs a comprehensive health check on the database to identify
potential issues and provide recommendations.

Usage:
    python check_database_health.py
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

from django.db import connection
from django.core.management import call_command
from django.db.utils import OperationalError

def check_database_connection():
    """Check if database connection is working"""
    print("🔌 Checking database connection...")
    
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT version()")
            version = cursor.fetchone()[0]
            print(f"  ✅ Connected successfully")
            print(f"  📋 Database: {version}")
            return True
    except OperationalError as e:
        print(f"  ❌ Connection failed: {e}")
        return False
    except Exception as e:
        print(f"  ❌ Unexpected error: {e}")
        return False

def check_table_status():
    """Check the status of important tables"""
    print("\n📊 Checking table status...")
    
    important_tables = [
        'business_category',
        'user_auth_user', 
        'business_business',
        'business_review',
        'business_service',
        'business_product'
    ]
    
    with connection.cursor() as cursor:
        for table in important_tables:
            try:
                cursor.execute(f"SELECT COUNT(*) FROM {table}")
                count = cursor.fetchone()[0]
                print(f"  📋 {table}: {count} records")
            except Exception as e:
                print(f"  ❌ {table}: Error - {e}")

def check_sequence_status():
    """Check database sequences for potential issues"""
    print("\n🔢 Checking sequence status...")
    
    with connection.cursor() as cursor:
        # Check business_category sequence
        try:
            cursor.execute("""
                SELECT pg_get_serial_sequence('business_category', 'id')
            """)
            seq_result = cursor.fetchone()
            
            if seq_result and seq_result[0]:
                cursor.execute(f"SELECT last_value FROM {seq_result[0]}")
                last_val = cursor.fetchone()[0]
                print(f"  📋 business_category sequence: {last_val}")
            else:
                print(f"  ⚠️  business_category: No sequence found")
        except Exception as e:
            print(f"  ❌ business_category sequence error: {e}")
        
        # Check user_auth_user sequence
        try:
            cursor.execute("""
                SELECT pg_get_serial_sequence('user_auth_user', 'id')
            """)
            seq_result = cursor.fetchone()
            
            if seq_result and seq_result[0]:
                cursor.execute(f"SELECT last_value FROM {seq_result[0]}")
                last_val = cursor.fetchone()[0]
                print(f"  📋 user_auth_user sequence: {last_val}")
            else:
                print(f"  ⚠️  user_auth_user: No sequence found")
        except Exception as e:
            print(f"  ❌ user_auth_user sequence error: {e}")

def check_constraint_violations():
    """Check for potential constraint violations"""
    print("\n🚫 Checking for constraint violations...")
    
    with connection.cursor() as cursor:
        # Check for duplicate business category IDs
        try:
            cursor.execute("""
                SELECT id, COUNT(*) as count 
                FROM business_category 
                GROUP BY id 
                HAVING COUNT(*) > 1
            """)
            
            duplicates = cursor.fetchall()
            if duplicates:
                print(f"  ❌ Found {len(duplicates)} duplicate business category IDs:")
                for dup in duplicates:
                    print(f"    - ID {dup[0]} appears {dup[1]} times")
            else:
                print(f"  ✅ No duplicate business category IDs found")
        except Exception as e:
            print(f"  ❌ Error checking business categories: {e}")
        
        # Check for duplicate partnership numbers
        try:
            cursor.execute("""
                SELECT partnership_number, COUNT(*) as count 
                FROM user_auth_user 
                GROUP BY partnership_number 
                HAVING COUNT(*) > 1
            """)
            
            duplicates = cursor.fetchall()
            if duplicates:
                print(f"  ❌ Found {len(duplicates)} duplicate partnership numbers:")
                for dup in duplicates:
                    print(f"    - {dup[0]} appears {dup[1]} times")
            else:
                print(f"  ✅ No duplicate partnership numbers found")
        except Exception as e:
            print(f"  ❌ Error checking partnership numbers: {e}")

def check_data_integrity():
    """Check data integrity and relationships"""
    print("\n🔍 Checking data integrity...")
    
    with connection.cursor() as cursor:
        # Check for orphaned business records
        try:
            cursor.execute("""
                SELECT COUNT(*) FROM business_business b
                LEFT JOIN user_auth_user u ON b.owner_id = u.id
                WHERE u.id IS NULL
            """)
            
            orphaned = cursor.fetchone()[0]
            if orphaned > 0:
                print(f"  ⚠️  Found {orphaned} orphaned business records")
            else:
                print(f"  ✅ No orphaned business records found")
        except Exception as e:
            print(f"  ❌ Error checking business integrity: {e}")
        
        # Check for orphaned reviews
        try:
            cursor.execute("""
                SELECT COUNT(*) FROM business_review r
                LEFT JOIN user_auth_user u ON r.user_id = u.id
                WHERE u.id IS NULL
            """)
            
            orphaned = cursor.fetchone()[0]
            if orphaned > 0:
                print(f"  ⚠️  Found {orphaned} orphaned review records")
            else:
                print(f"  ✅ No orphaned review records found")
        except Exception as e:
            print(f"  ❌ Error checking review integrity: {e}")

def generate_recommendations():
    """Generate recommendations based on findings"""
    print("\n💡 Recommendations:")
    print("  1. If you see duplicate key errors, run: python fix_database_sequences.py")
    print("  2. If you see orphaned records, consider data cleanup")
    print("  3. For sequence issues, the fix script should resolve them")
    print("  4. Monitor the logs for any new constraint violations")
    print("  5. Consider adding better error handling in your application code")

def main():
    print("🏥 Database Health Check")
    print("=" * 50)
    
    try:
        # Perform all checks
        if not check_database_connection():
            print("\n❌ Cannot proceed without database connection")
            return 1
        
        check_table_status()
        check_sequence_status()
        check_constraint_violations()
        check_data_integrity()
        
        generate_recommendations()
        
        print("\n🎉 Health check completed!")
        
    except Exception as e:
        print(f"\n❌ Health check failed with error: {e}")
        print("\n🔍 Troubleshooting:")
        print("   1. Make sure you're in the backend directory")
        print("   2. Check that Django is properly configured")
        print("   3. Verify database connection")
        print("   4. Check environment variables")
        return 1
    
    return 0

if __name__ == "__main__":
    exit(main())
