#!/bin/bash

echo "🚀 FEM Family Business Directory - Local Development Setup"
echo "================================================================"
echo

echo "This script will help you set up your local development environment."
echo

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    if ! command -v python &> /dev/null; then
        echo "❌ Python is not installed or not in PATH"
        echo "Please install Python and try again."
        exit 1
    else
        PYTHON_CMD="python"
    fi
else
    PYTHON_CMD="python3"
fi

echo "✅ Python found: $($PYTHON_CMD --version)"
echo

# Check if we're in the right directory
if [ ! -f "manage.py" ]; then
    echo "❌ Please run this script from the backend directory"
    echo "Current directory: $(pwd)"
    echo
    echo "Please navigate to the backend directory and try again."
    exit 1
fi

echo "✅ Backend directory found"
echo

# Check if virtual environment exists
if [ -f "venv/bin/activate" ]; then
    echo "🔧 Activating virtual environment..."
    source venv/bin/activate
    echo "✅ Virtual environment activated"
elif [ -f "venv/Scripts/activate" ]; then
    echo "🔧 Activating virtual environment..."
    source venv/Scripts/activate
    echo "✅ Virtual environment activated"
else
    echo "⚠️  Virtual environment not found"
    echo "You may need to create one with: $PYTHON_CMD -m venv venv"
fi

echo
echo "🌱 Starting local development setup..."
echo

# Run the setup script
$PYTHON_CMD setup_local_dev.py

echo
echo "🎉 Setup completed!"
echo
echo "📋 Next steps:"
echo "   1. Start your Django server: $PYTHON_CMD manage.py runserver"
echo "   2. Access Django admin: http://localhost:8000/admin/"
echo "   3. Login with: admin / admin123"
echo
