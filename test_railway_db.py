#!/usr/bin/env python3
"""
Test Railway Database Connection
"""
import psycopg2
import os

# Railway database connection string
DATABASE_URL = "postgresql://postgres:EQnOgRPMvZTtyDhlUHOcgpNSsVXwYOtR@centerbeam.proxy.rlwy.net:22007/railway"

def test_connection():
    try:
        print("🔌 Testing Railway database connection...")
        print(f"Host: centerbeam.proxy.rlwy.net")
        print(f"Port: 22007")
        print(f"Database: railway")
        
        # Parse connection string
        conn = psycopg2.connect(DATABASE_URL)
        
        print("✅ Database connection successful!")
        
        # Test a simple query
        cursor = conn.cursor()
        cursor.execute("SELECT version();")
        version = cursor.fetchone()
        print(f"PostgreSQL version: {version[0]}")
        
        # Test categories table
        cursor.execute("SELECT COUNT(*) FROM business_category;")
        category_count = cursor.fetchone()
        print(f"Categories in database: {category_count[0]}")
        
        # Show some sample categories
        cursor.execute("SELECT id, name, slug FROM business_category LIMIT 5;")
        categories = cursor.fetchall()
        print("\nSample categories:")
        for cat in categories:
            print(f"  - {cat[0]}: {cat[1]} ({cat[2]})")
        
        cursor.close()
        conn.close()
        print("\n🎉 All tests passed!")
        
    except psycopg2.OperationalError as e:
        print(f"❌ Connection failed: {e}")
        print("\nThis suggests the Railway database is down or unreachable.")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_connection()
