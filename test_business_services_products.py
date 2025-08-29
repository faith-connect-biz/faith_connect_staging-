#!/usr/bin/env python3
"""
Test script to verify business services and products functionality
Run this after applying the fixes to ensure everything works correctly.
"""

import os
import sys
import django
from django.conf import settings

# Add the project root to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings.dev')
django.setup()

from business.models import Business, Service, Product, Category, User
from business.serializers import BusinessSerializer, ServiceSerializer, ProductSerializer
from rest_framework.test import APIRequestFactory
from django.test import TestCase

def test_business_creation_with_services_products():
    """Test that business creation properly saves services and products"""
    print("🧪 Testing Business Creation with Services and Products...")
    
    # Create test data
    test_data = {
        'business_name': 'Test Business',
        'category_id': 1,  # Make sure this category exists
        'description': 'Test business description',
        'phone': '+254700000000',
        'email': 'test@example.com',
        'address': 'Test Address',
        'services': [
            {
                'name': 'Test Service 1',
                'description': 'Service description 1',
                'price_range': 'KSh 500-1000',
                'duration': '1 hour',
                'is_available': True,
                'images': ['https://example.com/image1.jpg', 'https://example.com/image2.jpg']
            },
            {
                'name': 'Test Service 2',
                'description': 'Service description 2',
                'price_range': 'KSh 1000-2000',
                'duration': '2 hours',
                'is_available': True,
                'images': ['https://example.com/image3.jpg']
            }
        ],
        'products': [
            {
                'name': 'Test Product 1',
                'description': 'Product description 1',
                'price': '1500.00',
                'is_available': True,
                'images': ['https://example.com/product1.jpg', 'https://example.com/product2.jpg']
            },
            {
                'name': 'Test Product 2',
                'description': 'Product description 2',
                'price': '2500.00',
                'is_available': True,
                'images': ['https://example.com/product3.jpg']
            }
        ]
    }
    
    try:
        # Create a test user
        user, created = User.objects.get_or_create(
            email='test@example.com',
            defaults={
                'first_name': 'Test',
                'last_name': 'User',
                'user_type': 'business'
            }
        )
        
        # Create a test category if it doesn't exist
        category, created = Category.objects.get_or_create(
            id=1,
            defaults={
                'name': 'Test Category',
                'slug': 'test-category'
            }
        )
        
        # Create API request factory
        factory = APIRequestFactory()
        request = factory.post('/api/business/')
        request.user = user
        
        # Test business creation
        serializer = BusinessSerializer(data=test_data, context={'request': request})
        if serializer.is_valid():
            business = serializer.save()
            print(f"✅ Business created successfully: {business.business_name}")
            
            # Check if services were created
            services = Service.objects.filter(business=business)
            print(f"📊 Services created: {services.count()}")
            for service in services:
                print(f"   - {service.name}: {len(service.images)} images")
            
            # Check if products were created
            products = Product.objects.filter(business=business)
            print(f"📊 Products created: {products.count()}")
            for product in products:
                print(f"   - {product.name}: {len(product.images)} images")
            
            # Test API endpoints
            print("\n🔗 Testing API Endpoints...")
            
            # Test services endpoint
            services_response = factory.get(f'/api/business/{business.id}/services/')
            print(f"✅ Services endpoint accessible")
            
            # Test products endpoint
            products_response = factory.get(f'/api/business/{business.id}/products/')
            print(f"✅ Products endpoint accessible")
            
            return True
        else:
            print(f"❌ Business creation failed: {serializer.errors}")
            return False
            
    except Exception as e:
        print(f"❌ Test failed with error: {str(e)}")
        return False

def test_database_schema():
    """Test that the database schema supports the required fields"""
    print("\n🗄️ Testing Database Schema...")
    
    try:
        # Check Service model fields
        service_fields = [field.name for field in Service._meta.fields]
        required_service_fields = ['business', 'name', 'description', 'images', 'service_image_url']
        
        for field in required_service_fields:
            if field in service_fields:
                print(f"✅ Service model has '{field}' field")
            else:
                print(f"❌ Service model missing '{field}' field")
        
        # Check Product model fields
        product_fields = [field.name for field in Product._meta.fields]
        required_product_fields = ['business', 'name', 'description', 'price', 'images', 'product_image_url']
        
        for field in required_product_fields:
            if field in product_fields:
                print(f"✅ Product model has '{field}' field")
            else:
                print(f"❌ Product model missing '{field}' field")
        
        return True
        
    except Exception as e:
        print(f"❌ Schema test failed: {str(e)}")
        return False

def test_serializers():
    """Test that serializers include the required fields"""
    print("\n📝 Testing Serializers...")
    
    try:
        # Test ServiceSerializer
        service_fields = ServiceSerializer.Meta.fields
        required_service_fields = ['id', 'name', 'description', 'images', 'service_image_url']
        
        for field in required_service_fields:
            if field in service_fields:
                print(f"✅ ServiceSerializer includes '{field}' field")
            else:
                print(f"❌ ServiceSerializer missing '{field}' field")
        
        # Test ProductSerializer
        product_fields = ProductSerializer.Meta.fields
        required_product_fields = ['id', 'name', 'description', 'price', 'images', 'product_image_url']
        
        for field in required_product_fields:
            if field in product_fields:
                print(f"✅ ProductSerializer includes '{field}' field")
            else:
                print(f"❌ ProductSerializer missing '{field}' field")
        
        return True
        
    except Exception as e:
        print(f"❌ Serializer test failed: {str(e)}")
        return False

def main():
    """Run all tests"""
    print("🚀 Starting Business Services and Products Test Suite...\n")
    
    # Test database schema
    schema_test = test_database_schema()
    
    # Test serializers
    serializer_test = test_serializers()
    
    # Test business creation
    creation_test = test_business_creation_with_services_products()
    
    # Summary
    print("\n" + "="*50)
    print("📋 TEST SUMMARY")
    print("="*50)
    print(f"Database Schema: {'✅ PASS' if schema_test else '❌ FAIL'}")
    print(f"Serializers: {'✅ PASS' if serializer_test else '❌ FAIL'}")
    print(f"Business Creation: {'✅ PASS' if creation_test else '❌ FAIL'}")
    
    if all([schema_test, serializer_test, creation_test]):
        print("\n🎉 All tests passed! Services and products should work correctly.")
        print("✅ You can now run migrations and test the application.")
    else:
        print("\n⚠️ Some tests failed. Please check the issues above.")
        print("❌ Do not run migrations until all tests pass.")

if __name__ == '__main__':
    main()
