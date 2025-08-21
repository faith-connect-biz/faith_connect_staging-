# Faith Connect App – Complete User Acceptance Testing (UAT) Document

## 1. Purpose
To validate that the Faith Connect Business Directory app meets functional and business requirements by allowing community members and business owners to register, log in, list, search, and interact with business profiles effectively.

## 2. Scope
- User registration and account creation (Community Member or Business Directory account)
- Login functionality with email or phone toggling
- Business directory browsing with filters (category, county, rating)
- Business profile interactions: view details, contact, favorite, share, message, call, visit website
- Search and filter functions with clear filters option
- Business management (create, update, delete)
- Service and product management
- Review and rating system
- Image upload and management
- OTP verification system
- Password reset functionality

## 3. Test Objectives
- Ensure users can create accounts with all required fields and password criteria enforced
- Confirm login works with toggle between email or phone for Community and Business users
- Validate filtering and search functionality in business directory
- Verify business cards display correct info and interactive buttons work as expected
- Confirm communication features (call, message, share) function smoothly
- Validate business management features for business owners
- Test image upload and management functionality
- Verify OTP and password reset systems work correctly

## 4. UAT Environment
- **Environment**: UAT/Staging server
- **App Version**: v 1.0.0
- **Platform**: Android, iOS, Web
- **Test Data**: Demo users, business listings
- **Tools**: BrowserStack, TestRail

## 5. Complete Test Scenarios & Acceptance Criteria

### 5.1 User Registration & Account Creation

| Scenario ID | Test Scenario | Test Steps | Expected Result | Status |
|-------------|---------------|------------|-----------------|---------|
| UAT-001 | First Name Field Validation | 1. Open registration form<br>2. Leave First Name empty<br>3. Submit form | Validation error: "First Name is required" | ⏳ |
| UAT-002 | Last Name Field Validation | 1. Leave Last Name empty<br>2. Submit form | Validation error: "Last Name is required" | ⏳ |
| UAT-003 | Partnership Number Field Validation | 1. Leave Partnership Number empty<br>2. Submit form | Validation error: "Partnership Number is required" | ⏳ |
| UAT-004 | Email Format Validation | 1. Enter invalid email format<br>2. Submit form | Validation error: "Enter a valid email address" | ⏳ |
| UAT-005 | Phone Number Field Validation | 1. Leave Phone Number empty<br>2. Submit form | Validation error: "Phone Number is required" | ⏳ |
| UAT-006 | Password Strength Validation | 1. Enter weak password<br>2. Submit form | Validation error: "Password must be at least 8 characters with uppercase, lowercase, number, and special character" | ⏳ |
| UAT-007 | User Type Selection | 1. Select "Community Member"<br>2. Submit form | Form submits with community user type | ⏳ |
| UAT-008 | User Type Selection | 1. Select "Business Owner"<br>2. Submit form | Form submits with business user type | ⏳ |
| UAT-009 | Successful Registration | 1. Fill all required fields correctly<br>2. Submit form | User account created successfully, redirect to verification | ⏳ |
| UAT-010 | Duplicate Partnership Number | 1. Use existing partnership number<br>2. Submit form | Error: "Partnership number already exists" | ⏳ |
| UAT-011 | Duplicate Email | 1. Use existing email address<br>2. Submit form | Error: "Email already exists" | ⏳ |
| UAT-012 | Duplicate Phone | 1. Use existing phone number<br>2. Submit form | Error: "Phone number already exists" | ⏳ |

### 5.2 OTP Verification System

