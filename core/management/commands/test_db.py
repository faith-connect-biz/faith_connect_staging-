from django.core.management.base import BaseCommand
from django.db import connection
from django.conf import settings
from user_auth.models import User
from business.models import Business, Category


class Command(BaseCommand):
    help = 'Test database connection and show connection details'

    def handle(self, *args, **options):
        self.stdout.write(
            self.style.SUCCESS('🚀 FEM Family Business Directory - Database Connection Test')
        )
        self.stdout.write('=' * 70)
        
        # Test database connection
        self.test_database_connection()
        
        # Test Django models
        self.test_django_models()
        
        self.stdout.write('=' * 70)

    def test_database_connection(self):
        """Test the database connection and show connection details."""
        self.stdout.write('\n🔍 Testing Database Connection...')
        self.stdout.write('=' * 50)
        
        try:
            # Get database settings
            db_settings = settings.DATABASES['default']
            self.stdout.write(f"📊 Database Engine: {db_settings.get('ENGINE', 'Not set')}")
            self.stdout.write(f"📊 Database Name: {db_settings.get('NAME', 'Not set')}")
            self.stdout.write(f"📊 Database Host: {db_settings.get('HOST', 'Not set')}")
            self.stdout.write(f"📊 Database Port: {db_settings.get('PORT', 'Not set')}")
            self.stdout.write(f"📊 Database User: {db_settings.get('USER', 'Not set')}")
            
            # Test connection
            with connection.cursor() as cursor:
                cursor.execute("SELECT version();")
                version = cursor.fetchone()
                self.stdout.write(
                    self.style.SUCCESS(f"✅ PostgreSQL Version: {version[0]}")
                )
                
                # Test a simple query
                cursor.execute("SELECT current_database(), current_user, current_timestamp;")
                db_info = cursor.fetchone()
                self.stdout.write(f"✅ Current Database: {db_info[0]}")
                self.stdout.write(f"✅ Current User: {db_info[1]}")
                self.stdout.write(f"✅ Current Timestamp: {db_info[2]}")
                
                # Test table creation (if it doesn't exist)
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS connection_test (
                        id SERIAL PRIMARY KEY,
                        test_message TEXT,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    );
                """)
                
                # Insert test data
                cursor.execute("""
                    INSERT INTO connection_test (test_message) 
                    VALUES ('Database connection test successful!')
                    RETURNING id, test_message, created_at;
                """)
                
                test_result = cursor.fetchone()
                self.stdout.write(
                    f"✅ Test Record Created: ID={test_result[0]}, Message='{test_result[1]}', Time={test_result[2]}"
                )
                
                # Clean up test data
                cursor.execute("DELETE FROM connection_test WHERE test_message = 'Database connection test successful!';")
                self.stdout.write("🧹 Test data cleaned up")
                
            self.stdout.write(
                self.style.SUCCESS('\n🎉 Database connection test PASSED!')
            )
            return True
            
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'\n❌ Database connection test FAILED!')
            )
            self.stdout.write(f"Error: {str(e)}")
            self.stdout.write(f"Error Type: {type(e).__name__}")
            return False

    def test_django_models(self):
        """Test if Django models can be imported and accessed."""
        self.stdout.write('\n🔍 Testing Django Models...')
        self.stdout.write('=' * 50)
        
        try:
            # Try to count records (this will test actual database queries)
            user_count = User.objects.count()
            business_count = Business.objects.count()
            category_count = Category.objects.count()
            
            self.stdout.write("✅ User model imported successfully")
            self.stdout.write("✅ Business model imported successfully")
            self.stdout.write("✅ Category model imported successfully")
            
            self.stdout.write(f"📊 Total Users: {user_count}")
            self.stdout.write(f"📊 Total Businesses: {business_count}")
            self.stdout.write(f"📊 Total Categories: {category_count}")
            
            self.stdout.write(
                self.style.SUCCESS('\n🎉 Django models test PASSED!')
            )
            return True
            
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'\n❌ Django models test FAILED!')
            )
            self.stdout.write(f"Error: {str(e)}")
            self.stdout.write(f"Error Type: {type(e).__name__}")
            return False
