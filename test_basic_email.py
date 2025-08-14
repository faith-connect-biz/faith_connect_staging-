#!/usr/bin/env python3
"""
Test basic email sending without templates
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

import requests
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def test_basic_email():
    """Test basic email sending"""
    print("📧 Testing Basic Email Sending...")
    
    api_key = os.environ.get('ZEPTO_API_KEY', '')
    from_email = os.environ.get('ZEPTO_FROM_EMAIL', '')
    
    if not api_key:
        print("❌ No API key found")
        return
    
    headers = {
        'accept': "application/json",
        'content-type': "application/json",
        'authorization': api_key
    }
    
    payload = {
        "from": {
            "address": from_email,
            "name": "FEM Connect"
        },
        "to": [{
            "email_address": {
                "address": "test@example.com",
                "name": "Test User"
            }
        }],
        "subject": "Test Email from FEM Connect",
        "htmlbody": "<p>Hello Test User,</p><p>This is a test email from FEM Connect.</p>",
        "textbody": "Hello Test User, This is a test email from FEM Connect."
    }
    
    print(f"API URL: https://api.zeptomail.com/v1.1/email")
    print(f"From Email: {from_email}")
    print(f"Headers: {headers}")
    print(f"Payload: {payload}")
    
    try:
        response = requests.post(
            "https://api.zeptomail.com/v1.1/email",
            json=payload,
            headers=headers,
            timeout=30
        )
        
        print(f"Response Status: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        print(f"Response Text: {response.text}")
        
        if response.status_code in [200, 201, 202]:
            print("✅ Basic email sent successfully")
            return True
        else:
            print(f"❌ Failed to send email. Status: {response.status_code}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Error sending email: {str(e)}")
        return False

if __name__ == "__main__":
    test_basic_email()
