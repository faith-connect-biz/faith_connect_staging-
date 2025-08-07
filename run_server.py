import os
import sys
import subprocess

# Set environment variables
os.environ['SECRET_KEY'] = 'django-insecure-your-secret-key-here'
os.environ['DEBUG'] = 'True'
os.environ['ENVIRONMENT'] = 'dev'

# Run the Django server
if __name__ == '__main__':
    subprocess.run([sys.executable, 'manage.py', 'runserver']) 