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

from utils.communication import send_email_verification_code
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
    def post(self, request):
        safe_data = mask_sensitive_data(request.data)
        logger.info(f"[REGISTER REQUEST] - {safe_data}")

        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            logger.info(f"[REGISTER SUCCESS] - User {user.id}")
            return success_response("User registered successfully", {
                "user_id": user.id,
                "email": user.email,
                "phone": user.phone,
                "user_type": user.user_type,
                "partnerNo": user.partnership_number,
            })

        logger.error(f"[REGISTER ERROR] - {serializer.errors}")
        return error_response("Registration failed", serializer.errors)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            logger.info(f"Login successful for partnership: {serializer.validated_data['partnership_number']}")
            return success_response("Login successful", serializer.validated_data)
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


def send_sms(phone_number, otp):
    print(f"Mock sending OTP {otp} to {phone_number}")  # Replace with real SMS logic


class ForgotPasswordOTPView(APIView):
    def post(self, request):
        serializer = ForgotPasswordOTPSerializer(data=request.data)
        if serializer.is_valid():
            phone = serializer.validated_data['phone_number']
            try:
                user = User.objects.get(phone=phone)
            except User.DoesNotExist:
                return error_response("User not found with this phone number.")

            otp = str(random.randint(100000, 999999))
            user.otp = otp
            user.save()

            send_sms(phone, f"Your OTP is {otp}")
            return success_response(message="OTP sent successfully.")
        return error_response(message="Validation failed.", errors=serializer.errors)


class ResetPasswordWithOTPView(APIView):
    def post(self, request):
        serializer = ResetPasswordWithOTPSerializer(data=request.data)
        if serializer.is_valid():
            phone = serializer.validated_data['phone_number']
            otp = serializer.validated_data['otp']
            new_password = serializer.validated_data['new_password']

            try:
                user = User.objects.get(phone=phone, otp=otp)
            except User.DoesNotExist:
                return error_response("Invalid phone number or OTP.")

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

        send_email_verification_code(email, token)
        return success_response("Verification token sent to email")

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

        send_sms(phone, otp)
        return success_response("OTP sent to phone number")


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

