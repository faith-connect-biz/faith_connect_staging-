from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from django.db.models import Avg, Count, Q
from django.contrib.admin import SimpleListFilter
from django.http import JsonResponse
from django.urls import path
from django.shortcuts import render
from django.contrib import messages
from django.utils import timezone
from datetime import datetime, timedelta

from business.models import Review, Service, BusinessHour, Business, Category, Product, Favorite
from user_auth.models import User

# Custom Filters
class BusinessStatusFilter(SimpleListFilter):
    title = 'Business Status'
    parameter_name = 'business_status'

    def lookups(self, request, model_admin):
        return (
            ('verified', 'Verified'),
            ('unverified', 'Unverified'),
            ('featured', 'Featured'),
            ('inactive', 'Inactive'),
        )

    def queryset(self, request, queryset):
        if self.value() == 'verified':
            return queryset.filter(is_verified=True)
        if self.value() == 'unverified':
            return queryset.filter(is_verified=False)
        if self.value() == 'featured':
            return queryset.filter(is_featured=True)
        if self.value() == 'inactive':
            return queryset.filter(is_active=False)

class RatingFilter(SimpleListFilter):
    title = 'Rating'
    parameter_name = 'rating'

    def lookups(self, request, model_admin):
        return (
            ('high', '4.5+ Stars'),
            ('good', '4.0-4.4 Stars'),
            ('average', '3.0-3.9 Stars'),
            ('low', 'Below 3.0 Stars'),
        )

    def queryset(self, request, queryset):
        if self.value() == 'high':
            return queryset.filter(rating__gte=4.5)
        if self.value() == 'good':
            return queryset.filter(rating__gte=4.0, rating__lt=4.5)
        if self.value() == 'average':
            return queryset.filter(rating__gte=3.0, rating__lt=4.0)
        if self.value() == 'low':
            return queryset.filter(rating__lt=3.0)

