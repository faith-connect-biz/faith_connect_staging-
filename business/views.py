from django.core.exceptions import ObjectDoesNotExist, PermissionDenied
import logging
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import generics, filters
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from django.shortcuts import get_object_or_404
from django.db import transaction, models
from django.utils import timezone
from django.http import Http404
from datetime import datetime, timedelta
import json
import os
import uuid
import boto3
from botocore.exceptions import ClientError
from django.conf import settings
from django.core.mail import send_mail
from django.template.loader import render_to_string
import requests
from django.core.cache import cache

# Local imports
from .models import (
    Business, Category, Favorite, Product, Review, BusinessHour,
    Service, PhotoRequest, BusinessLike, ReviewLike, ServiceReview, ProductReview, FEMChurch
)
from .serializers import (
    BusinessSerializer, BusinessListSerializer, CategorySerializer, FavoriteSerializer, 
    ProductSerializer, ReviewSerializer, BusinessHourSerializer,
    ServiceSerializer, PhotoRequestSerializer, BusinessLikeSerializer, 
    ReviewLikeSerializer, ServiceReviewSerializer, ProductReviewSerializer
)
from user_auth.utils import success_response, error_response
from user_auth.models import User
from utils.s3_service import S3Service
from core.pagination import CustomLimitOffsetPagination
from .filters import BusinessFilter
from .permissions import CanCreateReviewPermission, CanCreateServiceReviewPermission, CanCreateProductReviewPermission


logger = logging.getLogger('business')

# Create your views here.


class BusinessDetailAPIView(generics.RetrieveAPIView):
    permission_classes = [AllowAny]  # Allow public access to view business details
    serializer_class = BusinessSerializer
    queryset = Business.objects.filter(is_active=True).select_related('category', 'user')
    lookup_field = 'id'




class BusinessListCreateAPIView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]  # Require authentication for both list and create
    queryset = Business.objects.filter(is_active=True).select_related('category', 'user').order_by('-created_at')

    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = BusinessFilter
    search_fields = ['business_name', 'description', 'city']
    ordering_fields = ['created_at', 'rating']
    
    # Add pagination
    pagination_class = CustomLimitOffsetPagination

    def get_permissions(self):
        """Allow public access to list businesses, but require auth for creation"""
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_serializer_class(self):
        """Use different serializers for list vs create"""
        if self.request.method == 'GET':
            return BusinessListSerializer  # Lightweight for listing
        return BusinessSerializer  # Full serializer for creation


    def get_serializer_context(self):
        return {"request": self.request}

    def create(self, request, *args, **kwargs):
        # Check if user is authenticated for creation
        if not request.user.is_authenticated:
            logger.warning(f"[BUSINESS CREATE DENIED] unauthenticated user")
            return error_response(
                "Authentication required to create a business.",
                status_code=status.HTTP_401_UNAUTHORIZED
            )
        
        user = request.user
        if user.user_type != 'business':
            logger.warning(f"[BUSINESS CREATE DENIED] user_id={user.id} type={user.user_type}")
            return error_response(
                "Only business users can create a business.",
                status_code=status.HTTP_403_FORBIDDEN
            )

        # Remove 'user' if it exists in request.data to avoid conflict
        data = request.data.copy()
        data.pop('user', None)

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        business = serializer.save(user=user)
        logger.info(f"[BUSINESS CREATED] user_id={user.id} business_id={business.id}")
        return success_response("Business created successfully",
                                BusinessSerializer(business, context=self.get_serializer_context()).data)


