from django.db import models

# Create your models here.

import uuid
from django.db import models
from django.conf import settings
from django.contrib.auth import get_user_model


User = get_user_model()

from django.db import models
from django.utils.text import slugify

class FEMChurch(models.Model):
    """
    Model to represent FEM Churches/Branches for user affiliation tracking
    """
    name = models.CharField(max_length=200, unique=True, help_text="Name of the FEM Church or Branch")
    location = models.CharField(max_length=200, blank=True, null=True, help_text="Location of the church")
    country = models.CharField(max_length=100, default='Kenya', help_text="Country where the church is located")
    city = models.CharField(max_length=100, blank=True, null=True, help_text="City where the church is located")
    pastor_name = models.CharField(max_length=200, blank=True, null=True, help_text="Name of the pastor")
    contact_phone = models.CharField(max_length=20, blank=True, null=True, help_text="Church contact phone")
    contact_email = models.EmailField(blank=True, null=True, help_text="Church contact email")
    is_active = models.BooleanField(default=True, help_text="Whether this church is active")
    sort_order = models.IntegerField(default=0, help_text="Order for displaying churches in dropdowns")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "FEM Church"
        verbose_name_plural = "FEM Churches"
        ordering = ['sort_order', 'name']
    
    def __str__(self):
        return f"{self.name} - {self.city or self.location or 'Location TBD'}"

class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(unique=True, blank=True)
    description = models.TextField(blank=True, null=True, help_text="Brief description of what this category includes")
    subcategories = models.JSONField(default=list, blank=True, help_text="List of subcategories for this main category")
    icon = models.CharField(max_length=10, blank=True, null=True, help_text="Emoji icon for the category")
    is_active = models.BooleanField(default=True)
    sort_order = models.IntegerField(default=0, help_text="Order for displaying categories")

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    class Meta:
        verbose_name_plural = "Categories"
        ordering = ['sort_order', 'name']

    def __str__(self):
        return self.name

class Business(models.Model):
    BUSINESS_TYPE_CHOICES = [
        ('products', 'Products'),
        ('services', 'Services'),
        ('both', 'Both Products and Services'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='businesses')
    business_name = models.CharField(max_length=255)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name="businesses")
    subcategory = models.CharField(max_length=100, blank=True, null=True, help_text="Specific subcategory within the main category")
    description = models.TextField(blank=True, null=True)
    long_description = models.TextField(blank=True, null=True)
    business_type = models.CharField(max_length=20, choices=BUSINESS_TYPE_CHOICES, default='both', help_text="Type of business: Products, Services, or Both")

    phone = models.CharField(max_length=20, blank=True, null=True)
    email = models.EmailField(max_length=255, blank=True, null=True)
    website = models.URLField(max_length=500, blank=True, null=True)

    # Address fields - simplified according to requirements
    address = models.TextField(help_text="Street address or physical location")
    office_address = models.TextField(blank=True, null=True, help_text="Optional separate office or shop address")
    country = models.CharField(max_length=100, default='Kenya', help_text="Country")
    city = models.CharField(max_length=100, blank=True, null=True, help_text="City")
    
    # Church affiliation
    fem_church = models.ForeignKey(
        FEMChurch, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name="businesses",
        help_text="FEM Church or Branch affiliation"
    )

    latitude = models.DecimalField(max_digits=10, decimal_places=8, blank=True, null=True)
    longitude = models.DecimalField(max_digits=11, decimal_places=8, blank=True, null=True)

    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0)
    review_count = models.IntegerField(default=0)

    is_verified = models.BooleanField(default=False)
    is_featured = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    business_image_url = models.URLField(max_length=500, blank=True, null=True)
    business_logo_url = models.URLField(max_length=500, blank=True, null=True)

    # Social media links
    facebook_url = models.URLField(max_length=500, blank=True, null=True)
    instagram_url = models.URLField(max_length=500, blank=True, null=True)
    twitter_url = models.URLField(max_length=500, blank=True, null=True)
    youtube_url = models.URLField(max_length=500, blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.business_name

class BusinessHour(models.Model):
    DAYS_OF_WEEK = [
        (0, 'Sunday'),
        (1, 'Monday'),
        (2, 'Tuesday'),
        (3, 'Wednesday'),
        (4, 'Thursday'),
        (5, 'Friday'),
        (6, 'Saturday'),
    ]

    business = models.ForeignKey('Business', on_delete=models.CASCADE, related_name='hours')
    day_of_week = models.IntegerField(choices=DAYS_OF_WEEK)
    open_time = models.TimeField(blank=True, null=True)
    close_time = models.TimeField(blank=True, null=True)
    is_closed = models.BooleanField(default=False)

    class Meta:
        unique_together = ('business', 'day_of_week')

    def __str__(self):
        return f"{self.business.business_name} - {self.get_day_of_week_display()}"



class Service(models.Model):
    business = models.ForeignKey('Business', on_delete=models.CASCADE, related_name='services')
    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True, blank=True)
    description = models.TextField(blank=True, null=True)
    price_range = models.CharField(max_length=100, blank=True, null=True)  # e.g., "KSh 500 - 1000"
    duration = models.CharField(max_length=100, blank=True, null=True)     # e.g., "30 mins", "1 hour"
    service_image_url = models.URLField(max_length=500, blank=True, null=True)  # Main service image
    images = models.JSONField(default=list, blank=True)  # Multiple service images (up to 10)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(f"{self.name}-{self.business.business_name}")
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} ({self.business.business_name})"

