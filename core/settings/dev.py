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
SMS_API_KEY = config('SMS_API_KEY', default='')
SMS_API_SECRET = config('SMS_API_SECRET', default='')
SMS_FROM_NUMBER = config('SMS_FROM_NUMBER', default='CHOSENGCM')
