from django.contrib import admin
from django.contrib.admin import AdminSite
from django.urls import path
from django.shortcuts import render
from django.db.models import Count, Avg, Q
from django.utils import timezone
from datetime import datetime, timedelta
from django.http import JsonResponse

from business.models import Business, Review, Category, Product, Service, Favorite, BusinessHour
from user_auth.models import User

class FEMAdminSite(AdminSite):
    site_header = "Faith Connect Business Directory Administration"
    site_title = "FEM Admin"
    index_title = "Welcome to FEM Business Directory Management"
    site_url = "/"

    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path('dashboard/', self.admin_view(self.dashboard_view), name='dashboard'),
            path('analytics/', self.admin_view(self.analytics_view), name='analytics'),
            path('api/stats/', self.admin_view(self.stats_api), name='stats_api'),
        ]
        return custom_urls + urls

    def dashboard_view(self, request):
        """Custom dashboard with key metrics and quick actions"""
        
        # Get key statistics
        total_businesses = Business.objects.count()
        active_businesses = Business.objects.filter(is_active=True).count()
        verified_businesses = Business.objects.filter(is_verified=True).count()
        featured_businesses = Business.objects.filter(is_featured=True).count()
        
        total_users = User.objects.count()
        business_users = User.objects.filter(user_type='business').count()
        customer_users = User.objects.filter(user_type='customer').count()
        
        total_reviews = Review.objects.count()
        avg_rating = Review.objects.aggregate(Avg('rating'))['rating__avg'] or 0
        
        # Recent activity
        recent_businesses = Business.objects.order_by('-created_at')[:5]
        recent_reviews = Review.objects.order_by('-created_at')[:5]
        recent_users = User.objects.order_by('-created_at')[:5]
        
        # Pending actions
        pending_verifications = Business.objects.filter(is_verified=False, is_active=True).count()
        pending_reviews = Review.objects.filter(rating__lt=3).count()
        
        # Category distribution
        categories = Category.objects.annotate(
            business_count=Count('businesses')
        ).order_by('-business_count')[:10]
        
        context = {
            'title': 'FEM Business Directory Dashboard',
            'total_businesses': total_businesses,
            'active_businesses': active_businesses,
            'verified_businesses': verified_businesses,
            'featured_businesses': featured_businesses,
            'total_users': total_users,
            'business_users': business_users,
            'customer_users': customer_users,
            'total_reviews': total_reviews,
            'avg_rating': round(avg_rating, 1),
            'recent_businesses': recent_businesses,
            'recent_reviews': recent_reviews,
            'recent_users': recent_users,
            'pending_verifications': pending_verifications,
            'pending_reviews': pending_reviews,
            'categories': categories,
            'opts': Business._meta,
        }
        
        return render(request, 'admin/dashboard.html', context)

    def analytics_view(self, request):
        """Detailed analytics view with charts and trends"""
        
        # Time-based data for charts
        today = timezone.now().date()
        last_30_days = today - timedelta(days=30)
        last_7_days = today - timedelta(days=7)
        
        # Business growth over time
        business_growth = []
        for i in range(30):
            date = last_30_days + timedelta(days=i)
            count = Business.objects.filter(created_at__date=date).count()
            business_growth.append({
                'date': date.strftime('%Y-%m-%d'),
                'count': count
            })
        
        # Review trends
        review_trends = []
        for i in range(7):
            date = last_7_days + timedelta(days=i)
            count = Review.objects.filter(created_at__date=date).count()
            avg_rating = Review.objects.filter(created_at__date=date).aggregate(Avg('rating'))['rating__avg'] or 0
            review_trends.append({
                'date': date.strftime('%Y-%m-%d'),
                'count': count,
                'avg_rating': round(avg_rating, 1)
            })
        
        # Top performing categories
        top_categories = Category.objects.annotate(
            business_count=Count('businesses'),
            avg_rating=Avg('businesses__rating')
        ).filter(business_count__gt=0).order_by('-avg_rating')[:10]
        
        # Top rated businesses
        top_businesses = Business.objects.filter(
            rating__isnull=False, 
            review_count__gte=5
        ).order_by('-rating')[:10]
        
        context = {
            'title': 'Analytics & Insights',
            'business_growth': business_growth,
            'review_trends': review_trends,
            'top_categories': top_categories,
            'top_businesses': top_businesses,
            'opts': Business._meta,
        }
        
        return render(request, 'admin/analytics.html', context)

    def stats_api(self, request):
        """API endpoint for real-time statistics"""
        
        # Real-time stats
        stats = {
            'total_businesses': Business.objects.count(),
            'active_businesses': Business.objects.filter(is_active=True).count(),
            'total_users': User.objects.count(),
            'total_reviews': Review.objects.count(),
            'avg_rating': round(Review.objects.aggregate(Avg('rating'))['rating__avg'] or 0, 1),
            'pending_verifications': Business.objects.filter(is_verified=False, is_active=True).count(),
            'featured_businesses': Business.objects.filter(is_featured=True).count(),
        }
        
        return JsonResponse(stats)

# Create the custom admin site instance
admin_site = FEMAdminSite(name='fem_admin')

# Register all models with enhanced admin classes
from business.admin import (
    BusinessAdmin, ReviewAdmin, CategoryAdmin, ServiceAdmin, 
    BusinessHourAdmin, ProductAdmin, FavoriteAdmin
)
from user_auth.admin import UserAdmin
from business.models import BusinessHour

admin_site.register(Business, BusinessAdmin)
admin_site.register(Review, ReviewAdmin)
admin_site.register(Category, CategoryAdmin)
admin_site.register(Service, ServiceAdmin)
admin_site.register(BusinessHour, BusinessHourAdmin)
admin_site.register(Product, ProductAdmin)
admin_site.register(Favorite, FavoriteAdmin)
admin_site.register(User, UserAdmin) 