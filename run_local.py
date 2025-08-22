#!/usr/bin/env python3
"""
Local Development Server Startup Script
This script runs the Django project with development settings
"""

import os
import sys
import django
from django.core.management import execute_from_command_line

if __name__ == "__main__":
    # Set Django settings module to development
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings.dev')
    
    # Setup Django
    django.setup()
    
    print("🚀 Starting FEM Connect Local Development Server...")
    print("📧 Email Mode: Console (emails printed to terminal)")
    print("📱 SMS Mode: Simulated (no live SMS sent)")
    print("🗄️  Database: SQLite (db.sqlite3)")
    print("🌐 Server: http://127.0.0.1:8000")
    print("🔧 Admin: http://127.0.0.1:8000/admin")
    print("=" * 60)
    
    # Run the development server
    execute_from_command_line(['manage.py', 'runserver', '127.0.0.1:8000'])
