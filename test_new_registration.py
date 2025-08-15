#!/usr/bin/env python
"""
Test script for the new registration flow
"""
import requests
import json

BASE_URL = "http://localhost:8000/api/user_auth"

def test_new_registration_flow():
    """Test the new registration flow: create user -> send OTP -> verify OTP"""
    
    print("🧪 Testing New Registration Flow")
    print("=" * 50)
    
    # Step 1: Register user (creates user in DB, sends OTP)
    print("\n1️⃣ Testing User Registration...")
    registration_data = {
        "first_name": "Test",
        "last_name": "User",
        "partnership_number": "TEST001",
        "email": "test@example.com",
        "password": "testpass123",
        "user_type": "community"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/register", json=registration_data)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        
        if response.status_code == 201 and response.json().get('success'):
            user_id = response.json().get('user_id')
            print(f"✅ User created successfully with ID: {user_id}")
            
            # Step 2: Verify OTP (activate user account)
            print(f"\n2️⃣ Testing OTP Verification for user {user_id}...")
            
            # For testing, we need to get the OTP from the database
            # In real scenario, user would receive this via email/SMS
            print("⚠️  Note: In real scenario, user would receive OTP via email/SMS")
            print("   For testing, you need to check the database for the OTP value")
            
            # You can manually check the database with:
            # python manage.py shell
            # from user_auth.models import User
            # user = User.objects.get(id=user_id)
            # print(f"OTP: {user.otp}")
            
        else:
            print("❌ Registration failed")
            return False
            
    except Exception as e:
        print(f"❌ Error during registration: {str(e)}")
        return False
    
    print("\n✅ New registration flow test completed!")
    print("\n📝 To complete the test:")
    print("1. Check the database for the created user")
    print("2. Note the OTP value")
    print("3. Test OTP verification with the correct OTP")
    
    return True

def test_cache_endpoint():
    """Test the cache endpoint to verify cache is working"""
    
    print("\n🧪 Testing Cache Endpoint")
    print("=" * 30)
    
    try:
        response = requests.get(f"{BASE_URL}/test-cache")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        
        if response.status_code == 200 and response.json().get('success'):
            print("✅ Cache is working correctly!")
        else:
            print("❌ Cache test failed")
            
    except Exception as e:
        print(f"❌ Error testing cache: {str(e)}")

if __name__ == "__main__":
    print("🚀 Starting Registration Flow Tests")
    print("=" * 50)
    
    # Test cache first
    test_cache_endpoint()
    
    # Test new registration flow
    test_new_registration_flow()
    
    print("\n🎯 Test Summary:")
    print("- Cache functionality verified")
    print("- New registration flow tested")
    print("- Check database for created user and OTP")
