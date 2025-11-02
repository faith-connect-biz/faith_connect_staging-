# Frontend API Requirements

This document lists all API endpoints expected by the frontend with their request and response formats.

## Authentication Endpoints

### 1. Send OTP (Email)
**Endpoint:** `POST /api/auth/send-email-otp/`  
**Request:**
```json
{
  "email": "user@example.com"
}
```
**Response:**
```json
{
  "success": true,
  "message": "Verification token sent to email"
}
```

### 2. Verify Email OTP
**Endpoint:** `POST /api/auth/verify-email-otp/`  
**Request:**
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```
**Response:**
```json
{
  "success": true,
  "message": "OTP verified successfully!",
  "user": {
    "id": 1,
    "first_name": "John",
    "last_name": "Doe",
    "partnership_number": "PART123",
    "email": "user@example.com",
    "phone": "254712345678",
    "user_type": "business",
    "is_active": true,
    "is_verified": true
  },
  "tokens": {
    "access": "eyJ...",
    "refresh": "eyJ..."
  },
  "is_profile_complete": false,
  "is_new_user": true
}
```

### 3. Send OTP (Phone)
**Endpoint:** `POST /api/auth/send-phone-otp/`  
**Request:**
```json
{
  "phone": "254712345678"
}
```
**Response:**
```json
{
  "success": true,
  "message": "Verification token sent to phone"
}
```

### 4. Verify Phone OTP
**Endpoint:** `POST /api/auth/verify-phone-otp/`  
**Request:**
```json
{
  "phone": "254712345678",
  "otp": "123456"
}
```
**Response:**
```json
{
  "success": true,
  "message": "OTP verified successfully!",
  "user": {
    "id": 1,
    "first_name": "John",
    "last_name": "Doe",
    "partnership_number": "PART123",
    "email": "user@example.com",
    "phone": "254712345678",
    "user_type": "business",
    "is_active": true,
    "is_verified": true
  },
  "tokens": {
    "access": "eyJ...",
    "refresh": "eyJ..."
  },
  "is_profile_complete": false,
  "is_new_user": true
}
```

### 5. Register with OTP (Email)
**Endpoint:** `POST /api/auth/register-email-otp/`  
**Request:**
```json
{
  "email": "user@example.com",
  "otp": "123456",
  "user_type": "business"
}
```
**Response:**
```json
{
  "success": true,
  "message": "Account created successfully",
  "user": {
    "id": 1,
    "first_name": "John",
    "last_name": "Doe",
    "partnership_number": "PART123",
    "email": "user@example.com",
    "phone": null,
    "user_type": "business",
    "is_active": true,
    "is_verified": true
  },
  "tokens": {
    "access": "eyJ...",
    "refresh": "eyJ..."
  }
}
```

### 6. Register with OTP (Phone)
**Endpoint:** `POST /api/auth/register-phone-otp/`  
**Request:**
```json
{
  "phone": "254712345678",
  "otp": "123456",
  "user_type": "business"
}
```
**Response:**
```json
{
  "success": true,
  "message": "Account created successfully",
  "user": {
    "id": 1,
    "first_name": "John",
    "last_name": "Doe",
    "partnership_number": "PART123",
    "email": null,
    "phone": "254712345678",
    "user_type": "business",
    "is_active": true,
    "is_verified": true
  },
  "tokens": {
    "access": "eyJ...",
    "refresh": "eyJ..."
  }
}
```

## Business Endpoints

### 7. Check WhatsApp Registration
**Endpoint:** `POST /api/business/check-whatsapp/`  
**Request:**
```json
{
  "phone": "254712345678"
}
```
**Response:**
```json
{
  "success": true,
  "is_registered": false
}
```

### 8. Get Business Categories
**Endpoint:** `GET /api/business/categories/`  
**Response:**
```json
{
  "count": 10,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "name": "Food & Beverage",
      "slug": "food-beverage",
      "description": "Restaurants, cafes, catering",
      "icon": "🍽️",
      "is_active": true
    }
  ]
}
```

### 9. Get Business List
**Endpoint:** `GET /api/business/`  
**Query Params:** `page`, `page_size`, `category`, `city`, `search`  
**Response:**
```json
{
  "count": 50,
  "next": "/api/business/?page=2",
  "previous": null,
  "results": [
    {
      "id": "uuid",
      "business_name": "Demo Business",
      "category": { "id": 1, "name": "Food & Beverage", "slug": "food-beverage" },
      "description": "A great business",
      "address": "123 Main St",
      "city": "Nairobi",
      "country": "Kenya",
      "rating": 4.5,
      "review_count": 20,
      "is_verified": true,
      "is_active": true,
      "business_image_url": "https://..."
    }
  ]
}
```

### 10. Get Business Detail
**Endpoint:** `GET /api/business/{id}/`  
**Response:**
```json
{
  "id": "uuid",
  "business_name": "Demo Business",
  "category": { "id": 1, "name": "Food & Beverage" },
  "description": "A great business",
  "long_description": "Detailed description...",
  "phone": "254712345678",
  "email": "info@business.com",
  "website": "https://business.com",
  "address": "123 Main St",
  "city": "Nairobi",
  "country": "Kenya",
  "rating": 4.5,
  "review_count": 20,
  "is_verified": true,
  "is_active": true,
  "user": {
    "id": 1,
    "first_name": "John",
    "last_name": "Doe",
    "email": "owner@business.com"
  },
  "services": [],
  "products": [],
  "hours": [],
  "reviews": []
}
```

### 11. Create Business
**Endpoint:** `POST /api/business/`  
**Auth Required:** Yes  
**Request:**
```json
{
  "business_name": "My Business",
  "category_id": 1,
  "description": "Business description",
  "address": "123 Main St",
  "city": "Nairobi",
  "country": "Kenya",
  "phone": "254712345678",
  "email": "info@business.com",
  "website": "https://business.com"
}
```
**Response:**
```json
{
  "success": true,
  "message": "Business created successfully",
  "data": {
    "id": "uuid",
    "business_name": "My Business",
    "category": { "id": 1, "name": "Food & Beverage" },
    "description": "Business description",
    "address": "123 Main St",
    "city": "Nairobi",
    "country": "Kenya",
    "rating": 0,
    "review_count": 0,
    "is_verified": false,
    "is_active": true
  }
}
```

### 12. Update Business
**Endpoint:** `PUT /api/business/{id}/update/`  
**Auth Required:** Yes  
**Request:**
```json
{
  "business_name": "Updated Business Name",
  "description": "Updated description",
  "phone": "254712345678"
}
```
**Response:**
```json
{
  "success": true,
  "message": "Business updated successfully",
  "data": {
    "id": "uuid",
    "business_name": "Updated Business Name",
    "description": "Updated description",
    "phone": "254712345678"
  }
}
```

### 13. Get My Business
**Endpoint:** `GET /api/business/my-business/`  
**Auth Required:** Yes  
**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "business_name": "My Business",
    "category": { "id": 1, "name": "Food & Beverage" },
    "description": "Business description",
    "address": "123 Main St",
    "city": "Nairobi",
    "country": "Kenya",
    "rating": 4.5,
    "review_count": 20,
    "is_verified": true,
    "is_active": true
  }
}
```

## Summary

The frontend needs the following new endpoints to be created:

1. `/api/auth/send-email-otp/` - Send OTP to email
2. `/api/auth/verify-email-otp/` - Verify email OTP and login
3. `/api/auth/send-phone-otp/` - Send OTP to phone
4. `/api/auth/verify-phone-otp/` - Verify phone OTP and login
5. `/api/auth/register-email-otp/` - Register with email OTP
6. `/api/auth/register-phone-otp/` - Register with phone OTP

All these endpoints should:
- Return `success`, `message` fields in response
- Return user data and tokens after successful verification
- Return `is_profile_complete` boolean to indicate if profile needs completion
- Return `is_new_user` boolean to differentiate new vs existing users
- Handle inactive users by activating them after OTP verification

