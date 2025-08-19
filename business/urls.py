from django.urls import path
from .views import (
    BusinessDetailAPIView, BusinessListCreateAPIView, BusinessUpdateView, 
    ServiceListCreateAPIView, ProductListCreateAPIView, MyBusinessView, ServiceRetrieveUpdateDeleteView,
    ProductRetrieveUpdateDeleteView, CategoryListAPIView, FavoriteCreateView, FavoriteDeleteView,
    ReviewListCreateView, ReviewUpdateDeleteView, BusinessHourCreateView, PhotoRequestCreateView,
    PhotoRequestListView, PhotoRequestUpdateView, UserFavoritesView, UserReviewsView,
    BusinessServiceListCreateView, BusinessProductListCreateView, BusinessHoursView, BusinessAnalyticsView,
    BusinessImageUploadView, FavoriteToggleView, BusinessLikeToggleView, ReviewLikeToggleView,
    UserActivityView, UserBusinessView, get_service_image_upload_url, update_service_image,
    get_product_image_upload_url, update_product_image, get_business_profile_image_upload_url, 
    update_business_profile_image, get_business_logo_upload_url, update_business_logo,
    ServiceReviewListCreateView, ServiceReviewUpdateDeleteView, ProductReviewListCreateView, ProductReviewUpdateDeleteView
)

urlpatterns = [
    path('', BusinessListCreateAPIView.as_view(), name="business-list-create"),
    path('categories/', CategoryListAPIView.as_view(), name="category-list"),
    path('services/', ServiceListCreateAPIView.as_view(), name="service-list"),
    path('products/', ProductListCreateAPIView.as_view(), name="product-list"),
    path('my-business/', MyBusinessView.as_view(), name="my-business"),
    path('user/<int:user_id>/', UserBusinessView.as_view(), name="user-businesses"),
    path('<uuid:id>/', BusinessDetailAPIView.as_view(), name="business-detail"),
    path('<uuid:id>/update/', BusinessUpdateView.as_view(), name="business-update"),
    path('<uuid:id>/favorite/', FavoriteToggleView.as_view(), name="favorite-toggle"),
    path('<uuid:business_id>/services/', BusinessServiceListCreateView.as_view(), name="business-service-list-create"),
    path('<uuid:business_id>/products/', BusinessProductListCreateView.as_view(), name="business-product-list-create"),
    path('services/<int:id>/', ServiceRetrieveUpdateDeleteView.as_view(), name="service-detail"),
    path('products/<int:id>/', ProductRetrieveUpdateDeleteView.as_view(), name="product-detail"),
    path('<uuid:business_id>/reviews/', ReviewListCreateView.as_view(), name="business-reviews"),
    path('<uuid:business_id>/reviews/<int:pk>/', ReviewUpdateDeleteView.as_view(), name="business-review-detail"),
    path('services/<int:service_id>/reviews/', ServiceReviewListCreateView.as_view(), name="service-reviews"),
    path('services/<int:service_id>/reviews/<int:pk>/', ServiceReviewUpdateDeleteView.as_view(), name="service-review-detail"),
    path('products/<int:product_id>/reviews/', ProductReviewListCreateView.as_view(), name="product-reviews"),
    path('products/<int:product_id>/reviews/<int:pk>/', ProductReviewUpdateDeleteView.as_view(), name="product-review-detail"),
    path('<uuid:business_id>/hours/', BusinessHoursView.as_view(), name="business-hours"),
    path('<uuid:business_id>/analytics/', BusinessAnalyticsView.as_view(), name="business-analytics"),
    path('<uuid:business_id>/upload-image/', BusinessImageUploadView.as_view(), name="business-image-upload"),
    
    # Service Image Upload URLs
    path('services/<int:service_id>/upload-image/', get_service_image_upload_url, name="service-image-upload-url"),
    path('services/<int:service_id>/update-image/', update_service_image, name="service-image-update"),
    
    # Product Image Upload URLs
    path('products/<int:product_id>/upload-image/', get_product_image_upload_url, name="product-image-upload-url"),
    path('products/<int:product_id>/update-image/', update_product_image, name="product-image-update"),
    
    # Business Image Upload URLs
    path('<uuid:business_id>/upload-profile-image/', get_business_profile_image_upload_url, name="business-profile-image-upload-url"),
    path('<uuid:business_id>/update-profile-image/', update_business_profile_image, name="business-profile-image-update"),
    path('<uuid:business_id>/upload-logo/', get_business_logo_upload_url, name="business-logo-upload-url"),
    path('<uuid:business_id>/update-logo/', update_business_logo, name="business-logo-update"),
    
    # Photo Request URLs
    path('<uuid:business_id>/photo-request/', PhotoRequestCreateView.as_view(), name="photo-request-create"),
    path('photo-requests/', PhotoRequestListView.as_view(), name="photo-request-list"),
    path('photo-requests/<uuid:pk>/', PhotoRequestUpdateView.as_view(), name="photo-request-update"),
    
    # Like URLs
    path('<uuid:business_id>/like/', BusinessLikeToggleView.as_view(), name="business-like-toggle"),
    path('reviews/<int:review_id>/like/', ReviewLikeToggleView.as_view(), name="review-like-toggle"),
    
    # User Activity URLs
    path('user-activity/', UserActivityView.as_view(), name="user-activity"),
    path('favorites/', UserFavoritesView.as_view(), name="user-favorites"),
    path('user-reviews/', UserReviewsView.as_view(), name="user-reviews"),
]