class BusinessRegistrationStep1APIView(APIView):
    """API endpoint for Step 1 of business registration - Basic business information"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """Create business with basic information from Step 1"""
        try:
            user = request.user
            
            # Validate user type
            if user.user_type != 'business':
                return error_response(
                    "Only business users can create a business.",
                    status_code=status.HTTP_403_FORBIDDEN
                )
            
            # Validate required fields for Step 1
            required_fields = ['business_name', 'category_id', 'description', 'address', 'business_type']
            missing_fields = [field for field in required_fields if not request.data.get(field)]
            
            if missing_fields:
                return error_response(
                    f"Missing required fields: {', '.join(missing_fields)}",
                    status_code=status.HTTP_400_BAD_REQUEST
                )
            
            # Validate business_type
            business_type = request.data.get('business_type')
            if business_type not in ['products', 'services', 'both']:
                return error_response(
                    "Invalid business_type. Must be 'products', 'services', or 'both'",
                    status_code=status.HTTP_400_BAD_REQUEST
                )
            
            # Check if user already has a business
            existing_business = Business.objects.filter(user=user, is_active=True).first()
            if existing_business:
                return error_response(
                    "User already has an active business. Use update endpoint instead.",
                    status_code=status.HTTP_400_BAD_REQUEST
                )
            
            # Create business with basic information
            business_data = {
                'business_name': request.data.get('business_name'),
                'category_id': request.data.get('category_id'),
                'description': request.data.get('description'),
                'address': request.data.get('address'),
                'business_type': business_type,
                'city': request.data.get('city', ''),
                'country': request.data.get('country', 'Kenya'),
                'fem_church_id': request.data.get('fem_church_id')
            }
            
            # Validate category exists
            try:
                category = Category.objects.get(id=business_data['category_id'])
            except Category.DoesNotExist:
                return error_response(
                    f"Category with ID {business_data['category_id']} not found.",
                    status_code=status.HTTP_400_BAD_REQUEST
                )
            
            # Create business
            business = Business.objects.create(
                user=user,
                category=category,
                business_name=business_data['business_name'],
                description=business_data['description'],
                address=business_data['address'],
                business_type=business_data['business_type'],
                city=business_data['city'],
                country=business_data['country']
            )
            
            # Set FEM Church if provided
            if business_data['fem_church_id']:
                try:
                    fem_church = FEMChurch.objects.get(id=business_data['fem_church_id'])
                    business.fem_church = fem_church
                    business.save()
                except FEMChurch.DoesNotExist:
                    # Log warning but don't fail the creation
                    logger.warning(f"FEM Church with ID {business_data['fem_church_id']} not found")
            
            logger.info(f"[BUSINESS STEP 1 CREATED] user_id={user.id} business_id={business.id}")
            
            # Return business data with minimal fields for Step 2
            return success_response(
                "Business basic information created successfully",
                {
                    'id': str(business.id),
                    'business_name': business.business_name,
                    'business_type': business.business_type,
                    'category': business.category.name if business.category else None,
                    'step': 1,
                    'next_step': 2
                }
            )
            
        except Exception as e:
            logger.error(f"[BUSINESS STEP 1 ERROR] user_id={request.user.id} error={str(e)}")
            return error_response(
                f"Failed to create business: {str(e)}",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class BusinessRegistrationStep2APIView(APIView):
    """API endpoint for Step 2 of business registration - Profile completion"""
    permission_classes = [IsAuthenticated]
    
    def put(self, request, business_id):
        """Update business with profile completion information from Step 2"""
        try:
            user = request.user
            
            # Get business and verify ownership
            try:
                business = Business.objects.get(id=business_id, user=user, is_active=True)
            except Business.DoesNotExist:
                return error_response(
                    "Business not found or access denied.",
                    status_code=status.HTTP_404_NOT_FOUND
                )
            
            # Update business fields from Step 2
            update_fields = [
                'phone', 'email', 'website', 'long_description',
                'facebook_url', 'instagram_url', 'twitter_url', 'youtube_url'
            ]
            
            for field in update_fields:
                if field in request.data:
                    setattr(business, field, request.data[field])
            
            # Handle business hours if provided
            if 'hours' in request.data:
                hours_data = request.data['hours']
                # Clear existing hours
                BusinessHour.objects.filter(business=business).delete()
                
                # Create new hours
                for hour_data in hours_data:
                    day_of_week = hour_data.get('day_of_week')
                    open_time = hour_data.get('open_time')
                    close_time = hour_data.get('close_time')
                    is_closed = hour_data.get('is_closed', False)
                    
                    if day_of_week is not None:
                        BusinessHour.objects.create(
                            business=business,
                            day_of_week=day_of_week,
                            open_time=open_time if not is_closed else None,
                            close_time=close_time if not is_closed else None,
                            is_closed=is_closed
                        )
            
            # Handle services if provided
            if 'services' in request.data:
                services_data = request.data['services']
                # Clear existing services
                Service.objects.filter(business=business).delete()
                
                # Create new services
                for service_data in services_data:
                    if isinstance(service_data, dict) and service_data.get('name'):
                        Service.objects.create(
                            business=business,
                            name=service_data['name'],
                            description=service_data.get('description', ''),
                            price_range=service_data.get('price_range', ''),
                            duration=service_data.get('duration', ''),
                            service_image_url=service_data.get('service_image_url', ''),
                            is_active=True
                        )
            
            # Handle products if provided
            if 'products' in request.data:
                products_data = request.data['products']
                # Clear existing products
                Product.objects.filter(business=business).delete()
                
                # Create new products
                for product_data in products_data:
                    if isinstance(product_data, dict) and product_data.get('name') and product_data.get('price'):
                        Product.objects.create(
                            business=business,
                            name=product_data['name'],
                            description=product_data.get('description', ''),
                            price=product_data['price'],
                            price_currency=product_data.get('price_currency', 'KSH'),
                            product_image_url=product_data.get('product_image_url', ''),
                            is_active=True,
                            in_stock=True
                        )
            
            business.save()
            
            logger.info(f"[BUSINESS STEP 2 COMPLETED] user_id={user.id} business_id={business.id}")
            
            # Return updated business data
            serializer = BusinessSerializer(business, context={'request': request})
            return success_response(
                "Business profile completed successfully",
                {
                    'id': str(business.id),
                    'business_name': business.business_name,
                    'step': 2,
                    'completed': True,
                    'business': serializer.data
                }
            )
            
        except Exception as e:
            logger.error(f"[BUSINESS STEP 2 ERROR] user_id={request.user.id} business_id={business_id} error={str(e)}")
            return error_response(
                f"Failed to complete business profile: {str(e)}",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class BusinessUpdateView(generics.UpdateAPIView):
    queryset = Business.objects.all()
    serializer_class = BusinessSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'id'

    def get_queryset(self):
        """Only allow users to update their own business"""
        return Business.objects.filter(user=self.request.user)

    def perform_update(self, serializer):
        """Ensure the business belongs to the current user"""
        business = serializer.instance
        if business.user != self.request.user:
            logger.warning(f"[BUSINESS UPDATE DENIED] user_id={self.request.user.id} business_id={business.id}")
            raise PermissionDenied("You can only update your own business")
        serializer.save()
        logger.info(f"[BUSINESS UPDATED] user_id={self.request.user.id} business_id={business.id}")

class CategoryListAPIView(generics.ListAPIView):
    queryset = Category.objects.all().order_by('name')
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]  # Allow public access to list categories
    pagination_class = None  # Disable pagination for categories to show all 17


class FEMChurchListAPIView(generics.ListAPIView):
    """List all FEM Churches for business registration"""
    queryset = FEMChurch.objects.filter(is_active=True).order_by('sort_order', 'name')
    permission_classes = [AllowAny]  # Allow public access to list churches
    pagination_class = None
    
    def list(self, request, *args, **kwargs):
        churches = self.get_queryset()
        church_data = []
        for church in churches:
            church_data.append({
                'id': church.id,
                'name': church.name,
                'location': church.location,
                'city': church.city,
                'country': church.country
            })
        
        return Response({
            'success': True,
            'data': church_data
        })


# class GenerateSASToken(APIView):
#     permission_classes = [IsAuthenticated]
#
#     def post(self, request):
#         try:
#             filename = request.data.get('filename', 'business.jpg')
#             blob_name = f"business_images/{uuid.uuid4()}_{filename}"
#
#             sas_token = generate_blob_sas(
#                 account_name=settings.AZURE_ACCOUNT_NAME,
#                 container_name=settings.AZURE_CONTAINER_NAME,
#                 blob_name=blob_name,
#                 account_key=settings.AZURE_ACCOUNT_KEY,
#                 permission=BlobSasPermissions(write=True),
#                 expiry=datetime.utcnow() + timedelta(minutes=15)
#             )
#
#             upload_url = f"https://{settings.AZURE_ACCOUNT_NAME}.blob.core.windows.net/{settings.AZURE_CONTAINER_NAME}/{urllib.parse.quote(blob_name)}?{sas_token}"
#             blob_url = upload_url.split('?')[0]
#
#             return Response({
#                 "upload_url": upload_url,
#                 "blob_url": blob_url
#             })
#         except Exception as e:
#             return Response({"detail": str(e)}, status=500)


class UserFavoritesListView(generics.ListAPIView):
    serializer_class = FavoriteSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = CustomLimitOffsetPagination

    def get_queryset(self):
        return Favorite.objects.filter(user=self.request.user)

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            logger.info(f"[FAVORITES LIST] user_id={request.user.id} count={len(serializer.data)}")
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True)
        logger.info(f"[FAVORITES LIST] user_id={request.user.id} count={len(serializer.data)}")
        return Response(serializer.data)


class FavoriteToggleView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, id):
        user = request.user
        try:
            business = Business.objects.get(id=id)
        except ObjectDoesNotExist:
            logger.warning(f"[FAVORITE ADD FAILED] user_id={user.id} business_id={id} not_found")
            return error_response("Business not found", status_code=status.HTTP_404_NOT_FOUND)

        favorite, created = Favorite.objects.get_or_create(user=user, business=business)
        if not created:
            logger.info(f"[FAVORITE EXISTS] user_id={user.id} business_id={business.id}")
            return error_response("Business already favorited")
        logger.info(f"[FAVORITE ADDED] user_id={user.id} business_id={business.id}")
        return success_response("Business favorited successfully", status_code=status.HTTP_201_CREATED)

    def delete(self, request, id):
        user = request.user
        try:
            favorite = Favorite.objects.get(user=user, business__id=id)
            favorite.delete()
            logger.info(f"[FAVORITE REMOVED] user_id={user.id} business_id={id}")
            return success_response("Favorite removed successfully", status_code=status.HTTP_204_NO_CONTENT)
        except ObjectDoesNotExist:
            logger.warning(f"[FAVORITE REMOVE FAILED] user_id={user.id} business_id={id} not_found")
            return error_response("Favorite not found", status_code=status.HTTP_404_NOT_FOUND)

# List and Create products
class BusinessProductListCreateView(generics.ListCreateAPIView):
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated]  # Require authentication for both list and create
    filter_backends = [filters.SearchFilter, filters.OrderingFilter, DjangoFilterBackend]
    search_fields = ['name', 'description']
    ordering_fields = ['price', 'created_at']
    filterset_fields = ['in_stock', 'price_currency']
    pagination_class = CustomLimitOffsetPagination

    def get_permissions(self):
        """Allow public access to list products, but require auth for creation"""
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_queryset(self):
        business_id = self.kwargs.get('business_id')
        return Product.objects.filter(business_id=business_id, is_active=True)

    def perform_create(self, serializer):
        # Check if user is authenticated for creation
        if not self.request.user.is_authenticated:
            raise PermissionDenied("Authentication required to create a product.")
        
        business_id = self.kwargs.get('business_id')
        try:
            business = Business.objects.get(id=business_id)
        except ObjectDoesNotExist:
            raise PermissionDenied("Business not found")

        product = serializer.save(business=business)
        logger.info(f"[PRODUCT CREATED] user_id={self.request.user.id} business_id={business_id} product_id={product.id}")


class ProductRetrieveUpdateDeleteView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Product.objects.filter(is_active=True)
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]  # Allow public access to view products, but require auth for updates
    lookup_field = 'id'

    def perform_update(self, serializer):
        # Check if user is authenticated for updates
        if not self.request.user.is_authenticated:
            raise PermissionDenied("Authentication required to update a product.")
        
        product = self.get_object()
        if product.business.user != self.request.user:
            logger.warning(f"[PRODUCT UPDATE DENIED] user_id={self.request.user.id} product_id={product.id}")
            raise PermissionDenied("Only the owner can update this product")
        serializer.save()
        logger.info(f"[PRODUCT UPDATED] user_id={self.request.user.id} product_id={product.id}")

    def perform_destroy(self, instance):
        """Ensure the product belongs to the current user's business before deletion"""
        if instance.business.user != self.request.user:
            logger.warning(f"[PRODUCT DELETE DENIED] user_id={self.request.user.id} product_id={instance.id}")
            raise PermissionDenied("You can only delete products for your own business")
        instance.delete()
        logger.info(f"[PRODUCT DELETED] user_id={self.request.user.id} product_id={instance.id}")

