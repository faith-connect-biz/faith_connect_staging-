from django.urls import path

from business.views import BusinessDetailAPIView, BusinessUpdateView, BusinessListCreateAPIView, CategoryListAPIView, \
  FavoriteToggleView, BusinessProductListCreateView, ProductRetrieveUpdateView, ReviewListCreateView, \
  ReviewUpdateDeleteView

urlpatterns = [
    path('', BusinessListCreateAPIView.as_view(), name='business-list'),
    path('<uuid:id>/', BusinessDetailAPIView.as_view(), name='business-detail'),
    path('<uuid:id>/update/', BusinessUpdateView.as_view(), name='business-update'),
    path('categories/', CategoryListAPIView.as_view(), name="category-list"),
    path('<uuid:id>/favorite/', FavoriteToggleView.as_view(), name='favorite-toggle'),
    path('<uuid:business_id>/products/', BusinessProductListCreateView.as_view(), name='business-product-list-create'),
    path('products/<uuid:id>/', ProductRetrieveUpdateView.as_view(), name='product-detail'),
    path('<uuid:business_id>/reviews/', ReviewListCreateView.as_view(), name='business-reviews'),
    path('<uuid:business_id>/reviews/<int:pk>/', ReviewUpdateDeleteView.as_view(), name='business-review-detail'),
]
