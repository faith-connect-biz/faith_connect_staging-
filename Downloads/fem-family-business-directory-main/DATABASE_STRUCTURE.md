# FEM Family Business Directory - Database Structure

## Overview
This document outlines the database structure requirements for the FEM Family Business Directory application. It includes current data models, required fields, and planned updates.

---

## 🗄️ Current Database Models

### 1. **User Model**
```python
class User(AbstractUser):
    # Core Fields
    id = UUIDField(primary_key=True, default=uuid.uuid4)
    email = EmailField(unique=True)
    phone = PhoneNumberField(unique=True, null=True, blank=True)
    first_name = CharField(max_length=50)
    last_name = CharField(max_length=50)
    
    # Profile Fields
    profile_photo = ImageField(upload_to='profiles/', null=True, blank=True)
    date_of_birth = DateField(null=True, blank=True)
    gender = CharField(max_length=10, choices=GENDER_CHOICES, null=True, blank=True)
    
    # Address Fields
    county = CharField(max_length=50, null=True, blank=True)
    city = CharField(max_length=50, null=True, blank=True)
    address = TextField(null=True, blank=True)
    
    # Verification Fields
    is_verified = BooleanField(default=False)
    email_verified = BooleanField(default=False)
    phone_verified = BooleanField(default=False)
    
    # Timestamps
    created_at = DateTimeField(auto_now_add=True)
    updated_at = DateTimeField(auto_now=True)
    
    # User Type
    user_type = CharField(max_length=20, choices=USER_TYPE_CHOICES, default='community')
    
    class Meta:
        db_table = 'users'
```

### 2. **Business Model**
```python
class Business(models.Model):
    # Core Fields
    id = UUIDField(primary_key=True, default=uuid.uuid4)
    owner = ForeignKey(User, on_delete=CASCADE, related_name='businesses')
    name = CharField(max_length=200)
    description = TextField()
    
    # Business Details
    category = CharField(max_length=100, choices=BUSINESS_CATEGORIES)
    subcategory = CharField(max_length=100, null=True, blank=True)
    
    # Contact Information
    phone = PhoneNumberField()
    email = EmailField()
    website = URLField(null=True, blank=True)
    
    # Address Fields
    county = CharField(max_length=50)
    city = CharField(max_length=50)
    address = TextField()
    latitude = DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    
    # Business Type
    business_type = CharField(max_length=20, choices=BUSINESS_TYPE_CHOICES)  # products, services, both
    
    # Verification & Status
    is_verified = BooleanField(default=False)
    is_active = BooleanField(default=True)
    is_featured = BooleanField(default=False)
    
    # Media
    logo = ImageField(upload_to='business_logos/', null=True, blank=True)
    cover_photo = ImageField(upload_to='business_covers/', null=True, blank=True)
    
    # Timestamps
    created_at = DateTimeField(auto_now_add=True)
    updated_at = DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'businesses'
        verbose_name_plural = 'Businesses'
```

### 3. **Service Model**
```python
class Service(models.Model):
    # Core Fields
    id = UUIDField(primary_key=True, default=uuid.uuid4)
    business = ForeignKey(Business, on_delete=CASCADE, related_name='services')
    name = CharField(max_length=200)
    description = TextField()
    
    # Service Details
    duration = CharField(max_length=50)  # e.g., "1-2 hours", "Same day"
    price_range = CharField(max_length=100, null=True, blank=True)  # e.g., "KSH 500-2000"
    
    # Status
    is_active = BooleanField(default=True)
    is_featured = BooleanField(default=False)
    
    # Timestamps
    created_at = DateTimeField(auto_now_add=True)
    updated_at = DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'services'
```

### 4. **Product Model**
```python
class Product(models.Model):
    # Core Fields
    id = UUIDField(primary_key=True, default=uuid.uuid4)
    business = ForeignKey(Business, on_delete=CASCADE, related_name='products')
    name = CharField(max_length=200)
    description = TextField()
    
    # Product Details
    price = DecimalField(max_digits=10, decimal_places=2)
    currency = CharField(max_length=3, default='KSH')
    
    # Status
    is_active = BooleanField(default=True)
    is_featured = BooleanField(default=False)
    is_archived = BooleanField(default=False)  # NEW FIELD
    
    # Media
    photo = ImageField(upload_to='product_photos/', null=True, blank=True)
    
    # Timestamps
    created_at = DateTimeField(auto_now_add=True)
    updated_at = DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'products'
```

