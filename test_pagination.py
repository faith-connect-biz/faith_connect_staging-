#!/usr/bin/env python
"""
Test script to verify pagination functionality for businesses, products, and services
"""
import os
import sys
import django
from django.conf import settings

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings.dev')
django.setup()

from business.models import Business, Product, Service, Category
from business.serializers import BusinessSerializer, ProductSerializer, ServiceSerializer
from core.pagination import CustomLimitOffsetPagination
from rest_framework.test import APIRequestFactory
from django.contrib.auth import get_user_model

User = get_user_model()

def test_pagination():
    """Test pagination functionality"""
    print("Testing pagination functionality...")
    
    # Create a test request factory
    factory = APIRequestFactory()
    
    # Test business pagination
    print("\n1. Testing Business Pagination:")
    businesses = Business.objects.filter(is_active=True).select_related('category', 'user').order_by('-created_at')
    paginator = CustomLimitOffsetPagination()
    
    # Simulate a request with limit=5 and offset=0
    request = factory.get('/businesses/?limit=5&offset=0')
    request.query_params = {'limit': '5', 'offset': '0'}
    
    paginated_businesses = paginator.paginate_queryset(businesses, request)
    response = paginator.get_paginated_response(paginated_businesses)
    
    print(f"   Total businesses: {response.data['count']}")
    print(f"   Limit: {response.data['limit']}")
    print(f"   Offset: {response.data['offset']}")
    print(f"   Total pages: {response.data['total_pages']}")
    print(f"   Current page: {response.data['current_page']}")
    print(f"   Results count: {len(response.data['results'])}")
    
    # Test product pagination
    print("\n2. Testing Product Pagination:")
    products = Product.objects.filter(is_active=True).select_related('business', 'business__category')
    paginator = CustomLimitOffsetPagination()
    
    # Simulate a request with limit=3 and offset=0
    request = factory.get('/products/?limit=3&offset=0')
    request.query_params = {'limit': '3', 'offset': '0'}
    
    paginated_products = paginator.paginate_queryset(products, request)
    response = paginator.get_paginated_response(paginated_products)
    
    print(f"   Total products: {response.data['count']}")
    print(f"   Limit: {response.data['limit']}")
    print(f"   Offset: {response.data['offset']}")
    print(f"   Total pages: {response.data['total_pages']}")
    print(f"   Current page: {response.data['current_page']}")
    print(f"   Results count: {len(response.data['results'])}")
    
    # Test service pagination
    print("\n3. Testing Service Pagination:")
    services = Service.objects.filter(is_active=True).select_related('business', 'business__category')
    paginator = CustomLimitOffsetPagination()
    
    # Simulate a request with limit=4 and offset=0
    request = factory.get('/services/?limit=4&offset=0')
    request.query_params = {'limit': '4', 'offset': '0'}
    
    paginated_services = paginator.paginate_queryset(services, request)
    response = paginator.get_paginated_response(paginated_services)
    
    print(f"   Total services: {response.data['count']}")
    print(f"   Limit: {response.data['limit']}")
    print(f"   Offset: {response.data['offset']}")
    print(f"   Total pages: {response.data['total_pages']}")
    print(f"   Current page: {response.data['current_page']}")
    print(f"   Results count: {len(response.data['results'])}")
    
    # Test offset pagination
    print("\n4. Testing Offset Pagination (offset=5, limit=3):")
    request = factory.get('/businesses/?limit=3&offset=5')
    request.query_params = {'limit': '3', 'offset': '5'}
    
    paginated_businesses = paginator.paginate_queryset(businesses, request)
    response = paginator.get_paginated_response(paginated_businesses)
    
    print(f"   Total businesses: {response.data['count']}")
    print(f"   Limit: {response.data['limit']}")
    print(f"   Offset: {response.data['offset']}")
    print(f"   Total pages: {response.data['total_pages']}")
    print(f"   Current page: {response.data['current_page']}")
    print(f"   Results count: {len(response.data['results'])}")
    
    print("\n✅ Pagination test completed successfully!")

if __name__ == "__main__":
    try:
        test_pagination()
    except Exception as e:
        print(f"❌ Error during pagination test: {e}")
        import traceback
        traceback.print_exc()
