#!/usr/bin/env python3
"""
Test script for ZeptoMail template integration
Run this script to test email functionality
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

from utils.zeptomail import (
    zeptomail_service, 
    send_email_verification_code, 
    send_password_reset_email, 
    send_welcome_email,
    send_custom_template_email
)

def test_zeptomail_configuration():
    """Test ZeptoMail configuration"""
    print("🔧 Testing ZeptoMail Configuration...")
    
    if not os.environ.get('ZEPTO_API_KEY', ''):
        print("❌ ZEPTO_API_KEY not configured")
        return False
    
    if not os.environ.get('ZEPTO_FROM_EMAIL', ''):
        print("❌ ZEPTO_FROM_EMAIL not configured")
        return False
    
    # Check if at least one template key is configured
    verification_key = os.environ.get('ZEPTO_VERIFICATION_TEMPLATE_KEY', '')
    password_reset_key = os.environ.get('ZEPTO_PASSWORD_RESET_TEMPLATE_KEY', '')
    welcome_key = os.environ.get('ZEPTO_WELCOME_TEMPLATE_KEY', '')
    
    if not any([verification_key, password_reset_key, welcome_key]):
        print("❌ No ZeptoMail template keys configured")
        return False
    
    print("✅ ZeptoMail configuration found")
    print(f"  From Email: {os.environ.get('ZEPTO_FROM_EMAIL', '')}")
    print(f"  From Name: {os.environ.get('ZEPTO_FROM_NAME', 'FEM Connect')}")
    
    if verification_key:
        print(f"  Verification Template: {verification_key[:20]}...")
    if password_reset_key:
        print(f"  Password Reset Template: {password_reset_key[:20]}...")
    if welcome_key:
        print(f"  Welcome Template: {welcome_key[:20]}...")
    
    return True

def test_template_emails():
    """Test email sending using ZeptoMail templates"""
    print("\n📧 Testing Template Email Sending...")
    
    test_email = "test@example.com"
    test_name = "Test User"
    test_token = "123456"
    
    # Test verification email template
    print("  Testing verification email template...")
    success, response = send_email_verification_code(test_email, test_token, test_name)
    if success:
        print("  ✅ Verification email template sent successfully")
    else:
        print(f"  ❌ Verification email template failed: {response}")
    
    # Test password reset email template
    print("  Testing password reset email template...")
    success, response = send_password_reset_email(test_email, test_token, test_name)
    if success:
        print("  ✅ Password reset email template sent successfully")
    else:
        print(f"  ❌ Password reset email template failed: {response}")
    
    # Test welcome email template
    print("  Testing welcome email template...")
    success, response = send_welcome_email(test_email, test_name)
    if success:
        print("  ✅ Welcome email template sent successfully")
    else:
        print(f"  ❌ Welcome email template failed: {response}")
    
    return True

def test_custom_template():
    """Test custom template email sending"""
    print("\n✉️  Testing Custom Template Email...")
    
    test_email = "test@example.com"
    test_name = "Test User"
    
    # Test custom template with your example template key
    custom_template_key = "2d6f.625e18791e334fe4.k1.e64048f0-7696-11f0-8fbe-525400114fe6.198987ea2ff"
    
    merge_info = {
        "name": test_name,
        "OTP": "123456",
        "team": "FEM Connect",
        "product_name": "FEM Connect"
    }
    
    success, response = send_custom_template_email(
        email=test_email,
        user_name=test_name,
        template_key=custom_template_key,
        merge_info=merge_info
    )
    
    if success:
        print("✅ Custom template email sent successfully")
    else:
        print(f"❌ Custom template email failed: {response}")
    
    return success

def test_template_data_structure():
    """Test the template data structure being sent"""
    print("\n📊 Testing Template Data Structure...")
    
    # Show what merge_info is sent for each template type
    print("  Verification Email Merge Info:")
    verification_merge = {
        "name": "John Doe",
        "OTP": "123456",
        "team": "FEM Connect",
        "product_name": "FEM Connect"
    }
    print(f"    {verification_merge}")
    
    print("\n  Password Reset Merge Info:")
    reset_merge = {
        "name": "John Doe",
        "OTP": "123456",
        "team": "FEM Connect",
        "product_name": "FEM Connect"
    }
    print(f"    {reset_merge}")
    
    print("\n  Welcome Email Merge Info:")
    welcome_merge = {
        "name": "John Doe",
        "team": "FEM Connect",
        "product_name": "FEM Connect"
    }
    print(f"    {welcome_merge}")
    
    return True

def main():
    """Main test function"""
    print("🚀 ZeptoMail Template Integration Test")
    print("=" * 60)
    
    # Test configuration
    if not test_zeptomail_configuration():
        print("\n❌ Configuration test failed. Please check your .env file.")
        print("Required variables:")
        print("  - ZEPTO_API_KEY")
        print("  - ZEPTO_FROM_EMAIL")
        print("  - At least one template key (ZEPTO_VERIFICATION_TEMPLATE_KEY, etc.)")
        return
    
    # Test template data structure
    test_template_data_structure()
    
    # Test email functionality
    test_template_emails()
    test_custom_template()
    
    print("\n" + "=" * 60)
    print("✅ ZeptoMail template integration test completed!")
    print("\n📋 Next Steps:")
    print("1. Create templates in ZeptoMail dashboard")
    print("2. Get template keys and add to .env file")
    print("3. Use merge_info variables: name, OTP, team, product_name")
    print("4. Test with real email addresses")
    print("5. Customize templates with your brand styling")
    print("\n📚 See docs/ for detailed setup instructions")

if __name__ == "__main__":
    main()