### 5. **Review Model**
```python
class Review(models.Model):
    # Core Fields
    id = UUIDField(primary_key=True, default=uuid.uuid4)
    reviewer = ForeignKey(User, on_delete=CASCADE, related_name='reviews_given')
    business = ForeignKey(Business, on_delete=CASCADE, related_name='reviews')
    
    # Review Details
    rating = IntegerField(choices=RATING_CHOICES)  # 1-5 stars
    title = CharField(max_length=200, null=True, blank=True)
    comment = TextField()
    
    # Review Type
    review_type = CharField(max_length=20, choices=REVIEW_TYPE_CHOICES, default='business')  # business, service, product
    
    # Related Items (for service/product reviews)
    service = ForeignKey(Service, on_delete=CASCADE, null=True, blank=True, related_name='reviews')
    product = ForeignKey(Product, on_delete=CASCADE, null=True, blank=True, related_name='reviews')
    
    # Status
    is_verified = BooleanField(default=False)
    is_approved = BooleanField(default=True)
    
    # Timestamps
    created_at = DateTimeField(auto_now_add=True)
    updated_at = DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'reviews'
```

### 6. **Business Activity Model** (NEW)
```python
class BusinessActivity(models.Model):
    # Core Fields
    id = UUIDField(primary_key=True, default=uuid.uuid4)
    business = ForeignKey(Business, on_delete=CASCADE, related_name='activities')
    
    # Activity Details
    activity_type = CharField(max_length=50, choices=ACTIVITY_TYPE_CHOICES)  # view, inquiry, review, etc.
    description = TextField()
    
    # User Interaction
    user = ForeignKey(User, on_delete=CASCADE, null=True, blank=True, related_name='business_interactions')
    
    # Metadata
    ip_address = GenericIPAddressField(null=True, blank=True)
    user_agent = TextField(null=True, blank=True)
    
    # Timestamps
    created_at = DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'business_activities'
        verbose_name_plural = 'Business Activities'
```

### 7. **OTP Model** (NEW)
```python
class OTP(models.Model):
    # Core Fields
    id = UUIDField(primary_key=True, default=uuid.uuid4)
    user = ForeignKey(User, on_delete=CASCADE, related_name='otps')
    
    # OTP Details
    otp_code = CharField(max_length=6)
    otp_type = CharField(max_length=20, choices=OTP_TYPE_CHOICES)  # email, phone
    purpose = CharField(max_length=50, choices=OTP_PURPOSE_CHOICES)  # registration, password_reset, etc.
    
    # Status
    is_used = BooleanField(default=False)
    is_expired = BooleanField(default=False)
    
    # Expiry
    expires_at = DateTimeField()
    
    # Timestamps
    created_at = DateTimeField(auto_now_add=True)
    used_at = DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'otps'
```

---

## 📊 Database Schema Requirements

### **Required Fields for Each Model:**

#### **User Model:**
- ✅ All current fields are required
- ✅ Add: `profile_photo` (optional)
- ✅ Add: `user_type` (community/business)

#### **Business Model:**
- ✅ All current fields are required
- ✅ Add: `business_type` (products/services/both)
- ✅ Add: `is_featured` (for featured section)
- ✅ Add: `latitude/longitude` (for maps)

#### **Service Model:**
- ✅ All current fields are required
- ✅ Add: `is_featured` (for featured services)

#### **Product Model:**
- ✅ All current fields are required
- ✅ Add: `is_archived` (for archiving functionality)
- ✅ Add: `photo` (for product images)

#### **Review Model:**
- ✅ All current fields are required
- ✅ Add: `review_type` (business/service/product)
- ✅ Add: `service/product` foreign keys
- ✅ Add: `is_verified` (for verified reviews)

#### **Business Activity Model:**
- ✅ NEW MODEL - Track all business interactions
- ✅ Required for analytics and activity tracking

#### **OTP Model:**
- ✅ NEW MODEL - For phone/email verification
- ✅ Required for secure registration

---

## 🔄 API Endpoints Required

### **Authentication Endpoints:**
```
POST /api/auth/register/
POST /api/auth/login/
POST /api/auth/logout/
POST /api/auth/verify-email/
POST /api/auth/verify-phone/
POST /api/auth/reset-password/
POST /api/auth/change-password/
```

### **User Endpoints:**
```
GET /api/users/profile/
PUT /api/users/profile/
POST /api/users/upload-photo/
GET /api/users/businesses/
```

### **Business Endpoints:**
```
GET /api/businesses/
GET /api/businesses/{id}/
POST /api/businesses/
PUT /api/businesses/{id}/
DELETE /api/businesses/{id}/
GET /api/businesses/featured/
GET /api/businesses/search/
POST /api/businesses/{id}/archive/
POST /api/businesses/{id}/unarchive/
```

