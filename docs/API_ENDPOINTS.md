# FEM Connect API Documentation

## Authentication Endpoints

### 1. User Registration
**Endpoint:** `POST /api/auth/register/`

**Request Body:**
```json
{
    "first_name": "John",
    "last_name": "Doe",
    "partnership_number": "P12345",
    "user_type": "community",
    "email": "john@example.com",
    "phone": "254712345678",
    "password": "securepass123"
}
```

**Response:**
```json
{
    "success": true,
    "message": "User registered successfully",
    "data": {
        "user_id": 1,
        "email": "john@example.com",
        "phone": "254712345678",
        "user_type": "community",
        "partnerNo": "P12345"
    }
}
```

### 2. User Login
**Endpoint:** `POST /api/auth/login/`

**Request Body:**
```json
{
    "partnership_number": "P12345",
    "password": "securepass123"
}
```

**Response:**
```json
{
    "success": true,
    "message": "Login successful",
    "data": {
        "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
        "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
        "partnership_number": "P12345",
        "user_type": "community",
        "email": "john@example.com",
        "phone": "254712345678",
        "is_active": true
    }
}
```

### 3. Forgot Password (Supports both Email and Phone)
**Endpoint:** `POST /api/auth/forgot-password/`

**Request Body:**
```json
{
    "identifier": "user@example.com"  // or "254712345678"
}
```

**Response (Email):**
```json
{
    "success": true,
    "message": "Password reset OTP sent to your email successfully.",
    "data": null
}
```

**Response (Phone):**
```json
{
    "success": true,
    "message": "OTP sent successfully to your phone.",
    "data": null
}
```

### 4. Reset Password with OTP
**Endpoint:** `POST /api/auth/reset-password/`

**Request Body:**
```json
{
    "identifier": "user@example.com",  // or "254712345678"
    "otp": "123456",
    "new_password": "newsecurepass123"
}
```

**Response:**
```json
{
    "success": true,
    "message": "Password reset successful.",
    "data": null
}
```

### 5. Logout
**Endpoint:** `POST /api/auth/logout/`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

**Response:**
```json
{
    "success": true,
    "message": "Logout successful",
    "data": null
}
```

### 6. Token Refresh
**Endpoint:** `POST /api/auth/token/refresh/`

**Request Body:**
```json
{
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

**Response:**
```json
{
    "success": true,
    "message": "Token refreshed",
    "data": {
        "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
    }
}
```

## Verification Endpoints

### 7. Send Email Verification
**Endpoint:** `POST /api/auth/send-email-verification/`

**Request Body:**
```json
{
    "email": "user@example.com"
}
```

**Response:**
```json
{
    "success": true,
    "message": "Verification token sent to email",
    "data": null
}
```

### 8. Confirm Email Verification
**Endpoint:** `POST /api/auth/confirm-email-verification/`

**Request Body:**
```json
{
    "email": "user@example.com",
    "token": "123456"
}
```

**Response:**
```json
{
    "success": true,
    "message": "Email verified successfully.",
    "data": null
}
```

### 9. Send Phone OTP
**Endpoint:** `POST /api/auth/send-phone-otp/`

**Request Body:**
```json
{
    "phone_number": "254712345678"
}
```

**Response:**
```json
{
    "success": true,
    "message": "OTP sent successfully.",
    "data": null
}
```

### 10. Confirm Phone OTP
**Endpoint:** `POST /api/auth/confirm-phone-otp/`

**Request Body:**
```json
{
    "phone_number": "254712345678",
    "otp": "123456"
}
```

**Response:**
```json
{
    "success": true,
    "message": "Phone number verified successfully.",
    "data": null
}
```

## Business Endpoints

### 11. List Businesses
**Endpoint:** `GET /api/business/`

**Query Parameters:**
- `category`: Filter by category ID
- `city`: Filter by city
- `search`: Search in business name and description
- `page`: Page number for pagination
- `page_size`: Number of items per page

**Response:**
```json
{
    "count": 25,
    "next": "http://api.example.com/business/?page=2",
    "previous": null,
    "results": [
        {
            "id": "uuid-here",
            "business_name": "Sample Restaurant",
            "description": "Delicious food",
            "category": {
                "id": 1,
                "name": "Restaurant"
            },
            "address": "123 Main St",
            "city": "Nairobi",
            "rating": 4.5,
            "review_count": 12
        }
    ]
}
```

### 12. Create Business
**Endpoint:** `POST /api/business/`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
    "business_name": "My Business",
    "description": "Business description",
    "category": 1,
    "address": "123 Business St",
    "city": "Nairobi",
    "phone": "254712345678",
    "email": "business@example.com",
    "hours": [
        {
            "day_of_week": 1,
            "open_time": "09:00:00",
            "close_time": "17:00:00",
            "is_closed": false
        }
    ],
    "services": [
        {
            "name": "Service 1",
            "description": "Service description",
            "price_range": "KES 1000-5000",
            "duration": "1 hour"
        }
    ],
    "products": [
        {
            "name": "Product 1",
            "description": "Product description",
            "price": "1000.00",
            "category": "Electronics"
        }
    ]
}
```

## Chat Endpoints

### 13. List Chat Rooms
**Endpoint:** `GET /api/chat/rooms/`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
    "count": 3,
    "next": null,
    "previous": null,
    "results": [
        {
            "id": "uuid-here",
            "business": {
                "id": "uuid-here",
                "business_name": "Sample Business"
            },
            "last_message": {
                "content": "Hello!",
                "created_at": "2024-01-15T10:30:00Z"
            },
            "unread_count": 2
        }
    ]
}
```

## Error Responses

All endpoints return consistent error responses:

```json
{
    "success": false,
    "message": "Error description",
    "errors": {
        "field_name": ["Error details"]
    }
}
```

## Authentication

Most endpoints require authentication via JWT token in the Authorization header:

```
Authorization: Bearer <access_token>
```

## Rate Limiting

- Authentication endpoints: 5 requests per minute
- Business endpoints: 100 requests per minute
- Chat endpoints: 60 requests per minute

## Pagination

List endpoints support pagination with these query parameters:
- `page`: Page number (default: 1)
- `page_size`: Items per page (default: 20, max: 100)

## Status Codes

- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `429`: Too Many Requests
- `500`: Internal Server Error
