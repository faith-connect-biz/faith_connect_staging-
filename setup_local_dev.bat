@echo off
echo 🚀 FEM Family Business Directory - Local Development Setup
echo ================================================================

echo.
echo This script will help you set up your local development environment.
echo.

REM Check if Python is available
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed or not in PATH
    echo Please install Python and try again.
    pause
    exit /b 1
)

echo ✅ Python found
echo.

REM Check if we're in the right directory
if not exist "manage.py" (
    echo ❌ Please run this script from the backend directory
    echo Current directory: %CD%
    echo.
    echo Please navigate to the backend directory and try again.
    pause
    exit /b 1
)

echo ✅ Backend directory found
echo.

REM Check if virtual environment exists
if exist "venv\Scripts\activate.bat" (
    echo 🔧 Activating virtual environment...
    call venv\Scripts\activate.bat
    echo ✅ Virtual environment activated
) else (
    echo ⚠️  Virtual environment not found
    echo You may need to create one with: python -m venv venv
)

echo.
echo 🌱 Starting local development setup...
echo.

REM Run the setup script
python setup_local_dev.py

echo.
echo 🎉 Setup completed!
echo.
echo 📋 Next steps:
echo    1. Start your Django server: python manage.py runserver
echo    2. Access Django admin: http://localhost:8000/admin/
echo    3. Login with: admin / admin123
echo.

pause
