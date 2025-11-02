# Complete Authentication Flow: From Login to Viewing Businesses

This document explains the complete user journey from login to viewing businesses for both **Community Members** and **Business Owners**.

## Overview

The authentication system uses **OTP-only** authentication (no passwords). Users can log in with either email or phone number.

---

## Step-by-Step Flow

### 1. Initial Login Page (`/login`)

**User Action:** User navigates to the login page

**Frontend Code:** `src/pages/LoginPage.tsx`

**What Happens:**
- User enters either:
  - **Email address** (e.g., `john@example.com`)
  - **Phone number** (e.g., `254712345678` or `0712345678`)
- User clicks "Send OTP" button

**API Call:**
```typescript
// Frontend
apiService.sendOTP(contact, method) 
// method = 'email' or 'phone'

// Backend Endpoint
POST /api/auth/send-email-otp/  OR  POST /api/auth/send-phone-otp/
```

**Backend Response:**
```json
{
  "success": true,
  "message": "Verification token sent to email" // or "OTP sent successfully."
}
```

**What Happens Next:**
- OTP is stored in backend:
  - Email: stored in `user.email_token`
  - Phone: stored in `user.otp`
- OTP is sent to user via email (ZeptoMail) or SMS
- **Development:** OTP is printed to console for testing
- User is redirected to `/verify-otp`

---

### 2. OTP Verification Page (`/verify-otp`)

**User Action:** User enters the 6-digit OTP they received

**Frontend Code:** `src/pages/OTPVerificationPage.tsx`

**What Happens:**
- User enters 6-digit OTP in the input field
- OTP is validated on submission

**API Call:**
```typescript
// Frontend
apiService.verifyOTP(contact, otpValue, method)

// Backend Endpoint
POST /api/auth/verify-email-otp/  OR  POST /api/auth/verify-phone-otp/
```

**Backend Response:**
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
    "user_type": "business",  // or "community"
    "is_active": true,
    "is_verified": true
  },
  "tokens": {
    "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "is_profile_complete": false,  // or true
  "is_new_user": true  // or false
}
```

**Key Backend Actions:**
1. Verifies OTP against stored value
2. If user is **inactive** → activates them (`is_active=True`, `is_verified=True`)
3. Sends welcome email/SMS
4. Generates JWT tokens for authentication
5. Checks profile completion:
   - **Business users:** Checks if they have an active `Business` record
   - **Community users:** Checks if `first_name` and `last_name` exist
6. Returns all user data with tokens

**Frontend Decision Logic:**
```typescript
if (response.success) {
  if (response.is_new_user) {
    // NEW USER - Redirect to user type selection
    navigate('/user-type-selection');
  } else if (response.user && response.tokens) {
    // EXISTING USER - Log them in
    login(response.user, response.tokens);
    navigate('/'); // Go to home page
  }
}
```

---

### 3A. NEW USER Flow → User Type Selection

**Route:** `/user-type-selection`

**Frontend Code:** `src/pages/UserTypeSelectionPage.tsx`

**What Happens:**
- User sees two options:
  1. **Community Member** - Browse and connect
  2. **Business Owner** - Register a business
- User selects their type
- **Note:** This page likely exists but the current flow after OTP verification doesn't seem to use it based on the code

---

### 3B. EXISTING USER Flow → Direct to Home

**Route:** `/` (Home Page)

**Frontend Code:** `src/pages/Index.tsx`

**What Happens:**
- User data is stored in:
  - `localStorage.user` (user profile)
  - `localStorage.tokens` (JWT tokens)
  - `localStorage.sessionExpiry` (12-hour session)
- User sees the homepage with:
  - Hero section
  - Business categories
  - Product/Service carousel
  - Community stats
  - Call to action

---

## Community Member Journey

### After Login: Viewing Businesses

**Route:** `/directory`

**Frontend Code:** `src/pages/DirectoryPage.tsx`

**What Happens:**
1. User navigates to directory
2. Frontend calls `GET /api/business/`
3. Backend returns paginated list of businesses
4. User sees:
   - **Business List** - All registered businesses
   - **Service List** - All services offered
   - **Product List** - All products for sale

**Key Features:**
- Search by name/category
- Filter by:
  - Category
  - County
  - Rating
  - Price range
  - Verified only
  - Open now
- Sort by relevance, rating, name, etc.

**Clicking a Business:**
- Navigates to `/business/{id}`
- Shows full business details:
  - Name, description, category
  - Contact info, location
  - Services and products
  - Reviews and ratings
  - Photos

---

## Business Owner Journey

### After Login: Profile Completion Check

**Backend Logic:**
```python
if user.user_type == 'business':
    from business.models import Business
    has_business = Business.objects.filter(user=user, is_active=True).exists()
    is_profile_complete = has_business
