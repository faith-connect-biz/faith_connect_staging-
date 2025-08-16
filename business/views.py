from django.core.exceptions import ObjectDoesNotExist, PermissionDenied
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import generics, filters
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Business, Category, Favorite, Product, Review, BusinessHour
from .serializers import BusinessSerializer, CategorySerializer, FavoriteSerializer, ProductSerializer, ReviewSerializer, BusinessHourSerializer
from user_auth.utils import success_response, error_response
from user_auth.models import User
from django.db import transaction
from django.utils import timezone
from datetime import datetime, time
import json
from utils.s3_service import S3Service
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from .models import Business, Service, Product, Category
from .serializers import BusinessSerializer, ServiceSerializer, ProductSerializer, CategorySerializer
import boto3
from botocore.exceptions import ClientError
import os
from django.conf import settings
import uuid
from datetime import datetime, timedelta
from django.http import Http404
from django.db import models
from rest_framework.decorators import permission_classes as drf_permission_classes
from .models import PhotoRequest
from .serializers import PhotoRequestSerializer
from .models import BusinessLike, ReviewLike
from .serializers import BusinessLikeSerializer, ReviewLikeSerializer
from core.pagination import CustomLimitOffsetPagination


# Create your views here.


class BusinessDetailAPIView(generics.RetrieveAPIView):
    permission_classes = [AllowAny]  # Allow public access to view business details
    serializer_class = BusinessSerializer
    queryset = Business.objects.filter(is_active=True).select_related('category', 'user')
    lookup_field = 'id'




class BusinessListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = BusinessSerializer
    permission_classes = [AllowAny]  # Allow public access to list businesses, but require auth for creation
    queryset = Business.objects.filter(is_active=True).select_related('category', 'user').order_by('-created_at')

    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'city', 'county', 'is_featured']
    search_fields = ['business_name', 'description', 'city']
    ordering_fields = ['created_at', 'rating']
    
    # Add pagination
    pagination_class = CustomLimitOffsetPagination

    def get_serializer_context(self):
        return {"request": self.request}

    def create(self, request, *args, **kwargs):
        # Check if user is authenticated for creation
        if not request.user.is_authenticated:
            return error_response(
                "Authentication required to create a business.",
                status_code=status.HTTP_401_UNAUTHORIZED
            )
        
        user = request.user
        if user.user_type != 'business':
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

        return success_response("Business created successfully",
                                BusinessSerializer(business, context=self.get_serializer_context()).data)


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
            raise PermissionDenied("You can only update your own business")
        serializer.save()

class CategoryListAPIView(generics.ListAPIView):
    queryset = Category.objects.all().order_by('name')
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]  # Allow public access to list categories
    pagination_class = None  # Disable pagination for categories to show all 17


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
        serializer = self.get_serializer(queryset, many=True)
        return success_response("Fetched favorites successfully", serializer.data)


class FavoriteToggleView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, id):
        user = request.user
        try:
            business = Business.objects.get(id=id)
        except ObjectDoesNotExist:
            return error_response("Business not found", status_code=status.HTTP_404_NOT_FOUND)

        favorite, created = Favorite.objects.get_or_create(user=user, business=business)
        if not created:
            return error_response("Business already favorited")

        return success_response("Business favorited successfully", status_code=status.HTTP_201_CREATED)

    def delete(self, request, id):
        user = request.user
        try:
            favorite = Favorite.objects.get(user=user, business__id=id)
            favorite.delete()
            return success_response("Favorite removed successfully", status_code=status.HTTP_204_NO_CONTENT)
        except ObjectDoesNotExist:
            return error_response("Favorite not found", status_code=status.HTTP_404_NOT_FOUND)

# List and Create products
class BusinessProductListCreateView(generics.ListCreateAPIView):
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]  # Allow public access to list products, but require auth for creation
    filter_backends = [filters.SearchFilter, filters.OrderingFilter, DjangoFilterBackend]
    search_fields = ['name', 'description']
    ordering_fields = ['price', 'created_at']
    filterset_fields = ['in_stock', 'price_currency']
    pagination_class = CustomLimitOffsetPagination

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

        serializer.save(business=business)


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
            raise PermissionDenied("Only the owner can update this product")
        serializer.save()

    def perform_destroy(self, instance):
        """Ensure the product belongs to the current user's business before deletion"""
        if instance.business.user != self.request.user:
            raise PermissionDenied("You can only delete products for your own business")
        instance.delete()

class ReviewListCreateView(generics.ListCreateAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [AllowAny]  # Allow public access to list reviews, but require auth for creation
    pagination_class = CustomLimitOffsetPagination

    def get_permissions(self):
        """Allow anyone to view reviews, but require authentication to create"""
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_queryset(self):
        business_id = self.kwargs.get('business_id')
        print(f"ReviewListCreateView.get_queryset called with business_id: {business_id}")
        print(f"Business ID type: {type(business_id)}")
        
        # Check if business exists
        from .models import Business
        try:
            business = Business.objects.get(id=business_id)
            print(f"Business found: {business.business_name}")
        except Business.DoesNotExist:
            print(f"Business with ID {business_id} does not exist")
            return Review.objects.none()
        except Exception as e:
            print(f"Error checking business: {e}")
            return Review.objects.none()
        
        # Allow business owners to view reviews for their own business
        if self.request.user.is_authenticated and business.user == self.request.user:
            # Business owner can see all reviews for their business
            reviews = Review.objects.filter(business_id=business_id)
        else:
            # Public users can only see verified reviews
            reviews = Review.objects.filter(business_id=business_id, is_verified=True)
        
        print(f"Found {reviews.count()} reviews for business {business_id}")
        return reviews

    def perform_create(self, serializer):
        business_id = self.kwargs.get('business_id')
        
        # Get the business to check ownership
        try:
            business = Business.objects.get(id=business_id)
        except Business.DoesNotExist:
            raise PermissionDenied("Business not found.")
        
        # Prevent business owners from reviewing their own business
        if business.user == self.request.user:
            raise PermissionDenied("Business owners cannot review their own business.")
        
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
    permission_classes = [AllowAny]  # Allow public access to list services, but require auth for creation
    pagination_class = CustomLimitOffsetPagination
    
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
    permission_classes = [AllowAny]  # Allow public access to list services, but require auth for creation
    pagination_class = CustomLimitOffsetPagination
    
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
    permission_classes = [AllowAny]  # Allow public access to list products, but require auth for creation
    pagination_class = CustomLimitOffsetPagination
    
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
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        business_id = self.kwargs.get('business_id')
        business = get_object_or_404(Business, id=business_id, user=self.request.user)
        serializer.save(business=business)


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