### **Service Endpoints:**
```
GET /api/services/
GET /api/services/{id}/
POST /api/services/
PUT /api/services/{id}/
DELETE /api/services/{id}/
GET /api/services/featured/
```

### **Product Endpoints:**
```
GET /api/products/
GET /api/products/{id}/
POST /api/products/
PUT /api/products/{id}/
DELETE /api/products/{id}/
POST /api/products/{id}/archive/
POST /api/products/{id}/unarchive/
```

### **Review Endpoints:**
```
GET /api/reviews/
GET /api/reviews/{id}/
POST /api/reviews/
PUT /api/reviews/{id}/
DELETE /api/reviews/{id}/
GET /api/businesses/{id}/reviews/
```

### **Activity Endpoints:**
```
GET /api/businesses/{id}/activities/
POST /api/businesses/{id}/track-activity/
GET /api/analytics/business/{id}/
```

### **OTP Endpoints:**
```
POST /api/otp/send/
POST /api/otp/verify/
POST /api/otp/resend/
```

---

## 📈 Data Requirements

### **Sample Data for Testing:**

#### **Users:**
- 100+ community users
- 50+ business owners
- Mix of verified/unverified users

#### **Businesses:**
- 150+ businesses across different categories
- Mix of products/services/both
- Different counties and cities
- Some featured businesses

#### **Services:**
- 300+ services across businesses
- Different durations and price ranges
- Some featured services

#### **Products:**
- 500+ products across businesses
- Different price points
- Some archived products

#### **Reviews:**
- 1000+ reviews across businesses
- Mix of ratings (1-5 stars)
- Some verified reviews

---

## 🔧 Technical Requirements

### **Database Configuration:**
```python
# settings.py
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'fem_business_directory',
        'USER': 'your_username',
        'PASSWORD': 'your_password',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
```

### **Required Packages:**
```txt
Django==4.2.0
djangorestframework==3.14.0
django-cors-headers==4.0.0
django-phonenumber-field==7.2.0
phonenumbers==8.13.0
Pillow==9.5.0
psycopg2-binary==2.9.6
python-decouple==3.8
```

### **Environment Variables:**
```env
DEBUG=True
SECRET_KEY=your_secret_key
DATABASE_URL=postgresql://user:password@localhost:5432/db_name
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

---

## 🚀 Implementation Timeline

### **Phase 1: Core Models (Day 1)**
- [ ] Create User model with all fields
- [ ] Create Business model with all fields
- [ ] Create Service model
- [ ] Create Product model
- [ ] Set up basic authentication

### **Phase 2: Reviews & Activity (Day 2)**
- [ ] Create Review model
- [ ] Create BusinessActivity model
- [ ] Implement review system
- [ ] Set up activity tracking

### **Phase 3: OTP & Verification (Day 3)**
- [ ] Create OTP model
- [ ] Implement OTP generation/verification
- [ ] Add email/phone verification
- [ ] Test OTP flow

### **Phase 4: API Development (Day 4)**
- [ ] Create all required endpoints
- [ ] Implement filtering and search
- [ ] Add pagination
- [ ] Test all endpoints

### **Phase 5: Integration (Day 5)**
- [ ] Connect with frontend
- [ ] Test end-to-end flows
- [ ] Performance optimization
- [ ] Documentation

---

## 📋 Checklist for Database Developer

### **Setup:**
- [ ] Install PostgreSQL
- [ ] Create database
- [ ] Install required packages
- [ ] Configure environment variables

### **Models:**
- [ ] Create all models with proper fields
- [ ] Set up relationships
- [ ] Add indexes for performance
- [ ] Create migrations

### **API:**
- [ ] Set up Django REST Framework
- [ ] Create serializers
- [ ] Implement views
- [ ] Configure URLs

### **Authentication:**
- [ ] Set up JWT authentication
- [ ] Implement OTP system
- [ ] Add email/phone verification
- [ ] Test authentication flow

### **Testing:**
- [ ] Create sample data
- [ ] Test all endpoints
- [ ] Test authentication
- [ ] Performance testing

---

## 📞 Contact Information

### **Frontend Team:**
- Primary Developer: [Your Name]
- Secondary Developer: [Friend's Name]

### **Communication:**
- GitHub Issues: For technical discussions
- Slack/Discord: For real-time updates
- Email: For formal communications

---

*Last Updated: [Current Date]*
*Next Review: After Phase 1 completion* 