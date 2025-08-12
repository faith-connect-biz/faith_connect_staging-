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


# Create your views here.


class BusinessDetailAPIView(generics.RetrieveAPIView):
    permission_classes = [AllowAny]  # Allow public access to view business details
    serializer_class = BusinessSerializer
    queryset = Business.objects.filter(is_active=True).select_related('category')
    lookup_field = 'id'




class BusinessListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = BusinessSerializer
    permission_classes = [AllowAny]  # Allow public access to list businesses, but require auth for creation
    queryset = Business.objects.filter(is_active=True).select_related('category').order_by('-created_at')

    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'city', 'county', 'is_featured']
    search_fields = ['business_name', 'description', 'city']
    ordering_fields = ['created_at', 'rating']

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

class CategoryListAPIView(generics.ListAPIView):
    queryset = Category.objects.all().order_by('name')
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]  # Allow public access to list categories


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


class ProductRetrieveUpdateView(generics.RetrieveUpdateAPIView):
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

class ReviewListCreateView(generics.ListCreateAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [AllowAny]  # Allow public access to list reviews, but require auth for creation

    def get_queryset(self):
        business_id = self.kwargs.get('business_id')
        return Review.objects.filter(business_id=business_id)

    def perform_create(self, serializer):
        # Check if user is authenticated for creation
        if not self.request.user.is_authenticated:
            raise PermissionDenied("Authentication required to create a review.")
        
        business_id = self.kwargs.get('business_id')
        if Review.objects.filter(business_id=business_id, user=self.request.user).exists():
            raise PermissionDenied("You’ve already reviewed this business.")
        serializer.save(
            business_id=business_id,
            user=self.request.user
        )


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
    """Handle business image and logo uploads"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request, business_id):
        """Upload business image or logo"""
        try:
            business = get_object_or_404(Business, id=business_id)
            
            # Check if user owns this business
            if business.user != request.user:
                return Response({
                    'success': False,
                    'message': 'You can only upload images for your own business'
                }, status=status.HTTP_403_FORBIDDEN)
            
            image_type = request.data.get('image_type')  # 'image' or 'logo'
            image_url = request.data.get('image_url')
            
            if not image_url:
                return Response({
                    'success': False,
                    'message': 'Image URL is required'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            if image_type == 'logo':
                business.business_logo_url = image_url
            elif image_type == 'image':
                business.business_image_url = image_url
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
                    'business_logo_url': business.business_logo_url
                }
            })
            
        except Exception as e:
            return Response({
                'success': False,
                'message': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