| Scenario ID | Test Scenario | Test Steps | Expected Result | Status |
|-------------|---------------|------------|-----------------|---------|
| UAT-013 | Email OTP Request | 1. Complete registration<br>2. Check email for OTP | OTP received in email | ⏳ |
| UAT-014 | Phone OTP Request | 1. Complete registration with phone<br>2. Check SMS for OTP | OTP received via SMS | ⏳ |
| UAT-015 | OTP Verification Success | 1. Enter correct OTP<br>2. Submit verification | Account activated, redirect to dashboard | ⏳ |
| UAT-016 | OTP Verification Failure | 1. Enter incorrect OTP<br>2. Submit verification | Error: "Invalid OTP code" | ⏳ |
| UAT-017 | Resend Email OTP | 1. Click "Resend OTP"<br>2. Check email | New OTP received | ⏳ |
| UAT-018 | Resend Phone OTP | 1. Click "Resend OTP"<br>2. Check SMS | New OTP received | ⏳ |
| UAT-019 | OTP Expiration | 1. Wait for OTP to expire<br>2. Try to verify | Error: "OTP has expired" | ⏳ |

### 5.3 User Login & Authentication

| Scenario ID | Test Scenario | Test Steps | Expected Result | Status |
|-------------|---------------|------------|-----------------|---------|
| UAT-020 | Login with Email | 1. Select "Email" method<br>2. Enter valid credentials<br>3. Submit | Successful login, redirect to dashboard | ⏳ |
| UAT-021 | Login with Phone | 1. Select "Phone" method<br>2. Enter valid credentials<br>3. Submit | Successful login, redirect to dashboard | ⏳ |
| UAT-022 | Login with Partnership Number | 1. Enter partnership number<br>2. Enter password<br>3. Submit | Successful login, redirect to dashboard | ⏳ |
| UAT-023 | Invalid Credentials | 1. Enter incorrect password<br>2. Submit | Error: "Invalid credentials" | ⏳ |
| UAT-024 | Non-existent User | 1. Enter non-existent email/phone<br>2. Submit | Error: "User not found" | ⏳ |
| UAT-025 | Unverified Account Login | 1. Try to login with unverified account | Error: "Please verify your account first" | ⏳ |
| UAT-026 | Toggle Login Method | 1. Switch between email/phone methods | Form fields update accordingly | ⏳ |
| UAT-027 | Remember Me Functionality | 1. Check "Remember Me"<br>2. Login successfully | Session persists after browser close | ⏳ |
| UAT-028 | Logout Functionality | 1. Click logout button | User logged out, redirect to home | ⏳ |

### 5.4 Password Reset System

| Scenario ID | Test Scenario | Test Steps | Expected Result | Status |
|-------------|---------------|------------|-----------------|---------|
| UAT-029 | Request Password Reset via Email | 1. Click "Forgot Password"<br>2. Enter email<br>3. Submit | Reset link sent to email | ⏳ |
| UAT-030 | Request Password Reset via Phone | 1. Click "Forgot Password"<br>2. Enter phone<br>3. Submit | OTP sent to phone | ⏳ |
| UAT-031 | Password Reset OTP Verification | 1. Enter OTP from SMS<br>2. Submit | OTP verified, show new password form | ⏳ |
| UAT-032 | New Password Validation | 1. Enter weak new password<br>2. Submit | Validation error for password strength | ⏳ |
| UAT-033 | Password Reset Success | 1. Enter strong new password<br>2. Submit | Password updated, redirect to login | ⏳ |
| UAT-034 | Resend Password Reset OTP | 1. Click "Resend OTP" | New OTP sent | ⏳ |

### 5.5 Business Directory Browsing

| Scenario ID | Test Scenario | Test Steps | Expected Result | Status |
|-------------|---------------|------------|-----------------|---------|
| UAT-035 | View Business List | 1. Navigate to directory page | List of businesses displayed | ⏳ |
| UAT-036 | Business Card Information | 1. View business card | Shows: name, category, rating, location, image | ⏳ |
| UAT-037 | Grid View Display | 1. Select grid view | Businesses displayed in grid layout | ⏳ |
| UAT-038 | List View Display | 1. Select list view | Businesses displayed in list layout | ⏳ |
| UAT-039 | Business Image Display | 1. View business with image | Business image displayed correctly | ⏳ |
| UAT-040 | Business Image Fallback | 1. View business without image | Placeholder image displayed | ⏳ |
| UAT-041 | Verified Business Badge | 1. View verified business | Verified badge displayed | ⏳ |
| UAT-042 | Featured Business Badge | 1. View featured business | Featured badge displayed | ⏳ |
| UAT-043 | Business Rating Display | 1. View business with rating | Star rating displayed correctly | ⏳ |
| UAT-044 | Business Location Display | 1. View business card | City and county displayed | ⏳ |

