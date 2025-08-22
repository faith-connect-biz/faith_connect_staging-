#!/usr/bin/env python3
"""
Test Script for OTP and Email Systems
Tests SMS OTP, Email OTP, and Email Templates
"""

import os
import sys
import django
from datetime import datetime

# Add the backend directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings.dev')
django.setup()

from utils.ndovu_sms import sms_service, send_otp_sms, send_welcome_sms, send_password_reset_sms
from utils.zeptomail import ZeptoMailService
import random

def generate_otp():
    """Generate a 6-digit OTP"""
    return str(random.randint(100000, 999999))

def test_sms_system():
    """Test SMS functionality"""
    print("\n" + "="*50)
    print("📱 TESTING SMS SYSTEM")
    print("="*50)
    
    # Test phone number (replace with your actual number for testing)
    test_phone = "254703561237"  # Replace with your actual number
    
    print(f"Testing SMS with phone: {test_phone}")
    
    # Test 1: Send OTP SMS
    print("\n1️⃣ Testing OTP SMS...")
    otp = generate_otp()
    success, response = send_otp_sms(test_phone, otp)
    
    if success:
        print(f"✅ OTP SMS sent successfully!")
        print(f"   OTP: {otp}")
        print(f"   Response: {response}")
    else:
        print(f"❌ OTP SMS failed: {response}")
    
    # Test 2: Send Welcome SMS
    print("\n2️⃣ Testing Welcome SMS...")
    success, response = send_welcome_sms(test_phone, "Test User")
    
    if success:
        print(f"✅ Welcome SMS sent successfully!")
        print(f"   Response: {response}")
    else:
        print(f"❌ Welcome SMS failed: {response}")
    
    # Test 3: Send Password Reset SMS
    print("\n3️⃣ Testing Password Reset SMS...")
    reset_code = generate_otp()
    success, response = send_password_reset_sms(test_phone, reset_code)
    
    if success:
        print(f"✅ Password Reset SMS sent successfully!")
        print(f"   Reset Code: {reset_code}")
        print(f"   Response: {response}")
    else:
        print(f"❌ Password Reset SMS failed: {response}")

def test_email_system():
    """Test Email functionality"""
    print("\n" + "="*50)
    print("📧 TESTING EMAIL SYSTEM")
    print("="*50)
    
    # Initialize ZeptoMail service
    zepto_service = ZeptoMailService()
    
    # Test email (replace with your actual email for testing)
    test_email = "femconnect01@gmail.com"  # Replace with your actual email
    
    print(f"Testing Email with: {test_email}")
    
    # Test 1: Send Verification Email
    print("\n1️⃣ Testing Verification Email...")
    otp = generate_otp()
    success, response = zepto_service.send_verification_email(test_email, otp, "Test User")
    
    if success:
        print(f"✅ Verification Email sent successfully!")
        print(f"   OTP: {otp}")
        print(f"   Response: {response}")
    else:
        print(f"❌ Verification Email failed: {response}")
    
    # Test 2: Send Password Reset Email
    print("\n2️⃣ Testing Password Reset Email...")
    reset_code = generate_otp()
    success, response = zepto_service.send_password_reset_email(test_email, reset_code, "Test User")
    
    if success:
        print(f"✅ Password Reset Email sent successfully!")
        print(f"   Reset Code: {reset_code}")
        print(f"   Response: {response}")
    else:
        print(f"❌ Password Reset Email failed: {response}")
    
    # Test 3: Send Welcome Email
    print("\n3️⃣ Testing Welcome Email...")
    success, response = zepto_service.send_welcome_email(test_email, "Test User")
    
    if success:
        print(f"✅ Welcome Email sent successfully!")
        print(f"   Response: {response}")
    else:
        print(f"❌ Welcome Email failed: {response}")

def test_configuration():
    """Test configuration status"""
    print("\n" + "="*50)
    print("⚙️ CONFIGURATION STATUS")
    print("="*50)
    
    from django.conf import settings
    
    # SMS Configuration
    print("\n📱 SMS Configuration:")
    print(f"   SMS_API_KEY: {'✅ Configured' if settings.SMS_API_KEY else '❌ Not configured'}")
    print(f"   SMS_SECRET: {'✅ Configured' if getattr(settings, 'SMS_SECRET', '') else '❌ Not configured'}")
    print(f"   SMS_FROM_NUMBER: {getattr(settings, 'SMS_FROM_NUMBER', 'Not set')}")
    
    # Email Configuration
    print("\n📧 Email Configuration:")
    print(f"   ZEPTO_API_KEY: {'✅ Configured' if settings.ZEPTO_API_KEY else '❌ Not configured'}")
    print(f"   ZEPTO_FROM_EMAIL: {settings.ZEPTO_FROM_EMAIL}")
    print(f"   ZEPTO_FROM_NAME: {settings.ZEPTO_FROM_NAME}")
    print(f"   ZEPTO_VERIFICATION_TEMPLATE_KEY: {'✅ Configured' if settings.ZEPTO_VERIFICATION_TEMPLATE_KEY else '❌ Not configured'}")
    print(f"   ZEPTO_PASSWORD_RESET_TEMPLATE_KEY: {'✅ Configured' if settings.ZEPTO_PASSWORD_RESET_TEMPLATE_KEY else '❌ Not configured'}")
    print(f"   ZEPTO_WELCOME_TEMPLATE_KEY: {'✅ Configured' if settings.ZEPTO_WELCOME_TEMPLATE_KEY else '❌ Not configured'}")

def main():
    """Main test function"""
    print("🚀 FEM Connect - OTP & Email System Test")
    print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Test configuration first
    test_configuration()
    
    # Test SMS system
    test_sms_system()
    
    # Test Email system
    test_email_system()
    
    print("\n" + "="*50)
    print("🏁 TESTING COMPLETED")
    print("="*50)
    print("\n📝 Next Steps:")
    print("1. Check your phone for SMS messages")
    print("2. Check your email for verification emails")
    print("3. Update your .env file with actual API keys")
    print("4. Test with real phone numbers and emails")

if __name__ == "__main__":
    main()
