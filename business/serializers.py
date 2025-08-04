from business.models import BusinessHour, Service, Review, Business, Category, Favorite, Product

from rest_framework import serializers

from rest_framework import serializers
from .models import BusinessHour

class BusinessHourSerializer(serializers.ModelSerializer):
    day_of_week = serializers.ChoiceField(choices=BusinessHour.DAYS_OF_WEEK)

    class Meta:
        model = BusinessHour
        exclude = ['id', 'business']


class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        exclude = ['id', 'business']


class ReviewSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Review
        fields = ['id', 'user', 'rating', 'review_text', 'is_verified', 'created_at', 'updated_at']
        read_only_fields = ['is_verified', 'created_at', 'updated_at']

class BusinessSerializer(serializers.ModelSerializer):
    hours = BusinessHourSerializer(many=True)  # 👈 match related_name
    services = ServiceSerializer(many=True)
    reviews = ReviewSerializer(many=True, read_only=True)

    class Meta:
        model = Business
        exclude = ['user']

    def create(self, validated_data):
        request = self.context.get('request')
        user = request.user if request else None

        # Remove 'user' from validated_data if present
        validated_data.pop('user', None)

        hours_data = validated_data.pop('hours', [])
        services_data = validated_data.pop('services', [])

        business = Business.objects.create(user=user, **validated_data)

        for hour in hours_data:
            BusinessHour.objects.create(business=business, **hour)

        for service in services_data:
            Service.objects.create(business=business, **service)

        return business

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug']



class FavoriteSerializer(serializers.ModelSerializer):
    business = BusinessSerializer(read_only=True)

    class Meta:
        model = Favorite
        fields = ['id', 'business', 'created_at']


class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = [
            'id',
            'business',
            'name',
            'description',
            'price',
            'price_currency',
            'product_image_url',
            'is_active',
            'in_stock',
            'created_at'
        ]
        read_only_fields = ['id', 'created_at']



