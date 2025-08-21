# Backend Integration Guide

## Overview
This guide outlines the integration between the Django backend (`fem_connect`) and the React frontend (`fem-family-business-directory`).

## Backend Structure Analysis

### Current Django Models

#### User Model (`user_auth/models.py`)
- **Fields**: `first_name`, `last_name`, `partnership_number`, `email`, `phone`, `user_type`, `profile_image_url`, `bio`, `address`, `county`, `city`, `otp`, `email_token`, `is_verified`, `email_verified`, `phone_verified`, `is_active`, `is_staff`, `created_at`, `updated_at`, `last_login`
- **Key Features**: Custom user model with OTP support, email/phone verification

#### Business Model (`business/models.py`)
- **Fields**: `id` (UUID), `user`, `business_name`, `category`, `description`, `long_description`, `phone`, `email`, `website`, `address`, `city`, `county`, `state`, `zip_code`, `latitude`, `longitude`, `rating`, `review_count`, `is_verified`, `is_featured`, `is_active`, `business_image_url`, `business_logo_url`, `created_at`, `updated_at`
- **Related Models**: `Category`, `BusinessHour`, `Service`, `Product`, `Review`, `Favorite`

### API Endpoints

#### Authentication (`/api/auth/`)
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh-token` - Token refresh
- `POST /api/auth/forgot-password` - Forgot password OTP
- `POST /api/auth/reset-password` - Reset password with OTP
- `POST /api/auth/verify-email` - Send email verification
- `POST /api/auth/verify-email-confirm` - Confirm email verification
- `POST /api/auth/verify-phone` - Send phone OTP
- `POST /api/auth/verify-phone-confirm` - Confirm phone OTP

#### Business (`/api/business/`)
- `GET/POST /api/business/` - List/Create businesses
- `GET/PUT/DELETE /api/business/<uuid:id>` - Business detail/update
- `GET /api/business/categories` - List categories
- `POST /api/business/<uuid:id>/favorite` - Toggle favorite
- `GET/POST /api/business/api/businesses/<uuid:business_id>/products` - Business products
- `GET/PUT/DELETE /api/business/products/<uuid:id>` - Product detail
- `GET/POST /api/business/<uuid:business_id>/reviews` - Business reviews
- `GET/PUT/DELETE /api/business/<uuid:business_id>/reviews/<int:pk>` - Review detail

## Integration Plan

### Phase 1: Environment Setup
1. **Backend Setup**
   - Install Python dependencies
   - Configure environment variables
   - Set up database
   - Run migrations

2. **Frontend API Integration**
   - Create API service layer
   - Update existing components to use real API
   - Implement authentication flow
   - Add error handling

### Phase 2: Data Mapping
1. **User Registration/Login**
   - Map frontend form fields to backend API
   - Implement OTP verification flow
   - Handle JWT token management

2. **Business Management**
   - Update business registration to use backend
   - Implement business listing with real data
   - Add business detail pages

3. **Products & Services**
   - Integrate product/service management
   - Update directory filtering
   - Implement search functionality

### Phase 3: Advanced Features
1. **Reviews & Ratings**
   - Implement review system
   - Add rating calculations
   - Handle review moderation

2. **Favorites & Bookmarks**
   - Implement favorite functionality
   - Add user dashboard

3. **Search & Filtering**
   - Implement advanced search
   - Add category filtering
   - Location-based search

## Required Changes

### Backend Enhancements Needed
1. **Missing Models** (from DATABASE_STRUCTURE.md):
   - `BusinessActivity` model for tracking seller activity
   - Enhanced OTP model with purpose field
   - Product inventory tracking

2. **API Endpoints**:
   - Business activity tracking
   - Product archiving
   - Enhanced search/filtering
   - Chat functionality (future)

### Frontend Updates Required
1. **API Service Layer**:
   - Replace mock data with API calls
   - Implement authentication
   - Add error handling

2. **Component Updates**:
   - Update forms to match backend fields
   - Implement real-time data fetching
   - Add loading states

3. **New Features**:
   - Business activity tracking
   - Product management
   - Enhanced filtering

## Environment Variables

### Backend (.env)
```
SECRET_KEY=your-secret-key
DEBUG=True
DATABASE_URL=postgresql://user:password@localhost:5432/fem_connect
ALLOWED_HOSTS=localhost,127.0.0.1
```

### Frontend (.env)
```
VITE_API_BASE_URL=http://localhost:8000/api
VITE_WS_URL=ws://localhost:8000/ws
```

## Development Workflow

### Local Development Setup
1. **Backend**:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # or venv\Scripts\activate on Windows
   pip install -r requirements.txt
   python manage.py migrate
   python manage.py runserver
   ```

2. **Frontend**:
   ```bash
   npm install
   npm run dev
   ```

### API Testing
- Use Django REST Framework's built-in browsable API
- Test endpoints at `http://localhost:8000/api/`
- Use tools like Postman or Insomnia for API testing

## Security Considerations
1. **CORS Configuration**: Configure CORS for frontend domain
2. **JWT Token Management**: Implement proper token refresh
3. **Input Validation**: Ensure all inputs are validated
4. **Rate Limiting**: Implement API rate limiting
5. **File Upload Security**: Secure file upload endpoints

## Next Steps
1. Set up local development environment
2. Create API service layer in frontend
3. Update authentication flow
4. Implement business CRUD operations
5. Add product/service management
6. Test integration thoroughly
7. Deploy to staging environment 