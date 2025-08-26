from django.contrib.auth import authenticate
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from ..utils import normalize_phone

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
            'first_name': {'required': True},
            'last_name': {'required': True},
            'partnership_number': {'required': True},  # Required for everyone
            'user_type': {'required': True},
        }

    def validate_partnership_number(self, value):
        # Partnership number is required for everyone
        if not value:
            raise serializers.ValidationError("Partnership number is required.")
        
        # Don't check for duplicates - just store whatever is provided
        return value

    def validate_email(self, value):
        if value and User.objects.filter(email=value).exists():
            raise serializers.ValidationError("This email is already registered.")
        return value

    def validate_phone(self, value):
        if value:
            try:
                normalized = normalize_phone(value)
            except ValueError as e:
                raise serializers.ValidationError(str(e))
            if User.objects.filter(phone=normalized).exists():
                raise serializers.ValidationError("This phone number is already registered.")
        return value

    def validate(self, data):
        email = data.get('email')
        phone = data.get('phone')

        # Ensure at least one contact method is provided
        if not email and not phone:
            raise serializers.ValidationError("Either email or phone number must be provided.")
        
        # Check for existing users with same email OR phone
        existing_user = None
        
        if email:
            try:
                existing_user = User.objects.get(email=email)
            except User.DoesNotExist:
                pass
        
        if phone:
            try:
                normalized_phone = normalize_phone(phone)
            except ValueError as e:
                raise serializers.ValidationError({'phone': str(e)})
            # Replace incoming phone with normalized value for downstream creation
            data['phone'] = normalized_phone
            try:
                existing_user = User.objects.get(phone=normalized_phone)
            except User.DoesNotExist:
                pass
        
        if existing_user:
            # Check if this is the same person trying to add missing contact info
            if existing_user.partnership_number == data.get('partnership_number'):
                # Same person - allow updating contact info
                return data
            else:
                # Different person - prevent duplicate account
                if email and phone:
                    raise serializers.ValidationError(
                        "An account with this email or phone number already exists. "
                        "Please use a different email and phone number."
                    )
                elif email:
                    raise serializers.ValidationError(
                        "An account with this email already exists. "
                        "Please use a different email or contact support if this is your account."
                    )
                else:
                    raise serializers.ValidationError(
                        "An account with this phone number already exists. "
                        "Please use a different phone number or contact support if this is your account."
                    )

        # Ensure password meets minimum requirements
        password = data.get('password')
        if password and len(password) < 6:
            raise serializers.ValidationError("Password must be at least 6 characters long.")

        return data

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        return user


class LoginSerializer(serializers.Serializer):
    identifier = serializers.CharField(required=True)  # email or phone
    auth_method = serializers.ChoiceField(choices=['email', 'phone'], required=True)
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        identifier = data.get('identifier')
        auth_method = data.get('auth_method')
        password = data.get('password')

        user = None
        # Normalize phone identifiers to canonical format before lookup
        if auth_method == 'phone':
            try:
                identifier = normalize_phone(identifier)
            except Exception:
                # If normalization fails, continue with given identifier to avoid leaking hints
                pass

        lookup_field = 'email' if auth_method == 'email' else 'phone'

        try:
            user_obj = User.objects.get(**{lookup_field: identifier})
        except User.DoesNotExist:
            raise serializers.ValidationError("Invalid credentials")

        # Verify password
        if not user_obj.check_password(password):
            raise serializers.ValidationError("Invalid credentials")

        user = user_obj

        # Check account status
        if not user.is_active:
            raise serializers.ValidationError(
                "Your account is not yet active. Please verify your contact information first."
            )

        if not user.is_verified:
            raise serializers.ValidationError(
                "Please verify your contact information before logging in."
            )

        token = RefreshToken.for_user(user)

        return {
            "access": str(token.access_token),
            "refresh": str(token),
            "user_id": user.id,
            "user_type": user.user_type,
            "email": user.email,
            "phone": user.phone,
            "is_active": user.is_active,
        }



