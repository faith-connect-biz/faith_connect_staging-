from .base import *

from decouple import config

# Use SQLite for development
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# SMS Configuration (Ndovu SMS)
SMS_API_KEY = os.environ.get('SMS_API_KEY', '')
SMS_API_SECRET = os.environ.get('SMS_API_SECRET', '')
SMS_FROM_NUMBER = os.environ.get('SMS_FROM_NUMBER', 'CHOSENGCM')
