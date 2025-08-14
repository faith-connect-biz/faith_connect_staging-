"""
Production settings for FEM Family Business Directory
"""
from .base import *

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = False

# Production-specific CORS settings
CORS_ALLOWED_ORIGINS = [
    "https://www.faithconnect.biz",
    "https://faithconnect.biz",
    "https://fem-family-business-directory-rosy.vercel.app",
    "https://fem-directory-production.up.railway.app",
    "https://fem-directory.up.railway.app",
    "https://femdjango-production.up.railway.app",
]

# For development/testing, you can temporarily allow all origins
# CORS_ALLOW_ALL_ORIGINS = True

# Security settings for production
SECURE_SSL_REDIRECT = True
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True

# Additional security headers
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'

# Logging configuration for production
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
}