class ForgotPasswordOTPSerializer(serializers.Serializer):
    identifier = serializers.CharField()

    @staticmethod
    def validate_identifier(value):
        # Determine identifier type
        is_email = '@' in value
        if is_email:
            if not User.objects.filter(email=value).exists():
                raise serializers.ValidationError("User with this email does not exist.")
        else:
            # Normalize phone before lookup
            from ..utils import normalize_phone
            try:
                normalized = normalize_phone(value)
            except ValueError as e:
                raise serializers.ValidationError(str(e))
            if not User.objects.filter(phone=normalized).exists():
                raise serializers.ValidationError("User with this phone number does not exist.")
        return value


class ResetPasswordWithOTPSerializer(serializers.Serializer):
    identifier = serializers.CharField()
    otp = serializers.CharField()
    new_password = serializers.CharField(min_length=6)


class UserRegistrationSerializer(serializers.ModelSerializer):
    """
    Serializer for the new two-step registration process
    """
    # Map camelCase frontend fields to snake_case model fields (also accept snake_case aliases)
    firstName = serializers.CharField(source='first_name', required=False)
    lastName = serializers.CharField(source='last_name', required=False)
    userType = serializers.CharField(source='user_type', required=False)
    partnershipNumber = serializers.CharField(source='partnership_number', required=False)

    class Meta:
        model = User
        fields = [
            'firstName', 'lastName', 'userType', 'partnershipNumber',
            'email', 'phone', 'password'
        ]
        extra_kwargs = {
            'password': {'write_only': True, 'min_length': 6},
        }

    def to_internal_value(self, data):
        """Allow both camelCase and snake_case inputs by mapping aliases."""
        data = dict(data)  # make a shallow copy
        # If camelCase keys are missing, backfill from snake_case
        if 'firstName' not in data and 'first_name' in data:
            data['firstName'] = data['first_name']
        if 'lastName' not in data and 'last_name' in data:
            data['lastName'] = data['last_name']
        if 'userType' not in data and 'user_type' in data:
            data['userType'] = data['user_type']
        if 'partnershipNumber' not in data and 'partnership_number' in data:
            data['partnershipNumber'] = data['partnership_number']
        return super().to_internal_value(data)

    def validate_partnershipNumber(self, value):
        if not value:
            raise serializers.ValidationError("Partnership number is required.")
        return value

    def validate_email(self, value):
        if value and User.objects.filter(email=value).exists():
            raise serializers.ValidationError("This email is already registered.")
        return value

    def validate_phone(self, value):
        if value and User.objects.filter(phone=value).exists():
            raise serializers.ValidationError("This phone number is already registered.")
        return value

    def validate(self, data):
        email = data.get('email')
        phone = data.get('phone')
        # Ensure the required mapped fields exist regardless of input casing
        missing = []
        if not data.get('first_name'):
            missing.append('firstName')
        if not data.get('last_name'):
            missing.append('lastName')
        if not data.get('user_type'):
            missing.append('userType')
        if not data.get('partnership_number'):
            missing.append('partnershipNumber')
        if missing:
            # Return errors matching camelCase names expected by frontend
            raise serializers.ValidationError({field: ["This field is required."] for field in missing})

        # Ensure at least one contact method is provided
        if not email and not phone:
            raise serializers.ValidationError("Either email or phone number must be provided.")
        
        # Check for existing users with same email OR phone
        existing_user = None
        
        if email:
            try:
                existing_user = User.objects.get(email=email)
            except User.DoesNotExist:
                pass
        
        if phone:
            try:
                existing_user = User.objects.get(phone=phone)
            except User.DoesNotExist:
                pass
        
        if existing_user:
            # Check if this is the same person trying to add missing contact info
            if existing_user.partnership_number == data.get('partnership_number'):
                # Same person - allow updating contact info
                return data
            else:
                # Different person - prevent duplicate account
                if email and phone:
                    raise serializers.ValidationError(
                        "An account with this email or phone number already exists. "
                        "Please use a different email and phone number."
                    )
                elif email:
                    raise serializers.ValidationError(
                        "An account with this email already exists. "
                        "Please use a different email or contact support if this is your account."
                    )
                else:
                    raise serializers.ValidationError(
                        "An account with this phone number already exists. "
                        "Please use a different phone number or contact support if this is your account."
                    )

        # Ensure password meets minimum requirements
        password = data.get('password')
        if password and len(password) < 6:
            raise serializers.ValidationError("Password must be at least 6 characters long.")

        return data

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        return user
