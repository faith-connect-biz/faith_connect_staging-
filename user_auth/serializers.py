from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
import re

User = get_user_model()


class SignupSerializer(serializers.Serializer):
    """
    Serializer for user signup with required fields and validation
    """
    firstname = serializers.CharField(max_length=100, required=True)
    lastname = serializers.CharField(max_length=100, required=True)
    partnership_number = serializers.CharField(max_length=50, required=True)
    userType = serializers.ChoiceField(
        choices=[('Community', 'Community'), ('Business', 'Business')],
        required=True
    )
    password = serializers.CharField(write_only=True, required=True)
    isEmail = serializers.BooleanField(required=True)
    email = serializers.EmailField(required=False, allow_blank=True)
    phone = serializers.CharField(max_length=20, required=False, allow_blank=True)
    
    def validate_password(self, value):
        """Validate password strength"""
        try:
            validate_password(value)
        except ValidationError as e:
            raise serializers.ValidationError(str(e))
        return value
    
    def validate_partnership_number(self, value):
        """Check if partnership number is unique"""
        if User.objects.filter(partnership_number=value).exists():
            raise serializers.ValidationError("User with this partnership number already exists.")
        return value
    
    def validate_phone(self, value):
        """Validate phone if isEmail is False and ensure it's a Kenyan number"""
        is_email = self.initial_data.get('isEmail', False)
        if not is_email and not value:
            raise serializers.ValidationError("Phone is required when isEmail is false.")
        
        if value:
            # Check if phone number already exists
            if User.objects.filter(phone=value).exists():
                raise serializers.ValidationError("User with this phone number already exists.")
            
            # Validate Kenyan phone number format
            # Remove any spaces or special characters
            clean_phone = re.sub(r'[\s\-\(\)]', '', value)
            
            # Check if it starts with +254 or 254
            if not (clean_phone.startswith('+254') or clean_phone.startswith('254')):
                raise serializers.ValidationError("Phone number must be a Kenyan number starting with +254 or 254.")
            
            # Validate length (should be 12 digits for +254 or 11 digits for 254)
            if clean_phone.startswith('+254'):
                if len(clean_phone) != 13:  # +254 + 9 digits
                    raise serializers.ValidationError("Invalid phone number length. Should be +254 followed by 9 digits.")
            else:  # starts with 254
                if len(clean_phone) != 12:  # 254 + 9 digits
                    raise serializers.ValidationError("Invalid phone number length. Should be 254 followed by 9 digits.")
            
            # Validate that the remaining digits are numeric
            remaining_digits = clean_phone[4:] if clean_phone.startswith('+254') else clean_phone[3:]
            if not remaining_digits.isdigit():
                raise serializers.ValidationError("Phone number should contain only digits after the country code.")
            
            # Validate that the remaining digits are 9 digits
            if len(remaining_digits) != 9:
                raise serializers.ValidationError("Phone number should have exactly 9 digits after the country code.")
        
        return value
    
    def validate_email(self, value):
        """Validate email if isEmail is True"""
        is_email = self.initial_data.get('isEmail', False)
        if is_email and not value:
            raise serializers.ValidationError("Email is required when isEmail is true.")
        if value and User.objects.filter(email=value).exists():
            raise serializers.ValidationError("User with this email already exists.")
        return value
    
    def validate(self, attrs):
        """Cross-field validation"""
        is_email = attrs.get('isEmail')
        email = attrs.get('email')
        phone = attrs.get('phone')
        
        if is_email:
            if not email:
                raise serializers.ValidationError({
                    'email': 'Email is required when isEmail is true.'
                })
        else:
            if not phone:
                raise serializers.ValidationError({
                    'phone': 'Phone is required when isEmail is false.'
                })
        
        return attrs
