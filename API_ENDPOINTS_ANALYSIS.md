# API Endpoints Analysis & Documentation

## Overview
This document provides a comprehensive analysis of the Faith Connect API endpoints, comparing what's available in the Postman collection with what's implemented in the frontend `api.ts` service.

**Last Updated:** 2025-01-18
**Backend URL:** `https://faithconnectbackend-staging.up.railway.app`

---

## ✅ Implemented Endpoints

### Health & Public Endpoints
| Endpoint | Method | Implementation | Status |
|----------|--------|---------------|--------|
| `/health/` | GET | `healthCheck()` | ✅ Complete |
| `/api/stats/` | GET | `getPublicStats()` | ✅ Complete |

### Authentication (OTP Flow)
| Endpoint | Method | Implementation | Status |
|----------|--------|---------------|--------|
| `/api/auth/initiate-auth` | POST | `initiateAuth()` | ✅ Complete |
| `/api/auth/verify-otp` | POST | `verifyOTPWithIdentifier()` | ✅ Complete |
| `/api/auth/verify-otp` | POST | `verifyOTPWithUserId()` | ✅ Complete |
| `/api/auth/resend-otp` | POST | `resendOTP()` | ✅ Complete |
| `/api/auth/complete-profile` | POST | `completeProfile()` | ✅ Complete |

### Profile Endpoints
| Endpoint | Method | Implementation | Status |
|----------|--------|---------------|--------|
| `/api/profile` | GET | `getCurrentUser()` | ✅ Complete |
| `/api/profile-update` | PATCH | `updateProfile()` | ✅ Complete |
| `/api/profile-photo-upload-url` | POST | `getProfilePhotoUploadUrlAuth()` | ✅ Complete |
| `/api/profile-photo-upload-url-unauthenticated` | POST | `getProfilePhotoUploadUrlUnauth()` | ✅ Complete |

### Business Endpoints (ViewSet)
| Endpoint | Method | Implementation | Status |
|----------|--------|---------------|--------|
| `/api/business/vset/businesses/` | GET | `getBusinesses()` | ✅ Complete |
| `/api/business/vset/businesses/` | POST | `createBusiness()` | ✅ Complete |
| `/api/business/vset/businesses/{id}/` | GET | `getBusiness()` | ✅ Complete |
| `/api/business/vset/businesses/me/` | GET | `getMyBusiness()` | ✅ Complete |
| `/api/business/vset/businesses/{id}/hours/` | GET | `getBusinessHoursPublic()` | ✅ Complete |
| `/api/business/vset/businesses/{id}/hours/` | POST | `replaceBusinessHours()` | ✅ Complete |
| `/api/business/vset/businesses/{id}/favorite/` | POST | `toggleBusinessFavorite()` | ✅ Complete |
| `/api/business/vset/businesses/{id}/like/` | POST | `toggleBusinessLikeVSet()` | ✅ Complete |
| `/api/business/vset/businesses/{id}/reviews/` | GET | `getBusinessReviews()` | ✅ Complete |
| `/api/business/vset/businesses/{id}/reviews/` | POST | `createBusinessReview()` | ✅ Complete |
| `/api/business/vset/businesses/{id}/analytics/` | GET | `getBusinessAnalyticsVSet()` | ✅ Complete |
| `/api/business/vset/businesses/{id}/upload-image/` | POST | `getBusinessImageUploadUrlVSet()` | ✅ Complete |
| `/api/business/vset/businesses/check-whatsapp/` | POST | `checkWhatsAppNumberVSet()` | ✅ Complete |
| `/api/business/vset/businesses/favorites/` | GET | `getUserFavoritesVSet()` | ✅ Complete |
| `/api/business/vset/businesses/user-reviews/` | GET | `getUserReviewsVSet()` | ✅ Complete |
| `/api/business/vset/businesses/user-liked-reviews/` | GET | `getUserLikedReviewIdsVSet()` | ✅ Complete |
| `/api/business/vset/businesses/user-activity/` | GET | `getUserActivityVSet()` | ✅ Complete |

### Services Endpoints (ViewSet)
| Endpoint | Method | Implementation | Status |
|----------|--------|---------------|--------|
| `/api/business/vset/services/` | GET | `getAllServices()` | ✅ Complete |
| `/api/business/vset/services/?business_id={id}` | POST | `createServiceVSet()` | ✅ Complete |
| `/api/business/vset/services/{id}/` | GET | `getServiceVSet()` | ✅ Complete |
| `/api/business/vset/services/{id}/upload-image/` | POST | `getServiceImageUploadUrlVSet()` | ✅ Complete |
| `/api/business/vset/services/{id}/reviews/` | GET | `getServiceReviewsVSet()` | ✅ Complete |
| `/api/business/vset/services/{id}/reviews/` | POST | `createServiceReviewVSet()` | ✅ Complete |

