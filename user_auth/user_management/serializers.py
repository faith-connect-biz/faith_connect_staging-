import os

from django.contrib.auth import get_user_model
from rest_framework import serializers

User = get_user_model()
ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png']
class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'email', 'phone', 'email_verified', 'phone_verified','partnership_number']



class UpdateUserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['first_name', 'last_name']  # Only allow updating these fields


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

