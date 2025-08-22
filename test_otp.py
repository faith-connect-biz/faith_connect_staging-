#!/usr/bin/env python3
import requests
import json
import time

# Test configuration
BASE_URL = "http://localhost:8000/api"
TEST_EMAIL = "test@example.com"
TEST_PHONE = "+254700000000"

def test_registration_flow():
    """Test the complete registration flow with OTP verification"""
    print("🧪 Testing Registration Flow with OTP")
    print("=" * 50)
    
    # Step 1: Register user
    print("1️⃣ Registering user...")
    registration_data = {
        "first_name": "Test",
        "last_name": "User",
        "partnership_number": "TEST123456",
        "email": TEST_EMAIL,
        "phone": TEST_PHONE,
        "user_type": "community",
        "password": "TestPassword123!"
    }
    
    response = requests.post(f"{BASE_URL}/register", json=registration_data)
    print(f"Registration Response: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Registration successful!")
        print(f"Registration Token: {data.get('registration_token')}")
        print(f"OTP Sent To: {data.get('otp_sent_to')}")
        
        # Get the registration token
        registration_token = data.get('registration_token')
        
        # Step 2: Wait a moment for OTP to be processed
        print("\n2️⃣ Waiting for OTP processing...")
        time.sleep(2)
        
        # Step 3: Verify OTP (we'll need to get the OTP from logs or cache)
        print("\n3️⃣ Testing OTP verification...")
        print("Note: You'll need to check the server logs or database for the actual OTP")
        
        # For testing, we'll use a dummy OTP first
        test_otp = "123456"
        verify_data = {
            "registration_token": registration_token,
            "otp": test_otp
        }
        
        response = requests.post(f"{BASE_URL}/verify-registration-otp", json=verify_data)
        print(f"OTP Verification Response: {response.status_code}")
        print(f"Response: {response.json()}")
        
        if response.status_code == 400 and "expired" in response.json().get('message', ''):
            print("ℹ️ OTP expired (expected for dummy OTP), testing resend...")
            
            # Test resend OTP
            resend_data = {"registration_token": registration_token}
            response = requests.post(f"{BASE_URL}/resend-registration-otp", json=resend_data)
            print(f"Resend Response: {response.status_code}")
            print(f"Response: {response.json()}")
        
    else:
        print(f"❌ Registration failed: {response.json()}")

def test_phone_verification():
    """Test phone verification for existing users"""
    print("\n🧪 Testing Phone Verification")
    print("=" * 50)
    
    # Step 1: Send phone OTP
    print("1️⃣ Sending phone OTP...")
    send_otp_data = {"phone_number": TEST_PHONE}
    
    response = requests.post(f"{BASE_URL}/send-phone-otp", json=send_otp_data)
    print(f"Send OTP Response: {response.status_code}")
    print(f"Response: {response.json()}")
    
    if response.status_code == 200:
        print("✅ OTP sent successfully!")
        print("Note: Check server logs for the actual OTP")
        
        # Step 2: Verify phone OTP (with dummy OTP)
        print("\n2️⃣ Testing phone OTP verification...")
        verify_data = {
            "phone_number": TEST_PHONE,
            "otp": "123456"
        }
        
        response = requests.post(f"{BASE_URL}/confirm-phone-otp", json=verify_data)
        print(f"Phone Verification Response: {response.status_code}")
        print(f"Response: {response.json()}")
        
    else:
        print(f"❌ Failed to send OTP: {response.json()}")

def test_email_verification():
    """Test email verification for existing users"""
    print("\n🧪 Testing Email Verification")
    print("=" * 50)
    
    # Step 1: Send email verification
    print("1️⃣ Sending email verification...")
    send_email_data = {"email": TEST_EMAIL}
    
    response = requests.post(f"{BASE_URL}/send-email-verification", json=send_email_data)
    print(f"Send Email Response: {response.status_code}")
    print(f"Response: {response.json()}")
    
    if response.status_code == 200:
        print("✅ Email verification sent successfully!")
        print("Note: Check server logs for the actual token")
        
        # Step 2: Verify email token (with dummy token)
        print("\n2️⃣ Testing email verification...")
        verify_data = {
            "email": TEST_EMAIL,
            "token": "123456"
        }
        
        response = requests.post(f"{BASE_URL}/confirm-email-verification", json=verify_data)
        print(f"Email Verification Response: {response.status_code}")
        print(f"Response: {response.json()}")
        
    else:
        print(f"❌ Failed to send email verification: {response.json()}")

def main():
    print("🚀 Starting OTP Verification Tests")
    print("=" * 60)
    
    try:
        # Test registration flow
        test_registration_flow()
        
        # Test phone verification
        test_phone_verification()
        
        # Test email verification
        test_email_verification()
        
        print("\n✅ All tests completed!")
        print("\n📝 Next Steps:")
        print("1. Check server logs for actual OTP/token values")
        print("2. Use the actual OTP/token values to test verification")
        print("3. Check database to see if users are created/verified")
        
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to server. Make sure the server is running on localhost:8000")
    except Exception as e:
        print(f"❌ Test failed with error: {e}")

if __name__ == "__main__":
    main()