# Enhanced Business Admin
@admin.register(Business)
class BusinessAdmin(admin.ModelAdmin):
    list_display = [
        'business_name', 'category', 'city', 'rating_display', 
        'review_count', 'status_display', 'verification_status', 
        'featured_status', 'is_verified', 'is_featured', 'is_active', 'created_date'
    ]
    list_filter = [
        BusinessStatusFilter, RatingFilter, 'category', 'city', 'county',
        'is_verified', 'is_featured', 'is_active', 'created_at'
    ]
    search_fields = ['business_name', 'description', 'city', 'county', 'phone', 'email']
    list_editable = ['is_verified', 'is_featured', 'is_active']
    readonly_fields = ['rating', 'review_count', 'created_at', 'updated_at']
    ordering = ['-created_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('business_name', 'category', 'description', 'user')
        }),
        ('Contact Information', {
            'fields': ('address', 'city', 'county', 'phone', 'email')
        }),
        ('Business Details', {
            'fields': ('business_image_url', 'website', 'business_logo_url')
        }),
        ('Status & Verification', {
            'fields': ('is_verified', 'is_featured', 'is_active', 'rating', 'review_count')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    actions = [
        'approve_businesses', 'reject_businesses', 'feature_businesses', 
        'unfeature_businesses', 'send_verification_email', 'export_business_data'
    ]

    def rating_display(self, obj):
        if obj.rating:
            stars = '★' * int(obj.rating) + '☆' * (5 - int(obj.rating))
            return format_html(
                '<span style="color: #FFD700;">{}</span> ({})',
                stars, f"{obj.rating:.1f}"
            )
        return 'No ratings'
    rating_display.short_description = 'Rating'

    def status_display(self, obj):
        if obj.is_active:
            return format_html('<span style="color: green;">● Active</span>')
        return format_html('<span style="color: red;">● Inactive</span>')
    status_display.short_description = 'Status'

    def verification_status(self, obj):
        if obj.is_verified:
            return format_html('<span style="color: green;">✓ Verified</span>')
        return format_html('<span style="color: orange;">⚠ Pending</span>')
    verification_status.short_description = 'Verification'

    def featured_status(self, obj):
        if obj.is_featured:
            return format_html('<span style="color: gold;">⭐ Featured</span>')
        return '—'
    featured_status.short_description = 'Featured'

    def created_date(self, obj):
        return obj.created_at.strftime('%Y-%m-%d')
    created_date.short_description = 'Created'

    # Custom Actions
    def approve_businesses(self, request, queryset):
        updated = queryset.update(is_verified=True, is_active=True)
        self.message_user(
            request, 
            f'Successfully approved {updated} business(es).',
            messages.SUCCESS
        )
    approve_businesses.short_description = "Approve selected businesses"

    def reject_businesses(self, request, queryset):
        updated = queryset.update(is_verified=False, is_active=False)
        self.message_user(
            request, 
            f'Successfully rejected {updated} business(es).',
            messages.SUCCESS
        )
    reject_businesses.short_description = "Reject selected businesses"

    def feature_businesses(self, request, queryset):
        updated = queryset.update(is_featured=True)
        self.message_user(
            request, 
            f'Successfully featured {updated} business(es).',
            messages.SUCCESS
        )
    feature_businesses.short_description = "Feature selected businesses"

    def unfeature_businesses(self, request, queryset):
        updated = queryset.update(is_featured=False)
        self.message_user(
            request, 
            f'Successfully unfeatured {updated} business(es).',
            messages.SUCCESS
        )
    unfeature_businesses.short_description = "Unfeature selected businesses"

    def send_verification_email(self, request, queryset):
        # Placeholder for email functionality
        count = queryset.count()
        self.message_user(
            request, 
            f'Verification email would be sent to {count} business(es).',
            messages.INFO
        )
    send_verification_email.short_description = "Send verification email"

    def export_business_data(self, request, queryset):
        # Placeholder for export functionality
        count = queryset.count()
        self.message_user(
            request, 
            f'Export data for {count} business(es).',
            messages.INFO
        )
    export_business_data.short_description = "Export business data"

# Enhanced Review Admin
@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = [
        'business_name', 'user_name', 'rating_display', 'comment_preview', 
        'rating', 'created_date', 'is_approved'
    ]
    list_filter = ['rating', 'created_at', 'business__category', 'business__city']
    search_fields = ['business__business_name', 'user__first_name', 'user__last_name', 'review_text']
    list_editable = ['rating']
    readonly_fields = ['created_at']
    ordering = ['-created_at']

    actions = ['approve_reviews', 'reject_reviews', 'delete_spam_reviews']

    def business_name(self, obj):
        return obj.business.business_name
    business_name.short_description = 'Business'

    def user_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}"
    user_name.short_description = 'User'

    def rating_display(self, obj):
        stars = '★' * obj.rating + '☆' * (5 - obj.rating)
        return format_html(
            '<span style="color: #FFD700;">{}</span>',
            stars
        )
    rating_display.short_description = 'Rating'

    def comment_preview(self, obj):
        if obj.review_text:
            return obj.review_text[:50] + '...' if len(obj.review_text) > 50 else obj.review_text
        return 'No comment'
    comment_preview.short_description = 'Comment'

    def created_date(self, obj):
        return obj.created_at.strftime('%Y-%m-%d')
    created_date.short_description = 'Created'

    def is_approved(self, obj):
        if obj.rating >= 3:
            return format_html('<span style="color: green;">✓ Approved</span>')
        return format_html('<span style="color: orange;">⚠ Pending</span>')
    is_approved.short_description = 'Status'

    # Custom Actions
    def approve_reviews(self, request, queryset):
        updated = queryset.update(rating=queryset.model.rating)
        self.message_user(
            request, 
            f'Successfully approved {updated} review(s).',
            messages.SUCCESS
        )
    approve_reviews.short_description = "Approve selected reviews"

    def reject_reviews(self, request, queryset):
        updated = queryset.update(rating=1)
        self.message_user(
            request, 
            f'Successfully rejected {updated} review(s).',
            messages.SUCCESS
        )
    reject_reviews.short_description = "Reject selected reviews"

    def delete_spam_reviews(self, request, queryset):
        count = queryset.count()
        queryset.delete()
        self.message_user(
            request, 
            f'Successfully deleted {count} spam review(s).',
            messages.SUCCESS
        )
    delete_spam_reviews.short_description = "Delete spam reviews"

# Enhanced Category Admin
@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'business_count', 'average_rating']
    search_fields = ['name']
    ordering = ['name']

    def business_count(self, obj):
        return obj.businesses.count()
    business_count.short_description = 'Businesses'

    def average_rating(self, obj):
        avg = obj.businesses.aggregate(Avg('rating'))['rating__avg']
        if avg:
            return f"{avg:.1f} ★"
        return 'No ratings'
    average_rating.short_description = 'Avg Rating'

