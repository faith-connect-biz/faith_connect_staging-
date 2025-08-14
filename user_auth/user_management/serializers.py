import os

from django.contrib.auth import get_user_model
from rest_framework import serializers

User = get_user_model()
ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png']
class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'email', 'phone', 'email_verified', 'phone_verified', 'partnership_number', 'bio', 'address', 'county', 'city', 'website', 'user_type', 'is_verified', 'profile_image_url']



class UpdateUserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id',  # Include ID
            'first_name', 
            'last_name', 
            'partnership_number',  # Include partnership number
            'user_type',  # Include user type - CRITICAL!
            'is_verified',  # Include verification status
            'email_verified',  # Include email verification status
            'phone_verified',  # Include phone verification status
            'is_active',  # Include active status
            'bio', 
            'address', 
            'county', 
            'city',
            'website',  # Add website field
            'profile_image_url'  # Add profile image URL field
        ]


class ProfileImageURLSerializer(serializers.ModelSerializer):
    class Meta:
        model = get_user_model()
        fields = ['profile_image_url']

    @staticmethod
    def validate_profile_image_url(value):
        ext = os.path.splitext(value)[1].lower()
        if ext not in ALLOWED_EXTENSIONS:
            raise serializers.ValidationError(f"Only image files with extensions {ALLOWED_EXTENSIONS} are allowed.")
        return value

