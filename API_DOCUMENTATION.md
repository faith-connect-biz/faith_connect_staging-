# Faith Connect API Documentation

Complete API documentation for both Community and Business users, including all request and response payloads.

**Base URL:** `https://femdjango-production.up.railway.app/api`

**Authentication:** Most endpoints require JWT Bearer token in the `Authorization` header:
```
Authorization: Bearer <access_token>
```

---

## Table of Contents

1. [Authentication APIs](#authentication-apis)
2. [User Profile APIs](#user-profile-apis)
3. [Business APIs](#business-apis)
4. [Services & Products APIs](#services--products-apis)
5. [Reviews APIs](#reviews-apis)
6. [Community Features APIs](#community-features-apis)
7. [File Upload APIs](#file-upload-apis)
8. [Support & Requests APIs](#support--requests-apis)
9. [Public APIs](#public-apis)

---

## Authentication APIs

### 1. Send OTP (Initiate Authentication)
**Endpoint:** `POST /initiate-auth`  
**Auth Required:** No  
**User Type:** Both

**Request Payload:**
```json
{
  "identifier": "user@example.com" | "+254712345678",
  "auth_method": "email" | "phone"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent to your email",
  "user_id": 123,
  "requires_profile_completion": false,
  "otp": "123456" // Only in development
}
```

---

### 2. Verify OTP
**Endpoint:** `POST /verify-auth-otp`  
**Auth Required:** No  
**User Type:** Both

**Request Payload:**
```json
{
  "identifier": "user@example.com" | "+254712345678",
  "auth_method": "email" | "phone",
  "otp": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "123",
    "first_name": "John",
    "last_name": "Doe",
    "partnership_number": "FEM001",
    "email": "user@example.com",
    "phone": "+254712345678",
    "user_type": "community" | "business",
    "profile_image_url": "https://...",
    "is_verified": true,
    "email_verified": true,
    "phone_verified": true,
    "is_active": true,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  },
  "tokens": {
    "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
  },
  "is_new_user": false,
  "message": "OTP verified successfully"
}
```

---

### 3. Complete Profile (New User Registration)
**Endpoint:** `POST /complete-profile`  
**Auth Required:** No (uses identifier + auth_method)  
**User Type:** Both

**Request Payload:**
```json
{
  "identifier": "user@example.com" | "+254712345678",
  "auth_method": "email" | "phone",
  "first_name": "John",
  "last_name": "Doe",
  "partnership_number": "FEM001",
  "user_type": "community" | "business",
  "bio": "Optional bio",
  "profile_image_url": "https://...",
  "address": "123 Main St",
  "county": "Nairobi",
  "city": "Nairobi",
  "website": "https://example.com"
}
```

**Response:**
```json
{
  "success": true,
  "user": { /* User object */ },
  "tokens": {
    "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
  },
  "message": "Profile completed successfully"
}
```

---

### 4. Register (Legacy)
**Endpoint:** `POST /register`  
**Auth Required:** No  
**User Type:** Both

**Request Payload:**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "partnership_number": "FEM001",
  "email": "user@example.com",
  "phone": "+254712345678",
  "user_type": "community" | "business",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration successful. OTP sent to email.",
  "user_id": 123,
  "registration_token": "token123",
  "requires_otp": true,
  "otp_sent_to": "user@example.com"
}
```

---

### 5. Verify Registration OTP
**Endpoint:** `POST /verify-registration-otp`  
**Auth Required:** No  
**User Type:** Both

**Request Payload:**
```json
{
  "user_id": 123,
  "otp": "123456"
}
```
OR
```json
{
  "registration_token": "token123",
  "otp": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP verified successfully",
  "user": { /* User object */ },
  "tokens": {
    "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
  }
}
```

---

### 6. Resend OTP
**Endpoint:** `POST /resend-otp`  
**Auth Required:** No  
**User Type:** Both

**Request Payload:**
```json
{
  "user_id": 123
}
```
OR
```json
{
  "registration_token": "token123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP resent successfully",
  "otp_sent_to": "user@example.com"
}
```

---

### 7. Login (Legacy)
**Endpoint:** `POST /login`  
**Auth Required:** No  
**User Type:** Both

**Request Payload:**
```json
{
  "partnership_number": "FEM001",
  "password": "securepassword123"
}
```
OR
```json
{
  "identifier": "user@example.com",
  "auth_method": "email",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "user": { /* User object */ },
  "tokens": {
    "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
  }
}
```

---

### 8. Logout
**Endpoint:** `POST /logout`  
**Auth Required:** Yes  
**User Type:** Both

**Request Payload:**
```json
{
  "refresh": "refresh_token_here"
}
```

**Response:**
```json
{
  "message": "Logged out successfully"
}
```

---

### 9. Refresh Token
**Endpoint:** `POST /refresh-token`  
**Auth Required:** No  
**User Type:** Both

**Request Payload:**
```json
{
  "refresh": "refresh_token_here"
}
```

**Response:**
```json
{
  "access": "new_access_token",
  "access_token": "new_access_token" // Alternative field name
}
```

---

### 10. Request Password Reset
**Endpoint:** `POST /forgot-password`  
**Auth Required:** No  
**User Type:** Both

**Request Payload:**
```json
{
  "identifier": "user@example.com",
  "method": "email" | "phone"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent to your email",
  "token": "reset_token_123"
}
```

---

### 11. Reset Password
**Endpoint:** `POST /reset-password`  
**Auth Required:** No  
**User Type:** Both

**Request Payload:**
```json
{
  "token": "reset_token_123",
  "new_password": "newpassword123"
}
```
OR
```json
{
  "identifier": "user@example.com",
  "otp": "123456",
  "new_password": "newpassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

---

## User Profile APIs

### 12. Get Current User Profile
**Endpoint:** `GET /profile`  
**Auth Required:** Yes  
**User Type:** Both

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "123",
    "first_name": "John",
    "last_name": "Doe",
    "partnership_number": "FEM001",
    "email": "user@example.com",
    "phone": "+254712345678",
    "user_type": "community" | "business",
    "profile_image_url": "https://...",
    "bio": "User bio",
    "address": "123 Main St",
    "county": "Nairobi",
    "city": "Nairobi",
    "website": "https://example.com",
    "is_verified": true,
    "email_verified": true,
    "phone_verified": true,
    "is_active": true,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

---

### 13. Update User Profile
**Endpoint:** `PATCH /profile-update`  
**Auth Required:** Yes  
**User Type:** Both

**Request Payload:**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "bio": "Updated bio",
  "address": "123 Main St",
  "county": "Nairobi",
  "city": "Nairobi",
  "website": "https://example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "user": { /* Updated User object */ }
}
```

---

### 14. Get Profile Photo Upload URL
**Endpoint:** `POST /profile-photo-upload-url`  
**Auth Required:** Yes  
**User Type:** Both

**Request Payload:**
```json
{
  "file_name": "profile.jpg",
  "content_type": "image/jpeg"
}
```

**Response:**
```json
{
  "presigned_url": "https://s3.amazonaws.com/...",
  "file_key": "profile-photos/user123/profile.jpg",
  "expires_in_minutes": 60,
  "s3_url": "https://bucket.s3.region.amazonaws.com/..."
}
```

---

### 15. Update Profile Photo
**Endpoint:** `PUT /profile-photo-update`  
**Auth Required:** Yes  
**User Type:** Both

**Request Payload:**
```json
{
  "file_key": "profile-photos/user123/profile.jpg"
}
```

**Response:**
```json
{
  "profile_image_url": "https://bucket.s3.region.amazonaws.com/...",
  "s3_url": "https://bucket.s3.region.amazonaws.com/..."
}
```

---

### 16. Get Profile Photo Upload URL (Unauthenticated)
**Endpoint:** `POST /profile-photo-upload-url-unauthenticated`  
**Auth Required:** No  
**User Type:** Both (for profile completion)

**Request Payload:**
```json
{
  "identifier": "user@example.com",
  "auth_method": "email" | "phone",
  "file_name": "profile.jpg",
  "content_type": "image/jpeg"
}
```

**Response:**
```json
{
  "presigned_url": "https://s3.amazonaws.com/...",
  "file_key": "profile-photos/temp/profile.jpg",
  "expires_in_minutes": 60,
  "s3_url": "https://bucket.s3.region.amazonaws.com/..."
}
```

---

## Business APIs

### 17. Get All Businesses
**Endpoint:** `GET /business/`  
**Auth Required:** No (Public)  
**User Type:** Public

**Query Parameters:**
- `search` (string): Search term
- `category` (number): Category ID
- `city` (string): City filter
- `county` (string): County filter
- `rating` (number): Minimum rating
- `is_featured` (boolean): Featured businesses only
- `ordering` (string): Sort order (e.g., "-rating", "name")
- `page` (number): Page number
- `limit` (number): Items per page
- `offset` (number): Offset for pagination

**Response:**
```json
{
  "count": 100,
  "next": "https://api.example.com/business/?page=2",
  "previous": null,
  "results": [
    {
      "id": "123",
      "business_name": "ABC Company",
      "category": {
        "id": 1,
        "name": "Technology & IT",
        "slug": "technology-it"
      },
      "description": "Business description",
      "phone": "+254712345678",
      "email": "contact@abc.com",
      "website": "https://abc.com",
      "address": "123 Main St",
      "city": "Nairobi",
      "country": "Kenya",
      "rating": 4.5,
      "review_count": 25,
      "is_verified": true,
      "is_featured": false,
      "business_image_url": "https://...",
      "business_logo_url": "https://...",
      "services": [ /* Service objects */ ],
      "products": [ /* Product objects */ ],
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

### 18. Get Business by ID
**Endpoint:** `GET /business/{id}/`  
**Auth Required:** No (Public)  
**User Type:** Public

**Response:**
```json
{
  "id": "123",
  "business_name": "ABC Company",
  "category": { /* Category object */ },
  "description": "Full business description",
  "long_description": "Extended description",
  "phone": "+254712345678",
  "email": "contact@abc.com",
  "website": "https://abc.com",
  "address": "123 Main St",
  "city": "Nairobi",
  "country": "Kenya",
  "rating": 4.5,
  "review_count": 25,
  "is_verified": true,
  "is_featured": false,
  "business_image_url": "https://...",
  "business_logo_url": "https://...",
  "services": [ /* Service objects */ ],
  "products": [ /* Product objects */ ],
  "hours": [ /* Business hours */ ],
  "reviews": [ /* Review objects */ ],
  "created_at": "2024-01-01T00:00:00Z"
}
```

---

### 19. Create Business
**Endpoint:** `POST /business/`  
**Auth Required:** Yes  
**User Type:** Business

**Request Payload:**
```json
{
  "business_name": "ABC Company",
  "category_id": 1,
  "sector": "Software Development",
  "subcategory": "Web Development",
  "description": "Business description",
  "long_description": "Extended description",
  "phone": "+254712345678",
  "email": "contact@abc.com",
  "website": "https://abc.com",
  "address": "123 Main St",
  "office_address": "456 Office St",
  "country": "Kenya",
  "city": "Nairobi",
  "fem_church_id": 1,
  "latitude": -1.2921,
  "longitude": 36.8219,
  "business_image_url": "https://...",
  "business_logo_url": "https://...",
  "facebook_url": "https://facebook.com/...",
  "instagram_url": "https://instagram.com/...",
  "twitter_url": "https://twitter.com/...",
  "youtube_url": "https://youtube.com/...",
  "hours": [
    {
      "day_of_week": 1,
      "open_time": "09:00",
      "close_time": "17:00",
      "is_closed": false
    }
  ],
  "services_data": [
    {
      "name": "Web Development",
      "description": "Custom web solutions",
      "price_range": "KES 50,000 - 200,000",
      "duration": "2-4 weeks",
      "is_available": true,
      "photos": ["https://..."]
    }
  ],
  "products_data": [
    {
      "name": "Software License",
      "description": "Annual license",
      "price": "50000",
      "is_available": true,
      "photos": ["https://..."]
    }
  ],
  "features": ["Feature 1", "Feature 2"],
  "photo_request": "yes" | "no" | null,
  "photo_request_notes": "Request notes"
}
```

**Response:**
```json
{
  "success": true,
  "data": { /* Business object */ }
}
```

---

### 20. Update Business
**Endpoint:** `PUT /business/{id}/update/`  
**Auth Required:** Yes (Owner only)  
**User Type:** Business

**Request Payload:** Same as Create Business

**Response:**
```json
{
  "success": true,
  "data": { /* Updated Business object */ }
}
```

---

### 21. Delete Business
**Endpoint:** `DELETE /business/{id}`  
**Auth Required:** Yes (Owner only)  
**User Type:** Business

**Response:**
```json
{
  "message": "Business deleted successfully"
}
```

---

### 22. Get User's Business
**Endpoint:** `GET /business/my-business/`  
**Auth Required:** Yes  
**User Type:** Business

**Response:**
```json
{
  "success": true,
  "data": { /* Business object */ }
}
```

---

### 23. Get Business Hours
**Endpoint:** `GET /business/{id}/hours/`  
**Auth Required:** No (Public)  
**User Type:** Public

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "day_of_week": 1,
      "open_time": "09:00",
      "close_time": "17:00",
      "is_closed": false
    }
  ]
}
```

---

### 24. Update Business Hours
**Endpoint:** `POST /business/{id}/hours/`  
**Auth Required:** Yes (Owner only)  
**User Type:** Business

**Request Payload:**
```json
{
  "hours": [
    {
      "day_of_week": 1,
      "open_time": "09:00",
      "close_time": "17:00",
      "is_closed": false
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": [ /* Updated hours array */ ]
}
```

---

### 25. Get Business Analytics
**Endpoint:** `GET /business/{id}/analytics/`  
**Auth Required:** Yes (Owner only)  
**User Type:** Business

**Response:**
```json
{
  "success": true,
  "data": {
    "business_id": "123",
    "business_name": "ABC Company",
    "total_reviews": 25,
    "average_rating": 4.5,
    "rating_distribution": {
      "5": 10,
      "4": 8,
      "3": 5,
      "2": 2,
      "1": 0
    },
    "recent_reviews": [ /* Review objects */ ]
  }
}
```

---

### 26. Get Business Profile Image Upload URL
**Endpoint:** `POST /business/{id}/upload-profile-image/`  
**Auth Required:** Yes (Owner only)  
**User Type:** Business

**Request Payload:**
```json
{
  "file_name": "business-image.jpg",
  "content_type": "image/jpeg"
}
```

**Response:**
```json
{
  "presigned_url": "https://s3.amazonaws.com/...",
  "file_key": "business-images/123/image.jpg",
  "expires_in_minutes": 60
}
```

---

### 27. Update Business Profile Image
**Endpoint:** `PUT /business/{id}/update-profile-image/`  
**Auth Required:** Yes (Owner only)  
**User Type:** Business

**Request Payload:**
```json
{
  "file_key": "business-images/123/image.jpg"
}
```

**Response:**
```json
{
  "business_image_url": "https://bucket.s3.region.amazonaws.com/...",
  "s3_url": "https://bucket.s3.region.amazonaws.com/..."
}
```

---

### 28. Get Business Logo Upload URL
**Endpoint:** `POST /business/{id}/upload-logo/`  
**Auth Required:** Yes (Owner only)  
**User Type:** Business

**Request Payload:**
```json
{
  "file_name": "logo.png",
  "content_type": "image/png"
}
```

**Response:**
```json
{
  "presigned_url": "https://s3.amazonaws.com/...",
  "file_key": "business-logos/123/logo.png",
  "expires_in_minutes": 60
}
```

---

### 29. Update Business Logo
**Endpoint:** `PUT /business/{id}/update-logo/`  
**Auth Required:** Yes (Owner only)  
**User Type:** Business

**Request Payload:**
```json
{
  "file_key": "business-logos/123/logo.png"
}
```

**Response:**
```json
{
  "business_logo_url": "https://bucket.s3.region.amazonaws.com/...",
  "s3_url": "https://bucket.s3.region.amazonaws.com/..."
}
```

---

## Services & Products APIs

### 30. Get Business Services
**Endpoint:** `GET /business/{id}/services/`  
**Auth Required:** No (Public)  
**User Type:** Public

**Response:**
```json
{
  "results": [
    {
      "id": "456",
      "business": "123",
      "name": "Web Development",
      "description": "Custom web solutions",
      "price_range": "KES 50,000 - 200,000",
      "duration": "2-4 weeks",
      "service_image_url": "https://...",
      "images": ["https://...", "https://..."],
      "is_active": true,
      "is_available": true,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

### 31. Create Service
**Endpoint:** `POST /business/{id}/services/`  
**Auth Required:** Yes (Owner only)  
**User Type:** Business

**Request Payload:**
```json
{
  "name": "Web Development",
  "description": "Custom web solutions",
  "price_range": "KES 50,000 - 200,000",
  "duration": "2-4 weeks",
  "images": ["https://...", "https://..."],
  "is_active": true
}
```

**Response:**
```json
{
  "id": "456",
  "business": "123",
  "name": "Web Development",
  /* ... other service fields ... */
}
```

---

### 32. Get Service by ID
**Endpoint:** `GET /business/services/{id}/`  
**Auth Required:** No (Public)  
**User Type:** Public

**Response:**
```json
{
  "id": "456",
  "business": { /* Business object */ },
  "name": "Web Development",
  /* ... other service fields ... */
}
```

---

### 33. Update Service
**Endpoint:** `PUT /business/services/{id}/`  
**Auth Required:** Yes (Owner only)  
**User Type:** Business

**Request Payload:** Same as Create Service (all fields optional)

**Response:**
```json
{
  "id": "456",
  /* ... updated service fields ... */
}
```

---

### 34. Delete Service
**Endpoint:** `DELETE /business/services/{id}/`  
**Auth Required:** Yes (Owner only)  
**User Type:** Business

**Response:**
```json
{
  "message": "Service deleted successfully"
}
```

---

### 35. Get All Services
**Endpoint:** `GET /business/services/`  
**Auth Required:** No (Public)  
**User Type:** Public

**Query Parameters:**
- `search` (string): Search term
- `business__category` (string): Category filter
- `price_range` (string): Price range filter
- `duration` (string): Duration filter
- `ordering` (string): Sort order
- `page` (number): Page number
- `limit` (number): Items per page
- `offset` (number): Offset

**Response:**
```json
{
  "count": 50,
  "next": "https://api.example.com/business/services/?page=2",
  "previous": null,
  "results": [ /* Service objects */ ]
}
```

---

### 36. Get Service Image Upload URL
**Endpoint:** `POST /business/services/{id}/upload-image/`  
**Auth Required:** Yes (Owner only)  
**User Type:** Business

**Request Payload:**
```json
{
  "image_type": "main" | "additional",
  "file_name": "service-image.jpg",
  "content_type": "image/jpeg"
}
```

**Response:**
```json
{
  "presigned_url": "https://s3.amazonaws.com/...",
  "file_key": "service-images/456/image.jpg",
  "expires_in_minutes": 60,
  "image_type": "main"
}
```

---

### 37. Update Service Image
**Endpoint:** `PUT /business/services/{id}/update-image/`  
**Auth Required:** Yes (Owner only)  
**User Type:** Business

**Request Payload:**
```json
{
  "image_type": "main" | "additional",
  "file_key": "service-images/456/image.jpg"
}
```

**Response:**
```json
{
  "service_image_url": "https://bucket.s3.region.amazonaws.com/...",
  "images": ["https://...", "https://..."],
  "s3_url": "https://bucket.s3.region.amazonaws.com/..."
}
```

---

### 38. Get Business Products
**Endpoint:** `GET /business/{id}/products/`  
**Auth Required:** No (Public)  
**User Type:** Public

**Response:**
```json
{
  "results": [
    {
      "id": "789",
      "business": "123",
      "name": "Software License",
      "description": "Annual license",
      "price": 50000,
      "price_currency": "KES",
      "product_image_url": "https://...",
      "images": ["https://...", "https://..."],
      "is_active": true,
      "in_stock": true,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

### 39. Create Product
**Endpoint:** `POST /business/{id}/products/`  
**Auth Required:** Yes (Owner only)  
**User Type:** Business

**Request Payload:**
```json
{
  "name": "Software License",
  "description": "Annual license",
  "price": 50000,
  "price_currency": "KES",
  "images": ["https://...", "https://..."],
  "in_stock": true,
  "is_active": true
}
```

**Response:**
```json
{
  "id": "789",
  "business": "123",
  "name": "Software License",
  /* ... other product fields ... */
}
```

---

### 40. Get Product by ID
**Endpoint:** `GET /business/products/{id}/`  
**Auth Required:** No (Public)  
**User Type:** Public

**Response:**
```json
{
  "id": "789",
  "business": { /* Business object */ },
  "name": "Software License",
  /* ... other product fields ... */
}
```

---

### 41. Update Product
**Endpoint:** `PUT /business/products/{id}/`  
**Auth Required:** Yes (Owner only)  
**User Type:** Business

**Request Payload:** Same as Create Product (all fields optional)

**Response:**
```json
{
  "id": "789",
  /* ... updated product fields ... */
}
```

---

### 42. Delete Product
**Endpoint:** `DELETE /business/products/{id}/`  
**Auth Required:** Yes (Owner only)  
**User Type:** Business

**Response:**
```json
{
  "message": "Product deleted successfully"
}
```

---

### 43. Get All Products
**Endpoint:** `GET /business/products/`  
**Auth Required:** No (Public)  
**User Type:** Public

**Query Parameters:**
- `search` (string): Search term
- `business__category` (string): Category filter
- `in_stock` (boolean): Stock filter
- `price_currency` (string): Currency filter
- `ordering` (string): Sort order
- `page` (number): Page number
- `limit` (number): Items per page
- `offset` (number): Offset

**Response:**
```json
{
  "count": 50,
  "next": "https://api.example.com/business/products/?page=2",
  "previous": null,
  "results": [ /* Product objects */ ]
}
```

---

### 44. Get Product Image Upload URL
**Endpoint:** `POST /business/products/{id}/upload-image/`  
**Auth Required:** Yes (Owner only)  
**User Type:** Business

**Request Payload:**
```json
{
  "file_name": "product-image.jpg",
  "content_type": "image/jpeg"
}
```

**Response:**
```json
{
  "success": true,
  "upload_url": "https://s3.amazonaws.com/...",
  "fields": { /* S3 form fields */ },
  "file_key": "product-images/789/image.jpg"
}
```

---

### 45. Update Product Image
**Endpoint:** `PUT /business/products/{id}/update-image/`  
**Auth Required:** Yes (Owner only)  
**User Type:** Business

**Request Payload:**
```json
{
  "image_type": "main" | "additional",
  "file_key": "product-images/789/image.jpg"
}
```

**Response:**
```json
{
  "product_image_url": "https://bucket.s3.region.amazonaws.com/...",
  "images": ["https://...", "https://..."],
  "s3_url": "https://bucket.s3.region.amazonaws.com/..."
}
```

---

## Reviews APIs

### 46. Get Business Reviews
**Endpoint:** `GET /business/{id}/reviews/`  
**Auth Required:** No (Public)  
**User Type:** Public

**Response:**
```json
{
  "results": [
    {
      "id": 1,
      "business": "123",
      "user": "456",
      "rating": 5,
      "review_text": "Great service!",
      "is_verified": true,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z",
      "like_count": 5,
      "is_liked_by_user": false
    }
  ]
}
```

---

### 47. Create Business Review
**Endpoint:** `POST /business/{id}/reviews/`  
**Auth Required:** Yes  
**User Type:** Community

**Request Payload:**
```json
{
  "rating": 5,
  "review_text": "Great service!"
}
```

**Response:**
```json
{
  "id": 1,
  "business": "123",
  "user": "456",
  "rating": 5,
  "review_text": "Great service!",
  "is_verified": true,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z",
  "like_count": 0,
  "is_liked_by_user": false
}
```

---

### 48. Get Product Reviews
**Endpoint:** `GET /business/products/{id}/reviews/`  
**Auth Required:** No (Public)  
**User Type:** Public

**Response:**
```json
{
  "results": [ /* Review objects */ ]
}
```

---

### 49. Create Product Review
**Endpoint:** `POST /business/products/{id}/reviews/`  
**Auth Required:** Yes  
**User Type:** Community

**Request Payload:**
```json
{
  "rating": 5,
  "review_text": "Great product!"
}
```

**Response:**
```json
{
  "id": 2,
  "business": "123",
  "user": "456",
  "rating": 5,
  "review_text": "Great product!",
  /* ... other review fields ... */
}
```

---

### 50. Get Service Reviews
**Endpoint:** `GET /business/services/{id}/reviews/`  
**Auth Required:** No (Public)  
**User Type:** Public

**Response:**
```json
{
  "results": [ /* Review objects */ ]
}
```

---

### 51. Create Service Review
**Endpoint:** `POST /business/services/{id}/reviews/`  
**Auth Required:** Yes  
**User Type:** Community

**Request Payload:**
```json
{
  "rating": 5,
  "review_text": "Excellent service!"
}
```

**Response:**
```json
{
  "id": 3,
  "business": "123",
  "user": "456",
  "rating": 5,
  "review_text": "Excellent service!",
  /* ... other review fields ... */
}
```

---

### 52. Like/Unlike Review
**Endpoint:** `POST /business/reviews/{id}/like/`  
**Auth Required:** Yes  
**User Type:** Community

**Response:**
```json
{
  "liked": true,
  "message": "Review liked successfully"
}
```

---

## Community Features APIs

### 53. Toggle Favorite Business
**Endpoint:** `POST /business/{id}/favorite`  
**Auth Required:** Yes  
**User Type:** Community

**Response:**
```json
{
  "message": "Business added to favorites" | "Business removed from favorites"
}
```

---

### 54. Get User Favorites
**Endpoint:** `GET /business/favorites/`  
**Auth Required:** Yes  
**User Type:** Community

**Response:**
```json
[
  {
    "id": "fav123",
    "user": "456",
    "business": "123",
    "business_name": "ABC Company",
    "business_category": "Technology & IT",
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

---

### 55. Like/Unlike Business
**Endpoint:** `POST /business/{id}/like/`  
**Auth Required:** Yes  
**User Type:** Community

**Response:**
```json
{
  "liked": true,
  "message": "Business liked successfully"
}
```

---

### 56. Get User Activity
**Endpoint:** `GET /business/user-activity/`  
**Auth Required:** Yes  
**User Type:** Community

**Response:**
```json
{
  "activities": [
    {
      "type": "favorite" | "business_like" | "review_like" | "review",
      "id": "activity123",
      "business_name": "ABC Company",
      "business_category": "Technology & IT",
      "date": "2024-01-01T00:00:00Z",
      "business_id": "123",
      "rating": 5,
      "review_text": "Great service!"
    }
  ],
  "total_count": 10
}
```

---

### 57. Get User Reviews
**Endpoint:** `GET /business/user-reviews/`  
**Auth Required:** Yes  
**User Type:** Community

**Response:**
```json
[
  {
    "id": 1,
    "business": "123",
    "user": "456",
    "rating": 5,
    "review_text": "Great service!",
    /* ... other review fields ... */
  }
]
```

---

### 58. Get User Liked Reviews
**Endpoint:** `GET /business/user-liked-reviews/`  
**Auth Required:** Yes  
**User Type:** Community

**Response:**
```json
{
  "liked_review_ids": ["1", "2", "3"]
}
```

---

## Support & Requests APIs

### 59. Create Photo Request
**Endpoint:** `POST /business/{id}/photo-request/`  
**Auth Required:** Yes  
**User Type:** Community

**Request Payload:**
```json
{
  "business": "123",
  "notes": "Please provide professional photos of the workspace"
}
```

**Response:**
```json
{
  "id": "req123",
  "business": "123",
  "user": "456",
  "user_name": "John Doe",
  "business_name": "ABC Company",
  "request_date": "2024-01-01T00:00:00Z",
  "status": "pending",
  "notes": "Please provide professional photos of the workspace"
}
```

---

### 60. Get Photo Requests
**Endpoint:** `GET /business/photo-requests/`  
**Auth Required:** Yes  
**User Type:** Business (Owner only)

**Response:**
```json
[
  {
    "id": "req123",
    "business": "123",
    "user": "456",
    "user_name": "John Doe",
    "business_name": "ABC Company",
    "request_date": "2024-01-01T00:00:00Z",
    "status": "pending" | "approved" | "rejected" | "completed",
    "notes": "Request notes",
    "business_response": "Response from business",
    "completed_date": "2024-01-02T00:00:00Z"
  }
]
```

---

### 61. Update Photo Request
**Endpoint:** `PATCH /business/photo-requests/{id}/`  
**Auth Required:** Yes  
**User Type:** Business (Owner only)

**Request Payload:**
```json
{
  "status": "approved" | "rejected" | "completed",
  "business_response": "We'll schedule a photoshoot next week"
}
```

**Response:**
```json
{
  "id": "req123",
  /* ... updated photo request fields ... */
}
```

---

### 62. Create Professional Service Request
**Endpoint:** `POST /business/professional-service-requests/`  
**Auth Required:** Yes  
**User Type:** Community

**Request Payload:**
```json
{
  "request_type": "photography" | "videography" | "graphic_design" | "web_development" | "other",
  "title": "Professional Photography Needed",
  "description": "Need professional photos for business listing",
  "budget_range": "KES 10,000 - 20,000",
  "timeline": "Within 2 weeks",
  "priority": "low" | "medium" | "high" | "urgent"
}
```

**Response:**
```json
{
  "id": "psr123",
  "business": "123",
  "user": "456",
  "user_name": "John Doe",
  "business_name": "ABC Company",
  "request_type": "photography",
  "request_type_display": "Photography",
  "title": "Professional Photography Needed",
  "description": "Need professional photos for business listing",
  "budget_range": "KES 10,000 - 20,000",
  "timeline": "Within 2 weeks",
  "priority": "high",
  "priority_display": "High",
  "status": "pending",
  "status_display": "Pending",
  "request_date": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z",
  "is_active": true
}
```

---

### 63. Get Professional Service Requests
**Endpoint:** `GET /business/my-professional-service-requests/`  
**Auth Required:** Yes  
**User Type:** Community

**Response:**
```json
{
  "results": [ /* ProfessionalServiceRequest objects */ ]
}
```

---

### 64. Get Professional Service Request by ID
**Endpoint:** `GET /business/professional-service-requests/{id}/`  
**Auth Required:** Yes  
**User Type:** Community

**Response:**
```json
{
  "id": "psr123",
  /* ... ProfessionalServiceRequest object ... */
}
```

---

## Public APIs

### 65. Get Categories
**Endpoint:** `GET /business/categories/`  
**Auth Required:** No (Public)  
**User Type:** Public

**Response:**
```json
[
  {
    "id": 1,
    "name": "Technology & IT 💻",
    "slug": "technology-it",
    "description": "Technology and IT services",
    "subcategories": ["Web Development", "Mobile Apps"],
    "icon": "💻",
    "is_active": true,
    "sort_order": 1
  }
]
```

---

### 66. Get FEM Churches
**Endpoint:** `GET /business/fem-churches/`  
**Auth Required:** No (Public)  
**User Type:** Public

**Response:**
```json
{
  "results": [
    {
      "id": 1,
      "name": "FEM Church Nairobi Central",
      "location": "Nairobi Central",
      "city": "Nairobi",
      "country": "Kenya",
      "pastor_name": "Pastor John Doe",
      "contact_phone": "+254700123456",
      "contact_email": "nairobi@fem.or.ke",
      "is_active": true,
      "sort_order": 1,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ],
  "count": 5
}
```

---

### 67. Get Platform Statistics
**Endpoint:** `GET /stats/`  
**Auth Required:** No (Public)  
**User Type:** Public

**Response:**
```json
{
  "total_businesses": 100,
  "total_users": 500,
  "verified_businesses": 75,
  "average_rating": 4.5
}
```

---

### 68. Check WhatsApp Number
**Endpoint:** `POST /business/check-whatsapp/`  
**Auth Required:** Yes  
**User Type:** Business

**Request Payload:**
```json
{
  "phone": "+254712345678"
}
```

**Response:**
```json
{
  "success": true,
  "phone": "+254712345678",
  "is_whatsapp": true,
  "is_valid": true,
  "cached": false,
  "message": "Phone number is registered on WhatsApp",
  "whatsapp_info": { /* WhatsApp info object */ }
}
```

---

## File Upload Flow

### S3 Presigned URL Upload Process

1. **Request Presigned URL** from backend (see endpoints above)
2. **Upload file directly to S3** using the presigned URL:
   ```javascript
   fetch(presigned_url, {
     method: 'PUT',
     body: file,
     headers: {
       'Content-Type': file.type
     }
   })
   ```
3. **Update backend** with the file_key to link the file to the resource

---

## Error Responses

All endpoints may return the following error formats:

**400 Bad Request:**
```json
{
  "error": "Validation error",
  "message": "Invalid input data",
  "details": { /* Field-specific errors */ }
}
```

**401 Unauthorized:**
```json
{
  "error": "Authentication required",
  "message": "Please log in to access this resource"
}
```

**403 Forbidden:**
```json
{
  "error": "Permission denied",
  "message": "You don't have permission to perform this action"
}
```

**404 Not Found:**
```json
{
  "error": "Not found",
  "message": "Resource not found"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Internal server error",
  "message": "An unexpected error occurred"
}
```

---

## Notes

1. **Authentication**: Most endpoints require JWT Bearer token authentication. Include the token in the `Authorization` header.

2. **Pagination**: List endpoints support pagination using `page`, `limit`, and `offset` query parameters.

3. **File Uploads**: All file uploads use S3 presigned URLs. The process involves:
   - Requesting a presigned URL from the backend
   - Uploading the file directly to S3
   - Updating the backend with the file_key

4. **User Types**: 
   - **Community**: Regular users who can browse, review, favorite businesses
   - **Business**: Business owners who can manage their business listings

5. **Public vs Protected**: Some endpoints are public (no auth required) while others require authentication. Business management endpoints require ownership verification.

---

## API Versioning

Current API version: **v1** (implicit)

Base URL: `https://femdjango-production.up.railway.app/api`

---

**Last Updated:** 2024-01-01

