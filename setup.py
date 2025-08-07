#!/usr/bin/env python3
"""
Setup script for FEM Connect Django Backend
This script helps configure the backend for development
"""

import os
import sys
import subprocess
from pathlib import Path

def run_command(command, description):
    """Run a command and handle errors"""
    print(f"\n🔄 {description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} completed successfully")
        return result.stdout
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} failed: {e.stderr}")
        return None

def create_env_file():
    """Create .env file with default development settings"""
    env_content = """# Django Settings
SECRET_KEY=django-insecure-your-secret-key-here-change-in-production
DEBUG=True

# Database Settings (SQLite for development)
DATABASE_URL=sqlite:///db.sqlite3
DB_NAME=fem_db
DB_USER=fem_admin
DB_PASSWORD=fem_password_123
DB_HOST=localhost
DB_PORT=5432

# CORS Settings
ALLOWED_HOSTS=localhost,127.0.0.1,0.0.0.0

# JWT Settings
JWT_SECRET_KEY=your-jwt-secret-key-here
JWT_ALGORITHM=HS256

# Email Settings (for development)
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
EMAIL_HOST=localhost
EMAIL_PORT=1025

# SMS Settings (for development - using console)
SMS_BACKEND=django.core.mail.backends.console.EmailBackend

# File Upload Settings
MEDIA_URL=/media/
MEDIA_ROOT=media/

# Static Files
STATIC_URL=/static/
STATIC_ROOT=staticfiles/
"""
    
    env_path = Path('.env')
    if not env_path.exists():
        with open(env_path, 'w') as f:
            f.write(env_content)
        print("✅ Created .env file with default development settings")
    else:
        print("ℹ️  .env file already exists")

def install_dependencies():
    """Install Python dependencies"""
    return run_command("pip install -r requirements.txt", "Installing Python dependencies")

def run_migrations():
    """Run Django migrations"""
    return run_command("python manage.py makemigrations", "Creating migrations") and \
           run_command("python manage.py migrate", "Running migrations")

def create_superuser():
    """Create a superuser for admin access"""
    print("\n👤 Creating superuser...")
    print("Please enter the following details:")
    
    # Get user input
    partnership_number = input("Partnership Number: ").strip()
    first_name = input("First Name: ").strip()
    last_name = input("Last Name: ").strip()
    email = input("Email (optional): ").strip()
    password = input("Password: ").strip()
    
    if not all([partnership_number, first_name, last_name, password]):
        print("❌ All required fields must be provided")
        return False
    
    # Create superuser using Django management command
    command = f"""python manage.py shell -c "
from user_auth.models import User
from django.contrib.auth import get_user_model

User = get_user_model()
if not User.objects.filter(partnership_number='{partnership_number}').exists():
    user = User.objects.create_superuser(
        partnership_number='{partnership_number}',
        first_name='{first_name}',
        last_name='{last_name}',
        email='{email}' if '{email}' else None,
        password='{password}',
        user_type='business'
    )
    print(f'Superuser {partnership_number} created successfully')
else:
    print(f'User {partnership_number} already exists')
"
"""
    return run_command(command, "Creating superuser")

def create_sample_data():
    """Create sample categories and businesses for testing"""
    print("\n📊 Creating sample data...")
    
    sample_data_script = """
from business.models import Category, Business
from user_auth.models import User
from django.contrib.auth import get_user_model

User = get_user_model()

# Create sample categories
categories_data = [
    'Food & Dining',
    'Health & Beauty',
    'Technology',
    'Fashion & Clothing',
    'Home & Garden',
    'Sports & Fitness',
    'Education',
    'Automotive',
    'Entertainment',
    'Professional Services'
]

for cat_name in categories_data:
    Category.objects.get_or_create(name=cat_name)

print(f"Created {len(categories_data)} categories")

# Create sample business user if it doesn't exist
business_user, created = User.objects.get_or_create(
    partnership_number='BUS001',
    defaults={
        'first_name': 'Sample',
        'last_name': 'Business',
        'email': 'business@example.com',
        'user_type': 'business',
        'is_verified': True
    }
)

if created:
    business_user.set_password('password123')
    business_user.save()
    print("Created sample business user")

# Create sample business
if not Business.objects.filter(business_name='Sample Restaurant').exists():
    category = Category.objects.first()
    business = Business.objects.create(
        user=business_user,
        business_name='Sample Restaurant',
        category=category,
        description='A sample restaurant for testing',
        address='123 Sample Street, Nairobi',
        city='Nairobi',
        county='Nairobi',
        phone='+254700000000',
        email='restaurant@example.com',
        is_verified=True,
        is_active=True
    )
    print("Created sample business")

print("Sample data creation completed")
"""
    
    with open('create_sample_data.py', 'w') as f:
        f.write(sample_data_script)
    
    result = run_command("python create_sample_data.py", "Creating sample data")
    
    # Clean up temporary file
    if os.path.exists('create_sample_data.py'):
        os.remove('create_sample_data.py')
    
    return result

def main():
    """Main setup function"""
    print("🚀 FEM Connect Backend Setup")
    print("=" * 40)
    
    # Check if we're in the right directory
    if not os.path.exists('manage.py'):
        print("❌ Please run this script from the backend directory")
        sys.exit(1)
    
    # Step 1: Create environment file
    create_env_file()
    
    # Step 2: Install dependencies
    if not install_dependencies():
        print("❌ Failed to install dependencies")
        sys.exit(1)
    
    # Step 3: Run migrations
    if not run_migrations():
        print("❌ Failed to run migrations")
        sys.exit(1)
    
    # Step 4: Create superuser
    create_superuser_choice = input("\n🤔 Do you want to create a superuser? (y/n): ").strip().lower()
    if create_superuser_choice in ['y', 'yes']:
        create_superuser()
    
    # Step 5: Create sample data
    create_sample_choice = input("\n🤔 Do you want to create sample data for testing? (y/n): ").strip().lower()
    if create_sample_choice in ['y', 'yes']:
        create_sample_data()
    
    print("\n🎉 Backend setup completed!")
    print("\n📋 Next steps:")
    print("1. Start the backend server: python manage.py runserver")
    print("2. Access the admin panel: http://localhost:8000/admin")
    print("3. Access the API: http://localhost:8000/api/")
    print("4. Update your frontend .env file with: VITE_API_BASE_URL=http://localhost:8000/api")

if __name__ == "__main__":
    main() 