```

**Two Scenarios:**

### Scenario 1: Business Owner WITHOUT a registered business
- `is_profile_complete = False`
- User should be redirected to business registration
- **Expected Route:** `/business-onboarding` or `/register-business`

### Scenario 2: Business Owner WITH a registered business
- `is_profile_complete = True`
- User can access all features
- User can:
  - View their business at `/business/{their_business_id}`
  - Manage business at `/manage-business`
  - View all other businesses in directory

---

### Business Registration Flow (New Business Owner)

**Route:** `/business-onboarding` → `/register-business`

**Frontend Code:**
1. `src/pages/BusinessOnboardingPage.tsx` - Onboarding slides
2. `src/pages/BusinessRegistrationPage.tsx` - Registration form

**What Happens:**
1. User goes through onboarding slides
2. User fills out business registration form:
   - Business name
   - Category
   - Description
   - Address
   - Contact info
   - Services/Products
   - Hours
   - Photos

**API Call:**
```typescript
// Step 1: Basic Info
POST /api/business/register/step1/
{
  "business_name": "John's Bakery",
  "category_id": 1,
  "description": "Fresh baked goods",
  "address": "123 Main St",
  "business_type": "products"
}

// Step 2: Full Profile
PUT /api/business/register/step2/{business_id}/
{
  "phone": "254712345678",
  "email": "contact@bakery.com",
  "website": "https://bakery.com",
  "hours": [...],
  "services": [...],
  "products": [...]
}
```

**Success:**
- Business is created and linked to user
- User is now `is_profile_complete = True`
- User can manage their business

---

### Business Owner Viewing OTHER Businesses

**Same as Community Member:**
- Can browse directory
- Can view any business details
- Can search and filter
- Can view services/products

**Additional Privileges:**
- Can manage their own business
- Can respond to reviews
- Can update business info
- Can add/edit services and products

---

## Authentication Token Management

### Token Storage
- **Access Token:** Stored in `localStorage.tokens` (12-hour validity)
- **Refresh Token:** Stored in `localStorage.tokens` (longer validity)

### Automatic Token Refresh
**Frontend Code:** `src/services/api.ts`

**Interceptor Logic:**
1. All API requests include access token in header:
   ```
   Authorization: Bearer {access_token}
   ```

2. If API returns **401 (Unauthorized):**
   - Frontend automatically refreshes the token
   - Uses `refresh_token` to get new `access_token`
   - Retries the original request
   - If refresh fails → user is logged out

### Public Endpoints (No Auth Required)
```typescript
const publicEndpoints = [
  'register',
  'verify-registration-otp',
  'resend-otp',
  'login',
  'logout',
  'refresh-token',
  'verify-email',
  'verify-email-confirm',
  'verify-phone',
  'forgot-password',
  'reset-password',
  'categories',
  'stats'
];
```

**Plus:** Public GET requests to `/business/` for viewing businesses

### Protected Endpoints (Auth Required)
- All POST/PUT/DELETE to `/business/`
- `/business/my-business/`
- `/business/photo-request/`
- `/profile` updates
- User favorites, likes, reviews

---

## Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        LOGIN PAGE                                │
│  User enters email/phone → Click "Send OTP"                     │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
                  POST /api/auth/send-email-otp/
                  POST /api/auth/send-phone-otp/
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                   OTP VERIFICATION PAGE                          │
│  User enters OTP → Submit                                       │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
                  POST /api/auth/verify-email-otp/
                  POST /api/auth/verify-phone-otp/
                            │
                            ▼
            ┌───────────────────────────────────────┐
            │   Backend Checks & Returns:           │
            │   - is_new_user                       │
            │   - is_profile_complete               │
            │   - user data                         │
            │   - JWT tokens                        │
            └──────┬──────────────────┬─────────────┘
                   │                  │
         ┌─────────▼─────────┐   ┌───▼──────────────────────────┐
         │   NEW USER        │   │   EXISTING USER              │
         │                   │   │                              │
         │   Navigate to:    │   │   Navigate to:               │
         │   /user-type-     │   │   / (Home Page)              │
         │   selection       │   │                              │
         └─────────┬─────────┘   └───────┬──────────────────────┘
                   │                      │
        ┌──────────▼──────────┐   ┌──────▼──────────────────────┐
        │  COMMUNITY MEMBER   │   │     Already authenticated   │
        │  Business Owner     │   │     Stored in localStorage  │
        └──────────┬──────────┘   └──────┬───────────────────────┘
                   │                      │
        ┌──────────▼──────────┐   ┌──────▼──────────────────────┐
        │                     │   │     Both can access:        │
        │  Register           │   │     /directory              │
        │  Business           │   │     /business/{id}          │
        │                     │   │     All business listings   │
        └─────────────────────┘   └─────────────────────────────┘
```

