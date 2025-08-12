# authapp/serializers.py
from django.contrib.auth import authenticate
from rest_framework import serializers


from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'first_name', 'last_name', 'partnership_number', 'user_type',
            'email', 'phone', 'password'
        ]
        extra_kwargs = {
            'password': {'write_only': True, 'min_length': 6},
        }

    def validate(self, data):
        email = data.get('email')
        phone = data.get('phone')

        if not email and not phone:
            raise serializers.ValidationError("Either phone or email must be provided.")

        if email and User.objects.filter(email=email).exists():
            raise serializers.ValidationError("Email already exists.")

        if phone and User.objects.filter(phone=phone).exists():
            raise serializers.ValidationError("Phone number already exists.")

        return data

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        return user


class LoginSerializer(serializers.Serializer):
    partnership_number = serializers.CharField(required=False)
    identifier = serializers.CharField(required=False)  # email or phone
    auth_method = serializers.ChoiceField(choices=['email', 'phone'], required=False)
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        partnership_number = data.get('partnership_number')
        identifier = data.get('identifier')
        auth_method = data.get('auth_method')
        password = data.get('password')

        # Support both old and new login methods
        if partnership_number:
            # Traditional login with partnership number
            user = authenticate(partnership_number=partnership_number, password=password)
        elif identifier and auth_method:
            # New login with email/phone
            if auth_method == 'email':
                try:
                    user = User.objects.get(email=identifier)
                except User.DoesNotExist:
                    raise serializers.ValidationError("User with this email does not exist")
            else:  # phone
                try:
                    user = User.objects.get(phone=identifier)
                except User.DoesNotExist:
                    raise serializers.ValidationError("User with this phone number does not exist")
            
            # Verify password
            if not user.check_password(password):
                raise serializers.ValidationError("Invalid password")
        else:
            raise serializers.ValidationError("Either partnership_number or identifier with auth_method must be provided")

        if not user:
            raise serializers.ValidationError("Invalid credentials")

        token = RefreshToken.for_user(user)

        return {
            "access": str(token.access_token),
            "refresh": str(token),
            "partnership_number": user.partnership_number,
            "user_type": user.user_type,
            "email": user.email,
            "phone": user.phone,
            "is_active": user.is_active,
        }

class ForgotPasswordOTPSerializer(serializers.Serializer):
    phone_number = serializers.CharField()
    @staticmethod
    def validate_phone_number(value):
        if not User.objects.filter(phone=value).exists():
            raise serializers.ValidationError("User with this phone number does not exist.")
        return value

class ResetPasswordWithOTPSerializer(serializers.Serializer):
    phone_number = serializers.CharField()
    otp = serializers.CharField()
    new_password = serializers.CharField(min_length=6)

