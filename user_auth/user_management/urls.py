from django.urls import path
from .views import (
    UserProfileView, UserProfileUpdateView,
    get_profile_photo_upload_url, update_profile_photo
)

urlpatterns = [
    path('profile', UserProfileView.as_view(), name='user-profile'),
    path('profile-update', UserProfileUpdateView.as_view(), name='user-profile-update'),
    
    # Profile Photo Upload URLs
    path('profile-photo-upload-url', get_profile_photo_upload_url, name='profile-photo-upload-url'),
    path('profile-photo-update', update_profile_photo, name='profile-photo-update'),
]
