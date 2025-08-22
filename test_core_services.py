#!/usr/bin/env python3
"""
Core Service Testing Script
Simple tests for core services without full Django setup
"""

import os
import sys
import requests
import json
from datetime import datetime

def test_environment_variables():
    """Test if environment variables are accessible"""
    print("🔧 Testing Environment Variables...")
    
    required_vars = {
        'ZEPTO_API_KEY': 'ZeptoMail API Key',
        'ZEPTO_FROM_EMAIL': 'ZeptoMail From Email',
        'SMS_API_KEY': 'SMS API Key',
        'AWS_ACCESS_KEY_ID': 'AWS Access Key ID',
        'AWS_STORAGE_BUCKET_NAME': 'AWS S3 Bucket Name',
        'SECRET_KEY': 'Django Secret Key',
        'DATABASE_URL': 'Database URL',
    }
    
    results = []
    for var, description in required_vars.items():
        value = os.environ.get(var, '')
        if value:
            status = "✅ PASS"
            details = f"Length: {len(value)}"
            results.append(True)
        else:
            status = "❌ FAIL"
            details = "Not set"
            results.append(False)
        
        print(f"  {status} {description}: {details}")
    
    return all(results)

def test_external_api_connectivity():
    """Test if external APIs are reachable"""
    print("\n🔗 Testing External API Connectivity...")
    
    apis = [
        ('https://api.zeptomail.com/v1.1/email', 'ZeptoMail API'),
        ('https://api.ndovubase.com/sms/send', 'Ndovu SMS API'),
        ('https://s3.amazonaws.com', 'AWS S3'),
    ]
    
    results = []
    for url, name in apis:
        try:
            response = requests.get(url, timeout=10)
            if response.status_code in [200, 401, 403]:  # 401/403 means service is reachable but auth required
                status = "✅ PASS"
                details = f"Status: {response.status_code}"
                results.append(True)
            else:
                status = "❌ FAIL"
                details = f"Status: {response.status_code}"
                results.append(False)
        except requests.exceptions.RequestException as e:
            status = "❌ FAIL"
            details = str(e)
            results.append(False)
        
        print(f"  {status} {name}: {details}")
    
    return all(results)

def test_zeptomail_configuration():
    """Test ZeptoMail configuration"""
    print("\n📧 Testing ZeptoMail Configuration...")
    
    api_key = os.environ.get('ZEPTO_API_KEY', '')
    from_email = os.environ.get('ZEPTO_FROM_EMAIL', '')
    verification_key = os.environ.get('ZEPTO_VERIFICATION_TEMPLATE_KEY', '')
    
    results = []
    
    # Test API key
    if api_key:
        status = "✅ PASS"
        details = f"Length: {len(api_key)}"
        results.append(True)
    else:
        status = "❌ FAIL"
        details = "Not configured"
        results.append(False)
    print(f"  {status} API Key: {details}")
    
    # Test from email
    if from_email:
        status = "✅ PASS"
        details = from_email
        results.append(True)
    else:
        status = "❌ FAIL"
        details = "Not configured"
        results.append(False)
    print(f"  {status} From Email: {details}")
    
    # Test template key
    if verification_key:
        status = "✅ PASS"
        details = f"Length: {len(verification_key)}"
        results.append(True)
    else:
        status = "❌ FAIL"
        details = "Not configured"
        results.append(False)
    print(f"  {status} Verification Template: {details}")
    
    return all(results)

