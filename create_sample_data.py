#!/usr/bin/env python3
"""
Script to create sample data for testing the FEM Family Business Directory API
"""

import os
import sys
import django

# Add the project directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings.dev')
django.setup()

from business.models import Category, Business
from user_auth.models import User
from django.contrib.auth import get_user_model

User = get_user_model()

def create_sample_data():
    print("Creating sample data for FEM Family Business Directory...")
    
    # Create sample categories
    categories_data = [
        'Food & Dining',
        'Health & Beauty',
        'Technology',
        'Fashion & Clothing',
        'Home & Garden',
        'Sports & Fitness',
        'Education',
        'Automotive',
        'Entertainment',
        'Professional Services'
    ]
    
    created_categories = []
    for cat_name in categories_data:
        category, created = Category.objects.get_or_create(name=cat_name)
        if created:
            print(f"✅ Created category: {cat_name}")
        else:
            print(f"ℹ️  Category already exists: {cat_name}")
        created_categories.append(category)
    
    # Create sample business user if it doesn't exist
    business_user, created = User.objects.get_or_create(
        partnership_number='BUS001',
        defaults={
            'first_name': 'Sample',
            'last_name': 'Business',
            'email': 'business@example.com',
            'user_type': 'business',
            'is_verified': True,
            'is_active': True
        }
    )
    
    if created:
        business_user.set_password('password123')
        business_user.save()
        print("✅ Created sample business user: BUS001")
    else:
        print("ℹ️  Sample business user already exists: BUS001")
    
    # Create sample businesses
    sample_businesses = [
        {
            'business_name': 'Sample Restaurant',
            'description': 'A delicious restaurant serving local and international cuisine',
            'address': '123 Sample Street, Nairobi',
            'city': 'Nairobi',
            'phone': '+254700000001',
            'email': 'restaurant@example.com',
            'rating': 4.5,
            'review_count': 25,
            'is_verified': True,
            'is_active': True,
            'is_featured': True
        },
        {
            'business_name': 'Tech Solutions Ltd',
            'description': 'Professional technology solutions for businesses',
            'address': '456 Tech Avenue, Mombasa',
            'city': 'Mombasa',
            'phone': '+254700000002',
            'email': 'tech@example.com',
            'rating': 4.8,
            'review_count': 42,
            'is_verified': True,
            'is_active': True,
            'is_featured': True
        },
        {
            'business_name': 'Beauty Salon & Spa',
            'description': 'Premium beauty and wellness services',
            'address': '789 Beauty Lane, Kisumu',
            'city': 'Kisumu',
            'phone': '+254700000003',
            'email': 'beauty@example.com',
            'rating': 4.2,
            'review_count': 18,
            'is_verified': True,
            'is_active': True,
            'is_featured': False
        },
        {
            'business_name': 'Fashion Boutique',
            'description': 'Trendy fashion items for all ages',
            'address': '321 Fashion Road, Nakuru',
            'city': 'Nakuru',
            'phone': '+254700000004',
            'email': 'fashion@example.com',
            'rating': 4.0,
            'review_count': 15,
            'is_verified': True,
            'is_active': True,
            'is_featured': False
        },
        {
            'business_name': 'Home & Garden Center',
            'description': 'Everything you need for your home and garden',
            'address': '654 Garden Street, Eldoret',
            'city': 'Eldoret',
            'phone': '+254700000005',
            'email': 'garden@example.com',
            'rating': 4.3,
            'review_count': 22,
            'is_verified': True,
            'is_active': True,
            'is_featured': True
        }
    ]
    
    for i, business_data in enumerate(sample_businesses):
        # Use different categories for variety
        category = created_categories[i % len(created_categories)]
        
        business, created = Business.objects.get_or_create(
            business_name=business_data['business_name'],
            defaults={
                'user': business_user,
                'category': category,
                'description': business_data['description'],
                'address': business_data['address'],
                'city': business_data['city'],
                'phone': business_data['phone'],
                'email': business_data['email'],
                'rating': business_data['rating'],
                'review_count': business_data['review_count'],
                'is_verified': business_data['is_verified'],
                'is_active': business_data['is_active'],
                'is_featured': business_data['is_featured']
            }
        )
        
        if created:
            print(f"✅ Created business: {business_data['business_name']}")
        else:
            print(f"ℹ️  Business already exists: {business_data['business_name']}")
    
    print("\n🎉 Sample data creation completed!")
    print(f"📊 Created {len(created_categories)} categories")
    print(f"🏢 Created {len(sample_businesses)} businesses")
    print("\n🔗 Test your API endpoints:")
    print("   - Businesses: http://localhost:8000/api/business/")
    print("   - Categories: http://localhost:8000/api/business/categories/")
    print("   - Admin Panel: http://localhost:8000/admin/")

if __name__ == "__main__":
    create_sample_data() 