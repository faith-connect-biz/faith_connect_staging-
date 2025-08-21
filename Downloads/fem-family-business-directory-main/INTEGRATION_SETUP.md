# Integration Setup Guide

## Overview
This guide will help you set up the integrated FEM Family Business Directory with both the React frontend and Django backend running together.

## Prerequisites
- Node.js (v16 or higher)
- Python (v3.8 or higher)
- Git

## Step 1: Backend Setup

### 1.1 Navigate to Backend Directory
```bash
cd backend
```

### 1.2 Create Python Virtual Environment
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

### 1.3 Run Setup Script
```bash
python setup.py
```

This script will:
- Create a `.env` file with development settings
- Install Python dependencies
- Run database migrations
- Optionally create a superuser
- Optionally create sample data

### 1.4 Manual Setup (Alternative)
If you prefer manual setup:

```bash
# Install dependencies
pip install -r requirements.txt

# Create .env file
cp env.example .env
# Edit .env file with your settings

# Run migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Create sample data (optional)
python manage.py shell
# Run the sample data creation script from setup.py
```

### 1.5 Start Backend Server
```bash
python manage.py runserver
```

The backend will be available at: http://localhost:8000

## Step 2: Frontend Setup

### 2.1 Navigate to Frontend Directory
```bash
cd ..  # Go back to project root
```

### 2.2 Install Dependencies
```bash
npm install
```

### 2.3 Create Environment File
```bash
# Copy the example environment file
cp env.example .env

# Edit .env file to ensure API_BASE_URL points to your backend
VITE_API_BASE_URL=http://localhost:8000/api
```

### 2.4 Start Frontend Development Server
```bash
npm run dev
```

The frontend will be available at: http://localhost:5173

## Step 3: Verify Integration

### 3.1 Test Backend API
Visit: http://localhost:8000/api/
- You should see the Django REST Framework browsable API
- Test endpoints like: http://localhost:8000/api/business/categories

### 3.2 Test Frontend
Visit: http://localhost:5173
- The home page should load
- Check browser console for any API connection errors
- Try navigating to different pages

### 3.3 Test Authentication
1. Go to http://localhost:5173/register
2. Create a new user account
3. Try logging in at http://localhost:5173/login

## Step 4: Development Workflow

### 4.1 Backend Development
```bash
cd backend
# Activate virtual environment
venv\Scripts\activate  # Windows
source venv/bin/activate  # macOS/Linux

# Make changes to models
python manage.py makemigrations
python manage.py migrate

# Run tests
python manage.py test

# Start server
python manage.py runserver
```

### 4.2 Frontend Development
```bash
# In project root
npm run dev  # Start development server
npm run build  # Build for production
npm run preview  # Preview production build
```

### 4.3 Database Management
```bash
cd backend
python manage.py shell  # Django shell
python manage.py dbshell  # Database shell
python manage.py dumpdata > data.json  # Export data
python manage.py loaddata data.json  # Import data

```
A1234567
Emmanuel 
Maina
community
Test12345

## Step 5: API Testing

### 5.1 Using Django Admin
1. Visit: http://localhost:8000/admin
2. Login with your superuser credentials
3. Manage users, businesses, categories, etc.

### 5.2 Using API Endpoints
Test these endpoints:

**Authentication:**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

**Business:**
- `GET /api/business/` - List businesses
- `POST /api/business/` - Create business
- `GET /api/business/categories` - List categories

**Products:**
- `GET /api/business/api/businesses/{id}/products` - Business products
- `POST /api/business/api/businesses/{id}/products` - Create product

### 5.3 Using Tools
- **Postman**: Import the API collection
- **Insomnia**: Test API endpoints
- **Browser**: Use Django REST Framework's browsable API

## Step 6: Troubleshooting

### 6.1 Common Issues

**Backend Issues:**
- `ModuleNotFoundError`: Make sure virtual environment is activated
- `Database errors`: Run `python manage.py migrate`
- `Port already in use`: Change port with `python manage.py runserver 8001`

**Frontend Issues:**
- `API connection failed`: Check if backend is running and .env file is correct
- `CORS errors`: Backend CORS settings may need adjustment
- `Build errors`: Check Node.js version and dependencies

**Integration Issues:**
- `Authentication not working`: Check JWT token configuration
- `Data not loading`: Verify API endpoints and response format
- `File uploads failing`: Check media directory permissions

### 6.2 Debug Mode
Enable debug mode in backend `.env`:
```
DEBUG=True
```

Check browser console and Django logs for detailed error messages.

## Step 7: Production Setup

### 7.1 Backend Production
```bash
# Update .env for production
DEBUG=False
DATABASE_URL=postgresql://user:password@host:port/dbname
SECRET_KEY=your-production-secret-key

# Collect static files
python manage.py collectstatic

# Use production server (gunicorn)
gunicorn core.wsgi:application
```

### 7.2 Frontend Production
```bash
# Build for production
npm run build

# Serve with a production server
npm install -g serve
serve -s dist
```

## Step 8: Next Steps

1. **Implement Missing Features:**
   - Business activity tracking
   - Product archiving
   - Enhanced search/filtering
   - Chat functionality

2. **Add Tests:**
   - Backend: Django tests
   - Frontend: React testing library
   - Integration: API tests

3. **Deploy:**
   - Backend: Heroku, Railway, or AWS
   - Frontend: Vercel, Netlify, or AWS S3
   - Database: PostgreSQL on cloud provider

4. **Monitor:**
   - Set up logging
   - Add error tracking
   - Monitor performance

## Support

If you encounter issues:
1. Check the troubleshooting section
2. Review Django and React documentation
3. Check browser console and Django logs
4. Verify all environment variables are set correctly 