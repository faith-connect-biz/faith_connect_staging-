#!/usr/bin/env python3
"""
Test script to demonstrate the difference between BusinessListSerializer and BusinessSerializer
This shows the API optimization we implemented.
"""

import os
import sys
import django

# Add the project directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings.development')
django.setup()

from business.serializers import BusinessListSerializer, BusinessSerializer
from business.models import Business

def test_serializers():
    """Test the difference between list and detail serializers"""
    
    # Get a sample business
    business = Business.objects.filter(is_active=True).first()
    
    if not business:
        print("No active businesses found in database")
        return
    
    print("=" * 60)
    print("BUSINESS API OPTIMIZATION TEST")
    print("=" * 60)
    print(f"Testing with business: {business.business_name}")
    print()
    
    # Test BusinessListSerializer (for listing)
    print("1. BUSINESS LIST API (BusinessListSerializer)")
    print("-" * 40)
    list_serializer = BusinessListSerializer(business)
    list_data = list_serializer.data
    
    print("Fields returned by LIST API:")
    for field, value in list_data.items():
        print(f"  - {field}: {value}")
    
    print(f"\nTotal fields in LIST API: {len(list_data)}")
    print()
    
    # Test BusinessSerializer (for details)
    print("2. BUSINESS DETAIL API (BusinessSerializer)")
    print("-" * 40)
    detail_serializer = BusinessSerializer(business)
    detail_data = detail_serializer.data
    
    print("Fields returned by DETAIL API:")
    for field, value in detail_data.items():
        if field in list_data:
            print(f"  - {field}: {value} (also in list)")
        else:
            print(f"  - {field}: {value} (DETAIL ONLY)")
    
    print(f"\nTotal fields in DETAIL API: {len(detail_data)}")
    print()
    
    # Show the optimization
    print("3. OPTIMIZATION SUMMARY")
    print("-" * 40)
    list_only_fields = set(list_data.keys())
    detail_only_fields = set(detail_data.keys()) - list_only_fields
    
    print(f"Fields ONLY in list API: {len(list_only_fields)}")
    print(f"Fields ONLY in detail API: {len(detail_only_fields)}")
    print(f"Data reduction: {len(detail_only_fields)} fields removed from list API")
    print()
    
    print("Fields removed from list API (only in detail):")
    for field in sorted(detail_only_fields):
        print(f"  - {field}")
    
    print()
    print("=" * 60)
    print("OPTIMIZATION COMPLETE!")
    print("List API now returns only essential fields for better performance")
    print("Detail API returns complete business information when needed")
    print("=" * 60)

if __name__ == "__main__":
    test_serializers()