### 5.6 Search & Filtering

| Scenario ID | Test Scenario | Test Steps | Expected Result | Status |
|-------------|---------------|------------|-----------------|---------|
| UAT-045 | Search by Business Name | 1. Enter business name in search<br>2. Submit | Matching businesses displayed | ⏳ |
| UAT-046 | Search by Description | 1. Enter keyword in search<br>2. Submit | Businesses with matching description shown | ⏳ |
| UAT-047 | Filter by Category | 1. Select category from dropdown<br>2. Apply filter | Only businesses in selected category shown | ⏳ |
| UAT-048 | Filter by County | 1. Select county from dropdown<br>2. Apply filter | Only businesses in selected county shown | ⏳ |
| UAT-049 | Filter by Rating Range | 1. Set minimum rating<br>2. Apply filter | Only businesses above minimum rating shown | ⏳ |
| UAT-050 | Filter by Verified Only | 1. Check "Verified Only"<br>2. Apply filter | Only verified businesses shown | ⏳ |
| UAT-051 | Multiple Filters Combined | 1. Apply multiple filters<br>2. Submit | Results match all applied filters | ⏳ |
| UAT-052 | Clear All Filters | 1. Apply multiple filters<br>2. Click "Clear Filters" | All filters reset, all businesses shown | ⏳ |
| UAT-053 | Search with No Results | 1. Search for non-existent term | "No results found" message displayed | ⏳ |
| UAT-054 | Filter with No Results | 1. Apply filter with no matches | "No results found" message displayed | ⏳ |

### 5.7 Business Profile Interactions

| Scenario ID | Test Scenario | Test Steps | Expected Result | Status |
|-------------|---------------|------------|-----------------|---------|
| UAT-055 | View Business Details | 1. Click on business card | Business detail page opens | ⏳ |
| UAT-056 | Business Information Display | 1. View business detail page | All business information displayed correctly | ⏳ |
| UAT-057 | Contact Information Display | 1. View business details | Phone, email, website displayed | ⏳ |
| UAT-058 | Social Media Links | 1. View business details | Social media links displayed if available | ⏳ |
| UAT-059 | Business Hours Display | 1. View business details | Operating hours displayed | ⏳ |
| UAT-060 | Services List Display | 1. View business details | List of services displayed | ⏳ |
| UAT-061 | Products List Display | 1. View business details | List of products displayed | ⏳ |
| UAT-062 | Reviews Display | 1. View business details | Customer reviews displayed | ⏳ |
| UAT-063 | Call Business | 1. Click phone number | Phone dialer opens with business number | ⏳ |
| UAT-064 | Email Business | 1. Click email address | Email client opens with business email | ⏳ |
| UAT-065 | Visit Website | 1. Click website link | Business website opens in new tab | ⏳ |
| UAT-066 | Share Business | 1. Click share button | Share options displayed | ⏳ |
| UAT-067 | Add to Favorites | 1. Click heart icon | Business added to favorites | ⏳ |
| UAT-068 | Remove from Favorites | 1. Click filled heart icon | Business removed from favorites | ⏳ |
| UAT-069 | Message Business | 1. Click message button | Message form opens | ⏳ |
| UAT-070 | Get Directions | 1. Click location | Maps app opens with business location | ⏳ |

### 5.8 Business Management (Business Owners)

