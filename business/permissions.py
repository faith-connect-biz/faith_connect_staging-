from rest_framework import permissions
from .models import Business, Service, Product

class IsBusinessUser(permissions.BasePermission):
    """
    Allows access only to users with user_type 'business'.
    """

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.user_type == 'business'
        )

class CanCreateReviewPermission(permissions.BasePermission):
    """
    Custom permission to allow users to create reviews for businesses they don't own.
    """
    
    message = "Business owners cannot review their own business."
    
    def has_permission(self, request, view):
        # Allow GET requests for everyone
        if request.method == 'GET':
            return True
            
        # Require authentication for POST requests
        if not request.user.is_authenticated:
            return False
            
        # Check if user is trying to review their own business
        business_id = view.kwargs.get('business_id')
        if business_id:
            try:
                business = Business.objects.get(id=business_id)
                if business.user == request.user:
                    return False  # Business owners cannot review their own business
            except Business.DoesNotExist:
                # If business doesn't exist, we'll let the view handle this error
                # This prevents permission issues from masking business not found errors
                return True
                
        return True
    
    def get_message(self):
        return self.message


class CanCreateServiceReviewPermission(permissions.BasePermission):
    """
    Custom permission to allow users to create reviews for services they don't own.
    """
    
    message = "Business owners cannot review their own services."
    
    def has_permission(self, request, view):
        # Allow GET requests for everyone
        if request.method == 'GET':
            return True
            
        # Require authentication for POST requests
        if not request.user.is_authenticated:
            return False
            
        # Check if user is trying to review their own service
        service_id = view.kwargs.get('service_id')
        if service_id:
            try:
                service = Service.objects.get(id=service_id)
                if service.business.user == request.user:
                    return False  # Business owners cannot review their own services
            except Service.DoesNotExist:
                # If service doesn't exist, we'll let the view handle this error
                return True
                
        return True
    
    def get_message(self):
        return self.message


class CanCreateProductReviewPermission(permissions.BasePermission):
    """
    Custom permission to allow users to create reviews for products they don't own.
    """
    
    message = "Business owners cannot review their own products."
    
    def has_permission(self, request, view):
        # Allow GET requests for everyone
        if request.method == 'GET':
            return True
            
        # Require authentication for POST requests
        if not request.user.is_authenticated:
            return False
            
        # Check if user is trying to review their own product
        product_id = view.kwargs.get('product_id')
        if product_id:
            try:
                product = Product.objects.get(id=product_id)
                if product.business.user == request.user:
                    return False  # Business owners cannot review their own products
            except Product.DoesNotExist:
                # If product doesn't exist, we'll let the view handle this error
                return True
                
        return True
    
    def get_message(self):
        return self.message
