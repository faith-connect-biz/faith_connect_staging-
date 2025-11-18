# API Migration Summary

## ✅ Completed Migration to Staging API

**Base URL Updated:** `https://faithconnectbackend-staging.up.railway.app/api`

All endpoints have been updated to match the new staging API structure as defined in the Postman collection.

---

## 🔄 Key Changes Made

### 1. Base URL
- **Old:** `https://femdjango-production.up.railway.app/api`
- **New:** `https://faithconnectbackend-staging.up.railway.app/api`

### 2. Authentication Endpoints
All auth endpoints now use `/api/auth/` prefix:
- ✅ `POST /api/auth/initiate-auth` (was `/initiate-auth`)
- ✅ `POST /api/auth/verify-otp` (was `/verify-auth-otp`)
- ✅ `POST /api/auth/resend-otp` (was `/resend-otp`)
- ✅ `POST /api/auth/complete-profile` (was `/complete-profile`)

### 3. Business Endpoints
All business endpoints now use `/api/business/vset/businesses/`:
- ✅ `GET /api/business/vset/businesses/` - List businesses (public, minimal)
- ✅ `GET /api/business/vset/businesses/{id}/` - Business detail (requires auth)
- ✅ `GET /api/business/vset/businesses/me/` - My business (owner)
- ✅ `POST /api/business/vset/businesses/` - Create business
- ✅ `PATCH /api/business/vset/businesses/{id}/` - Update business (was PUT)
- ✅ `DELETE /api/business/vset/businesses/{id}/` - Delete business
- ✅ `GET /api/business/vset/businesses/{id}/hours/` - Get hours (public)
- ✅ `POST /api/business/vset/businesses/{id}/hours/` - Update hours (owner)
- ✅ `POST /api/business/vset/businesses/{id}/favorite/` - Toggle favorite
- ✅ `POST /api/business/vset/businesses/{id}/like/` - Toggle like
- ✅ `GET /api/business/vset/businesses/{id}/reviews/` - List reviews (auth required)
- ✅ `POST /api/business/vset/businesses/{id}/reviews/` - Create review
- ✅ `GET /api/business/vset/businesses/{id}/analytics/` - Analytics (public)
- ✅ `POST /api/business/vset/businesses/{id}/upload-image/` - Get presigned URL
- ✅ `GET /api/business/vset/businesses/favorites/` - User favorites
- ✅ `GET /api/business/vset/businesses/user-reviews/` - User reviews
- ✅ `GET /api/business/vset/businesses/user-liked-reviews/` - User liked reviews
- ✅ `GET /api/business/vset/businesses/user-activity/` - User activity
- ✅ `POST /api/business/vset/businesses/check-whatsapp/` - Check WhatsApp

### 4. Services Endpoints
All services endpoints now use `/api/business/vset/services/`:
- ✅ `GET /api/business/vset/services/` - List services (public)
- ✅ `POST /api/business/vset/services/?business_id={id}` - Create service
- ✅ `GET /api/business/vset/services/{id}/` - Service detail (requires auth)
- ✅ `PATCH /api/business/vset/services/{id}/` - Update service (was PUT)
- ✅ `DELETE /api/business/vset/services/{id}/` - Delete service
- ✅ `POST /api/business/vset/services/{id}/upload-image/` - Get presigned URL
- ✅ `GET /api/business/vset/services/{id}/reviews/` - List reviews (public)
- ✅ `POST /api/business/vset/services/{id}/reviews/` - Create review

### 5. Products Endpoints
All products endpoints now use `/api/business/vset/products/`:
- ✅ `GET /api/business/vset/products/` - List products (public)
- ✅ `POST /api/business/vset/products/?business_id={id}` - Create product
- ✅ `GET /api/business/vset/products/{id}/` - Product detail (requires auth)
- ✅ `PATCH /api/business/vset/products/{id}/` - Update product (was PUT)
- ✅ `DELETE /api/business/vset/products/{id}/` - Delete product
- ✅ `POST /api/business/vset/products/{id}/upload-image/` - Get presigned URL
- ✅ `GET /api/business/vset/products/{id}/reviews/` - List reviews (public)
- ✅ `POST /api/business/vset/products/{id}/reviews/` - Create review

### 6. Profile Endpoints
- ✅ `GET /api/profile` - Get profile
- ✅ `PATCH /api/profile-update` - Update profile
- ✅ `POST /api/profile-photo-upload-url` - Get presigned URL (authenticated)
- ✅ `POST /api/profile-photo-upload-url-unauthenticated` - Get presigned URL (unauthenticated)

### 7. Public Endpoints
- ✅ `GET /health/` - Health check
- ✅ `GET /api/stats/` - Platform statistics

---

## 📝 Important Notes

### Image Upload Flow
The new API uses a **presign-only** upload flow:
1. Request presigned URL from backend
2. Upload file directly to S3 using presigned URL
3. Update the resource (business/service/product/profile) with the S3 URL via PATCH

**Key Changes:**
- Business image upload: Use `image_type: 'image'` or `'logo'` (not `file_name`)
- Service/Product image upload: Use `image_role: 'main'` or `'additional'` (not `image_type`)
- After S3 upload, update resource via PATCH with the image URL (not a separate update-image endpoint)

### HTTP Methods
- **Updates:** Changed from `PUT` to `PATCH` for business/service/product updates
- **Image Updates:** No separate update-image endpoint - use PATCH on the resource with image URL

### Authentication Requirements
- **Business Detail:** Now requires authentication (was public)
- **Business Reviews List:** Now requires authentication (was public)
- **Service/Product Detail:** Now requires authentication (was public)
- **Service/Product Reviews List:** Public (no auth required)

### Query Parameters
- Services/Products creation: Use `?business_id={id}` query parameter instead of including in body
- Business services/products: Use `?business={id}` query parameter for filtering

---

## ✅ Verified Endpoints

The following endpoints have been tested and confirmed working:

1. ✅ Health Check: `GET /health/`
2. ✅ Stats: `GET /api/stats/`
3. ✅ Initiate Auth: `POST /api/auth/initiate-auth`
4. ✅ Business List: `GET /api/business/vset/businesses/`
5. ✅ Services List: `GET /api/business/vset/services/`
6. ✅ Products List: `GET /api/business/vset/products/`

---

## 🔍 Endpoints Not in Postman Collection

The following endpoints are still using old paths (may need backend confirmation):
- Categories: `/business/categories/` (may still work)
- FEM Churches: `/business/fem-churches/` (may still work)
- Photo Requests: `/business/{id}/photo-request/` (may need update)
- Professional Service Requests: `/business/professional-service-requests/` (may need update)

These endpoints are not in the Postman collection, so they may:
1. Still work with old paths
2. Need to be updated to new paths
3. Be deprecated/removed

---

## 🚀 Next Steps

1. ✅ Base URL updated
2. ✅ All main endpoints updated
3. ✅ Image upload flow updated
4. ⚠️ Test all functionality in the app
5. ⚠️ Verify categories and FEM churches endpoints
6. ⚠️ Verify photo request and professional service request endpoints

---

**Migration Status:** ✅ Complete (Main endpoints)
**Last Updated:** 2024-01-01