| Scenario ID | Test Scenario | Test Steps | Expected Result | Status |
|-------------|---------------|------------|-----------------|---------|
| UAT-071 | Create New Business | 1. Fill business creation form<br>2. Submit | Business created successfully | ⏳ |
| UAT-072 | Business Name Validation | 1. Leave business name empty<br>2. Submit | Validation error displayed | ⏳ |
| UAT-073 | Business Category Selection | 1. Select category from dropdown | Category selected correctly | ⏳ |
| UAT-074 | Business Address Validation | 1. Leave address empty<br>2. Submit | Validation error displayed | ⏳ |
| UAT-075 | Business Description | 1. Enter business description | Description saved correctly | ⏳ |
| UAT-076 | Business Contact Information | 1. Enter phone, email, website | Contact info saved correctly | ⏳ |
| UAT-077 | Business Location Details | 1. Enter city, county, state, zip | Location details saved correctly | ⏳ |
| UAT-078 | Business Hours Setup | 1. Set operating hours for each day | Hours saved correctly | ⏳ |
| UAT-079 | Business Image Upload | 1. Upload business image<br>2. Submit | Image uploaded successfully | ⏳ |
| UAT-080 | Business Logo Upload | 1. Upload business logo<br>2. Submit | Logo uploaded successfully | ⏳ |
| UAT-081 | Social Media Links | 1. Enter social media URLs | Social media links saved | ⏳ |
| UAT-082 | Edit Business Profile | 1. Modify business information<br>2. Save changes | Changes saved successfully | ⏳ |
| UAT-083 | Delete Business | 1. Click delete business<br>2. Confirm deletion | Business deleted successfully | ⏳ |
| UAT-084 | Business Verification Status | 1. View business profile | Verification status displayed | ⏳ |

### 5.9 Service Management

| Scenario ID | Test Scenario | Test Steps | Expected Result | Status |
|-------------|---------------|------------|-----------------|---------|
| UAT-085 | Add New Service | 1. Fill service form<br>2. Submit | Service added successfully | ⏳ |
| UAT-086 | Service Name Validation | 1. Leave service name empty<br>2. Submit | Validation error displayed | ⏳ |
| UAT-087 | Service Description | 1. Enter service description | Description saved correctly | ⏳ |
| UAT-088 | Service Price Range | 1. Set price range | Price range saved correctly | ⏳ |
| UAT-089 | Service Duration | 1. Set service duration | Duration saved correctly | ⏳ |
| UAT-090 | Service Images Upload | 1. Upload service images | Images uploaded successfully | ⏳ |
| UAT-091 | Edit Service | 1. Modify service details<br>2. Save changes | Changes saved successfully | ⏳ |
| UAT-092 | Delete Service | 1. Click delete service<br>2. Confirm deletion | Service deleted successfully | ⏳ |
| UAT-093 | Service Availability Toggle | 1. Toggle service availability | Status updated correctly | ⏳ |

### 5.10 Product Management

| Scenario ID | Test Scenario | Test Steps | Expected Result | Status |
|-------------|---------------|------------|-----------------|---------|
| UAT-094 | Add New Product | 1. Fill product form<br>2. Submit | Product added successfully | ⏳ |
| UAT-095 | Product Name Validation | 1. Leave product name empty<br>2. Submit | Validation error displayed | ⏳ |
| UAT-096 | Product Description | 1. Enter product description | Description saved correctly | ⏳ |
| UAT-097 | Product Price | 1. Set product price | Price saved correctly | ⏳ |
| UAT-098 | Product Currency | 1. Select currency | Currency saved correctly | ⏳ |
| UAT-099 | Product Images Upload | 1. Upload product images | Images uploaded successfully | ⏳ |
| UAT-100 | Product Stock Status | 1. Set stock status | Stock status saved correctly | ⏳ |
| UAT-101 | Edit Product | 1. Modify product details<br>2. Save changes | Changes saved successfully | ⏳ |
| UAT-102 | Delete Product | 1. Click delete product<br>2. Confirm deletion | Product deleted successfully | ⏳ |
| UAT-103 | Product Availability Toggle | 1. Toggle product availability | Status updated correctly | ⏳ |

