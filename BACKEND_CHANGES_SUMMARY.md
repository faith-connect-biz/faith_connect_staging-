# Backend Changes Summary

## Overview
Updated the Django backend to support the frontend's OTP-based authentication flow with proper response formats.

## New Endpoints Added

### 1. `/api/auth/send-email-otp/`
**View:** `SendEmailVerificationView`  
**Method:** POST  
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
**Functionality:**
- Checks if user exists
- Generates 6-digit OTP
- Stores OTP in `user.email_token`
- Sends OTP via email using ZeptoMail

### 2. `/api/auth/verify-email-otp/`
**View:** `VerifyEmailOTPView`  
**Method:** POST  
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
**Functionality:**
- Verifies OTP against `user.email_token`
- Activates inactive users
- Generates JWT access and refresh tokens
- Returns user data with tokens
- Checks profile completion:
  - Business users: checks if they have an active business
  - Community users: checks if they have first_name and last_name
- Sends welcome email for new activations

### 3. `/api/auth/send-phone-otp/`
**View:** `SendPhoneOTPView`  
**Method:** POST  
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
  "message": "OTP sent successfully."
}
```
**Functionality:**
- Normalizes phone number to 254XXXXXXXXX format
- Checks if user exists (prefers inactive users)
- Generates 6-digit OTP
- Stores OTP in `user.otp`
- Sends OTP via SMS

### 4. `/api/auth/verify-phone-otp/`
**View:** `VerifyPhoneOTPView`  
**Method:** POST  
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
**Functionality:**
- Normalizes phone number
- Verifies OTP against `user.otp`
- Activates inactive users
- Generates JWT access and refresh tokens
- Returns user data with tokens
- Checks profile completion
- Sends welcome SMS for new activations

## Key Features

### Profile Completion Logic
Both verification endpoints check profile completion:
- **Business users:** Profile is complete if they have an active `Business` record
- **Community users:** Profile is complete if they have `first_name` and `last_name`

### User Activation
Both verification endpoints:
- Activate inactive users after OTP verification
- Set `is_active`, `is_verified`, `email_verified`/`phone_verified` flags
- Send welcome email/SMS for new activations

### Token Generation
After successful verification, endpoints generate:
- JWT `access_token` for API authentication
- JWT `refresh_token` for token renewal

### Response Format
All responses follow consistent format:
- `success`: Boolean indicating operation success
- `message`: Human-readable message
- `user`: User object with core fields
- `tokens`: JWT tokens for authentication
- `is_profile_complete`: Boolean indicating if profile setup is complete
- `is_new_user`: Boolean indicating if user was just activated

## Files Modified

1. **user_auth/views.py:**
   - Added `VerifyEmailOTPView` class
   - Added `VerifyPhoneOTPView` class
   - These views return full user data, tokens, and profile completion status

2. **user_auth/urls.py:**
   - Added URL patterns for `/api/auth/...` endpoints
   - Mapped endpoints to new views

## Testing Notes

### Development Testing
All views include development logging:
```
logger.debug(f"🔧 DEV TESTING - Email Token: {token} sent to {email}")
print(f"🔧 DEV TESTING - Email Token: {token} sent to {email}")
```

### Error Handling
- User not found: Returns 400 with "User not found"
- Invalid OTP: Returns 400 with "Invalid OTP" or "Invalid verification token"
- Email/SMS send failure: Returns 500 with descriptive error

## Integration
These endpoints integrate with:
- JWT authentication via `rest_framework_simplejwt`
- User model in `user_auth.models`
- Business model for profile completion checks
- Email service (ZeptoMail) for email OTP
- SMS service for phone OTP


