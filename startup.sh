#!/bin/bash

echo "🚀 Starting FEM Family Business Directory on Railway..."

# Step 1: Collect static files
echo "📁 Collecting static files..."
python manage.py collectstatic --noinput

# Step 2: Run migrations (if any)
echo "🔄 Running migrations..."
python manage.py migrate --noinput

# Step 3: Create superuser only (categories already exist)
echo "👤 Creating superuser..."
python manage.py create_superuser_local --username admin --password admin4123 --email admin@femconnect.com || echo "⚠️  Superuser creation failed or already exists"

# Step 4: Start the server
echo "🚀 Starting Django server..."
exec gunicorn core.wsgi:application --bind 0.0.0.0:$PORT --workers 2 --timeout 120
