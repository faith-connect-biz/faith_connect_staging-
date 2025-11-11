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
            address='123 Test Street',
            city='Nairobi',
            country='Kenya'
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
        
        # Try to create duplicate review
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('already reviewed', str(response.data))
    
    def test_unauthenticated_user_cannot_create_review(self):
        """Test that unauthenticated users cannot create reviews"""
        url = reverse('business-reviews', kwargs={'business_id': self.business.id})
        
        # Clear any existing credentials
        self.client.credentials()
        
        data = {
            'rating': 5,
            'review_text': 'Great business!'
        }
        
        response = self.client.post(url, data, format='json')
        
        # Should get unauthorized
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_unauthenticated_user_can_view_reviews(self):
        """Test that unauthenticated users can view reviews"""
        # First create a review with an authenticated user
        url = reverse('business-reviews', kwargs={'business_id': self.business.id})
        
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.reviewer_token}')
        
        data = {
            'rating': 5,
            'review_text': 'Great business!'
        }
        
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Set the review as verified so unauthenticated users can see it
        review = Review.objects.get(business=self.business, user=self.reviewer)
        review.is_verified = True
        review.save()
        
        # Now test that unauthenticated user can view reviews
        self.client.credentials()  # Clear credentials
        
        response = self.client.get(url)
        
        # Should succeed
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)  # Assuming pagination
