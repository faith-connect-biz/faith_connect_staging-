from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.html import format_html
from django.contrib import messages
from django.db.models import Count, Q
from django.contrib.admin import SimpleListFilter
from django.utils import timezone
from datetime import timedelta

from user_auth.models import User

# Custom Filters
class UserTypeFilter(SimpleListFilter):
    title = 'User Type'
    parameter_name = 'user_type'

    def lookups(self, request, model_admin):
        return (
            ('business', 'Business Users'),
            ('customer', 'Customer Users'),
            ('admin', 'Admin Users'),
        )

    def queryset(self, request, queryset):
        if self.value() == 'business':
            return queryset.filter(user_type='business')
        if self.value() == 'customer':
            return queryset.filter(user_type='customer')
        if self.value() == 'admin':
            return queryset.filter(user_type='admin')

class VerificationFilter(SimpleListFilter):
    title = 'Verification Status'
    parameter_name = 'verification_status'

    def lookups(self, request, model_admin):
        return (
            ('verified', 'Verified'),
            ('unverified', 'Unverified'),
            ('pending', 'Pending Verification'),
        )

    def queryset(self, request, queryset):
        if self.value() == 'verified':
            return queryset.filter(is_verified=True)
        if self.value() == 'unverified':
            return queryset.filter(is_verified=False)
        if self.value() == 'pending':
            return queryset.filter(is_verified=False, is_active=True)

# Enhanced User Admin
@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = [
        'partnership_number', 'full_name', 'email', 'user_type_display', 
        'verification_status', 'business_count', 'is_verified', 'is_active', 'last_login', 'created_at'
    ]
    list_filter = [
        UserTypeFilter, VerificationFilter, 'is_active', 'is_staff', 
        'is_superuser', 'created_at', 'last_login'
    ]
    search_fields = [
        'partnership_number', 'first_name', 'last_name', 'email', 
        'phone'
    ]
    list_editable = ['is_verified', 'is_active']
    readonly_fields = ['created_at', 'last_login', 'business_count']
    ordering = ['-created_at']

    fieldsets = (
        ('Personal Information', {
            'fields': ('partnership_number', 'first_name', 'last_name', 'email', 'phone')
        }),
        ('Account Type & Status', {
            'fields': ('user_type', 'is_verified', 'is_active', 'is_staff', 'is_superuser')
        }),
        ('Security', {
            'fields': ('password',)
        }),
        ('Important Dates', {
            'fields': ('created_at', 'last_login'),
            'classes': ('collapse',)
        }),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': (
                'partnership_number', 'first_name', 'last_name', 'email', 
                'phone', 'user_type', 'password1', 'password2'
            ),
        }),
    )

    actions = [
        'verify_users', 'unverify_users', 'activate_users', 'deactivate_users',
        'send_welcome_email', 'export_user_data', 'delete_inactive_users',
        'clean_invalid_business_uuids'
    ]

    def full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}"
    full_name.short_description = 'Full Name'

    def user_type_display(self, obj):
        type_colors = {
            'business': 'blue',
            'customer': 'green',
            'admin': 'red'
        }
        color = type_colors.get(obj.user_type, 'gray')
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color, obj.get_user_type_display()
        )
    user_type_display.short_description = 'User Type'

    def verification_status(self, obj):
        if obj.is_verified:
            return format_html('<span style="color: green;">✓ Verified</span>')
        elif obj.is_active:
            return format_html('<span style="color: orange;">⚠ Pending</span>')
        else:
            return format_html('<span style="color: red;">✗ Unverified</span>')
    verification_status.short_description = 'Verification'

    def business_count(self, obj):
        if obj.user_type == 'business':
            count = obj.businesses.count()
            return format_html(
                '<span style="color: blue;">{} business(es)</span>',
                count
            )
        return '—'
    business_count.short_description = 'Businesses'

    # Custom Actions
    def verify_users(self, request, queryset):
        updated = queryset.update(is_verified=True, is_active=True)
        self.message_user(
            request, 
            f'Successfully verified {updated} user(s).',
            messages.SUCCESS
        )
    verify_users.short_description = "Verify selected users"

    def unverify_users(self, request, queryset):
        updated = queryset.update(is_verified=False)
        self.message_user(
            request, 
            f'Successfully unverified {updated} user(s).',
            messages.SUCCESS
        )
    unverify_users.short_description = "Unverify selected users"

    def activate_users(self, request, queryset):
        updated = queryset.update(is_active=True)
        self.message_user(
            request, 
            f'Successfully activated {updated} user(s).',
            messages.SUCCESS
        )
    activate_users.short_description = "Activate selected users"

    def deactivate_users(self, request, queryset):
        updated = queryset.update(is_active=False)
        self.message_user(
            request, 
            f'Successfully deactivated {updated} user(s).',
            messages.SUCCESS
        )
    deactivate_users.short_description = "Deactivate selected users"

    def send_welcome_email(self, request, queryset):
        count = queryset.count()
        self.message_user(
            request, 
            f'Welcome email would be sent to {count} user(s).',
            messages.INFO
        )
    send_welcome_email.short_description = "Send welcome email"

    def export_user_data(self, request, queryset):
        count = queryset.count()
        self.message_user(
            request, 
            f'Export data for {count} user(s).',
            messages.INFO
        )
    export_user_data.short_description = "Export user data"

    def delete_inactive_users(self, request, queryset):
        inactive_users = queryset.filter(is_active=False, created_at__lt=timezone.now() - timedelta(days=30))
        count = inactive_users.count()
        inactive_users.delete()
        self.message_user(
            request, 
            f'Successfully deleted {count} inactive user(s).',
            messages.SUCCESS
        )
    delete_inactive_users.short_description = "Delete inactive users (30+ days old)"

    def clean_invalid_business_uuids(self, request, queryset):
        from django.core import management
        try:
            management.call_command('clean_invalid_uuids', stdout=None, stderr=None)
            self.message_user(
                request,
                'Invalid UUID rows in business tables have been cleaned.',
                messages.SUCCESS
            )
        except Exception as e:
            self.message_user(
                request,
                f'Cleanup failed: {e}',
                messages.ERROR
            )
    clean_invalid_business_uuids.short_description = "Clean invalid UUID rows in business tables"

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.annotate(
            business_count=Count('businesses', distinct=True)
        )