# Enhanced Service Admin
@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ['name', 'business', 'price_range', 'duration', 'is_active']
    list_filter = ['is_active', 'business__category']
    search_fields = ['name', 'description', 'business__business_name']
    list_editable = ['is_active']

# Enhanced BusinessHour Admin
@admin.register(BusinessHour)
class BusinessHourAdmin(admin.ModelAdmin):
    list_display = ['business', 'day_of_week', 'open_time', 'close_time', 'is_closed']
    list_filter = ['day_of_week', 'is_closed', 'business__category']
    search_fields = ['business__business_name']

# Enhanced Product Admin
@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = [
        'name', 'business', 'price', 'price_currency', 'in_stock', 
        'is_active'
    ]
    list_filter = ['in_stock', 'is_active', 'price_currency', 'business__category']
    search_fields = ['name', 'description', 'business__business_name']
    list_editable = ['in_stock', 'is_active']
    ordering = ['-created_at']

    actions = ['mark_in_stock', 'mark_out_of_stock', 'activate_products', 'deactivate_products']

    def mark_in_stock(self, request, queryset):
        updated = queryset.update(in_stock=True)
        self.message_user(
            request, 
            f'Successfully marked {updated} product(s) as in stock.',
            messages.SUCCESS
        )
    mark_in_stock.short_description = "Mark as in stock"

    def mark_out_of_stock(self, request, queryset):
        updated = queryset.update(in_stock=False)
        self.message_user(
            request, 
            f'Successfully marked {updated} product(s) as out of stock.',
            messages.SUCCESS
        )
    mark_out_of_stock.short_description = "Mark as out of stock"

    def activate_products(self, request, queryset):
        updated = queryset.update(is_active=True)
        self.message_user(
            request, 
            f'Successfully activated {updated} product(s).',
            messages.SUCCESS
        )
    activate_products.short_description = "Activate selected products"

    def deactivate_products(self, request, queryset):
        updated = queryset.update(is_active=False)
        self.message_user(
            request, 
            f'Successfully deactivated {updated} product(s).',
            messages.SUCCESS
        )
    deactivate_products.short_description = "Deactivate selected products"

# Enhanced Favorite Admin
@admin.register(Favorite)
class FavoriteAdmin(admin.ModelAdmin):
    list_display = ['user', 'business', 'created_at']
    list_filter = ['created_at', 'business__category', 'business__city']
    search_fields = ['user__first_name', 'user__last_name', 'business__business_name']
    readonly_fields = ['created_at']
    ordering = ['-created_at']

# Custom Admin Site
class FEMAdminSite(admin.AdminSite):
    site_header = "FEM Family Business Directory Administration"
    site_title = "FEM Admin"
    index_title = "Welcome to FEM Business Directory Management"
    site_url = "/"

# Register the custom admin site
admin_site = FEMAdminSite(name='fem_admin')

# Register all models with the custom admin site
admin_site.register(Business, BusinessAdmin)
admin_site.register(Review, ReviewAdmin)
admin_site.register(Category, CategoryAdmin)
admin_site.register(Service, ServiceAdmin)
admin_site.register(BusinessHour, BusinessHourAdmin)
admin_site.register(Product, ProductAdmin)
admin_site.register(Favorite, FavoriteAdmin)