### 5.11 Review & Rating System

| Scenario ID | Test Scenario | Test Steps | Expected Result | Status |
|-------------|---------------|------------|-----------------|---------|
| UAT-104 | Submit Business Review | 1. Rate business<br>2. Write review text<br>3. Submit | Review submitted successfully | ⏳ |
| UAT-105 | Rating Validation | 1. Submit without rating | Validation error displayed | ⏳ |
| UAT-106 | Review Text Optional | 1. Submit with rating only | Review submitted successfully | ⏳ |
| UAT-107 | Edit Own Review | 1. Modify review<br>2. Save changes | Review updated successfully | ⏳ |
| UAT-108 | Delete Own Review | 1. Click delete review<br>2. Confirm deletion | Review deleted successfully | ⏳ |
| UAT-109 | View All Reviews | 1. Navigate to reviews section | All reviews displayed | ⏳ |
| UAT-110 | Review Verification Status | 1. View review | Verification status displayed | ⏳ |
| UAT-111 | Average Rating Calculation | 1. View business profile | Average rating calculated correctly | ⏳ |
| UAT-112 | Review Count Display | 1. View business profile | Total review count displayed | ⏳ |

### 5.12 Image Management

| Scenario ID | Test Scenario | Test Steps | Expected Result | Status |
|-------------|---------------|------------|-----------------|---------|
| UAT-113 | Business Image Upload | 1. Select image file<br>2. Upload | Image uploaded successfully | ⏳ |
| UAT-114 | Business Logo Upload | 1. Select logo file<br>2. Upload | Logo uploaded successfully | ⏳ |
| UAT-115 | Service Image Upload | 1. Select multiple images<br>2. Upload | Images uploaded successfully | ⏳ |
| UAT-116 | Product Image Upload | 1. Select multiple images<br>2. Upload | Images uploaded successfully | ⏳ |
| UAT-117 | Image Format Validation | 1. Try to upload unsupported format | Error: "Unsupported file format" | ⏳ |
| UAT-118 | Image Size Validation | 1. Try to upload oversized image | Error: "File too large" | ⏳ |
| UAT-119 | Multiple Image Upload | 1. Select up to 10 images<br>2. Upload | All images uploaded successfully | ⏳ |
| UAT-120 | Image Preview | 1. Upload image | Preview displayed correctly | ⏳ |
| UAT-121 | Image Deletion | 1. Click delete image<br>2. Confirm deletion | Image deleted successfully | ⏳ |
| UAT-122 | Image Replacement | 1. Replace existing image | New image replaces old one | ⏳ |

### 5.13 User Profile Management

| Scenario ID | Test Scenario | Test Steps | Expected Result | Status |
|-------------|---------------|------------|-----------------|---------|
| UAT-123 | View User Profile | 1. Navigate to profile page | Profile information displayed | ⏳ |
| UAT-124 | Edit Profile Information | 1. Modify profile details<br>2. Save changes | Changes saved successfully | ⏳ |
| UAT-125 | Profile Image Upload | 1. Upload profile image | Profile image updated | ⏳ |
| UAT-126 | Update Contact Information | 1. Modify email/phone<br>2. Save changes | Contact info updated | ⏳ |
| UAT-127 | Update Address Information | 1. Modify address details<br>2. Save changes | Address updated | ⏳ |
| UAT-128 | Change Password | 1. Enter current password<br>2. Enter new password<br>3. Confirm | Password changed successfully | ⏳ |
| UAT-129 | Current Password Validation | 1. Enter incorrect current password | Error: "Current password incorrect" | ⏳ |
| UAT-130 | New Password Strength | 1. Enter weak new password | Validation error displayed | ⏳ |
| UAT-131 | Profile Privacy Settings | 1. Modify privacy settings<br>2. Save changes | Settings updated | ⏳ |

### 5.14 Navigation & User Experience

