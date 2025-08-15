from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Business, Category, Review

User = get_user_model()

class ReviewValidationTests(APITestCase):
    def setUp(self):
        """Set up test data"""
        # Create test users
        self.business_owner = User.objects.create_user(
            partnership_number='OWNER001',
            email='owner@test.com',
            password='testpass123',
            first_name='John',
            last_name='Owner',
            user_type='business'
        )
        
        self.reviewer = User.objects.create_user(
            partnership_number='REVIEWER001',
            email='reviewer@test.com',
            password='testpass123',
            first_name='Jane',
            last_name='Reviewer',
            user_type='community'
        )
        
        # Create test category
        self.category = Category.objects.create(
            name='Test Category',
            description='Test category description'
        )
        
        # Create test business
        self.business = Business.objects.create(
            user=self.business_owner,
            business_name='Test Business',
            category=self.category,
            address='Test Address',
            city='Test City',
            county='Test County'
        )
        
        # Get tokens for authentication
        self.business_owner_token = str(RefreshToken.for_user(self.business_owner).access_token)
        self.reviewer_token = str(RefreshToken.for_user(self.reviewer).access_token)
    
    def test_business_owner_cannot_review_own_business(self):
        """Test that business owners cannot review their own business"""
        url = reverse('business-reviews', kwargs={'business_id': self.business.id})
        
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.business_owner_token}')
        
        data = {
            'rating': 5,
            'review_text': 'Great business!'
        }
        
        response = self.client.post(url, data, format='json')
        
        # Should get permission denied
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertIn('Business owners cannot review their own business', str(response.data))
    
    def test_user_can_review_other_business(self):
        """Test that regular users can review businesses they don't own"""
        url = reverse('business-reviews', kwargs={'business_id': self.business.id})
        
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.reviewer_token}')
        
        data = {
            'rating': 5,
            'review_text': 'Great business!'
        }
        
        response = self.client.post(url, data, format='json')
        
        # Should succeed
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Review.objects.count(), 1)
    
    def test_duplicate_review_prevention(self):
        """Test that users cannot create duplicate reviews for the same business"""
        url = reverse('business-reviews', kwargs={'business_id': self.business.id})
        
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.reviewer_token}')
        
        data = {
            'rating': 5,
            'review_text': 'Great business!'
        }
        
        # Create first review
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Try to create duplicate review - should get 400 (validation error from serializer)
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('already reviewed this business', str(response.data))
    
    def test_unauthenticated_user_cannot_review(self):
        """Test that unauthenticated users cannot create reviews"""
        url = reverse('business-reviews', kwargs={'business_id': self.business.id})
        
        data = {
            'rating': 5,
            'review_text': 'Great business!'
        }
        
        response = self.client.post(url, data, format='json')
        
        # Should get permission denied
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
