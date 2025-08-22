from .base import *
import dj_database_url

DEBUG = config('DEBUG', cast=bool, default=False)
SECRET_KEY = config('SECRET_KEY')
ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='.onrender.com').split(',')

DATABASES = {
    'default': dj_database_url.config(conn_max_age=600)
}
