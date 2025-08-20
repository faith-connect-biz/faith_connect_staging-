# authapp/urls.py

from django.urls import path, include
from .views import (
    RegisterAPIView, LoginView, LogoutAPIView, CustomTokenRefreshView,
    ForgotPasswordOTPView, ResetPasswordWithOTPView, SendEmailVerificationView,
    SendPhoneOTPView, ConfirmEmailVerificationView, ConfirmPhoneOTPView,
    VerifyRegistrationOTPView, ResendRegistrationOTPView, SignupView, ResendOTPView
)

urlpatterns = [
    # path('resend-registration-otp', ResendRegistrationOTPView.as_view(), name='resend_registration_otp'),
    path('resend-otp', ResendOTPView.as_view(), name='resend_otp'),
    path('signup', SignupView.as_view(), name='signup'),
    path('register', RegisterAPIView.as_view(), name='register'),
    path('verify-registration-otp', VerifyRegistrationOTPView.as_view(), name='verify_registration_otp'),
    path('login', LoginView.as_view(), name='login'),
    path('logout', LogoutAPIView.as_view(), name='logout'),
    path('refresh-token', CustomTokenRefreshView.as_view(), name='custom_token_refresh'),
    path('forgot-password', ForgotPasswordOTPView.as_view()),
    path('reset-password', ResetPasswordWithOTPView.as_view()),
    path('verify-email', SendEmailVerificationView.as_view(),name='verify_email'),
    path('verify-email-confirm', ConfirmEmailVerificationView.as_view(),name='confirm_email'),
    path('verify-phone', SendPhoneOTPView.as_view(), name='verify_phone'),
    path('verify-phone-confirm', ConfirmPhoneOTPView.as_view(), name='confirm_phone'),

    
    # Include user management URLs
    path('', include('user_auth.user_management.urls')),
]
