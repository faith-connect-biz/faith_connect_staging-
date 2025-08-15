#!/usr/bin/env python
"""
Script to collect static files for the Django admin favicon
"""
import os
import sys
import django
from pathlib import Path

# Add the project directory to Python path
project_dir = Path(__file__).resolve().parent
sys.path.insert(0, str(project_dir))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings.dev')
django.setup()

from django.core.management import execute_from_command_line

if __name__ == '__main__':
    # Collect static files
    execute_from_command_line(['manage.py', 'collectstatic', '--noinput'])
    print("Static files collected successfully!")
    print("Admin favicon should now be available at /static/admin/favicon.ico")
