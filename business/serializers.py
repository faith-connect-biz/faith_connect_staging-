from business.models import BusinessHour, Service, Review, Business, Category

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
    class Meta:
        model = Review
        exclude = ['id', 'business', 'user']


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



