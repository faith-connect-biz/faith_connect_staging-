#!/bin/bash

echo "🚀 Starting FEM Family Business Directory on Railway..."

# Step 1: Collect static files
echo "📁 Collecting static files..."
python manage.py collectstatic --noinput

# Step 2: Run migrations (if any)
echo "🔄 Running migrations..."
python manage.py migrate --noinput

# Step 3: Seed the database
echo "🌱 Seeding database with test data..."
python manage.py seed_railway_data --users 5 --businesses 10 --services-per-business 3

# Step 4: Start the server
echo "🚀 Starting Django server..."
exec gunicorn core.wsgi:application --bind 0.0.0.0:$PORT --workers 2 --timeout 120
