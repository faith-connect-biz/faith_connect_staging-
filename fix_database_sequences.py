#!/usr/bin/env python
"""
Database Sequence Fix Script

This script fixes database sequence issues that can cause duplicate key constraint violations.
Run this script from the backend directory.

Usage:
    python fix_database_sequences.py
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

def fix_sequences():
    """Fix database sequences to prevent duplicate key violations"""
    print("🔧 Fixing database sequences...")
    
    with connection.cursor() as cursor:
        # Get all tables with auto-incrementing IDs
        cursor.execute("""
            SELECT table_name, column_name 
            FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND column_default LIKE 'nextval%'
            AND table_name IN ('business_category', 'user_auth_user', 'business_business')
        """)
        
        tables = cursor.fetchall()
        
        for table_name, column_name in tables:
            print(f"  📋 Fixing sequence for {table_name}.{column_name}")
            
            # Get the current maximum ID
            cursor.execute(f"SELECT MAX({column_name}) FROM {table_name}")
            result = cursor.fetchone()
            max_id = result[0] if result[0] else 0
            
            if max_id > 0:
                # Get the sequence name
                cursor.execute(f"""
                    SELECT pg_get_serial_sequence('{table_name}', '{column_name}')
                """)
                seq_result = cursor.fetchone()
                
                if seq_result and seq_result[0]:
                    sequence_name = seq_result[0]
                    print(f"    🔄 Setting sequence {sequence_name} to {max_id + 1}")
                    
                    # Set the sequence to the next value after the max ID
                    cursor.execute(f"SELECT setval('{sequence_name}', {max_id + 1}, false)")
                    
                    print(f"    ✅ Sequence {sequence_name} updated")
                else:
                    print(f"    ⚠️  No sequence found for {table_name}.{column_name}")
            else:
                print(f"    ℹ️  Table {table_name} is empty, no sequence update needed")

def check_duplicates():
    """Check for potential duplicate data issues"""
    print("\n🔍 Checking for duplicate data issues...")
    
    with connection.cursor() as cursor:
        # Check business categories
        cursor.execute("""
            SELECT id, name, COUNT(*) as count 
            FROM business_category 
            GROUP BY id, name 
            HAVING COUNT(*) > 1
        """)
        
        duplicates = cursor.fetchall()
        if duplicates:
            print("  ❌ Found duplicate business categories:")
            for dup in duplicates:
                print(f"    - ID {dup[0]}: {dup[1]} (count: {dup[2]})")
        else:
            print("  ✅ No duplicate business categories found")
        
        # Check user partnership numbers
        cursor.execute("""
            SELECT partnership_number, COUNT(*) as count 
            FROM user_auth_user 
            GROUP BY partnership_number 
            HAVING COUNT(*) > 1
        """)
        
        duplicates = cursor.fetchall()
        if duplicates:
            print("  ❌ Found duplicate partnership numbers:")
            for dup in duplicates:
                print(f"    - {dup[0]} (count: {dup[2]})")
        else:
            print("  ✅ No duplicate partnership numbers found")

def main():
    print("🚀 Database Sequence Fix Script")
    print("=" * 50)
    
    try:
        # Check for duplicates first
        check_duplicates()
        
        # Fix sequences
        fix_sequences()
        
        print("\n🎉 Database sequences fixed successfully!")
        print("\n📋 Next Steps:")
        print("   1. Try running your seeding scripts again")
        print("   2. The duplicate key errors should be resolved")
        print("   3. If issues persist, check for data inconsistencies")
        
    except Exception as e:
        print(f"\n❌ Script failed with error: {e}")
        print("\n🔍 Troubleshooting:")
        print("   1. Make sure you're in the backend directory")
        print("   2. Check that Django is properly configured")
        print("   3. Verify database connection")
        print("   4. Check environment variables")
        return 1
    
    return 0

if __name__ == "__main__":
    exit(main())
