import logging
import random
from tokenize import TokenError
import json
from django.core.cache import cache
from django.conf import settings
import uuid
from django.utils import timezone

from django.contrib.auth import get_user_model
from django.contrib.auth import authenticate
from django.contrib.auth.hashers import make_password
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.db import transaction
from django.http import JsonResponse
from django.shortcuts import render
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.views.generic import View
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework_simplejwt.serializers import TokenRefreshSerializer
from rest_framework.response import Response

from utils.zeptomail import send_email_verification_code
from utils.communication import send_sms
from .UserSerializer.Serializers import RegisterSerializer, LoginSerializer, ForgotPasswordOTPSerializer, \
    ResetPasswordWithOTPSerializer, UserRegistrationSerializer
from .utils import success_response, error_response

# Helper functions
def generate_otp():
    """Generate a 6-digit OTP"""
    return str(random.randint(100000, 999999))

def clear_otp_cache(registration_token):
    """Clear OTP-related cache entries"""
    try:
        registration_cache_key = f'registration_{registration_token}'
        otp_cache_key = f'otp_{registration_token}'
        cache.delete(registration_cache_key)
        cache.delete(otp_cache_key)
        logger.info(f"Cleared cache for registration token: {registration_token}")
        return True
    except Exception as e:
        logger.error(f"Failed to clear cache: {e}")
        return False

def get_cache_status(registration_token):
    """Get cache status for debugging"""
    try:
        registration_cache_key = f'registration_{registration_token}'
        otp_cache_key = f'otp_{registration_token}'
        
        registration_data = cache.get(registration_cache_key)
        stored_otp = cache.get(otp_cache_key)
        
        return {
            'registration_data_exists': bool(registration_data),
            'otp_exists': bool(stored_otp),
            'otp_value': stored_otp if stored_otp else None
        }
    except Exception as e:
        logger.error(f"Failed to get cache status: {e}")
        return {'error': str(e)}

def send_verification_email(email, otp):
    """Send verification email with OTP"""
    try:
        from utils.zeptomail import send_email_verification_code
        success, response = send_email_verification_code(
            email=email,
            token=otp,
            user_name="User"  # Will be updated after user creation
        )
        if not success:
            raise Exception(f"Email service error: {response}")
        return True
    except Exception as e:
        raise Exception(f"Failed to send email: {str(e)}")

def send_verification_sms(phone, otp):
    """Send verification SMS with OTP"""
    try:
        from utils.communication import send_otp_sms
        success, response = send_otp_sms(phone, otp)
        if not success:
            raise Exception(f"SMS service error: {response}")
        return True
    except Exception as e:
        raise Exception(f"Failed to send SMS: {str(e)}")


logger = logging.getLogger('user_auth')
User = get_user_model()  # ✅ Correct User model import


def mask_sensitive_data(data, sensitive_fields=None):
    sensitive_fields = sensitive_fields or ['password']
    return {
        k: ('****' if k in sensitive_fields else v)
        for k, v in data.items()
    }