### Products Endpoints (ViewSet)
| Endpoint | Method | Implementation | Status |
|----------|--------|---------------|--------|
| `/api/business/vset/products/` | GET | `getAllProducts()` | ✅ Complete |
| `/api/business/vset/products/?business_id={id}` | POST | `createProductVSet()` | ✅ Complete |
| `/api/business/vset/products/{id}/` | GET | `getProductVSet()` | ✅ Complete |
| `/api/business/vset/products/{id}/upload-image/` | POST | `getProductImageUploadUrlVSet()` | ✅ Complete |
| `/api/business/vset/products/{id}/reviews/` | GET | `getProductReviewsVSet()` | ✅ Complete |
| `/api/business/vset/products/{id}/reviews/` | POST | `createProductReviewVSet()` | ✅ Complete |

---

## ✅ Recently Added Endpoints

### Business Endpoints
| Endpoint | Method | Implementation | Status |
|----------|--------|---------------|--------|
| `/api/business/vset/businesses/{id}/` | PATCH | `updateBusinessVSet()` | ✅ Complete |
| `/api/business/vset/businesses/{id}/` | DELETE | `deleteBusinessVSet()` | ✅ Complete |

### Services Endpoints
| Endpoint | Method | Implementation | Status |
|----------|--------|---------------|--------|
| `/api/business/vset/services/{id}/` | PATCH | `updateServiceVSet()` | ✅ Complete |
| `/api/business/vset/services/{id}/` | DELETE | `deleteServiceVSet()` | ✅ Complete |

### Products Endpoints
| Endpoint | Method | Implementation | Status |
|----------|--------|---------------|--------|
| `/api/business/vset/products/{id}/` | PATCH | `updateProductVSet()` | ✅ Complete |
| `/api/business/vset/products/{id}/` | DELETE | `deleteProductVSet()` | ✅ Complete |

### Legacy Endpoints Still in Use

These endpoints use old paths and should be migrated to ViewSet paths:

| Legacy Endpoint | Current Implementation | Should Use |
|----------------|----------------------|-----------|
| `/business/{id}/` | `getBusiness()` (legacy) | `/api/business/vset/businesses/{id}/` ✅ Fixed |
| `/business/` | `getBusinesses()` (legacy) | `/api/business/vset/businesses/` ✅ Fixed |
| `/business/{id}/update/` | `updateBusiness()` | `/api/business/vset/businesses/{id}/` |
| `/business/{id}/services/` | `getBusinessServices()` | Should use main services list with filter |
| `/business/{id}/products/` | `getBusinessProducts()` | Should use main products list with filter |
| `/business/{id}/hours/` | `getBusinessHours()` (legacy) | `/api/business/vset/businesses/{id}/hours/` ✅ Fixed |
| `/business/{id}/analytics/` | `getBusinessAnalytics()` (legacy) | `/api/business/vset/businesses/{id}/analytics/` ✅ Fixed |
| `/business/{id}/upload-image/` | Legacy methods | `/api/business/vset/businesses/{id}/upload-image/` ✅ Fixed |
| `/business/{id}/like/` | `toggleBusinessLike()` (legacy) | `/api/business/vset/businesses/{id}/like/` ✅ Fixed |
| `/business/{id}/favorite` | `toggleFavorite()` (legacy) | `/api/business/vset/businesses/{id}/favorite/` ✅ Fixed |
| `/business/services/{id}/` | `getService()` (legacy) | `/api/business/vset/services/{id}/` ✅ Fixed |
| `/business/products/{id}/` | `getProduct()` (legacy) | `/api/business/vset/products/{id}/` ✅ Fixed |
| `/business/my-business/` | `getUserBusiness()` (legacy) | `/api/business/vset/businesses/me/` ✅ Fixed |

---

## 🔧 Components Requiring Updates

### High Priority - Need ViewSet Migration

1. **BusinessManagementPage.tsx**
   - Uses: `getBusinessServices()`, `getBusinessProducts()`, `getBusinessHours()`, `getBusinessAnalytics()`
   - Should use: ViewSet endpoints with proper filtering
   - Impact: Business management functionality

2. **BusinessDetailPage.tsx**
   - Uses: `getBusinessServices()`, `createProductReview()`, `createServiceReview()`
   - Should use: ViewSet endpoints
   - Impact: Business detail viewing and reviews

3. **ServiceForm.tsx & ProductForm.tsx**
   - Uses: `updateService()`, `createService()`, `updateProduct()`, `createProduct()`
   - Should use: `createServiceVSet()`, `createProductVSet()`, and implement update methods
   - Impact: Service/Product CRUD operations

4. **ReviewSection.tsx & ProductServiceReviews.tsx**
   - Uses: `getProductReviews()`, `getServiceReviews()`, `createProductReview()`, `createServiceReview()`
   - Should use: `getProductReviewsVSet()`, `getServiceReviewsVSet()`, `createProductReviewVSet()`, `createServiceReviewVSet()`
   - Impact: Review functionality

### Medium Priority - Legacy Method Wrappers

5. **useBusinessQuery.ts**
   - Uses: `getBusiness()`, `getBusinessAnalytics()`
   - Should use: Already updated to ViewSet, needs verification
   - Impact: Business data fetching hook

