import django_filters
from .models import Business, Category


class BusinessFilter(django_filters.FilterSet):
    """Custom filter for Business model to handle slug-based category filtering"""
    
    category = django_filters.CharFilter(method='filter_by_category_slug')
    
    class Meta:
        model = Business
        fields = ['category', 'city']
    
    def filter_by_category_slug(self, queryset, name, value):
        """Filter businesses by category slug"""
        try:
            # Try to find category by slug first
            category = Category.objects.get(slug=value)
            return queryset.filter(category=category)
        except Category.DoesNotExist:
            # If slug not found, try to find by name
            try:
                category = Category.objects.get(name__iexact=value)
                return queryset.filter(category=category)
            except Category.DoesNotExist:
                # If neither slug nor name found, return empty queryset
                return queryset.none()