| Scenario ID | Test Scenario | Test Steps | Expected Result | Status |
|-------------|---------------|------------|-----------------|---------|
| UAT-132 | Navigation Menu | 1. View navigation menu | All menu items displayed correctly | ⏳ |
| UAT-133 | Responsive Design - Mobile | 1. View on mobile device | Layout adapts to mobile screen | ⏳ |
| UAT-134 | Responsive Design - Tablet | 1. View on tablet device | Layout adapts to tablet screen | ⏳ |
| UAT-135 | Responsive Design - Desktop | 1. View on desktop | Layout optimized for desktop | ⏳ |
| UAT-136 | Loading States | 1. Perform action that requires loading | Loading indicator displayed | ⏳ |
| UAT-137 | Error Handling | 1. Trigger an error condition | User-friendly error message displayed | ⏳ |
| UAT-138 | Success Messages | 1. Complete successful action | Success message displayed | ⏳ |
| UAT-139 | Form Validation | 1. Submit form with errors | Validation errors displayed clearly | ⏳ |
| UAT-140 | Accessibility - Screen Reader | 1. Use screen reader | All elements properly labeled | ⏳ |
| UAT-141 | Accessibility - Keyboard Navigation | 1. Navigate using keyboard only | All functions accessible via keyboard | ⏳ |
| UAT-142 | Accessibility - Color Contrast | 1. Check color combinations | Sufficient contrast for readability | ⏳ |

### 5.15 Performance & Security

| Scenario ID | Test Scenario | Test Steps | Expected Result | Status |
|-------------|---------------|------------|-----------------|---------|
| UAT-143 | Page Load Performance | 1. Measure page load time | Pages load within acceptable time | ⏳ |
| UAT-144 | Image Loading Performance | 1. Load pages with images | Images load progressively | ⏳ |
| UAT-145 | Search Response Time | 1. Perform search operation | Results returned quickly | ⏳ |
| UAT-146 | Filter Response Time | 1. Apply filters | Results filtered quickly | ⏳ |
| UAT-147 | Session Security | 1. Check session handling | Secure session management | ⏳ |
| UAT-148 | Data Validation | 1. Submit malicious data | Input properly sanitized | ⏳ |
| UAT-149 | CSRF Protection | 1. Test form submissions | CSRF tokens properly implemented | ⏳ |
| UAT-150 | XSS Prevention | 1. Test script injection | Scripts properly escaped | ⏳ |

## 6. Test Execution Guidelines

### 6.1 Test Data Requirements
- Test users with different roles (Community Member, Business Owner)
- Sample businesses across different categories and counties
- Test images in various formats and sizes
- Sample services and products

### 6.2 Test Environment Setup
- Clean database with test data
- Multiple devices and browsers
- Network conditions simulation
- Performance monitoring tools

### 6.3 Test Execution Order
1. User Registration & Authentication
2. Basic Navigation & UI
3. Business Directory Features
4. Business Management
5. Advanced Features
6. Performance & Security

### 6.4 Defect Reporting
- Clear description of the issue
- Steps to reproduce
- Expected vs. actual behavior
- Screenshots or screen recordings
- Environment details

## 7. Acceptance Criteria Summary

### 7.1 Critical Paths (Must Pass)
- User registration and login
- Business directory browsing
- Basic search and filtering
- Business profile viewing

### 7.2 Important Features (Should Pass)
- Business management
- Service/product management
- Review system
- Image upload

### 7.3 Nice-to-Have Features (Nice if Pass)
- Advanced filtering
- Social sharing
- Performance optimizations

## 8. Sign-off Requirements

- [ ] All Critical Path tests pass
- [ ] At least 90% of Important Features pass
- [ ] Performance benchmarks met
- [ ] Security tests pass
- [ ] Accessibility requirements met
- [ ] Cross-browser compatibility verified
- [ ] Mobile responsiveness confirmed

---

**Document Version**: 1.0  
**Last Updated**: [Current Date]  
**Prepared By**: [Tester Name]  
**Reviewed By**: [Reviewer Name]  
**Approved By**: [Stakeholder Name]