class RegisterAPIView(APIView):
    """
    User registration view that stores data temporarily until OTP verification
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        try:
            serializer = UserRegistrationSerializer(data=request.data)
            if serializer.is_valid():
                # Generate a unique registration token
                registration_token = str(uuid.uuid4())
                
                # Store registration data temporarily (expires in 10 minutes)
                registration_data = {
                    'user_data': serializer.validated_data,
                    'timestamp': timezone.now().isoformat(),
                    'verified': False
                }
                
                # Store in cache with 10-minute expiration
                cache_key = f'registration_{registration_token}'
                cache.set(cache_key, registration_data, timeout=600)  # 10 minutes
                
                # Send OTP to user's email/phone
                user_data = serializer.validated_data
                email = user_data.get('email')
                phone = user_data.get('phone')
                
                if email:
                    # Send email OTP
                    try:
                        # Generate OTP
                        otp = generate_otp()
                        
                        # Store OTP in cache with registration token
                        otp_cache_key = f'otp_{registration_token}'
                        cache.set(otp_cache_key, otp, timeout=600)  # 10 minutes
                        
                        # Send email with OTP
                        send_verification_email(email, otp)
                        
                        return Response({
                            'success': True,
                            'message': 'Registration data received. Please check your email for OTP verification.',
                            'registration_token': registration_token,
                            'requires_otp': True,
                            'otp_sent_to': 'email'
                        }, status=status.HTTP_200_OK)
                        
                    except Exception as e:
                        # Remove registration data if OTP sending fails
                        cache.delete(cache_key)
                        return Response({
                            'success': False,
                            'message': f'Failed to send OTP: {str(e)}'
                        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                
                elif phone:
                    # Send phone OTP
                    try:
                        # Generate OTP
                        otp = generate_otp()
                        
                        # Store OTP in cache with registration token
                        otp_cache_key = f'otp_{registration_token}'
                        cache.set(otp_cache_key, otp, timeout=600)  # 10 minutes
                        
                        # Send SMS with OTP
                        send_verification_sms(phone, otp)
                        
                        return Response({
                            'success': True,
                            'message': 'Registration data received. Please check your phone for OTP verification.',
                            'registration_token': registration_token,
                            'requires_otp': True,
                            'otp_sent_to': 'phone'
                        }, status=status.HTTP_200_OK)
                        
                    except Exception as e:
                        # Remove registration data if OTP sending fails
                        cache.delete(cache_key)
                        return Response({
                            'success': False,
                            'message': f'Failed to send OTP: {str(e)}'
                        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                
                else:
                    # No email or phone provided
                    cache.delete(cache_key)
                    return Response({
                        'success': False,
                        'message': 'Either email or phone is required for registration.'
                    }, status=status.HTTP_400_BAD_REQUEST)
            
            else:
                return Response({
                    'success': False,
                    'message': 'Invalid data provided.',
                    'errors': serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            return Response({
                'success': False,
                'message': f'Registration failed: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            serializer = LoginSerializer(data=request.data)
            if serializer.is_valid():
                # The serializer returns tokens and user data directly
                validated_data = serializer.validated_data
                
                logger.info(f"Login successful for partnership: {validated_data.get('partnership_number')}")
                
                return success_response("Login successful", {
                    "tokens": {
                        "access": validated_data.get('access'),
                        "refresh": validated_data.get('refresh'),
                    },
                    "user": {
                        "partnership_number": validated_data.get('partnership_number'),
                        "user_type": validated_data.get('user_type'),
                        "email": validated_data.get('email'),
                        "phone": validated_data.get('phone'),
                        "is_active": validated_data.get('is_active'),
                    }
                })
            else:
                # Handle field validation errors
                return error_response("Login failed", serializer.errors)
                
        except serializers.ValidationError as e:
            # Handle validation errors from the serializer's validate() method
            if hasattr(e, 'detail'):
                # If it's a ValidationError with detail
                if isinstance(e.detail, list):
                    message = e.detail[0] if e.detail else "Login failed"
                elif isinstance(e.detail, dict):
                    message = "Login failed"
                    errors = e.detail
                else:
                    message = str(e.detail)
                    errors = {"non_field_errors": [str(e.detail)]}
            else:
                # If it's a simple ValidationError
                message = str(e)
                errors = {"non_field_errors": [str(e)]}
            
            return error_response(message, errors)
            
        except Exception as e:
            # Handle any other unexpected errors
            logger.error(f"Login error: {str(e)}")
            return error_response("Login failed", {"non_field_errors": ["An unexpected error occurred. Please try again."]})


class LogoutAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        refresh_token = request.data.get("refresh")
        if not refresh_token:
            return error_response("Refresh token is required", status_code=status.HTTP_400_BAD_REQUEST)

        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
            return success_response("Logout successful", status_code=status.HTTP_205_RESET_CONTENT)
        except TokenError:
            return error_response("Invalid or expired token", status_code=status.HTTP_400_BAD_REQUEST)


class CustomTokenRefreshView(TokenRefreshView):
    serializer_class = TokenRefreshSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)

        try:
            serializer.is_valid(raise_exception=True)
        except Exception as e:
            return error_response("Token refresh failed", str(e), status.HTTP_400_BAD_REQUEST)

        return success_response("Token refreshed", serializer.validated_data)


class ForgotPasswordOTPView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        safe_data = mask_sensitive_data(request.data)
        logger.info(f"[FORGOT PASSWORD ATTEMPT] - {safe_data}")

        serializer = ForgotPasswordOTPSerializer(data=request.data)
        if serializer.is_valid():
            identifier = serializer.validated_data['identifier']
            
            # Determine if it's email or phone
            is_email = '@' in identifier
            
            try:
                if is_email:
                    user = User.objects.get(email=identifier)
                    # Generate OTP for email
                    otp = str(random.randint(100000, 999999))
                    user.otp = otp
                    user.save()
                    
                    # Generate password reset link
                    reset_link = f"https://yourdomain.com/reset-password?token={otp}&email={identifier}"
                    
                    logger.info(f"[FORGOT PASSWORD SUCCESS] - Email: {identifier}, User: {user.id}")
                    
                    # Send email via ZeptoMail with reset link
                    success, response = send_email_verification_code(
                        email=identifier, 
                        token=otp, 
                        user_name=f"{user.first_name} {user.last_name}",
                        reset_link=reset_link
                    )
                    
                    if success:
                        return success_response(message="Password reset link sent to your email successfully.")
                    else:
                        logger.error(f"[FORGOT PASSWORD EMAIL FAILED] - Email: {identifier}, Response: {response}")
                        return error_response(message="Failed to send password reset email. Please try again later.")
                        
                else:
                    # Phone number
                    user = User.objects.get(phone=identifier)
                    otp = str(random.randint(100000, 999999))
                    user.otp = otp
                    user.save()

                    logger.info(f"[FORGOT PASSWORD SUCCESS] - Phone: {identifier}, User: {user.id}")

                    success, response = send_email_verification_code(identifier, otp)

                    if success:
                        return success_response(message="OTP sent successfully to your phone.")
                    else:
                        logger.error(f"[FORGOT PASSWORD SMS FAILED] - Phone: {identifier}, Response: {response}")
                        return error_response(message="Failed to send OTP. Please try again later.")

            except User.DoesNotExist:
                identifier_type = "email" if is_email else "phone number"
                logger.warning(f"[FORGOT PASSWORD FAILED] - {identifier_type}: {identifier} not found")
                return error_response(f"User not found with this {identifier_type}.")

        logger.warning(f"[FORGOT PASSWORD VALIDATION ERROR] - {serializer.errors}")
        return error_response(message="Validation failed.", errors=serializer.errors)


class ResetPasswordWithOTPView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = ResetPasswordWithOTPSerializer(data=request.data)
        if serializer.is_valid():
            identifier = serializer.validated_data['identifier']
            otp = serializer.validated_data['otp']
            new_password = serializer.validated_data['new_password']
            
            # Determine if it's email or phone
            is_email = '@' in identifier

            try:
                if is_email:
                    user = User.objects.get(email=identifier, otp=otp)
                else:
                    user = User.objects.get(phone=identifier, otp=otp)
            except User.DoesNotExist:
                identifier_type = "email" if is_email else "phone number"
                return error_response(f"Invalid {identifier_type} or OTP.")

            user.set_password(new_password)
            user.otp = None  # Clear OTP after use
            user.save()

            return success_response(message="Password reset successful.")
        return error_response(message="Reset failed.", errors=serializer.errors)

class SendEmailVerificationView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        email = request.data.get("email")
        if not email:
            return error_response("Email is required")

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return error_response("User with this email does not exist")

        token = str(random.randint(100000, 999999))
        user.email_token = token
        user.save()

        # Use ZeptoMail for email verification
        success, response = send_email_verification_code(
            email=email, 
            token=token, 
            user_name=f"{user.first_name} {user.last_name}"
        )
        
        if success:
            return success_response("Verification token sent to email")
        else:
            logger.error(f"[EMAIL VERIFICATION FAILED] - Email: {email}, Response: {response}")
            return error_response("Failed to send verification email. Please try again later.")

class SendPhoneOTPView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        phone = request.data.get("phone_number")
        if not phone:
            return error_response("Phone number is required")

        try:
            user = User.objects.get(phone=phone)
        except User.DoesNotExist:
            return error_response("User with this phone number does not exist")

        otp = str(random.randint(100000, 999999))
        user.otp = otp
        user.save()
        success, response = send_sms(phone, otp)
        if success:
            return success_response(message="OTP sent successfully.")
        else:
            logger.error(f"[Validate  Phone  SMS FAILED] - Phone: {phone}, Response: {response}")
            return error_response(message="Failed to send OTP. Please try again later.")


class ConfirmEmailVerificationView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        email = request.data.get("email")
        token = request.data.get("token")

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return error_response(message="User not found")

        if user.email_token == token:
            user.email_verified = True
            user.email_token = None
            
            # Activate user account after email verification
            user.is_active = True
            user.is_verified = True
            user.save()
            
            # Send welcome email
            try:
                from utils.zeptomail import send_welcome_email
                send_welcome_email(email, f"{user.first_name} {user.last_name}")
                logger.info(f"Welcome email sent to {email} after verification")
            except Exception as e:
                logger.warning(f"Failed to send welcome email: {str(e)}")
                # Don't fail the verification if welcome email fails
            
            logger.info(f"[EMAIL VERIFICATION SUCCESS] - User {user.id}, Email: {email}")
            return success_response(message="Email verified successfully! Your account is now active.")
        return error_response(message="Invalid verification token.")

class ConfirmPhoneOTPView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        phone = request.data.get("phone_number")
        otp = request.data.get("otp")

        try:
            user = User.objects.get(phone=phone)
        except User.DoesNotExist:
            return error_response(message="User not found")

        if user.otp == otp:
            user.phone_verified = True
            user.otp = None
            
            # Activate user account after phone verification
            user.is_active = True
            user.is_verified = True
            user.save()
            
            # Send welcome SMS
            try:
                from utils.communication import send_welcome_sms
                send_welcome_sms(phone, f"{user.first_name} {user.last_name}")
                logger.info(f"Welcome SMS sent to {phone} after verification")
            except Exception as e:
                logger.warning(f"Failed to send welcome SMS: {str(e)}")
                # Don't fail the verification if welcome SMS fails
            
            logger.info(f"[PHONE VERIFICATION SUCCESS] - User {user.id}, Phone: {phone}")
            return success_response(message="Phone number verified successfully! Your account is now active.")
        return error_response(message="Invalid OTP.")


class VerifyRegistrationOTPView(APIView):
    """
    Verify OTP and create user account
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        try:
            registration_token = request.data.get('registration_token')
            otp = request.data.get('otp')
            
            if not registration_token or not otp:
                return Response({
                    'success': False,
                    'message': 'Registration token and OTP are required.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Get registration data from cache
            registration_cache_key = f'registration_{registration_token}'
            registration_data = cache.get(registration_cache_key)
            
            if not registration_data:
                return Response({
                    'success': False,
                    'message': 'Registration token expired or invalid. Please register again.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Get OTP from cache
            otp_cache_key = f'otp_{registration_token}'
            stored_otp = cache.get(otp_cache_key)
            
            # If OTP not in cache, try to regenerate it (fallback mechanism)
            if not stored_otp:
                logger.warning(f"OTP not found in cache for token: {registration_token}")
                return Response({
                    'success': False,
                    'message': 'OTP expired. Please request a new OTP using the resend endpoint.',
                    'requires_resend': True
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Verify OTP
            if str(otp) != str(stored_otp):
                return Response({
                    'success': False,
                    'message': 'Invalid OTP. Please check and try again.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # OTP is valid, create the user
            user_data = registration_data['user_data']
            
            try:
                with transaction.atomic():
                    # Create user with verified status
                    user = User.objects.create(
                        first_name=user_data['first_name'],
                        last_name=user_data['last_name'],
                        partnership_number=user_data['partnership_number'],
                        email=user_data.get('email'),
                        phone=user_data.get('phone'),
                        user_type=user_data['user_type'],
                        password=make_password(user_data['password']),
                        is_active=True,  # User is now active
                        is_verified=True,  # User is verified
                        email_verified=bool(user_data.get('email')),
                        phone_verified=bool(user_data.get('phone'))
                    )
                    
                    # Clear cache after successful account creation
                    cache.delete(registration_cache_key)
                    cache.delete(otp_cache_key)
                    
                    # Generate tokens
                    refresh = RefreshToken.for_user(user)
                    access_token = str(refresh.access_token)
                    refresh_token = str(refresh)
                    
                    logger.info(f"[REGISTRATION SUCCESS] - User {user.id} created successfully")
                    
                    return Response({
                        'success': True,
                        'message': 'Account created successfully!',
                        'user': {
                            'id': user.id,
                            'first_name': user.first_name,
                            'last_name': user.last_name,
                            'partnership_number': user.partnership_number,
                            'email': user.email,
                            'phone': user.phone,
                            'user_type': user.user_type,
                            'is_verified': user.is_verified
                        },
                        'tokens': {
                            'access': access_token,
                            'refresh': refresh_token
                        }
                    }, status=status.HTTP_201_CREATED)
                    
            except Exception as e:
                return Response({
                    'success': False,
                    'message': f'Failed to create account: {str(e)}'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                
        except Exception as e:
            return Response({
                'success': False,
                'message': f'OTP verification failed: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ResendRegistrationOTPView(APIView):
    """
    Resend OTP for registration
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        try:
            registration_token = request.data.get('registration_token')
            
            if not registration_token:
                return Response({
                    'success': False,
                    'message': 'Registration token is required.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Get registration data from cache
            registration_cache_key = f'registration_{registration_token}'
            registration_data = cache.get(registration_cache_key)
            
            if not registration_data:
                return Response({
                    'success': False,
                    'message': 'Registration token expired or invalid. Please register again.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Generate new OTP
            new_otp = generate_otp()
            
            # Store new OTP in cache
            otp_cache_key = f'otp_{registration_token}'
            cache.set(otp_cache_key, new_otp, timeout=600)  # 10 minutes
            
            # Send new OTP
            user_data = registration_data['user_data']
            email = user_data.get('email')
            phone = user_data.get('phone')
            
            if email:
                try:
                    send_verification_email(email, new_otp)
                    return Response({
                        'success': True,
                        'message': 'New OTP sent to your email.',
                        'otp_sent_to': 'email'
                    }, status=status.HTTP_200_OK)
                except Exception as e:
                    return Response({
                        'success': False,
                        'message': f'Failed to send email OTP: {str(e)}'
                    }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            elif phone:
                try:
                    send_verification_sms(phone, new_otp)
                    return Response({
                        'success': True,
                        'message': 'New OTP sent to your phone.',
                        'otp_sent_to': 'phone'
                    }, status=status.HTTP_200_OK)
                except Exception as e:
                    return Response({
                        'success': False,
                        'message': f'Failed to send SMS OTP: {str(e)}'
                    }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            else:
                return Response({
                    'success': False,
                    'message': 'No contact method found for OTP delivery.'
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            return Response({
                'success': False,
                'message': f'Failed to resend OTP: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

