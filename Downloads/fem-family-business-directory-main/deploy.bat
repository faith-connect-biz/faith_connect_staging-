@echo off
REM 🚀 FEM Family Business Directory - Production Deployment Script (Windows)
REM This script helps you deploy to Railway and Vercel

echo 🚀 Starting Production Deployment...
echo.

REM Check if required tools are installed
echo 📋 Checking deployment requirements...

where railway >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Railway CLI not found. Install with: npm install -g @railway/cli
    pause
    exit /b 1
)

where vercel >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Vercel CLI not found. Install with: npm install -g vercel
    pause
    exit /b 1
)

echo ✅ All requirements met!
echo.

REM Deploy backend to Railway
echo 🚀 Deploying backend to Railway...
cd backend

if not exist "railway.json" (
    echo ❌ railway.json not found. Run: railway init
    pause
    exit /b 1
)

echo 📤 Running railway up...
railway up
if %errorlevel% neq 0 (
    echo ❌ Backend deployment failed!
    pause
    exit /b 1
)

echo ✅ Backend deployed to Railway!
cd ..

REM Run migrations
echo 🔄 Running database migrations...
cd backend

railway run python manage.py migrate
if %errorlevel% neq 0 (
    echo ❌ Database migrations failed!
    pause
    exit /b 1
)

echo ✅ Database migrations completed!

railway run python manage.py collectstatic --noinput
if %errorlevel% neq 0 (
    echo ⚠️ Static files collection failed (this is usually OK)
) else (
    echo ✅ Static files collected!
)

cd ..

REM Deploy frontend to Vercel
echo 🌐 Deploying frontend to Vercel...

echo 📤 Running vercel --prod...
vercel --prod
if %errorlevel% neq 0 (
    echo ❌ Frontend deployment failed!
    pause
    exit /b 1
)

echo ✅ Frontend deployed to Vercel!

REM Create superuser
echo 👤 Creating superuser...
cd backend

echo ⚠️ You will be prompted to enter superuser credentials...
railway run python manage.py createsuperuser
if %errorlevel% neq 0 (
    echo ⚠️ Superuser creation failed or was cancelled
) else (
    echo ✅ Superuser created successfully!
)

cd ..

echo.
echo 🎉 Deployment completed successfully!
echo.
echo 📋 Next steps:
echo 1. Test your API endpoints
echo 2. Test user registration and login
echo 3. Test business creation and reviews
echo 4. Set up monitoring and alerts
echo.
echo 📚 For more information, see: PRODUCTION_DEPLOYMENT_GUIDE.md
echo.
pause
