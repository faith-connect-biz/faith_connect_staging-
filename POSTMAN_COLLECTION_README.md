# FEM Connect API - Postman Collection

This Postman collection contains all the API endpoints for the FEM Connect application. You can use this to test all the APIs we've been working on.

## 📁 Files

- `FEM_Connect_API_Collection.postman_collection.json` - Main API collection with all endpoints
- `FEM_Connect_Environment.postman_environment.json` - Environment variables for testing
- `POSTMAN_COLLECTION_README.md` - This README file

## 🚀 Getting Started

### 1. Install Postman
Download and install Postman from: https://www.postman.com/downloads/

### 2. Import the Collection
1. Open Postman
2. Click "Import" button
3. Select the `FEM_Connect_API_Collection.postman_collection.json` file
4. Click "Import"

### 3. Import the Environment
1. Click "Import" again
2. Select the `FEM_Connect_Environment.postman_environment.json` file
3. Click "Import"

### 4. Select Environment
1. In the top-right corner, select "FEM Connect Environment" from the environment dropdown
2. This will enable all the variables

### 5. Start the Django Server
Make sure your Django server is running:
```bash
python3 manage.py runserver 8000
```

## 🧪 Testing Workflow

### Step 1: User Registration & Authentication
1. **Signup** - Create a new user account
2. **Login** - Get access and refresh tokens
3. **Verify Account** - Verify email/phone (check console for OTP/tokens)

### Step 2: Business Operations
1. **Create Business** - Create a business (requires business user)
2. **Upload Logo/Images** - Test file upload functionality
3. **Create Services/Products** - Add services and products to business

### Step 3: Test Pagination
1. **Get Businesses with Pagination** - Test `?limit=5&offset=0`
2. **Get Services with Pagination** - Test `?limit=3&offset=0`
3. **Get Products with Pagination** - Test `?limit=3&offset=0`

## 🔧 Environment Variables

The collection uses these variables that you can update:

### Authentication
- `{{access_token}}` - JWT access token (set after login)
- `{{refresh_token}}` - JWT refresh token (set after login)

### Test Data
- `{{test_email}}` - Test user email
- `{{test_phone}}` - Test user phone
- `{{test_partnership_number}}` - Test user partnership number
- `{{test_password}}` - Test user password

### IDs (set after creation)
- `{{user_id}}` - User ID
- `{{business_id}}` - Business ID
- `{{service_id}}` - Service ID
- `{{product_id}}` - Product ID
- `{{review_id}}` - Review ID

## 📋 Key Features to Test

### ✅ Authentication & User Management
- [ ] User signup with email/phone
- [ ] OTP verification
- [ ] Login/logout
- [ ] Password reset
- [ ] Profile management
- [ ] Profile photo upload

### ✅ Business Management
- [ ] Business creation
- [ ] Business logo upload
- [ ] Business profile image upload
- [ ] Business updates
- [ ] Business analytics

### ✅ Services & Products
- [ ] Service creation/update/delete
- [ ] Product creation/update/delete
- [ ] Service/product image upload
- [ ] Pagination for services/products

### ✅ Reviews & Interactions
- [ ] Business reviews
- [ ] Service reviews
- [ ] Product reviews
- [ ] Like/favorite functionality

### ✅ File Upload System
- [ ] Profile photo upload
- [ ] Business logo upload
- [ ] Business image upload
- [ ] Service image upload
- [ ] Product image upload

## 🔍 Debug Information

### Development Mode Features
- **Email Simulation**: All emails are printed to console
- **SMS Simulation**: All SMS are printed to console
- **Debug Logging**: OTPs and tokens are logged for testing

### Console Output
When testing in development mode, you'll see:
```
🔧 DEV TESTING - Email Token: 123456 sent to test@example.com
🔧 DEV TESTING - Phone OTP: 123456 sent to +254712345678
```

## 🐛 Troubleshooting

### Common Issues

1. **Server Not Running**
   - Make sure Django server is running on port 8000
   - Check: `python3 manage.py runserver 8000`

2. **Authentication Errors**
   - Ensure you're logged in and have valid tokens
   - Check token expiration

3. **File Upload Issues**
   - Verify S3 credentials are configured
   - Check file size limits

4. **Pagination Issues**
   - Use correct `limit` and `offset` parameters
   - Check response format

### Error Responses
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (permission denied)
- `404` - Not Found
- `500` - Internal Server Error

## 📊 API Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {...}
}
```

### Paginated Response
```json
{
  "count": 10,
  "next": "http://127.0.0.1:8000/api/business/?limit=5&offset=5",
  "previous": null,
  "results": [...],
  "limit": 5,
  "offset": 0,
  "total_pages": 2,
  "current_page": 1
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": {...}
}
```

## 🎯 Testing Checklist

### Authentication Flow
- [ ] Signup with email
- [ ] Signup with phone
- [ ] Login
- [ ] Verify email token
- [ ] Verify phone OTP
- [ ] Resend OTP
- [ ] Logout
- [ ] Refresh token

### Business Flow
- [ ] Create business
- [ ] Upload business logo
- [ ] Upload business image
- [ ] Update business
- [ ] Get business details
- [ ] Get my business

### Content Management
- [ ] Create service
- [ ] Create product
- [ ] Upload service image
- [ ] Upload product image
- [ ] Update service/product
- [ ] Delete service/product

### User Interactions
- [ ] Create review
- [ ] Like business
- [ ] Favorite business
- [ ] Like review
- [ ] Get user activity

### Pagination
- [ ] Business pagination
- [ ] Service pagination
- [ ] Product pagination
- [ ] Review pagination

## 📝 Notes

- All endpoints use `http://127.0.0.1:8000` as base URL
- Authentication uses JWT tokens
- File uploads use S3 pre-signed URLs
- Development mode simulates email/SMS
- Pagination uses limit/offset pattern
- All responses include success/error indicators

## 🔄 How to Update Variables After Login

After a successful login, you'll get tokens in the response. To update the environment variables:

1. **Copy the tokens** from the login response
2. **Click the "Environment" tab** in Postman
3. **Update the variables**:
   - Set `access_token` to the access token value
   - Set `refresh_token` to the refresh token value
4. **Save the environment**

## 🎉 Quick Start Commands

### Test Health Check
```bash
curl -X GET "http://127.0.0.1:8000/health/"
```

### Test Categories
```bash
curl -X GET "http://127.0.0.1:8000/api/business/categories/"
```

### Test Signup
```bash
curl -X POST "http://127.0.0.1:8000/api/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "firstname": "Test",
    "lastname": "User",
    "partnership_number": "TEST001",
    "userType": "Community",
    "password": "testpass123",
    "isEmail": true,
    "email": "test@example.com"
  }'
```

Happy testing! 🚀
