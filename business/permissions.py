from rest_framework import permissions
from .models import Business

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
                return False
                
        return True
    
    def get_message(self):
        return self.message
