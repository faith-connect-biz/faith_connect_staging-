"""
WSGI config for core project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/howto/deployment/wsgi/
"""

import os
import sys

# Force the settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings.railway')

try:
    from django.core.wsgi import get_wsgi_application
    application = get_wsgi_application()
    print("✅ WSGI application created successfully")
except Exception as e:
    print(f"❌ Error creating WSGI application: {e}")
    print(f"Current DJANGO_SETTINGS_MODULE: {os.environ.get('DJANGO_SETTINGS_MODULE')}")
    sys.exit(1)