class Review(models.Model):
    business = models.ForeignKey('Business', on_delete=models.CASCADE, related_name='reviews')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='business_reviews')
    rating = models.IntegerField(choices=[(i, i) for i in range(1, 6)])
    review_text = models.TextField(blank=True, null=True)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('business', 'user')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.first_name} {self.user.last_name} - {self.business.business_name}"


class ServiceReview(models.Model):
    service = models.ForeignKey('Service', on_delete=models.CASCADE, related_name='reviews')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='service_reviews')
    rating = models.IntegerField(choices=[(i, i) for i in range(1, 6)])
    review_text = models.TextField(blank=True, null=True)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('service', 'user')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.first_name} {self.user.last_name} - {self.service.name}"


class ProductReview(models.Model):
    product = models.ForeignKey('Product', on_delete=models.CASCADE, related_name='reviews')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='product_reviews')
    rating = models.IntegerField(choices=[(i, i) for i in range(1, 6)])
    review_text = models.TextField(blank=True, null=True)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('product', 'user')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.first_name} {self.user.last_name} - {self.product.name}"


class PhotoRequest(models.Model):
    """Model to handle professional photo requests from users"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    business = models.ForeignKey('Business', on_delete=models.CASCADE, related_name='photo_requests')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='photo_requests')
    request_date = models.DateTimeField(auto_now_add=True)
    status = models.CharField(
        max_length=20,
        choices=[
            ('pending', 'Pending'),
            ('approved', 'Approved'),
            ('rejected', 'Rejected'),
            ('completed', 'Completed')
        ],
        default='pending'
    )
    notes = models.TextField(blank=True, null=True, help_text="Additional notes from the user")
    business_response = models.TextField(blank=True, null=True, help_text="Response from the business owner")
    completed_date = models.DateTimeField(blank=True, null=True)
    
    class Meta:
        unique_together = ('business', 'user')
        ordering = ['-request_date']
    
    def __str__(self):
        return f"Photo request from {self.user.first_name} {self.user.last_name} to {self.business.business_name}"


class Favorite(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='favorites'
    )
    business = models.ForeignKey(
        'Business',  # or 'yourapp.Business' if Business is in another app
        on_delete=models.CASCADE,
        related_name='favorited_by'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'business')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user} favorited {self.business}"


class Product(models.Model):
    business = models.ForeignKey(
        'Business',
        on_delete=models.CASCADE,
        related_name='products'
    )
    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True, blank=True)
    description = models.TextField(blank=True, null=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    price_currency = models.CharField(max_length=3, default='KSH')
    product_image_url = models.URLField(max_length=500, blank=True, null=True)  # Main product image
    images = models.JSONField(default=list, blank=True)  # Multiple product images (up to 10)
    is_active = models.BooleanField(default=True)
    in_stock = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(f"{self.name}-{self.business.business_name}")
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} ({self.business.business_name})"


class BusinessLike(models.Model):
    """Model to handle business likes"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='business_likes')
    business = models.ForeignKey('Business', on_delete=models.CASCADE, related_name='likes')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('user', 'business')
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.first_name} {self.user.last_name} liked {self.business.business_name}"
    
    def clean(self):
        from django.core.exceptions import ValidationError
        # Prevent users from liking their own business
        if self.user == self.business.user:
            raise ValidationError("Users cannot like their own business")


class ReviewLike(models.Model):
    """Model to handle review likes"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='review_likes')
    review = models.ForeignKey('Review', on_delete=models.CASCADE, related_name='likes')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('user', 'review')
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.first_name} {self.user.last_name} liked review by {self.review.user.first_name}"
    
    def clean(self):
        from django.core.exceptions import ValidationError
        # Prevent users from liking their own reviews
        if self.user == self.review.user:
            raise ValidationError("Users cannot like their own reviews")