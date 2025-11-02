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
from django.db import transaction, IntegrityError
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

from utils.communication import send_email_verification_code, send_welcome_email, send_sms, send_otp_sms, send_welcome_message, send_password_reset_message
from .UserSerializer.Serializers import RegisterSerializer, LoginSerializer, ForgotPasswordOTPSerializer, \
    ResetPasswordWithOTPSerializer, UserRegistrationSerializer
from .utils import success_response, error_response, normalize_phone
from .serializers import SignupSerializer

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
    User registration view that creates user in DB and sends OTP for verification
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        try:
            safe_data = mask_sensitive_data(request.data)
            logger.info(f"[REGISTER ATTEMPT] - payload={safe_data}")

            serializer = UserRegistrationSerializer(data=request.data)
            if serializer.is_valid():
                user_data = serializer.validated_data
                email = user_data.get('email')
                phone = user_data.get('phone')
                
                if not email and not phone:
                    return Response({
                        'success': False,
                        'message': 'Either email or phone is required for registration.'
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                try:
                    with transaction.atomic():
                        # Create user with inactive status (will be activated after OTP verification)
                        # Normalize phone if provided to avoid duplicates across formats
                        normalized_phone = None
                        if phone:
                            try:
                                normalized_phone = normalize_phone(phone)
                            except Exception:
                                normalized_phone = phone

                        user = User.objects.create(
                            first_name=user_data['first_name'],
                            last_name=user_data['last_name'],
                            partnership_number=user_data['partnership_number'],
                            email=email,
                            phone=normalized_phone,
                            user_type=user_data['user_type'],
                            password=make_password(user_data['password']),
                            is_active=False,  # User is inactive until OTP verification
                            is_verified=False,  # User is not verified yet
                            email_verified=False,
                            phone_verified=False
                        )
                        
                        # Generate OTP
                        otp = generate_otp()
                        
                        # Store OTP in user model (temporary field)
                        user.otp = otp
                        user.save()
                        
                        logger.info(f"[REGISTER CREATED] user_id={user.id}")
                        
                        # Send OTP based on contact method
                        if email:
                            try:
                                send_verification_email(email, otp)
                                return Response({
                                    'success': True,
                                    'message': 'Account created! Please check your email for OTP verification.',
                                    'user_id': user.id,
                                    'requires_otp': True,
                                    'otp_sent_to': 'email'
                                }, status=status.HTTP_201_CREATED)
                            except Exception as e:
                                # If email fails, delete the user and return error
                                user.delete()
                                logger.error(f"[REGISTER OTP EMAIL FAILED] user_id={user.id} error={str(e)}")
                                return Response({
                                    'success': False,
                                    'message': f'Failed to send OTP: {str(e)}'
                                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                        
                        elif phone:
                            try:
                                send_verification_sms(phone, otp)
                                return Response({
                                    'success': True,
                                    'message': 'Account created! Please check your phone for OTP verification.',
                                    'user_id': user.id,
                                    'requires_otp': True,
                                    'otp_sent_to': 'phone'
                                }, status=status.HTTP_201_CREATED)
                            except Exception as e:
                                # If SMS fails, delete the user and return error
                                user.delete()
                                logger.error(f"[REGISTER OTP SMS FAILED] user_id={user.id} error={str(e)}")
                                return Response({
                                    'success': False,
                                    'message': f'Failed to send OTP: {str(e)}'
                                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                
                except IntegrityError as e:
                    # Handle unique constraint violations gracefully
                    error_message = str(e)
                    if 'user_auth_user.email' in error_message or 'UNIQUE constraint failed: user_auth_user.email' in error_message:
                        friendly = 'This email is already registered.'
                    elif 'user_auth_user.phone' in error_message or 'UNIQUE constraint failed: user_auth_user.phone' in error_message:
                        friendly = 'This phone number is already registered.'
                    else:
                        friendly = 'A uniqueness constraint failed.'
                    logger.warning(f"[REGISTER INTEGRITY ERROR] {error_message}")
                    return Response({
                        'success': False,
                        'message': friendly
                    }, status=status.HTTP_400_BAD_REQUEST)
                except Exception as e:
                    logger.exception(f"[REGISTER CREATE FAILED] error={str(e)}")
                    return Response({
                        'success': False,
                        'message': f'Failed to create account: {str(e)}'
                    }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            else:
                logger.warning(f"[REGISTER VALIDATION ERROR] errors={serializer.errors}")
                return Response({
                    'success': False,
                    'message': 'Invalid data provided.',
                    'errors': serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            logger.exception(f"[REGISTER UNHANDLED ERROR] error={str(e)}")
            return Response({
                'success': False,
                'message': f'Registration failed: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            return error_response("Login failed", serializer.errors)

        validated_data = serializer.validated_data
        logger.info(f"Login successful for user: {validated_data.get('email') or validated_data.get('phone')}")

        return success_response("Login successful", validated_data)


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
                    # Enforce reset method matches registration contact
                    if not user.email:
                        return error_response("This account was registered with phone. Use phone to reset.")
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
                    try:
                        normalized = normalize_phone(identifier)
                    except Exception as e:
                        return error_response(str(e))
                    user = User.objects.get(phone=normalized)
                    # Enforce reset method matches registration contact
                    if not user.phone:
                        return error_response("This account was registered with email. Use email to reset.")
                    otp = str(random.randint(100000, 999999))
                    user.otp = otp
                    user.save()

                    logger.info(f"[FORGOT PASSWORD SUCCESS] - Phone: {identifier}, User: {user.id}")

                    success, response = send_password_reset_message(identifier, otp)

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
            # Log for development testing
            logger.debug(f"🔧 DEV TESTING - Email Token: {token} sent to {email}")
            print(f"🔧 DEV TESTING - Email Token: {token} sent to {email}")
            return success_response("Verification token sent to email")
        else:
            logger.error(f"[EMAIL VERIFICATION FAILED] - Email: {email}, Response: {response}")
            return error_response("Failed to send verification email. Please try again later.")

class SendPhoneOTPView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        # Accept multiple possible client field names
        phone = (
            request.data.get("phone_number")
            or request.data.get("phone")
            or request.data.get("phoneNumber")
            or request.data.get("identifier")
        )
        if isinstance(phone, str):
            phone = phone.strip()
        if not phone:
            return error_response("Phone number is required")

        try:
            # Normalize phone for consistent lookup
            try:
                normalized_phone = normalize_phone(phone)
            except Exception:
                normalized_phone = phone

            # Prefer the most recent unverified user if duplicates exist
            user = (
                User.objects.filter(phone=normalized_phone, is_active=False)
                .order_by('-id')
                .first()
            ) or (
                User.objects.filter(phone=normalized_phone).order_by('-id').first()
            )
            if not user:
                raise User.DoesNotExist
        except User.DoesNotExist:
            return error_response("User with this phone number does not exist")

        otp = str(random.randint(100000, 999999))
        user.otp = otp
        user.save()
        success, response = send_sms(phone, otp)
        if success:
            # Log for development testing
            logger.debug(f"🔧 DEV TESTING - Phone OTP: {otp} sent to {phone}")
            print(f"🔧 DEV TESTING - Phone OTP: {otp} sent to {phone}")
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
        # Accept multiple possible client field names
        phone = (
            request.data.get("phone_number")
            or request.data.get("phone")
            or request.data.get("phoneNumber")
            or request.data.get("identifier")
        )
        otp = (
            request.data.get("otp")
            or request.data.get("token")
            or request.data.get("code")
        )
        if isinstance(phone, str):
            phone = phone.strip()
        if isinstance(otp, str):
            otp = otp.strip()

        if not phone or not otp:
            return error_response(message="Phone number and OTP are required")

        # Normalize phone for consistent lookup
        try:
            normalized_phone = normalize_phone(phone)
        except Exception:
            normalized_phone = phone

        # Find matching inactive user by phone and OTP first; fall back to any by phone
        user = (
            User.objects.filter(phone=normalized_phone, otp=str(otp), is_active=False)
            .order_by('-id')
            .first()
        )

        if not user:
            # If no exact match, attempt to locate latest by phone for better error messaging
            fallback_user = User.objects.filter(phone=normalized_phone).order_by('-id').first()
            if fallback_user:
                logger.debug(
                    f"🔧 DEV TESTING - OTP Verification Failed: Expected {fallback_user.otp}, Got {otp}"
                )
            return error_response(message="Invalid OTP.")

        # OTP is valid for this user, activate and clear OTP
        user.phone_verified = True
        user.otp = None
        user.is_active = True
        user.is_verified = True
        user.save()

        # Send welcome SMS (best effort)
        try:
            send_welcome_message(normalized_phone, f"{user.first_name} {user.last_name}")
            logger.info(f"Welcome SMS sent to {normalized_phone} after verification")
        except Exception as e:
            logger.warning(f"Failed to send welcome SMS: {str(e)}")

        logger.info(f"[PHONE VERIFICATION SUCCESS] - User {user.id}, Phone: {normalized_phone}")
        return success_response(message="Phone number verified successfully! Your account is now active.")


# New views for /api/auth/ endpoints expected by frontend

class VerifyEmailOTPView(APIView):
    """
    Verify email OTP and return user data with tokens
    Endpoint: /api/auth/verify-email-otp/
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        email = request.data.get("email")
        otp = request.data.get("otp")

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return error_response(message="User not found")

        # Verify OTP
        if str(user.email_token) == str(otp):
            # Determine if this is a new user before activation
            is_new_user = not user.is_active
            
            # Clear OTP token
            user.email_token = None
            
            # Activate user if inactive
            if not user.is_active:
                user.email_verified = True
                user.is_active = True
                user.is_verified = True
                
                # Send welcome email
                try:
                    send_welcome_email(email, f"{user.first_name} {user.last_name}")
                    logger.info(f"Welcome email sent to {email}")
                except Exception as e:
                    logger.warning(f"Failed to send welcome email: {str(e)}")
            
            user.save()
            
            # Generate tokens
            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)
            refresh_token = str(refresh)
            
            # Check if profile is complete
            is_profile_complete = True
            if user.user_type == 'business':
                from business.models import Business
                has_business = Business.objects.filter(user=user, is_active=True).exists()
                is_profile_complete = has_business
            else:
                is_profile_complete = bool(user.first_name and user.last_name)
            
            logger.info(f"[EMAIL OTP SUCCESS] - User {user.id}, Email: {email}, Profile Complete: {is_profile_complete}, New User: {is_new_user}")
            
            return Response({
                'success': True,
                'message': 'OTP verified successfully!',
                'user': {
                    'id': user.id,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'partnership_number': user.partnership_number,
                    'email': user.email,
                    'phone': user.phone,
                    'user_type': user.user_type,
                    'is_active': user.is_active,
                    'is_verified': user.is_verified
                },
                'tokens': {
                    'access': access_token,
                    'refresh': refresh_token
                },
                'is_profile_complete': is_profile_complete,
                'is_new_user': is_new_user
            }, status=status.HTTP_200_OK)
        
        return error_response(message="Invalid verification token.")


class VerifyPhoneOTPView(APIView):
    """
    Verify phone OTP and return user data with tokens
    Endpoint: /api/auth/verify-phone-otp/
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        phone = request.data.get("phone")
        otp = request.data.get("otp")

        if not phone or not otp:
            return error_response(message="Phone number and OTP are required")

        try:
            normalized_phone = normalize_phone(phone)
        except Exception:
            normalized_phone = phone

        try:
            user = User.objects.filter(phone=normalized_phone).order_by('-id').first()
            if not user:
                raise User.DoesNotExist
        except User.DoesNotExist:
            logger.debug(f"🔧 DEV TESTING - User not found for phone: {phone}")
            return error_response(message="User not found.")

        # Verify OTP
        if str(user.otp) != str(otp):
            logger.debug(f"🔧 DEV TESTING - OTP Verification Failed: Expected {user.otp}, Got {otp}")
            return error_response(message="Invalid OTP.")

        # Determine if this is a new user before activation
        is_new_user = not user.is_active
        
        # Clear OTP and activate user
        user.otp = None
        
        if not user.is_active:
            user.phone_verified = True
            user.is_active = True
            user.is_verified = True
            
            # Send welcome SMS
            try:
                send_welcome_message(normalized_phone, f"{user.first_name} {user.last_name}")
                logger.info(f"Welcome SMS sent to {normalized_phone}")
            except Exception as e:
                logger.warning(f"Failed to send welcome SMS: {str(e)}")
        
        user.save()

        # Generate tokens
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)
        
        # Check if profile is complete
        is_profile_complete = True
        if user.user_type == 'business':
            from business.models import Business
            has_business = Business.objects.filter(user=user, is_active=True).exists()
            is_profile_complete = has_business
        else:
            is_profile_complete = bool(user.first_name and user.last_name)
        
        # Determine if profile completion is required (inverse of is_profile_complete)
        requires_profile_completion = not is_profile_complete
        
        logger.info(f"[PHONE OTP SUCCESS] - User {user.id}, Phone: {normalized_phone}, Profile Complete: {is_profile_complete}, New User: {is_new_user}")
        
        return Response({
            'success': True,
            'message': 'Phone verified successfully! Please complete your profile.' if requires_profile_completion else 'OTP verified successfully!',
            'data': {
                'access_token': access_token,
                'refresh_token': refresh_token,
                'user': {
                    'id': user.id,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'partnership_number': user.partnership_number,
                    'email': user.email,
                    'phone': user.phone,
                    'phone_verified': user.phone_verified,
                    'user_type': user.user_type,
                    'is_active': user.is_active,
                    'is_verified': user.is_verified,
                    'requires_profile_completion': requires_profile_completion
                },
                'requires_profile_completion': requires_profile_completion,
                'first_time': is_new_user
            }
        }, status=status.HTTP_200_OK)


class VerifyRegistrationOTPView(APIView):
    """
    Verify OTP and activate user account
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        try:
            user_id = request.data.get('user_id')
            otp = request.data.get('otp')
            
            if not user_id or not otp:
                return Response({
                    'success': False,
                    'message': 'User ID and OTP are required.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            try:
                # Get user from database
                user = User.objects.get(id=user_id, is_active=False)
            except User.DoesNotExist:
                return Response({
                    'success': False,
                    'message': 'User not found or already verified.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Verify OTP
            if str(otp) != str(user.otp):
                # Log for development testing
                logger.debug(f"🔧 DEV TESTING - OTP Verification Failed: Expected {user.otp}, Got {otp}")
                print(f"🔧 DEV TESTING - OTP Verification Failed: Expected {user.otp}, Got {otp}")
                return Response({
                    'success': False,
                    'message': 'Invalid OTP. Please check and try again.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # OTP is valid, activate the user
            try:
                with transaction.atomic():
                    # Log for development testing
                    logger.debug(f"🔧 DEV TESTING - OTP Verification Success: {otp} for user {user.id}")
                    print(f"🔧 DEV TESTING - OTP Verification Success: {otp} for user {user.id}")
                    
                    # Activate user account
                    user.is_active = True
                    user.is_verified = True
                    user.email_verified = bool(user.email)
                    user.phone_verified = bool(user.phone)
                    user.otp = None  # Clear OTP after use
                    user.save()
                    
                    logger.info(f"User {user.id} activated successfully")
                    
                    # Send welcome messages
                    try:
                        if user.email:
                            send_welcome_email(user.email, f"{user.first_name} {user.last_name}")
                            logger.info(f"Welcome email sent to {user.email}")
                        
                        if user.phone:
                            send_welcome_message(user.phone, f"{user.first_name} {user.last_name}")
                            logger.info(f"Welcome SMS sent to {user.phone}")
                    except Exception as e:
                        logger.warning(f"Failed to send welcome message: {str(e)}")
                        # Don't fail the activation if welcome message fails
                    
                    # Generate authentication tokens
                    refresh = RefreshToken.for_user(user)
                    access_token = str(refresh.access_token)
                    refresh_token = str(refresh)
                    
                    return Response({
                        'success': True,
                        'message': 'Account activated successfully! Welcome to our platform.',
                        'user': {
                            'id': user.id,
                            'first_name': user.first_name,
                            'last_name': user.last_name,
                            'partnership_number': user.partnership_number,
                            'email': user.email,
                            'phone': user.phone,
                            'user_type': user.user_type,
                            'is_active': user.is_active,
                            'is_verified': user.is_verified
                        },
                        'tokens': {
                            'access': access_token,
                            'refresh': refresh_token
                        }
                    }, status=status.HTTP_200_OK)
                    
            except Exception as e:
                logger.error(f"Failed to activate user {user.id}: {str(e)}")
                return Response({
                    'success': False,
                    'message': f'Failed to activate account: {str(e)}'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                
        except Exception as e:
            logger.error(f"OTP verification failed: {str(e)}")
            return Response({
                'success': False,
                'message': f'OTP verification failed: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ResendOTPView(APIView):
    """
    Resend OTP using email or phone
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        try:
            email = request.data.get('email')
            phone = request.data.get('phone')
            
            if not email and not phone:
                return Response({
                    'success': False,
                    'message': 'Email or phone is required.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Find user by email or phone
            try:
                if email:
                    user = User.objects.get(email=email, is_active=False)
                    contact_method = 'email'
                    contact_value = email
                else:
                    user = User.objects.get(phone=phone, is_active=False)
                    contact_method = 'phone'
                    contact_value = phone
            except User.DoesNotExist:
                return Response({
                    'success': False,
                    'message': 'User not found or already verified.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Generate new OTP and store it on the user model for a unified flow
            new_otp = generate_otp()
            user.otp = new_otp
            user.save()
            
            logger.info(f"New OTP generated for user {user.id}: {new_otp}")
            
            # Send new OTP
            try:
                if contact_method == 'email':
                    send_verification_email(contact_value, new_otp)
                    # Log for development testing
                    logger.debug(f"🔧 DEV TESTING - Resend Email OTP: {new_otp} sent to {contact_value}")
                    print(f"🔧 DEV TESTING - Resend Email OTP: {new_otp} sent to {contact_value}")
                    message = 'New OTP sent to your email.'
                else:
                    send_verification_sms(contact_value, new_otp)
                    # Log for development testing
                    logger.debug(f"🔧 DEV TESTING - Resend Phone OTP: {new_otp} sent to {contact_value}")
                    print(f"🔧 DEV TESTING - Resend Phone OTP: {new_otp} sent to {contact_value}")
                    message = 'New OTP sent to your phone.'
                
                return Response({
                    'success': True,
                    'message': message,
                    'otp_sent_to': contact_method
                }, status=status.HTTP_200_OK)
                
            except Exception as e:
                logger.error(f"Failed to send {contact_method} OTP to {contact_value}: {str(e)}")
                return Response({
                    'success': False,
                    'message': f'Failed to send {contact_method} OTP: {str(e)}'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                
        except Exception as e:
            logger.error(f"Failed to resend OTP: {str(e)}")
            return Response({
                'success': False,
                'message': f'Failed to resend OTP: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ResendRegistrationOTPView(APIView):
    """
    Resend OTP for registration
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        try:
            user_id = request.data.get('user_id')
            
            if not user_id:
                return Response({
                    'success': False,
                    'message': 'User ID is required.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            try:
                # Get user from database
                user = User.objects.get(id=user_id, is_active=False)
            except User.DoesNotExist:
                return Response({
                    'success': False,
                    'message': 'User not found or already verified.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Generate new OTP
            new_otp = generate_otp()
            
            # Update user's OTP
            user.otp = new_otp
            user.save()
            
            logger.info(f"New OTP generated for user {user.id}: {new_otp}")
            
            # Send new OTP based on contact method
            email = user.email
            phone = user.phone
            
            if email:
                try:
                    send_verification_email(email, new_otp)
                    return Response({
                        'success': True,
                        'message': 'New OTP sent to your email.',
                        'otp_sent_to': 'email'
                    }, status=status.HTTP_200_OK)
                except Exception as e:
                    logger.error(f"Failed to send email OTP to {email}: {str(e)}")
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
                    logger.error(f"Failed to send SMS OTP to {phone}: {str(e)}")
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
            logger.error(f"Failed to resend OTP: {str(e)}")
            return Response({
                'success': False,
                'message': f'Failed to resend OTP: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class SignupView(APIView):
    """
    User signup view with required fields and OTP generation
    Uses SignupSerializer for validation
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        try:
            serializer = SignupSerializer(data=request.data)
            if serializer.is_valid():
                # Extract validated data
                first_name = serializer.validated_data['firstname']
                last_name = serializer.validated_data['lastname']
                partnership_number = serializer.validated_data['partnership_number']
                user_type = serializer.validated_data['userType']
                password = serializer.validated_data['password']
                is_email = serializer.validated_data['isEmail']
                email = serializer.validated_data.get('email')
                phone = serializer.validated_data.get('phone')
                
                # Create user
                user = User.objects.create(
                    first_name=first_name,
                    last_name=last_name,
                    partnership_number=partnership_number,
                    email=email,
                    phone=phone,
                    user_type=user_type.lower(),  # Convert to lowercase for DB
                    password=make_password(password),
                    is_active=False,
                    is_verified=False,
                    email_verified=False,
                    phone_verified=False
                )
                
                # Generate 6-digit token
                token = generate_otp()
                
                # Store token based on contact method
                if is_email:
                    user.email_token = token
                else:
                    user.otp = token
                
                user.save()
                
                logger.info(f"User created with ID: {user.id}, Token: {token}")
                
                # Send token via email or phone
                try:
                    if is_email:
                        send_verification_email(email, token)
                        message = f"Account created! Please check your email for verification token."
                        token_sent_to = "email"
                        # Log for development testing
                        logger.debug(f"🔧 DEV TESTING - Email Token: {token} sent to {email}")
                        print(f"🔧 DEV TESTING - Email Token: {token} sent to {email}")
                    else:
                        send_verification_sms(phone, token)
                        message = f"Account created! Please check your phone for verification token."
                        token_sent_to = "phone"
                        # Log for development testing
                        logger.debug(f"🔧 DEV TESTING - Phone Token: {token} sent to {phone}")
                        print(f"🔧 DEV TESTING - Phone Token: {token} sent to {phone}")
                    
                    return Response({
                        'success': True,
                        'message': message,
                        'user_id': user.id,
                        'requires_verification': True,
                        'token_sent_to': token_sent_to
                    }, status=status.HTTP_201_CREATED)
                    
                except Exception as e:
                    # If token sending fails, delete the user and return error
                    user.delete()
                    logger.error(f"Failed to send verification token: {str(e)}")
                    return Response({
                        'success': False,
                        'message': f'Failed to send verification token: {str(e)}'
                    }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            else:
                return Response({
                    'success': False,
                    'message': 'Validation failed.',
                    'errors': serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            logger.error(f"Signup failed: {str(e)}")
            return Response({
                'success': False,
                'message': f'Signup failed: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
