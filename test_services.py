#!/usr/bin/env python3
"""
Comprehensive service and endpoint testing script
Tests all configured services to verify they're accessible from the server
"""

import os
import sys
import django
import requests
import logging
from datetime import datetime

# Add the project directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings.railway')
django.setup()

from django.conf import settings
from django.test import Client
from django.urls import reverse

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ServiceTester:
    """Test all configured services and endpoints"""
    
    def __init__(self):
        self.results = []
        self.client = Client()
        self.base_url = "http://localhost:8000"  # Default Django dev server
        
    def log_result(self, service, test_name, success, details=""):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        timestamp = datetime.now().strftime("%H:%M:%S")
        result = f"[{timestamp}] {status} {service}: {test_name}"
        if details:
            result += f" - {details}"
        
        self.results.append({
            'service': service,
            'test': test_name,
            'success': success,
            'details': details,
            'timestamp': timestamp
        })
        
        print(result)
        return success
    
    def test_environment_variables(self):
        """Test if all required environment variables are set"""
        print("\n🔧 Testing Environment Variables...")
        
        required_vars = {
            'ZEPTO_API_KEY': 'ZeptoMail API Key',
            'ZEPTO_FROM_EMAIL': 'ZeptoMail From Email',
            'ZEPTO_VERIFICATION_TEMPLATE_KEY': 'ZeptoMail Verification Template',
            'SMS_API_KEY': 'SMS API Key',
            'AWS_ACCESS_KEY_ID': 'AWS Access Key ID',
            'AWS_STORAGE_BUCKET_NAME': 'AWS S3 Bucket Name',
            'SECRET_KEY': 'Django Secret Key',
            'DATABASE_URL': 'Database URL',
        }
        
        all_present = True
        for var, description in required_vars.items():
            value = os.environ.get(var, '')
            if value:
                self.log_result("Environment", f"{description}", True, f"Length: {len(value)}")
            else:
                self.log_result("Environment", f"{description}", False, "Not set")
                all_present = False
        
        return all_present
    
    def test_database_connection(self):
        """Test database connectivity"""
        print("\n🗄️  Testing Database Connection...")
        
        try:
            from django.db import connection
            cursor = connection.cursor()
            cursor.execute("SELECT 1")
            result = cursor.fetchone()
            
            if result and result[0] == 1:
                self.log_result("Database", "Connection", True, "Database accessible")
                return True
            else:
                self.log_result("Database", "Connection", False, "Unexpected result")
                return False
                
        except Exception as e:
            self.log_result("Database", "Connection", False, str(e))
            return False
    
    def test_django_apps(self):
        """Test if Django apps are properly configured"""
        print("\n🐍 Testing Django Apps...")
        
        try:
            # Test if apps are in INSTALLED_APPS
            required_apps = ['user_auth', 'business', 'rest_framework', 'corsheaders']
            for app in required_apps:
                if app in settings.INSTALLED_APPS:
                    self.log_result("Django", f"App {app}", True)
                else:
                    self.log_result("Django", f"App {app}", False, "Not in INSTALLED_APPS")
            
            # Test if models can be imported
            from user_auth.models import User
            from business.models import Business, Category
            self.log_result("Django", "Models Import", True, "User, Business, Category models accessible")
            
            return True
            
        except Exception as e:
            self.log_result("Django", "Apps Configuration", False, str(e))
            return False
    
    def test_api_endpoints(self):
        """Test API endpoints accessibility"""
        print("\n🌐 Testing API Endpoints...")
        
        # Test basic endpoints
        endpoints = [
            ('/api/', 'API Root'),
            ('/api/schema/', 'API Schema'),
            ('/admin/', 'Admin Interface'),
        ]
        
        all_accessible = True
        for endpoint, name in endpoints:
            try:
                response = self.client.get(endpoint)
                if response.status_code in [200, 301, 302]:  # Allow redirects
                    self.log_result("API", f"{name} ({endpoint})", True, f"Status: {response.status_code}")
                else:
                    self.log_result("API", f"{name} ({endpoint})", False, f"Status: {response.status_code}")
                    all_accessible = False
            except Exception as e:
                self.log_result("API", f"{name} ({endpoint})", False, str(e))
                all_accessible = False
        
        return all_accessible
    
    def test_zeptomail_service(self):
        """Test ZeptoMail service configuration"""
        print("\n📧 Testing ZeptoMail Service...")
        
        try:
            from utils.zeptomail import zeptomail_service
            
            # Test service initialization
            if zeptomail_service.api_key:
                self.log_result("ZeptoMail", "API Key", True, f"Length: {len(zeptomail_service.api_key)}")
            else:
                self.log_result("ZeptoMail", "API Key", False, "Not configured")
            
            if zeptomail_service.from_email:
                self.log_result("ZeptoMail", "From Email", True, zeptomail_service.from_email)
            else:
                self.log_result("ZeptoMail", "From Email", False, "Not configured")
            
            # Test template keys
            template_count = sum(1 for key in zeptomail_service.template_keys.values() if key)
            if template_count > 0:
                self.log_result("ZeptoMail", "Template Keys", True, f"{template_count} configured")
            else:
                self.log_result("ZeptoMail", "Template Keys", False, "None configured")
            
            return True
            
        except Exception as e:
            self.log_result("ZeptoMail", "Service", False, str(e))
            return False
    
    def test_sms_service(self):
        """Test SMS service configuration"""
        print("\n📱 Testing SMS Service...")
        
        try:
            sms_api_key = os.environ.get('SMS_API_KEY', '')
            sms_secret = os.environ.get('SMS_SECRET', '')
            
            if sms_api_key:
                self.log_result("SMS", "API Key", True, f"Length: {len(sms_api_key)}")
            else:
                self.log_result("SMS", "API Key", False, "Not configured")
            
            if sms_secret:
                self.log_result("SMS", "Secret", True, f"Length: {len(sms_secret)}")
            else:
                self.log_result("SMS", "Secret", False, "Not configured")
            
            return True
            
        except Exception as e:
            self.log_result("SMS", "Service", False, str(e))
            return False
    
    def test_aws_s3_service(self):
        """Test AWS S3 service configuration"""
        print("\n☁️  Testing AWS S3 Service...")
        
        try:
            aws_key = os.environ.get('AWS_ACCESS_KEY_ID', '')
            aws_secret = os.environ.get('AWS_SECRET_ACCESS_KEY', '')
            bucket_name = os.environ.get('AWS_STORAGE_BUCKET_NAME', '')
            region = os.environ.get('AWS_S3_REGION_NAME', '')
            
            if aws_key:
                self.log_result("AWS S3", "Access Key", True, f"Length: {len(aws_key)}")
            else:
                self.log_result("AWS S3", "Access Key", False, "Not configured")
            
            if aws_secret:
                self.log_result("AWS S3", "Secret Key", True, f"Length: {len(aws_secret)}")
            else:
                self.log_result("AWS S3", "Secret Key", False, "Not configured")
            
            if bucket_name:
                self.log_result("AWS S3", "Bucket Name", True, bucket_name)
            else:
                self.log_result("AWS S3", "Bucket Name", False, "Not configured")
            
            if region:
                self.log_result("AWS S3", "Region", True, region)
            else:
                self.log_result("AWS S3", "Region", False, "Not configured")
            
            return True
            
        except Exception as e:
            self.log_result("AWS S3", "Service", False, str(e))
            return False
    
    def test_cors_configuration(self):
        """Test CORS configuration"""
        print("\n🌍 Testing CORS Configuration...")
        
        try:
            cors_origins = getattr(settings, 'CORS_ALLOWED_ORIGINS', [])
            cors_all_origins = getattr(settings, 'CORS_ALLOW_ALL_ORIGINS', False)
            
            if cors_all_origins:
                self.log_result("CORS", "Allow All Origins", True, "Enabled")
            else:
                self.log_result("CORS", "Allow All Origins", False, "Disabled")
            
            if cors_origins:
                self.log_result("CORS", "Allowed Origins", True, f"{len(cors_origins)} origins configured")
                for origin in cors_origins[:3]:  # Show first 3
                    print(f"    - {origin}")
                if len(cors_origins) > 3:
                    print(f"    ... and {len(cors_origins) - 3} more")
            else:
                self.log_result("CORS", "Allowed Origins", False, "None configured")
            
            return True
            
        except Exception as e:
            self.log_result("CORS", "Configuration", False, str(e))
            return False
    
    def test_static_files(self):
        """Test static files configuration"""
        print("\n📁 Testing Static Files Configuration...")
        
        try:
            static_url = getattr(settings, 'STATIC_URL', '')
            static_root = getattr(settings, 'STATIC_ROOT', '')
            
            if static_url:
                self.log_result("Static Files", "URL", True, static_url)
            else:
                self.log_result("Static Files", "URL", False, "Not configured")
            
            if static_root:
                self.log_result("Static Files", "Root", True, static_root)
            else:
                self.log_result("Static Files", "Root", False, "Not configured")
            
            # Test if static files directory exists
            if os.path.exists(static_root):
                self.log_result("Static Files", "Directory", True, "Exists")
            else:
                self.log_result("Static Files", "Directory", False, "Does not exist")
            
            return True
            
        except Exception as e:
            self.log_result("Static Files", "Configuration", False, str(e))
            return False
    
    def test_external_services(self):
        """Test external service connectivity"""
        print("\n🔗 Testing External Service Connectivity...")
        
        services = [
            ('https://api.zeptomail.com/v1.1/email', 'ZeptoMail API'),
            ('https://api.ndovubase.com/sms/send', 'Ndovu SMS API'),
            ('https://s3.amazonaws.com', 'AWS S3'),
        ]
        
        all_accessible = True
        for url, name in services:
            try:
                response = requests.get(url, timeout=10)
                if response.status_code in [200, 401, 403]:  # 401/403 means service is reachable but auth required
                    self.log_result("External", f"{name}", True, f"Status: {response.status_code}")
                else:
                    self.log_result("External", f"{name}", False, f"Status: {response.status_code}")
                    all_accessible = False
            except requests.exceptions.RequestException as e:
                self.log_result("External", f"{name}", False, str(e))
                all_accessible = False
        
        return all_accessible
    
    def generate_report(self):
        """Generate a summary report"""
        print("\n" + "="*80)
        print("📊 SERVICE TESTING SUMMARY REPORT")
        print("="*80)
        
        total_tests = len(self.results)
        passed_tests = sum(1 for r in self.results if r['success'])
        failed_tests = total_tests - passed_tests
        
        print(f"Total Tests: {total_tests}")
        print(f"✅ Passed: {passed_tests}")
        print(f"❌ Failed: {failed_tests}")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        if failed_tests > 0:
            print("\n❌ FAILED TESTS:")
            for result in self.results:
                if not result['success']:
                    print(f"  - {result['service']}: {result['test']} - {result['details']}")
        
        print("\n🔧 RECOMMENDATIONS:")
        if failed_tests == 0:
            print("  🎉 All services are working correctly!")
        else:
            print("  📝 Check the failed tests above and ensure:")
            print("    - Environment variables are properly set")
            print("    - External services are accessible")
            print("    - Database connection is working")
            print("    - Required packages are installed")
        
        print("="*80)
        
        return passed_tests == total_tests
    
    def run_all_tests(self):
        """Run all tests"""
        print("🚀 Starting Comprehensive Service Testing...")
        print(f"⏰ Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("="*80)
        
        # Run all tests
        tests = [
            self.test_environment_variables,
            self.test_database_connection,
            self.test_django_apps,
            self.test_api_endpoints,
            self.test_zeptomail_service,
            self.test_sms_service,
            self.test_aws_s3_service,
            self.test_cors_configuration,
            self.test_static_files,
            self.test_external_services,
        ]
        
        for test in tests:
            try:
                test()
            except Exception as e:
                self.log_result("System", "Test Execution", False, f"Error in {test.__name__}: {str(e)}")
        
        # Generate report
        success = self.generate_report()
        
        return success

def main():
    """Main function"""
    tester = ServiceTester()
    success = tester.run_all_tests()
    
    if success:
        print("\n🎉 All services are working correctly!")
        sys.exit(0)
    else:
        print("\n⚠️  Some services have issues. Check the report above.")
        sys.exit(1)

if __name__ == "__main__":
    main()
