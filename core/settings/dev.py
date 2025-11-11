from .base import *

import dj_database_url
from decouple import config

# Use PostgreSQL for development by default; fall back to SQLite if no env vars
DATABASE_URL = config(
    "DATABASE_URL",
    default="postgres://postgres:postgres@localhost:5432/faith_connect"
)

DATABASES = {
    'default': dj_database_url.parse(DATABASE_URL, conn_max_age=600)
}

# Override email settings for local development - use console backend
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
EMAIL_HOST = 'localhost'
EMAIL_PORT = 1025
EMAIL_USE_TLS = False
EMAIL_USE_SSL = False
EMAIL_HOST_USER = ''
EMAIL_HOST_PASSWORD = ''

# Disable live SMS/Email services for local development
ZEPTO_API_KEY = ''
SMS_API_KEY = ''

# Use simple database cache for local development
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.db.DatabaseCache',
        'LOCATION': 'cache_table',
        'TIMEOUT': 600,  # 10 minutes default timeout
    }
}

# Disable S3 for local development
USE_S3 = False

# Local development CORS settings
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:8080",
    "http://127.0.0.1:8080",
]

# Print emails to console instead of sending
print("🔧 Local Development Mode: Emails will be printed to console, SMS disabled")

# Ensure request logging middleware is enabled in dev too (already in base)
# Add any dev-specific logging tweaks if needed
