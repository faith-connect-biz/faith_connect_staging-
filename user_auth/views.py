import logging
import random
from tokenize import TokenError

from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import APIView
from rest_framework_simplejwt.serializers import (
    TokenRefreshSerializer
)
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView

from utils.zeptomail import send_email_verification_code
from .UserSerializer.Serializers import RegisterSerializer, LoginSerializer, ForgotPasswordOTPSerializer, \
    ResetPasswordWithOTPSerializer
from .utils import success_response, error_response


logger = logging.getLogger('user_auth')
User = get_user_model()  # ✅ Correct User model import


def mask_sensitive_data(data, sensitive_fields=None):
    sensitive_fields = sensitive_fields or ['password']
    return {
        k: ('****' if k in sensitive_fields else v)
        for k, v in data.items()
    }


class RegisterAPIView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        safe_data = mask_sensitive_data(request.data)
        logger.info(f"[REGISTER REQUEST] - {safe_data}")

        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            logger.info(f"[REGISTER SUCCESS] - User {user.id}")
            
            # Automatically send email verification if email is provided
            if user.email:
                try:
                    # Generate OTP for email verification
                    otp = str(random.randint(100000, 999999))
                    user.email_token = otp  # Use email_token for email verification
                    user.save()
                    
                    # Send email verification using ZeptoMail
                    success, response = send_email_verification_code(
                        email=user.email, 
                        token=otp, 
                        user_name=f"{user.first_name} {user.last_name}"
                    )
                    
                    if success:
                        logger.info(f"[EMAIL VERIFICATION SENT] - User {user.id}, Email: {user.email}")
                    else:
                        logger.error(f"[EMAIL VERIFICATION FAILED] - User {user.id}, Email: {user.email}, Response: {response}")
                        # Log the specific error for debugging
                        if 'error' in response:
                            logger.error(f"[EMAIL VERIFICATION ERROR DETAIL] - {response['error']}")
                except Exception as e:
                    logger.error(f"[EMAIL VERIFICATION ERROR] - User {user.id}, Email: {user.email}, Error: {str(e)}")
                    # Continue with registration even if email fails
            
            # Automatically send phone OTP if phone is provided and no email
            elif user.phone:
                try:
                    # Generate OTP for phone verification
                    otp = str(random.randint(100000, 999999))
                    user.otp = otp  # Use otp field for phone verification
                    user.save()
                    
                    # Send phone OTP using SMS service
                    from utils.communication import send_otp_sms
                    success, response = send_otp_sms(user.phone, otp)
                    
                    if success:
                        logger.info(f"[PHONE OTP SENT] - User {user.id}, Phone: {user.phone}")
                    else:
                        logger.error(f"[PHONE OTP FAILED] - User {user.id}, Phone: {user.phone}, Response: {response}")
                except Exception as e:
                    logger.error(f"[PHONE OTP ERROR] - User {user.id}, Phone: {user.phone}, Error: {str(e)}")
                    # Continue with registration even if phone OTP fails
            
            # Generate authentication tokens for the new user
            token = RefreshToken.for_user(user)
            
            return success_response("User registered successfully", {
                "tokens": {
                    "access": str(token.access_token),
                    "refresh": str(token),
                },
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "phone": user.phone,
                    "user_type": user.user_type,
                    "partnership_number": user.partnership_number,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "is_active": user.is_active,
                }
            })

        logger.error(f"[REGISTER ERROR] - {serializer.errors}")
        
        # Provide more user-friendly error messages
        error_details = {}
        for field, errors in serializer.errors.items():
            if field == 'partnership_number':
                error_details[field] = "Please provide a valid partnership number."
            elif field == 'email':
                error_details[field] = "Please provide a valid email address."
            elif field == 'phone':
                error_details[field] = "Please provide a valid phone number."
            elif field == 'password':
                error_details[field] = "Password must be at least 6 characters long."
            elif field == 'first_name':
                error_details[field] = "First name is required."
            elif field == 'last_name':
                error_details[field] = "Last name is required."
            elif field == 'user_type':
                error_details[field] = "User type is required."
            else:
                error_details[field] = str(errors[0]) if errors else "Invalid value"
        
        return error_response("Registration failed", error_details)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
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
        return error_response("Login failed", serializer.errors)


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
        success, response = send_email_verification_code(phone, otp)
        if success:
            return success_response(message="OTP sent successfully.")
        else:
            logger.error(f"[Validate  Phone  SMS FAILED] - Phone: {phone}, Response: {response}")
            return error_response(message="Failed to send OTP. Please try again later.")


class ConfirmEmailVerificationView(APIView):
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
            user.save()
            return success_response(message="Email verified successfully.")
        return error_response(message="Invalid verification token.")

class ConfirmPhoneOTPView(APIView):
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
            user.save()
            return success_response(message="Phone number verified successfully.")
        return error_response(message="Invalid OTP.")

