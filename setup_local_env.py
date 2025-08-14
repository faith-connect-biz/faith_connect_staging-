#!/usr/bin/env python3
"""
Setup script for local development environment
"""
import os
import shutil
from pathlib import Path

def setup_local_environment():
    """Set up local development environment"""
    print("🚀 Setting up local development environment...")
    
    # Get the backend directory
    backend_dir = Path(__file__).parent
    env_template = backend_dir / "env.local.template"
    env_file = backend_dir / ".env"
    
    # Check if .env already exists
    if env_file.exists():
        print("ℹ️  .env file already exists")
        response = input("Do you want to overwrite it? (y/N): ").strip().lower()
        if response != 'y':
            print("✅ Setup complete - using existing .env file")
            return
    
    # Copy template to .env
    if env_template.exists():
        shutil.copy2(env_template, env_file)
        print("✅ Created .env file from template")
        
        # Update the .env file with some default values
        with open(env_file, 'r') as f:
            content = f.read()
        
        # Generate a random secret key
        import secrets
        secret_key = f"django-insecure-{secrets.token_urlsafe(50)}"
        content = content.replace("django-insecure-your-secret-key-here-change-in-production", secret_key)
        
        with open(env_file, 'w') as f:
            f.write(content)
        
        print("✅ Generated secure Django secret key")
        print("✅ Local environment setup complete!")
        print("\n📝 Next steps:")
        print("1. Review and customize the .env file if needed")
        print("2. Run: python manage.py migrate")
        print("3. Run: python manage.py runserver")
        print("\n📧 Email Configuration:")
        print("- Emails will be printed to console (no real emails sent)")
        print("- To use ZeptoMail, add your API keys to .env")
        
    else:
        print("❌ env.local.template not found")
        print("Please create a .env file manually")

if __name__ == "__main__":
    setup_local_environment()