class ReviewListCreateView(generics.ListCreateAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [CanCreateReviewPermission]
    pagination_class = CustomLimitOffsetPagination

    def get_queryset(self):
        business_id = self.kwargs.get('business_id')
        
        # Check if business exists
        try:
            business = Business.objects.get(id=business_id)
        except Business.DoesNotExist:
            # Return empty queryset but don't raise error for GET requests
            return Review.objects.none()
        except Exception as e:
            # Log any other errors but don't crash
            return Review.objects.none()
        
        # All users can see all reviews for the business
        reviews = Review.objects.filter(business_id=business_id)
        
        return reviews

    def perform_create(self, serializer):
        business_id = self.kwargs.get('business_id')
        
        # Get the business to check ownership
        try:
            business = Business.objects.get(id=business_id)
        except Business.DoesNotExist:
            raise PermissionDenied("Business not found.")
        
        # Check for existing review (this is now protected by database unique constraint)
        # but we keep the check for better user experience
        if Review.objects.filter(business_id=business_id, user=self.request.user).exists():
            raise PermissionDenied("You've already reviewed this business.")
        
        # Save the review - the unique constraint will prevent duplicates at DB level
        serializer.save(
            business_id=business_id,
            user=self.request.user
        )
    
    def get_serializer_context(self):
        """Add business_id to serializer context for validation"""
        context = super().get_serializer_context()
        context['business_id'] = self.kwargs.get('business_id')
        return context


class ReviewUpdateDeleteView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Review.objects.filter(user=self.request.user, business_id=self.kwargs.get('business_id'))

    def perform_update(self, serializer):
        review = self.get_object()
        if review.user != self.request.user:
            raise PermissionDenied("You can only update your own review.")
        serializer.save()

    def perform_destroy(self, instance):
        if instance.user != self.request.user:
            raise PermissionDenied("You can only delete your own review.")
        instance.delete()
    
    def get_serializer_context(self):
        """Add business_id to serializer context for validation"""
        context = super().get_serializer_context()
        context['business_id'] = self.kwargs.get('business_id')
        return context


class ServiceReviewListCreateView(generics.ListCreateAPIView):
    serializer_class = ServiceReviewSerializer
    permission_classes = [CanCreateServiceReviewPermission]
    pagination_class = CustomLimitOffsetPagination

    def get_queryset(self):
        service_id = self.kwargs.get('service_id')
        
        # Check if service exists
        try:
            service = Service.objects.get(id=service_id)
        except Service.DoesNotExist:
            # Return empty queryset but don't raise error for GET requests
            return ServiceReview.objects.none()
        except Exception as e:
            # Log any other errors but don't crash
            return ServiceReview.objects.none()
        
        # All users can see all reviews for the service
        reviews = ServiceReview.objects.filter(service_id=service_id)
        
        return reviews

    def perform_create(self, serializer):
        service_id = self.kwargs.get('service_id')
        
        # Get the service to check ownership
        try:
            service = Service.objects.get(id=service_id)
        except Service.DoesNotExist:
            raise PermissionDenied("Service not found.")
        
        # Check for existing review
        if ServiceReview.objects.filter(service_id=service_id, user=self.request.user).exists():
            raise PermissionDenied("You've already reviewed this service.")
        
        # Save the review
        serializer.save(
            service_id=service_id,
            user=self.request.user
        )
    
    def get_serializer_context(self):
        """Add service_id to serializer context for validation"""
        context = super().get_serializer_context()
        context['service_id'] = self.kwargs.get('service_id')
        return context


class ServiceReviewUpdateDeleteView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ServiceReviewSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ServiceReview.objects.filter(user=self.request.user, service_id=self.kwargs.get('service_id'))

    def perform_update(self, serializer):
        review = self.get_object()
        if review.user != self.request.user:
            raise PermissionDenied("You can only update your own review.")
        serializer.save()

    def perform_destroy(self, instance):
        if instance.user != self.request.user:
            raise PermissionDenied("You can only delete your own review.")
        instance.delete()
    
    def get_serializer_context(self):
        """Add service_id to serializer context for validation"""
        context = super().get_serializer_context()
        context['service_id'] = self.kwargs.get('service_id')
        return context


class ProductReviewListCreateView(generics.ListCreateAPIView):
    serializer_class = ProductReviewSerializer
    permission_classes = [CanCreateProductReviewPermission]
    pagination_class = CustomLimitOffsetPagination

    def get_queryset(self):
        product_id = self.kwargs.get('product_id')
        
        # Check if product exists
        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            # Return empty queryset but don't raise error for GET requests
            return ProductReview.objects.none()
        except Exception as e:
            # Log any other errors but don't crash
            return ProductReview.objects.none()
        
        # All users can see all reviews for the product
        reviews = ProductReview.objects.filter(product_id=product_id)
        
        return reviews

    def perform_create(self, serializer):
        product_id = self.kwargs.get('product_id')
        
        # Get the product to check ownership
        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            raise PermissionDenied("Product not found.")
        
        # Check for existing review
        if ProductReview.objects.filter(product_id=product_id, user=self.request.user).exists():
            raise PermissionDenied("You've already reviewed this product.")
        
        # Save the review
        serializer.save(
            product_id=product_id,
            user=self.request.user
        )
    
    def get_serializer_context(self):
        """Add product_id to serializer context for validation"""
        context = super().get_serializer_context()
        context['product_id'] = self.kwargs.get('product_id')
        return context


class ProductReviewUpdateDeleteView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ProductReviewSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ProductReview.objects.filter(user=self.request.user, product_id=self.kwargs.get('product_id'))

    def perform_update(self, serializer):
        review = self.get_object()
        if review.user != self.request.user:
            raise PermissionDenied("You can only update your own review.")
        serializer.save()

    def perform_destroy(self, instance):
        if instance.user != self.request.user:
            raise PermissionDenied("You can only delete your own review.")
        instance.delete()
    
    def get_serializer_context(self):
        """Add product_id to serializer context for validation"""
        context = super().get_serializer_context()
        context['product_id'] = self.kwargs.get('product_id')
        return context


class BusinessHoursView(APIView):
    """Handle business hours CRUD operations"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request, business_id):
        """Get business hours for a specific business"""
        try:
            business = get_object_or_404(Business, id=business_id)
            hours = BusinessHour.objects.filter(business=business)
            serializer = BusinessHourSerializer(hours, many=True)
            return Response({
                'success': True,
                'data': serializer.data
            })
        except Exception as e:
            return Response({
                'success': False,
                'message': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
    
    def post(self, request, business_id):
        """Create or update business hours for a business"""
        try:
            business = get_object_or_404(Business, id=business_id)
            
            # Check if user owns this business
            if business.user != request.user:
                return Response({
                    'success': False,
                    'message': 'You can only manage hours for your own business'
                }, status=status.HTTP_403_FORBIDDEN)
            
            hours_data = request.data.get('hours', [])
            
            with transaction.atomic():
                # Delete existing hours for this business
                BusinessHour.objects.filter(business=business).delete()
                
                # Create new hours
                for hour_data in hours_data:
                    day_of_week = hour_data.get('day_of_week')
                    open_time = hour_data.get('open_time')
                    close_time = hour_data.get('close_time')
                    is_closed = hour_data.get('is_closed', False)
                    
                    if is_closed:
                        open_time = None
                        close_time = None
                    
                    BusinessHour.objects.create(
                        business=business,
                        day_of_week=day_of_week,
                        open_time=open_time,
                        close_time=close_time,
                        is_closed=is_closed
                    )
            
            # Return updated hours
            hours = BusinessHour.objects.filter(business=business)
            serializer = BusinessHourSerializer(hours, many=True)
            
            return Response({
                'success': True,
                'message': 'Business hours updated successfully',
                'data': serializer.data
            })
            
        except Exception as e:
            return Response({
                'success': False,
                'message': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)


class BusinessImageUploadView(APIView):
    """Handle business image and logo uploads using S3 pre-signed URLs"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request, business_id):
        """Get a pre-signed URL for uploading business image or logo"""
        try:
            business = get_object_or_404(Business, id=business_id)
            
            # Check if user owns this business
            if business.user != request.user:
                return Response({
                    'success': False,
                    'message': 'You can only upload images for your own business'
                }, status=status.HTTP_403_FORBIDDEN)
            
            image_type = request.data.get('image_type')  # 'image' or 'logo'
            file_name = request.data.get('file_name', '')
            content_type = request.data.get('content_type', 'image/jpeg')
            
            if not image_type:
                return Response({
                    'success': False,
                    'message': 'Image type is required (use "image" or "logo")'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Generate file key for S3
            if image_type == 'logo':
                folder = 'business_logos'
            else:
                folder = 'business_images'
            
            # Generate unique filename
            import uuid
            file_extension = content_type.split('/')[-1] if '/' in content_type else 'jpg'
            file_key = f"{folder}/{business_id}/{uuid.uuid4()}.{file_extension}"
            
            # Generate pre-signed URL
            s3_service = S3Service()
            result = s3_service.generate_presigned_upload_url(
                file_key=file_key,
                content_type=content_type,
                expiration_minutes=5
            )
            
            if not result['success']:
                return Response({
                    'success': False,
                    'message': f'Failed to generate upload URL: {result["error"]}'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            return Response({
                'success': True,
                'message': f'Upload URL generated for {image_type}',
                'data': {
                    'presigned_url': result['presigned_url'],
                    'file_key': result['file_key'],
                    'expires_in_minutes': result['expires_in_minutes'],
                    'image_type': image_type
                }
            })
            
        except Exception as e:
            return Response({
                'success': False,
                'message': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, business_id):
        """Update business with the uploaded image URL"""
        try:
            business = get_object_or_404(Business, id=business_id)
            
            # Check if user owns this business
            if business.user != request.user:
                return Response({
                    'success': False,
                    'message': 'You can only update images for your own business'
                }, status=status.HTTP_403_FORBIDDEN)
            
            image_type = request.data.get('image_type')
            file_key = request.data.get('file_key')
            
            if not image_type or not file_key:
                return Response({
                    'success': False,
                    'message': 'Image type and file key are required'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Get the S3 URL for the uploaded file
            s3_service = S3Service()
            s3_url = s3_service.get_file_url(file_key)
            
            # Update the business model
            if image_type == 'logo':
                business.business_logo_url = s3_url
            elif image_type == 'image':
                business.business_image_url = s3_url
            else:
                return Response({
                    'success': False,
                    'message': 'Invalid image type. Use "image" or "logo"'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            business.save()
            
            return Response({
                'success': True,
                'message': f'Business {image_type} updated successfully',
                'data': {
                    'business_image_url': business.business_image_url,
                    'business_logo_url': business.business_logo_url,
                    's3_url': s3_url
                }
            })
            
        except Exception as e:
            return Response({
                'success': False,
                'message': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)


# Service Image Upload Endpoints
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def get_service_image_upload_url(request, service_id):
    """Get pre-signed URL for service image upload"""
    try:
        service = get_object_or_404(Service, id=service_id)
        
        # Check if user owns the business
        if service.business.user != request.user:
            return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
        
        # Get file info from request
        file_name = request.data.get('file_name')
        content_type = request.data.get('content_type')
        image_type = request.data.get('image_type', 'main')  # 'main' or 'additional'
        
        if not file_name or not content_type:
            return Response({'error': 'file_name and content_type are required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Generate unique file key
        file_extension = file_name.split('.')[-1]
        file_key = f"services/{service.business.id}/{service.id}/{image_type}_{uuid.uuid4()}.{file_extension}"
        
        # Generate pre-signed URL
        s3_client = boto3.client(
            's3',
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_S3_REGION_NAME
        )
        
        presigned_url = s3_client.generate_presigned_url(
            'put_object',
            Params={
                'Bucket': settings.AWS_STORAGE_BUCKET_NAME,
                'Key': file_key,
                'ContentType': content_type
            },
            ExpiresIn=3600  # 1 hour
        )
        
        return Response({
            'presigned_url': presigned_url,
            'file_key': file_key,
            'expires_in_minutes': 60,
            'image_type': image_type
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_service_image(request, service_id):
    """Update service with uploaded image"""
    try:
        service = get_object_or_404(Service, id=service_id)
        
        # Check if user owns the business
        if service.business.user != request.user:
            return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
        
        file_key = request.data.get('file_key')
        image_type = request.data.get('image_type', 'main')
        
        if not file_key:
            return Response({'error': 'file_key is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Generate direct S3 URL (more reliable than CloudFront)
        s3_url = f"https://{settings.AWS_STORAGE_BUCKET_NAME}.s3.{settings.AWS_S3_REGION_NAME}.amazonaws.com/{file_key}"
        
        # Update service image
        if image_type == 'main':
            service.service_image_url = s3_url
        elif image_type == 'additional':
            if not service.images:
                service.images = []
            service.images.append(s3_url)
            # Keep only last 10 images
            if len(service.images) > 10:
                service.images = service.images[-10:]
        
        service.save()
        
        return Response({
            'service_image_url': service.service_image_url,
            'images': service.images,
            's3_url': s3_url,
            'message': 'Service image updated successfully'
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Product Image Upload Endpoints
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def get_product_image_upload_url(request, product_id):
    """Get pre-signed URL for product image upload"""
    try:
        product = get_object_or_404(Product, id=product_id)
        
        # Check if user owns the business
        if product.business.user != request.user:
            return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
        
        # Get file info from request
        file_name = request.data.get('file_name')
        content_type = request.data.get('content_type')
        image_type = request.data.get('image_type', 'main')  # 'main' or 'additional'
        
        if not file_name or not content_type:
            return Response({'error': 'file_name and content_type are required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Generate unique file key
        file_extension = file_name.split('.')[-1]
        file_key = f"products/{product.business.id}/{product.id}/{image_type}_{uuid.uuid4()}.{file_extension}"
        
        # Generate pre-signed URL
        s3_client = boto3.client(
            's3',
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_S3_REGION_NAME
        )
        
        presigned_url = s3_client.generate_presigned_url(
            'put_object',
            Params={
                'Bucket': settings.AWS_STORAGE_BUCKET_NAME,
                'Key': file_key,
                'ContentType': content_type
            },
            ExpiresIn=3600  # 1 hour
        )
        
        return Response({
            'presigned_url': presigned_url,
            'file_key': file_key,
            'expires_in_minutes': 60,
            'image_type': image_type
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_product_image(request, product_id):
    """Update product with uploaded image"""
    try:
        product = get_object_or_404(Product, id=product_id)
        
        # Check if user owns the business
        if product.business.user != request.user:
            return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
        
        file_key = request.data.get('file_key')
        image_type = request.data.get('image_type', 'main')
        
        if not file_key:
            return Response({'error': 'file_key is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Generate direct S3 URL (more reliable than CloudFront)
        s3_url = f"https://{settings.AWS_STORAGE_BUCKET_NAME}.s3.{settings.AWS_S3_REGION_NAME}.amazonaws.com/{file_key}"
        
        # Update product image
        if image_type == 'main':
            product.product_image_url = s3_url
        elif image_type == 'additional':
            if not product.images:
                product.images = []
            product.images.append(s3_url)
            # Keep only last 10 images
            if len(product.images) > 10:
                product.images = product.images[-10:]
        
        product.save()
        
        return Response({
            'product_image_url': product.product_image_url,
            'images': product.images,
            's3_url': s3_url,
            'message': 'Product image updated successfully'
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UserBusinessView(generics.RetrieveAPIView):
    """Get business for a specific user"""
    serializer_class = BusinessSerializer
    permission_classes = [AllowAny]  # Allow public access to view user business
    
    def get_object(self):
        user_id = self.kwargs.get('user_id')
        business = Business.objects.filter(
            user_id=user_id,
            is_active=True
        ).select_related('category', 'user').order_by('-created_at').first()
        
        if not business:
            raise Http404(f"No active business found for user {user_id}")
        
        return business


class MyBusinessView(generics.RetrieveAPIView):
    """Get current user's business"""
    serializer_class = BusinessSerializer
    permission_classes = [IsAuthenticated]  # Require authentication
    
    def get_object(self):
        user = self.request.user
        business = Business.objects.filter(
            user=user,
            is_active=True
        ).select_related('category', 'user').order_by('-created_at').first()
        
        if not business:
            raise Http404("No active business found for current user")
        
        return business
    
    def get(self, request, *args, **kwargs):
        try:
            business = self.get_object()
            serializer = self.get_serializer(business)
            return Response({
                'success': True,
                'data': serializer.data
            })
        except Http404:
            return Response({
                'success': False,
                'message': 'No active business found for current user',
                'data': None
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'success': False,
                'message': str(e),
                'data': None
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class BusinessServiceListCreateView(generics.ListCreateAPIView):
    """List and create services for a business"""
    serializer_class = ServiceSerializer
    permission_classes = [IsAuthenticated]  # Require authentication for both list and create
    pagination_class = CustomLimitOffsetPagination
    
    def get_permissions(self):
        """Allow public access to list services, but require auth for creation"""
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAuthenticated()]
    
    def get_queryset(self):
        business_id = self.kwargs.get('business_id')
        return Service.objects.filter(business_id=business_id, is_active=True)
    
    def perform_create(self, serializer):
        # Check if user is authenticated for creation
        if not self.request.user.is_authenticated:
            raise PermissionDenied("Authentication required to create a service.")
        
        business_id = self.kwargs.get('business_id')
        try:
            business = Business.objects.get(id=business_id)
        except ObjectDoesNotExist:
            raise PermissionDenied("Business not found")
        
        serializer.save(business=business)


class BusinessAnalyticsView(APIView):
    """Get business analytics including recent reviews and ratings"""
    permission_classes = [AllowAny]  # Allow public access to view analytics
    
    def get(self, request, business_id):
        """Get business analytics data"""
        try:
            business = get_object_or_404(Business, id=business_id)
            
            # Get recent reviews (last 10)
            recent_reviews = Review.objects.filter(
                business=business
            ).select_related('user').order_by('-created_at')[:10]
            
            # Calculate rating statistics
            all_reviews = Review.objects.filter(business=business)
            total_reviews = all_reviews.count()
            avg_rating = all_reviews.aggregate(avg_rating=models.Avg('rating'))['avg_rating'] or 0
            
            # Rating distribution
            rating_distribution = {}
            for i in range(1, 6):
                rating_distribution[i] = all_reviews.filter(rating=i).count()
            
            # Serialize reviews
            review_serializer = ReviewSerializer(recent_reviews, many=True)
            
            return Response({
                'success': True,
                'data': {
                    'business_id': str(business.id),
                    'business_name': business.business_name,
                    'total_reviews': total_reviews,
                    'average_rating': round(avg_rating, 2),
                    'rating_distribution': rating_distribution,
                    'recent_reviews': review_serializer.data
                }
            })
            
        except Exception as e:
            return Response({
                'success': False,
                'message': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)


class ServiceListAPIView(generics.ListAPIView):
    """List all active services across all businesses"""
    serializer_class = ServiceSerializer
    permission_classes = [AllowAny]  # Allow public access to list all services
    queryset = Service.objects.filter(is_active=True).select_related('business', 'business__category')
    
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['business__category', 'price_range']
    search_fields = ['name', 'description', 'business__business_name']
    ordering_fields = ['created_at', 'name']
    
    # Add pagination
    pagination_class = CustomLimitOffsetPagination


class ServiceListCreateAPIView(generics.ListCreateAPIView):
    """List and create services"""
    serializer_class = ServiceSerializer
    permission_classes = [IsAuthenticated]  # Require authentication for both list and create
    pagination_class = CustomLimitOffsetPagination
    
    def get_permissions(self):
        """Allow public access to list services, but require auth for creation"""
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAuthenticated()]
    
    def get_queryset(self):
        return Service.objects.filter(is_active=True).select_related('business', 'business__category')
    
    def perform_create(self, serializer):
        # Check if user is authenticated for creation
        if not self.request.user.is_authenticated:
            raise PermissionDenied("Authentication required to create a service.")
        
        # For now, we'll require a business_id in the request data
        # In a real app, you might want to get this from the user's business
        business_id = self.request.data.get('business_id')
        if not business_id:
            raise PermissionDenied("Business ID is required to create a service")
        
        try:
            business = Business.objects.get(id=business_id)
            # Check if user owns this business
            if business.user != self.request.user:
                raise PermissionDenied("You can only create services for your own business")
        except Business.DoesNotExist:
            raise PermissionDenied("Business not found")
        
        serializer.save(business=business)


class ServiceRetrieveUpdateDeleteView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, and delete an individual service"""
    serializer_class = ServiceSerializer
    queryset = Service.objects.all()
    lookup_field = 'id'

    def get_permissions(self):
        """Allow public access for GET, require auth for PUT/DELETE"""
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_queryset(self):
        """For updates/deletes, only allow users to modify services for their own business"""
        if self.request.method in ['PUT', 'DELETE']:
            return Service.objects.filter(business__user=self.request.user)
        return Service.objects.all()

    def perform_update(self, serializer):
        """Ensure the service belongs to the current user's business"""
        service = serializer.instance
        if service.business.user != self.request.user:
            raise PermissionDenied("You can only update services for your own business")
        serializer.save()

    def perform_destroy(self, instance):
        """Ensure the service belongs to the current user's business before deletion"""
        if instance.business.user != self.request.user:
            raise PermissionDenied("You can only delete services for your own business")
        instance.delete()


class ProductRetrieveUpdateDeleteView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, and delete an individual product"""
    serializer_class = ProductSerializer
    queryset = Product.objects.all()
    lookup_field = 'id'

    def get_permissions(self):
        """Allow public access for GET, require auth for PUT/DELETE"""
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_queryset(self):
        """For updates/deletes, only allow users to modify products for their own business"""
        if self.request.method in ['PUT', 'DELETE']:
            return Product.objects.filter(business__user=self.request.user)
        return Product.objects.all()

    def perform_update(self, serializer):
        """Ensure the product belongs to the current user's business"""
        product = serializer.instance
        if product.business.user != self.request.user:
            raise PermissionDenied("You can only update products for your own business")
        serializer.save()

    def perform_destroy(self, instance):
        """Ensure the product belongs to the current user's business before deletion"""
        if instance.business.user != self.request.user:
            raise PermissionDenied("You can only delete products for your own business")
        instance.delete()


class ProductListAPIView(generics.ListAPIView):
    """List all active products across all businesses"""
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]  # Allow public access to list all products
    queryset = Product.objects.filter(is_active=True).select_related('business', 'business__category')
    
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['business__category', 'in_stock', 'price_currency']
    search_fields = ['name', 'description', 'business__business_name']
    ordering_fields = ['created_at', 'name', 'price']
    
    # Add pagination
    pagination_class = CustomLimitOffsetPagination


class ProductListCreateAPIView(generics.ListCreateAPIView):
    """List and create products"""
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated]  # Require authentication for both list and create
    pagination_class = CustomLimitOffsetPagination
    
    def get_permissions(self):
        """Allow public access to list products, but require auth for creation"""
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAuthenticated()]
    
    def get_queryset(self):
        return Product.objects.filter(is_active=True).select_related('business', 'business__category')
    
    def perform_create(self, serializer):
        # Check if user is authenticated for creation
        if not self.request.user.is_authenticated:
            raise PermissionDenied("Authentication required to create a product.")
        
        # For now, we'll require a business_id in the request data
        # In a real app, you might want to get this from the user's business
        business_id = self.request.data.get('business_id')
        if not business_id:
            raise PermissionDenied("Business ID is required to create a product")
        
        try:
            business = Business.objects.get(id=business_id)
            # Check if user owns this business
            if business.user != self.request.user:
                raise PermissionDenied("You can only create products for your own business")
        except Business.DoesNotExist:
            raise PermissionDenied("Business not found")
        
        serializer.save(business=business)


class BusinessHourCreateView(generics.CreateAPIView):
    serializer_class = BusinessHourSerializer


# New views for category-based product and service details
class ProductDetailByCategoryView(generics.RetrieveAPIView):
    """Get product details by category and slug"""
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]
    lookup_field = 'slug'
    
    def get_queryset(self):
        category_slug = self.kwargs.get('category_slug')
        return Product.objects.filter(
            business__category__slug=category_slug,
            is_active=True
        ).select_related('business', 'business__category')


class ServiceDetailByCategoryView(generics.RetrieveAPIView):
    """Get service details by category and slug"""
    serializer_class = ServiceSerializer
    permission_classes = [AllowAny]
    lookup_field = 'slug'
    
    def get_queryset(self):
        category_slug = self.kwargs.get('category_slug')
        return Service.objects.filter(
            business__category__slug=category_slug,
            is_active=True
        ).select_related('business', 'business__category')


class PhotoRequestCreateView(generics.CreateAPIView):
    """Create a new photo request"""
    serializer_class = PhotoRequestSerializer
    permission_classes = [IsAuthenticated]
    
    def perform_create(self, serializer):
        photo_request = serializer.save()
        
        # Send email notification to business owner
        # Email functionality temporarily disabled - just save to database
        pass
        
        return photo_request


class FavoriteCreateView(generics.CreateAPIView):
    """Create a new favorite"""
    serializer_class = FavoriteSerializer
    permission_classes = [IsAuthenticated]
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class FavoriteDeleteView(generics.DestroyAPIView):
    """Delete a favorite"""
    serializer_class = FavoriteSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Favorite.objects.filter(user=self.request.user)


class UserFavoritesView(generics.ListAPIView):
    """Get all favorites for the current user"""
    serializer_class = FavoriteSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Favorite.objects.filter(user=self.request.user).select_related('business', 'business__category')


class UserReviewsView(generics.ListAPIView):
    """Get all reviews written by the current user"""
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Review.objects.filter(user=self.request.user).select_related('business', 'business__category')


class PhotoRequestListView(generics.ListAPIView):
    """List photo requests for a business owner"""
    serializer_class = PhotoRequestSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # Only show photo requests for businesses owned by the current user
        return PhotoRequest.objects.filter(
            business__user=self.request.user
        ).select_related('user', 'business')


class PhotoRequestUpdateView(generics.UpdateAPIView):
    """Update photo request status (for business owners)"""
    serializer_class = PhotoRequestSerializer
    permission_classes = [IsAuthenticated]
    queryset = PhotoRequest.objects.all()
    
    def get_queryset(self):
        # Only allow business owners to update their photo requests
        return PhotoRequest.objects.filter(business__user=self.request.user)
    
    def perform_update(self, serializer):
        photo_request = serializer.save()
        
        # If status is being updated to completed, set completed_date
        if photo_request.status == 'completed' and not photo_request.completed_date:
            photo_request.completed_date = timezone.now()
            photo_request.save()
        
        # Email functionality removed - just save to database
        
        return photo_request


class BusinessLikeToggleView(generics.CreateAPIView):
    """Toggle business like (like/unlike)"""
    serializer_class = BusinessLikeSerializer
    permission_classes = [IsAuthenticated]
    
    def post(self, request, *args, **kwargs):
        business_id = self.kwargs.get('business_id')
        user = request.user
        
        try:
            business = Business.objects.get(id=business_id)
            
            # Check if user already liked this business
            existing_like = BusinessLike.objects.filter(user=user, business=business).first()
            
            if existing_like:
                # Unlike: delete the like
                existing_like.delete()
                return Response({
                    'liked': False,
                    'message': 'Business unliked successfully'
                })
            else:
                # Like: create new like
                # Validate that user is not liking their own business
                if user == business.user:
                    return Response({
                        'error': 'You cannot like your own business'
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                like = BusinessLike.objects.create(user=user, business=business)
                return Response({
                    'liked': True,
                    'message': 'Business liked successfully'
                })
                
        except Business.DoesNotExist:
            return Response({
                'error': 'Business not found'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)


class ReviewLikeToggleView(generics.CreateAPIView):
    """Toggle review like (like/unlike)"""
    serializer_class = ReviewLikeSerializer
    permission_classes = [IsAuthenticated]
    
    def post(self, request, *args, **kwargs):
        review_id = self.kwargs.get('review_id')
        user = request.user
        
        try:
            review = Review.objects.get(id=review_id)
            
            # Check if user already liked this review
            existing_like = ReviewLike.objects.filter(user=user, review=review).first()
            
            if existing_like:
                # Unlike: delete the like
                existing_like.delete()
                return Response({
                    'liked': False,
                    'message': 'Review unliked successfully'
                })
            else:
                # Like: create new like
                # Validate that user is not liking their own review
                if user == review.user:
                    return Response({
                        'error': 'You cannot like your own review'
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                like = ReviewLike.objects.create(user=user, review=review)
                return Response({
                    'liked': True,
                    'message': 'Review liked successfully'
                })
                
        except Review.DoesNotExist:
            return Response({
                'error': 'Review not found'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)


class UserActivityView(generics.ListAPIView):
    """Get user's activity including favorites, likes, and reviews"""
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        # This will be a custom queryset that combines different types of activities
        return []
    
    def list(self, request, *args, **kwargs):
        user = request.user
        
        # Get user's favorites
        favorites = Favorite.objects.filter(user=user).select_related('business', 'business__category')
        
        # Get user's business likes
        business_likes = BusinessLike.objects.filter(user=user).select_related('business', 'business__category')
        
        # Get user's review likes
        review_likes = ReviewLike.objects.filter(user=user).select_related('review', 'review__business')
        
        # Get user's reviews
        reviews = Review.objects.filter(user=user).select_related('business', 'business__category')
        
        # Combine all activities and sort by date
        activities = []
        
        for favorite in favorites:
            activities.append({
                'type': 'favorite',
                'id': favorite.id,
                'business_name': favorite.business.business_name,
                'business_category': favorite.business.category.name if favorite.business.category else 'Uncategorized',
                'date': favorite.created_at,
                'business_id': favorite.business.id
            })
        
        for like in business_likes:
            activities.append({
                'type': 'business_like',
                'id': like.id,
                'business_name': like.business.business_name,
                'business_category': like.business.category.name if like.business.category else 'Uncategorized',
                'date': like.created_at,
                'business_id': like.business.id
            })
        
        for like in review_likes:
            activities.append({
                'type': 'review_like',
                'id': like.id,
                'business_name': like.review.business.business_name,
                'business_category': like.review.business.category.name if like.review.business.category else 'Uncategorized',
                'date': like.created_at,
                'business_id': like.review.business.id,
                'review_text': like.review.review_text[:100] + "..." if like.review.review_text and len(like.review.review_text) > 100 else like.review.review_text
            })
        
        for review in reviews:
            activities.append({
                'type': 'review',
                'id': review.id,
                'business_name': review.business.business_name,
                'business_category': review.business.category.name if review.business.category else 'Uncategorized',
                'date': review.created_at,
                'business_id': review.business.id,
                'rating': review.rating,
                'review_text': review.review_text
            })
        
        # Sort activities by date (newest first)
        activities.sort(key=lambda x: x['date'], reverse=True)
        
        return Response({
            'activities': activities,
            'total_count': len(activities)
        })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def get_business_profile_image_upload_url(request, business_id):
    """Get pre-signed URL for uploading business profile image"""
    try:
        # Verify business ownership
        business = get_object_or_404(Business, id=business_id, user=request.user)
        
        # Get file info from request
        file_name = request.data.get('file_name')
        content_type = request.data.get('content_type')
        
        if not file_name or not content_type:
            return Response(
                {'error': 'file_name and content_type are required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Generate unique file key
        file_extension = content_type.split('/')[-1] if '/' in content_type else 'bin'
        file_key = f"business_profile_images/{business_id}/{uuid.uuid4()}.{file_extension}"
        
        # Get S3 service
        s3_service = S3Service()
        
        # Generate pre-signed URL
        result = s3_service.generate_presigned_upload_url(file_key, content_type)
        
        if result['success']:
            return Response({
                'presigned_url': result['presigned_url'],
                'file_key': result['file_key'],
                'expires_in_minutes': result['expires_in_minutes']
            })
        else:
            return Response(
                {'error': result['error']}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
            
    except Business.DoesNotExist:
        return Response(
            {'error': 'Business not found or access denied'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_business_profile_image(request, business_id):
    """Update business with uploaded profile image"""
    try:
        # Verify business ownership
        business = get_object_or_404(Business, id=business_id, user=request.user)
        
        # Get file key from request
        file_key = request.data.get('file_key')
        
        if not file_key:
            return Response(
                {'error': 'file_key is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get S3 service
        s3_service = S3Service()
        
        # Generate direct S3 URL (more reliable than CloudFront)
        s3_url = f"https://{s3_service.bucket_name}.s3.{settings.AWS_S3_REGION_NAME}.amazonaws.com/{file_key}"
        
        # Update business profile image
        business.business_image_url = s3_url
        business.save()
        
        return Response({
            'business_image_url': s3_url,
            's3_url': s3_url,
            'message': 'Business profile image updated successfully'
        })
        
    except Business.DoesNotExist:
        return Response(
            {'error': 'Business not found or access denied'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def get_business_logo_upload_url(request, business_id):
    """Get pre-signed URL for uploading business logo"""
    try:
        # Verify business ownership
        business = get_object_or_404(Business, id=business_id, user=request.user)
        
        # Get file info from request
        file_name = request.data.get('file_name')
        content_type = request.data.get('content_type')
        
        if not file_name or not content_type:
            return Response(
                {'error': 'file_name and content_type are required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Generate unique file key
        file_extension = content_type.split('/')[-1] if '/' in content_type else 'bin'
        file_key = f"business_logos/{business_id}/{uuid.uuid4()}.{file_extension}"
        
        # Get S3 service
        s3_service = S3Service()
        
        # Generate pre-signed URL
        result = s3_service.generate_presigned_upload_url(file_key, content_type)
        
        if result['success']:
            return Response({
                'presigned_url': result['presigned_url'],
                'file_key': result['file_key'],
                'expires_in_minutes': result['expires_in_minutes']
            })
        else:
            return Response(
                {'error': result['error']}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
            
    except Business.DoesNotExist:
        return Response(
            {'error': 'Business not found or access denied'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_business_logo(request, business_id):
    """Update business with uploaded logo"""
    try:
        # Verify business ownership
        business = get_object_or_404(Business, id=business_id, user=request.user)
        
        # Get file key from request
        file_key = request.data.get('file_key')
        
        if not file_key:
            return Response(
                {'error': 'file_key is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get S3 service
        s3_service = S3Service()
        
        # Generate direct S3 URL (more reliable than CloudFront)
        s3_url = f"https://{s3_service.bucket_name}.s3.{settings.AWS_S3_REGION_NAME}.amazonaws.com/{file_key}"
        
        # Update business logo
        business.business_logo_url = s3_url
        business.save()
        
        return Response({
            'business_logo_url': s3_url,
            's3_url': s3_url,
            'message': 'Business logo updated successfully'
        })
        
    except Business.DoesNotExist:
        return Response(
            {'error': 'Business not found or access denied'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


class UserLikedReviewsView(generics.ListAPIView):
    """Get list of review IDs that the current user has liked"""
    permission_classes = [IsAuthenticated]
    
    def list(self, request, *args, **kwargs):
        user = request.user
        
        try:
            # Get all review IDs that the user has liked
            liked_review_ids = ReviewLike.objects.filter(user=user).values_list('review_id', flat=True)
            
            return Response({
                'liked_review_ids': list(liked_review_ids)
            })
            
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


@api_view(['POST'])
@permission_classes([AllowAny])
def book_service(request, service_id):
    """
    Send booking request email to business for a specific service
    """
    try:
        # Get the service and business
        service = get_object_or_404(Service, id=service_id, is_active=True)
        business = service.business
        
        if not business.is_active:
            return Response({
                'success': False,
                'message': 'Business is not active'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if not business.email:
            return Response({
                'success': False,
                'message': 'Business email not available'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Get customer details from request
        customer_name = request.data.get('customer_name', '')
        customer_email = request.data.get('customer_email', '')
        customer_phone = request.data.get('customer_phone', '')
        message = request.data.get('message', '')
        
        # Validate required fields
        if not customer_name or not customer_email:
            return Response({
                'success': False,
                'message': 'Customer name and email are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Prepare email content
        subject = f"New Service Booking Request – {service.name}"
        
        email_body = f"""
Hello {business.business_name},

You have received a new service booking request through FaithConnect:

SERVICE DETAILS:
- Service: {service.name}
- Description: {service.description or 'No description provided'}
- Price Range: {service.price_range or 'Contact for pricing'}
- Duration: {service.duration or 'Not specified'}

CUSTOMER DETAILS:
- Name: {customer_name}
- Email: {customer_email}
- Phone: {customer_phone or 'Not provided'}

CUSTOMER MESSAGE:
{message or 'No additional message provided'}

Please contact the customer directly to discuss the booking details.

Best regards,
FaithConnect Team

---
This email was sent from FaithConnect Business Directory.
Please do not reply to this email directly.
        """
        
        # Send email
        try:
            send_mail(
                subject=subject,
                message=email_body,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[business.email],
                fail_silently=False,
            )
            
            # Log the booking request for analytics
            logger.info(f"Service booking request sent: Service {service.id}, Business {business.id}, Customer {customer_email}")
            
            return Response({
                'success': True,
                'message': 'Booking request sent successfully'
            }, status=status.HTTP_200_OK)
            
        except Exception as email_error:
            logger.error(f"Failed to send booking email: {str(email_error)}")
            return Response({
                'success': False,
                'message': 'Failed to send booking request. Please try again.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
    except Service.DoesNotExist:
        return Response({
            'success': False,
            'message': 'Service not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Error in book_service: {str(e)}")
        return Response({
            'success': False,
            'message': 'An error occurred while processing your request'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_business_contact(request, business_id):
    """
    Get business contact details for display
    """
    try:
        business = get_object_or_404(Business, id=business_id, is_active=True)
        
        # Only return contact details for verified businesses
        if not business.is_verified:
            return Response({
                'success': False,
                'message': 'Business contact details not available'
            }, status=status.HTTP_403_FORBIDDEN)
        
        contact_details = {
            'business_name': business.business_name,
            'phone': business.phone,
            'email': business.email,
            'whatsapp': business.whatsapp,
            'address': business.address,
            'city': business.city,
            'website': business.website
        }
        
        return Response({
            'success': True,
            'contact_details': contact_details
        }, status=status.HTTP_200_OK)
        
    except Business.DoesNotExist:
        return Response({
            'success': False,
            'message': 'Business not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Error in get_business_contact: {str(e)}")
        return Response({
            'success': False,
            'message': 'An error occurred while fetching contact details'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def check_whatsapp_number(request):
    """
    Check if a phone number is registered on WhatsApp using 2Chat API
    """
    try:
        phone_number = request.data.get('phone')
        
        if not phone_number:
            return Response({
                'success': False,
                'message': 'Phone number is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Clean the phone number (remove spaces, dashes, etc.)
        clean_number = phone_number.replace(' ', '').replace('-', '').replace('(', '').replace(')', '')
        
        # Ensure it starts with + for international format
        if not clean_number.startswith('+'):
            # Assume Kenya number if no country code
            if clean_number.startswith('0'):
                clean_number = '+254' + clean_number[1:]
            elif clean_number.startswith('254'):
                clean_number = '+' + clean_number
            else:
                clean_number = '+254' + clean_number
        
        # Check cache first
        cache_key = f"whatsapp_check_{clean_number}"
        cached_result = cache.get(cache_key)
        
        if cached_result is not None:
            logger.info(f"WhatsApp check cache hit for {clean_number}: {cached_result}")
            return Response({
                'success': True,
                'phone': clean_number,
                'is_whatsapp': cached_result,
                'cached': True
            })
        
        # Get 2Chat API configuration from settings
        chat_api_key = getattr(settings, 'CHAT_API_KEY', None)
        chat_phone = getattr(settings, 'CHAT_PHONE', None)
        
        if not chat_api_key or not chat_phone:
            logger.warning("2Chat API credentials not configured, skipping WhatsApp check")
            # Return optimistic result if API not configured
            return Response({
                'success': True,
                'phone': clean_number,
                'is_whatsapp': True,
                'message': 'WhatsApp check not configured, assuming number is valid'
            })
        
        # Call 2Chat API
        api_url = f"https://api.p.2chat.io/open/whatsapp/check-number/{chat_phone}/{clean_number}"
        headers = {
            'X-User-API-Key': chat_api_key
        }
        
        try:
            response = requests.get(api_url, headers=headers, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            
            # Extract WhatsApp status
            is_whatsapp = data.get('on_whatsapp', False)
            is_valid = data.get('is_valid', False)
            
            # Cache the result for 24 hours
            cache.set(cache_key, is_whatsapp, 86400)
            
            # Log the result
            if is_whatsapp:
                logger.info(f"WhatsApp check successful for {clean_number}: registered")
            else:
                logger.warning(f"WhatsApp check failed for {clean_number}: not registered or invalid")
            
            return Response({
                'success': True,
                'phone': clean_number,
                'is_whatsapp': is_whatsapp,
                'is_valid': is_valid,
                'cached': False,
                'whatsapp_info': data.get('whatsapp_info', {}) if is_whatsapp else None
            })
            
        except requests.exceptions.RequestException as e:
            logger.error(f"2Chat API request failed for {clean_number}: {str(e)}")
            
            # Return optimistic result on API failure
            return Response({
                'success': True,
                'phone': clean_number,
                'is_whatsapp': True,
                'message': 'WhatsApp check service unavailable, assuming number is valid',
                'error': str(e)
            })
            
    except Exception as e:
        logger.error(f"Error in check_whatsapp_number: {str(e)}")
        return Response({
            'success': False,
            'message': 'An error occurred while checking WhatsApp registration'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