def test_aws_configuration():
    """Test AWS configuration"""
    print("\n☁️  Testing AWS Configuration...")
    
    access_key = os.environ.get('AWS_ACCESS_KEY_ID', '')
    secret_key = os.environ.get('AWS_SECRET_ACCESS_KEY', '')
    bucket_name = os.environ.get('AWS_STORAGE_BUCKET_NAME', '')
    region = os.environ.get('AWS_S3_REGION_NAME', '')
    
    results = []
    
    # Test access key
    if access_key:
        status = "✅ PASS"
        details = f"Length: {len(access_key)}"
        results.append(True)
    else:
        status = "❌ FAIL"
        details = "Not configured"
        results.append(False)
    print(f"  {status} Access Key: {details}")
    
    # Test secret key
    if secret_key:
        status = "✅ PASS"
        details = f"Length: {len(secret_key)}"
        results.append(True)
    else:
        status = "❌ FAIL"
        details = "Not configured"
        results.append(False)
    print(f"  {status} Secret Key: {details}")
    
    # Test bucket name
    if bucket_name:
        status = "✅ PASS"
        details = bucket_name
        results.append(True)
    else:
        status = "❌ FAIL"
        details = "Not configured"
        results.append(False)
    print(f"  {status} Bucket Name: {details}")
    
    # Test region
    if region:
        status = "✅ PASS"
        details = region
        results.append(True)
    else:
        status = "❌ FAIL"
        details = "Not configured"
        results.append(False)
    print(f"  {status} Region: {details}")
    
    return all(results)

def test_sms_configuration():
    """Test SMS configuration"""
    print("\n📱 Testing SMS Configuration...")
    
    api_key = os.environ.get('SMS_API_KEY', '')
    secret = os.environ.get('SMS_SECRET', '')
    from_number = os.environ.get('SMS_FROM_NUMBER', '')
    
    results = []
    
    # Test API key
    if api_key:
        status = "✅ PASS"
        details = f"Length: {len(api_key)}"
        results.append(True)
    else:
        status = "❌ FAIL"
        details = "Not configured"
        results.append(False)
    print(f"  {status} API Key: {details}")
    
    # Test secret
    if secret:
        status = "✅ PASS"
        details = f"Length: {len(secret)}"
        results.append(True)
    else:
        status = "❌ FAIL"
        details = "Not configured"
        results.append(False)
    print(f"  {status} Secret: {details}")
    
    # Test from number
    if from_number:
        status = "✅ PASS"
        details = from_number
        results.append(True)
    else:
        status = "❌ FAIL"
        details = "Not configured"
        results.append(False)
    print(f"  {status} From Number: {details}")
    
    return all(results)

def generate_summary_report(results):
    """Generate a summary report"""
    print("\n" + "="*60)
    print("📊 CORE SERVICE TESTING SUMMARY")
    print("="*60)
    
    total_tests = len(results)
    passed_tests = sum(results)
    failed_tests = total_tests - passed_tests
    
    print(f"Total Tests: {total_tests}")
    print(f"✅ Passed: {passed_tests}")
    print(f"❌ Failed: {failed_tests}")
    print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
    
    if failed_tests > 0:
        print("\n❌ FAILED TESTS:")
        test_names = [
            "Environment Variables",
            "External API Connectivity", 
            "ZeptoMail Configuration",
            "AWS Configuration",
            "SMS Configuration"
        ]
        
        for i, result in enumerate(results):
            if not result:
                print(f"  - {test_names[i]}")
    
    print("\n🔧 RECOMMENDATIONS:")
    if failed_tests == 0:
        print("  🎉 All core services are properly configured!")
    else:
        print("  📝 Check the failed tests above and ensure:")
        print("    - Environment variables are set in Railway")
        print("    - External service APIs are accessible")
        print("    - Required credentials are valid")
    
    print("="*60)
    
    return passed_tests == total_tests

def main():
    """Main function"""
    print("🚀 Starting Core Service Testing...")
    print(f"⏰ Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("="*60)
    
    # Run all tests
    results = [
        test_environment_variables(),
        test_external_api_connectivity(),
        test_zeptomail_configuration(),
        test_aws_configuration(),
        test_sms_configuration(),
    ]
    
    # Generate summary
    success = generate_summary_report(results)
    
    if success:
        print("\n🎉 All core services are working correctly!")
        sys.exit(0)
    else:
        print("\n⚠️  Some core services have issues. Check the report above.")
        sys.exit(1)

if __name__ == "__main__":
    main()
