#!/usr/bin/env python3
"""
Test script to verify business update functionality
"""

import os
import sys
import django
from django.conf import settings

# Add the backend directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings.dev')
django.setup()

from business.models import Business, Category, User
from business.serializers import BusinessSerializer
from business.views import BusinessUpdateView
from rest_framework.test import APIRequestFactory
from rest_framework.test import force_authenticate

def test_business_update():
    """Test that business update works correctly"""
    print("Testing business update functionality...")
    
    try:
        # Get or create a test user
        user, created = User.objects.get_or_create(
            username='testuser',
            defaults={
                'email': 'test@example.com',
                'first_name': 'Test',
                'last_name': 'User',
                'user_type': 'business'
            }
        )
        
        if created:
            user.set_password('testpass123')
            user.save()
            print(f"Created test user: {user.username}")
        else:
            print(f"Using existing test user: {user.username}")
        
        # Get or create a test category
        category, created = Category.objects.get_or_create(
            name='Test Category',
            defaults={'slug': 'test-category'}
        )
        
        if created:
            print(f"Created test category: {category.name}")
        else:
            print(f"Using existing test category: {category.name}")
        
        # Get or create a test business
        business, created = Business.objects.get_or_create(
            user=user,
            defaults={
                'business_name': 'Test Business',
                'category': category,
                'description': 'A test business',
                'address': '123 Test St',
                'city': 'Test City',
                'county': 'Test County'
            }
        )
        
        if created:
            print(f"Created test business: {business.business_name}")
        else:
            print(f"Using existing test business: {business.business_name}")
        
        # Test the serializer update method
        print("\nTesting BusinessSerializer update method...")
        
        # Create update data
        update_data = {
            'business_name': 'Updated Test Business',
            'description': 'An updated test business description',
            'category_id': category.id
        }
        
        # Test serializer update
        serializer = BusinessSerializer(business, data=update_data, partial=True)
        if serializer.is_valid():
            updated_business = serializer.save()
            print(f"✓ Business updated successfully!")
            print(f"  - Name: {updated_business.business_name}")
            print(f"  - Description: {updated_business.description}")
        else:
            print(f"✗ Serializer validation failed: {serializer.errors}")
            return False
        
        # Test the view permissions
        print("\nTesting BusinessUpdateView permissions...")
        
        factory = APIRequestFactory()
        request = factory.put(f'/business/{business.id}/update/', update_data)
        force_authenticate(request, user=user)
        
        view = BusinessUpdateView.as_view()
        response = view(request, id=business.id)
        
        if response.status_code == 200:
            print("✓ BusinessUpdateView allows owner to update business")
        else:
            print(f"✗ BusinessUpdateView failed: {response.status_code}")
            return False
        
        # Test that non-owner cannot update
        other_user, created = User.objects.get_or_create(
            username='otheruser',
            defaults={
                'email': 'other@example.com',
                'first_name': 'Other',
                'last_name': 'User',
                'user_type': 'business'
            }
        )
        
        if created:
            other_user.set_password('testpass123')
            other_user.save()
        
        request = factory.put(f'/business/{business.id}/update/', update_data)
        force_authenticate(request, user=other_user)
        
        response = view(request, id=business.id)
        
        if response.status_code == 404:  # Should not find the business in their queryset
            print("✓ BusinessUpdateView correctly prevents non-owners from updating")
        else:
            print(f"✗ BusinessUpdateView security issue: {response.status_code}")
            return False
        
        print("\n🎉 All tests passed! Business update functionality is working correctly.")
        return True
        
    except Exception as e:
        print(f"✗ Test failed with error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    success = test_business_update()
    sys.exit(0 if success else 1)