---

## Business Owner Profile Completion Check

### Backend Logic (user_auth/views.py)

```python
# In VerifyEmailOTPView and VerifyPhoneOTPView

is_profile_complete = True
if user.user_type == 'business':
    from business.models import Business
    has_business = Business.objects.filter(user=user, is_active=True).exists()
    is_profile_complete = has_business
else:
    # Community users
    is_profile_complete = bool(user.first_name and user.last_name)
```

**Result:**
- **Business owners** need an active `Business` record in the database
- **Community users** just need basic profile info

### Frontend Handling

**Current Code (OTPVerificationPage.tsx):**
```typescript
if (response.is_new_user) {
  navigate('/user-type-selection');
} else if (response.user && response.tokens) {
  login(response.user, response.tokens);
  navigate('/');
}
```

**Note:** The `is_profile_complete` flag is returned by backend but **not currently used** in the frontend routing. The frontend relies on `is_new_user` flag instead.

**Recommended Enhancement:**
```typescript
if (response.success && response.user && response.tokens) {
  login(response.user, response.tokens);
  
  if (!response.is_profile_complete) {
    // Profile incomplete - redirect based on user type
    if (response.user.userType === 'business') {
      navigate('/business-onboarding');
    } else {
      navigate('/profile-update');
    }
  } else {
    // Profile complete - go to home
    navigate('/');
  }
}
```

---

## Summary

### Community Member Flow
1. Login → Enter email/phone → Receive OTP
2. Verify OTP → Get authenticated
3. Browse businesses at `/directory`
4. View business details at `/business/{id}`
5. Search, filter, and explore

### Business Owner Flow (No Business Yet)
1. Login → Enter email/phone → Receive OTP
2. Verify OTP → Get authenticated
3. Redirected to business registration
4. Complete business profile
5. Business is created and active
6. Can now browse other businesses AND manage own business

### Business Owner Flow (Has Business)
1. Login → Enter email/phone → Receive OTP
2. Verify OTP → Get authenticated
3. Browse businesses at `/directory`
4. Manage own business at `/manage-business`
5. View own business at `/business/{their_id}`

---

## Key Technical Points

1. **No Passwords:** OTP-only authentication
2. **JWT Tokens:** Used for all authenticated requests
3. **Auto-Refresh:** Tokens automatically refreshed on expiry
4. **Profile Completion:** Checked by backend, returned to frontend
5. **Public Directory:** Businesses viewable without authentication
6. **Protected Actions:** All modifications require authentication
7. **Session Duration:** 12 hours
8. **Phone Normalization:** Kenyan phone numbers normalized to 254XXXXXXXXX format


