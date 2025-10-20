#!/bin/bash

# Start the Django backend server
echo "🚀 Starting Faith Connect Backend Server..."

# Navigate to the backend directory
cd backend/fem_connect

# Check if Python 3 is available
if command -v python3 &> /dev/null; then
    PYTHON_CMD="python3"
elif command -v python &> /dev/null; then
    PYTHON_CMD="python"
else
    echo "❌ Python not found. Please install Python 3."
    exit 1
fi

echo "📋 Using Python command: $PYTHON_CMD"

# Check Django setup
echo "🔍 Checking Django setup..."
$PYTHON_CMD manage.py check

if [ $? -eq 0 ]; then
    echo "✅ Django setup is valid"
else
    echo "❌ Django setup has issues. Please fix them first."
    exit 1
fi

# Start the server
echo "🌐 Starting Django development server on http://localhost:8000..."
echo "📝 Press Ctrl+C to stop the server"
echo ""

$PYTHON_CMD manage.py runserver 8000
