#!/usr/bin/env python3
"""
Debug script for ZeptoMail API issues
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

def debug_zeptomail_config():
    """Debug ZeptoMail configuration"""
    print("🔍 Debugging ZeptoMail Configuration...")
    
    # Check environment variables
    api_key = config('ZEPTO_API_KEY', default='')
    from_email = config('ZEPTO_FROM_EMAIL', default='')
    from_name = config('ZEPTO_FROM_NAME', default='')
    verification_key = config('ZEPTO_VERIFICATION_TEMPLATE_KEY', default='')
    
    print(f"API Key Length: {len(api_key)}")
    print(f"API Key (first 20 chars): {api_key[:20] if api_key else 'None'}...")
    print(f"API Key (last 20 chars): ...{api_key[-20:] if api_key else 'None'}")
    print(f"From Email: {from_email}")
    print(f"From Name: {from_name}")
    print(f"Verification Template Key: {verification_key[:20] if verification_key else 'None'}...")
    
    # Check if API key looks valid
    if api_key and api_key.startswith('Zoho-enczapikey '):
        print("✅ API key format looks correct (starts with 'Zoho-enczapikey ')")
    elif api_key:
        print("⚠️  API key doesn't start with 'Zoho-enczapikey ' - this might be the issue")
        print("   Expected format: Zoho-enczapikey <your-actual-key>")
    else:
        print("❌ No API key found")
    
    # Test API key format
    if api_key:
        # Remove the prefix if it exists
        if api_key.startswith('Zoho-enczapikey '):
            actual_key = api_key[16:]  # Remove "Zoho-enczapikey " prefix
        else:
            actual_key = api_key
        
        print(f"Actual key length: {len(actual_key)}")
        print(f"Actual key (first 20 chars): {actual_key[:20]}...")
        
        # Check if it looks like a valid ZeptoMail key
        if len(actual_key) > 50 and '+' in actual_key and '=' in actual_key:
            print("✅ Key format looks like a valid ZeptoMail API key")
        else:
            print("⚠️  Key format doesn't look like a typical ZeptoMail API key")

if __name__ == "__main__":
    debug_zeptomail_config()
