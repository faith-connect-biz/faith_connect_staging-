#!/usr/bin/env python3
"""
Django management command to test business creation with services and products
Run with: python manage.py test_business_creation
"""

import os
import sys
import django
from django.core.management.base import BaseCommand
from django.test import TestCase
from django.contrib.auth import get_user_model
from business.models import Business, Service, Product, Category
from business.serializers import BusinessSerializer
from rest_framework.test import APIRequestFactory

User = get_user_model()

class Command(BaseCommand):
    help = 'Test business creation with services and products'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('🚀 Starting Business Creation Test...'))
        
        try:
            # Test 1: Check if we have categories
            categories = Category.objects.all()
            if not categories.exists():
                self.stdout.write(self.style.WARNING('⚠️ No categories found. Creating test category...'))
                category = Category.objects.create(
                    name='Test Category',
                    slug='test-category',
                    description='Test category for business creation'
                )
            else:
                category = categories.first()
            
            self.stdout.write(self.style.SUCCESS(f'✅ Using category: {category.name}'))
            
            # Test 2: Check if we have a test user
            test_user = User.objects.filter(email='test@example.com').first()
            if not test_user:
                self.stdout.write(self.style.WARNING('⚠️ No test user found. Creating test user...'))
                test_user = User.objects.create_user(
                    email='test@example.com',
                    password='testpass123',
                    first_name='Test',
                    last_name='User',
                    phone='+254700000000'
                )
            
            self.stdout.write(self.style.SUCCESS(f'✅ Using test user: {test_user.email}'))
            
            # Test 3: Create test business data
            business_data = {
                'business_name': 'Test Business',
                'category_id': category.id,
                'description': 'A test business for services and products',
                'address': '123 Test Street',
                'city': 'Nairobi',
                'county': 'Nairobi',
                'phone': '+254700000001',
                'email': 'business@test.com',
                'services': [
                    {
                        'name': 'Test Service 1',
                        'description': 'This is a test service',
                        'price_range': '1000-5000',
                        'duration': '2 hours',
                        'is_available': True,
                        'images': ['https://example.com/service1.jpg']
                    },
                    {
                        'name': 'Test Service 2',
                        'description': 'Another test service',
                        'price_range': '2000-8000',
                        'duration': '1 hour',
                        'is_available': True,
                        'images': ['https://example.com/service2.jpg', 'https://example.com/service2b.jpg']
                    }
                ],
                'products': [
                    {
                        'name': 'Test Product 1',
                        'description': 'This is a test product',
                        'price': '1500.00',
                        'is_available': True,
                        'images': ['https://example.com/product1.jpg']
                    },
                    {
                        'name': 'Test Product 2',
                        'description': 'Another test product',
                        'price': '2500.00',
                        'is_available': True,
                        'images': ['https://example.com/product2.jpg', 'https://example.com/product2b.jpg']
                    }
                ]
            }
            
            # Test 4: Create business using serializer
            factory = APIRequestFactory()
            request = factory.post('/api/businesses/')
            request.user = test_user
            
            serializer = BusinessSerializer(data=business_data, context={'request': request})
            
            if serializer.is_valid():
                business = serializer.save()
                self.stdout.write(self.style.SUCCESS(f'✅ Business created successfully: {business.business_name}'))
                
                # Test 5: Check if services were created
                services = Service.objects.filter(business=business)
                self.stdout.write(self.style.SUCCESS(f'✅ {services.count()} services created'))
                
                for service in services:
                    self.stdout.write(f'   - {service.name}: {len(service.images or [])} images')
                
                # Test 6: Check if products were created
                products = Product.objects.filter(business=business)
                self.stdout.write(self.style.SUCCESS(f'✅ {products.count()} products created'))
                
                for product in products:
                    self.stdout.write(f'   - {product.name}: {len(product.images or [])} images')
                
                # Test 7: Test API retrieval
                business_serialized = BusinessSerializer(business, context={'request': request})
                business_data_retrieved = business_serialized.data
                
                self.stdout.write(self.style.SUCCESS('✅ Business data retrieved successfully'))
                self.stdout.write(f'   - Services in response: {len(business_data_retrieved.get("services", []))}')
                self.stdout.write(f'   - Products in response: {len(business_data_retrieved.get("products", []))}')
                
                # Clean up test data
                business.delete()
                self.stdout.write(self.style.SUCCESS('✅ Test data cleaned up'))
                
            else:
                self.stdout.write(self.style.ERROR('❌ Business creation failed'))
                for field, errors in serializer.errors.items():
                    self.stdout.write(self.style.ERROR(f'   - {field}: {errors}'))
                    
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'❌ Test failed with error: {str(e)}'))
            import traceback
            self.stdout.write(self.style.ERROR(traceback.format_exc()))
        
        self.stdout.write(self.style.SUCCESS('🎉 Test completed!'))