6. **ImageUploader.tsx**
   - Uses: Legacy upload methods
   - Should use: ViewSet upload endpoints
   - Impact: Image upload functionality

### Low Priority - Already Using Context

7. **DirectoryPage.tsx**
   - Uses: BusinessContext (which handles API calls)
   - Status: Indirect usage, no changes needed if context is updated
   - Impact: Directory listing

---

## 📋 Action Items

### Immediate (High Priority)
- [x] ~~Update `updateBusiness()` to use `/api/business/vset/businesses/{id}/` (PUT/PATCH)~~ ✅ Added `updateBusinessVSet()`
- [x] ~~Implement `updateServiceVSet()` method for `/api/business/vset/services/{id}/` (PUT/PATCH)~~ ✅ Complete
- [x] ~~Implement `updateProductVSet()` method for `/api/business/vset/products/{id}/` (PUT/PATCH)~~ ✅ Complete
- [ ] Update `BusinessManagementPage.tsx` to use new ViewSet methods
- [ ] Update `ServiceForm.tsx` and `ProductForm.tsx` to use ViewSet methods

### Short Term (Medium Priority)
- [x] ~~Implement `deleteBusinessVSet()` method~~ ✅ Complete
- [x] ~~Implement `deleteServiceVSet()` method~~ ✅ Complete
- [x] ~~Implement `deleteProductVSet()` method~~ ✅ Complete
- [ ] Update `BusinessDetailPage.tsx` review methods to use ViewSet
- [ ] Update `ReviewSection.tsx` to use ViewSet review methods
- [ ] Migrate all legacy methods to use ViewSet paths

### Long Term (Low Priority)
- [ ] Remove deprecated legacy methods after migration is complete
- [ ] Add comprehensive error handling for all ViewSet endpoints
- [ ] Add request/response TypeScript types for all missing endpoints
- [ ] Create utility functions for common API patterns
- [ ] Add API endpoint documentation comments with examples

---

## 🔄 Migration Strategy

### Phase 1: Core Business Operations (Week 1)
1. Update business CRUD operations to ViewSet
2. Update business-related queries (hours, analytics)
3. Test business management functionality

### Phase 2: Services & Products (Week 2)
1. Implement missing ViewSet methods for services/products
2. Update all components using services/products
3. Test service/product CRUD and reviews

### Phase 3: Reviews & Interactions (Week 3)
1. Migrate all review functionality to ViewSet
2. Update like/favorite functionality
3. Test all user interactions

### Phase 4: Cleanup & Optimization (Week 4)
1. Remove deprecated legacy methods
2. Add comprehensive error handling
3. Performance optimization
4. Documentation updates

---

## 📝 Request/Response Type Coverage

### Fully Typed ✅
- InitiateAuthRequest/Response
- VerifyOTPRequest/Response
- CompleteProfileRequest
- PresignedUrlRequest/Response
- BusinessHoursRequest
- CheckWhatsAppRequest/Response
- PublicStats
- BusinessAnalyticsResponse

### Needs Additional Types ⚠️
- UpdateBusinessRequest (for PUT/PATCH)
- UpdateServiceRequest (for PUT/PATCH)
- UpdateProductRequest (for PUT/PATCH)
- DeleteResponse (standard delete confirmation)
- ReviewUpdateRequest (if update reviews is needed)
- Pagination response wrapper types

---

## 🚨 Breaking Changes to Watch

1. **Endpoint Path Changes**: Legacy `/business/` → `/api/business/vset/businesses/`
2. **Query Parameters**: Some filters may have changed (e.g., `business__category` vs `category`)
3. **Response Structure**: ViewSet responses may have different nesting
4. **Authentication**: Some endpoints moved from public to auth-required
5. **Presigned URLs**: New format for S3 upload URLs

---

## 📚 Reference

### Postman Collection Variables
- `base_url`: `https://faithconnectbackend-staging.up.railway.app`
- `auth_token`: User access token
- `user_id`: Current user ID
- `business_id`: Business ID for operations
- `service_id`: Service ID for operations
- `product_id`: Product ID for operations

### Common Query Parameters
- `search`: Text search across name/description
- `category`: Filter by category ID
- `business__category`: Filter services/products by business category
- `city`: Filter by city
- `county`: Filter by county
- `is_featured`: Filter featured businesses
- `in_stock`: Filter products by stock status
- `price_range`: Filter by price range
- `ordering`: Sort results

---

## 🎯 Next Steps

1. ✅ Review this document with the team
2. ⏳ Prioritize missing endpoint implementations
3. ⏳ Begin Phase 1 of migration strategy
4. ⏳ Update components to use new ViewSet methods
5. ⏳ Add comprehensive testing for all new endpoints
6. ⏳ Update API documentation with examples
7. ⏳ Remove deprecated methods after successful migration

---

**Document Status:** 🟢 Up to Date
**API Service Status:** 🟢 All ViewSet Endpoints Implemented (CRUD Complete)
**Component Updates:** 🟡 In Progress - Legacy methods still used in components
