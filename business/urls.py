from django.urls import path
from .views import (
    BusinessListCreateAPIView, BusinessDetailAPIView, BusinessUpdateView, 
    CategoryListAPIView, FavoriteToggleView, UserFavoritesListView,
    BusinessProductListCreateView, ProductRetrieveUpdateView,
    ReviewListCreateView, ReviewUpdateDeleteView, BusinessHoursView,
    BusinessImageUploadView,
    get_service_image_upload_url, update_service_image,
    get_product_image_upload_url, update_product_image, UserBusinessView, BusinessServiceListCreateView, BusinessAnalyticsView,
    ServiceListAPIView, ProductListAPIView, MyBusinessView
)

urlpatterns = [
    path('', BusinessListCreateAPIView.as_view(), name="business-list-create"),
    path('categories/', CategoryListAPIView.as_view(), name="category-list"),
    path('services/', ServiceListAPIView.as_view(), name="service-list"),
    path('products/', ProductListAPIView.as_view(), name="product-list"),
    path('my-business/', MyBusinessView.as_view(), name="my-business"),
    path('user/<int:user_id>/', UserBusinessView.as_view(), name="user-businesses"),
    path('<uuid:id>/', BusinessDetailAPIView.as_view(), name="business-detail"),
    path('<uuid:id>/update/', BusinessUpdateView.as_view(), name="business-update"),
    path('<uuid:id>/favorite/', FavoriteToggleView.as_view(), name="favorite-toggle"),
    path('<uuid:business_id>/services/', BusinessServiceListCreateView.as_view(), name="business-service-list-create"),
    path('<uuid:business_id>/products/', BusinessProductListCreateView.as_view(), name="business-product-list-create"),
    path('products/<uuid:id>/', ProductRetrieveUpdateView.as_view(), name="product-detail"),
    path('<uuid:business_id>/reviews/', ReviewListCreateView.as_view(), name="business-reviews"),
    path('<uuid:business_id>/reviews/<int:pk>/', ReviewUpdateDeleteView.as_view(), name="business-review-detail"),
    path('<uuid:business_id>/hours/', BusinessHoursView.as_view(), name="business-hours"),
    path('<uuid:business_id>/analytics/', BusinessAnalyticsView.as_view(), name="business-analytics"),
    path('<uuid:business_id>/upload-image/', BusinessImageUploadView.as_view(), name="business-image-upload"),
    
    # Service Image Upload URLs
    path('services/<int:service_id>/upload-image/', get_service_image_upload_url, name="service-image-upload-url"),
    path('services/<int:service_id>/update-image/', update_service_image, name="service-image-update"),
    
    # Product Image Upload URLs
    path('products/<int:product_id>/upload-image/', get_product_image_upload_url, name="product-image-upload-url"),
    path('products/<int:product_id>/update-image/', update_product_image, name="product-image-update"),
]
