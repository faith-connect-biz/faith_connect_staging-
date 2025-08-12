#!/usr/bin/env python3
"""
Test script for password reset functionality with reset links
"""

import os
import sys
import django
from decouple import config

# Add the project directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from utils.zeptomail import send_password_reset_email

def test_password_reset_with_link():
    """Test password reset email with reset link"""
    print("🔐 Testing Password Reset with Reset Link...")
    
    test_email = "test@example.com"
    test_name = "Test User"
    test_token = "123456"
    test_reset_link = "https://faithconnect.biz/reset-password?token=123456&email=test@example.com"
    
    print(f"Email: {test_email}")
    print(f"Name: {test_name}")
    print(f"Token: {test_token}")
    print(f"Reset Link: {test_reset_link}")
    
    # Test password reset email with reset link
    success, response = send_password_reset_email(
        email=test_email,
        token=test_token,
        user_name=test_name,
        reset_link=test_reset_link
    )
    
    if success:
        print("✅ Password reset email with link sent successfully")
        print(f"Response: {response}")
    else:
        print(f"❌ Password reset email failed: {response}")
    
    return success

def test_password_reset_without_link():
    """Test password reset email without reset link (fallback to OTP)"""
    print("\n🔐 Testing Password Reset without Reset Link (OTP only)...")
    
    test_email = "test@example.com"
    test_name = "Test User"
    test_token = "123456"
    
    print(f"Email: {test_email}")
    print(f"Name: {test_name}")
    print(f"Token: {test_token}")
    
    # Test password reset email without reset link
    success, response = send_password_reset_email(
        email=test_email,
        token=test_token,
        user_name=test_name
    )
    
    if success:
        print("✅ Password reset email (OTP only) sent successfully")
        print(f"Response: {response}")
    else:
        print(f"❌ Password reset email failed: {response}")
    
    return success

def main():
    """Main test function"""
    print("🚀 Password Reset Functionality Test")
    print("=" * 60)
    
    # Test with reset link
    test_password_reset_with_link()
    
    # Test without reset link (OTP only)
    test_password_reset_without_link()
    
    print("\n" + "=" * 60)
    print("✅ Password reset functionality test completed!")
    print("\n📋 Template Variables Available:")
    print("  - name: User's name")
    print("  - OTP: One-time password")
    print("  - team: Faith Connect")
    print("  - product_name: Faith Connect")
    print("  - password_reset_link: Password reset URL (when provided)")
    print("\n📚 Next Steps:")
    print("1. Create password reset template in ZeptoMail dashboard")
    print("2. Use merge_info variables in your template")
    print("3. Test with real email addresses")
    print("4. Customize the reset link domain in your code")

if __name__ == "__main__":
    main()
