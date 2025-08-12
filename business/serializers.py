from business.models import BusinessHour, Service, Review, Business, Category, Favorite, Product
from rest_framework import serializers


class BusinessHourSerializer(serializers.ModelSerializer):
    day_of_week = serializers.ChoiceField(choices=BusinessHour.DAYS_OF_WEEK)

    class Meta:
        model = BusinessHour
        exclude = ['id', 'business']


class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        exclude = ['id', 'business']


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


class ReviewSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Review
        fields = ['id', 'user', 'rating', 'review_text', 'is_verified', 'created_at', 'updated_at']
        read_only_fields = ['is_verified', 'created_at', 'updated_at']


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug']


class BusinessSerializer(serializers.ModelSerializer):
    hours = BusinessHourSerializer(many=True, read_only=True)
    services = ServiceSerializer(many=True, read_only=True)
    products = ProductSerializer(many=True, read_only=True)
    reviews = ReviewSerializer(many=True, read_only=True)
    category = CategorySerializer(read_only=True)

    class Meta:
        model = Business
        exclude = ['user']

    def create(self, validated_data):
        try:
            request = self.context.get('request')
            user = request.user if request else None

            if not user:
                raise serializers.ValidationError("User is required to create a business")

            # Remove 'user' from validated_data if present
            validated_data.pop('user', None)

            hours_data = validated_data.pop('hours', [])
            services_data = validated_data.pop('services', [])
            products_data = validated_data.pop('products', [])
            features_data = validated_data.pop('features', [])
            photo_request = validated_data.pop('photoRequest', False)
            photo_request_notes = validated_data.pop('photoRequestNotes', '')

            # Validate required fields
            if not validated_data.get('business_name'):
                raise serializers.ValidationError("Business name is required")
            
            if not validated_data.get('category'):
                raise serializers.ValidationError("Business category is required")
            
            if not validated_data.get('address'):
                raise serializers.ValidationError("Business address is required")

            # Create the business
            business = Business.objects.create(user=user, **validated_data)

            try:
                # Create business hours
                for hour in hours_data:
                    if not isinstance(hour, dict):
                        continue
                    
                    # Validate hour data
                    day_of_week = hour.get('day_of_week')
                    is_closed = hour.get('is_closed', False)
                    
                    if day_of_week is None:
                        continue
                    
                    # Only create if not closed or if open/close times are provided
                    if not is_closed and (hour.get('open_time') and hour.get('close_time')):
                        BusinessHour.objects.create(business=business, **hour)
                    elif is_closed:
                        BusinessHour.objects.create(
                            business=business,
                            day_of_week=day_of_week,
                            is_closed=True
                        )

            except Exception as e:
                # Log the error but don't fail the entire business creation
                print(f"Error creating business hours: {str(e)}")

            try:
                # Create services from string names
                for service_name in services_data:
                    if isinstance(service_name, str) and service_name.strip():
                        Service.objects.create(
                            business=business,
                            name=service_name.strip(),
                            description=f"Service: {service_name.strip()}",
                            is_active=True
                        )

            except Exception as e:
                # Log the error but don't fail the entire business creation
                print(f"Error creating services: {str(e)}")

            try:
                # Create products
                for product in products_data:
                    if not isinstance(product, dict):
                        continue
                    
                    # Validate product data
                    name = product.get('name')
                    price = product.get('price')
                    
                    if not name or not price:
                        continue
                    
                    Product.objects.create(
                        business=business,
                        name=name.strip(),
                        description=product.get('description', '').strip(),
                        price=str(price),
                        price_currency='KES',
                        product_image_url=product.get('photo', ''),
                        is_active=True,
                        in_stock=True
                    )

            except Exception as e:
                # Log the error but don't fail the entire business creation
                print(f"Error creating products: {str(e)}")

            try:
                # Store features as a JSON field or create a separate model if needed
                if features_data and isinstance(features_data, list):
                    current_description = business.description or ""
                    features_text = f"\n\nFeatures: {', '.join([str(f).strip() for f in features_data if f])}"
                    business.description = current_description + features_text
                    business.save()

            except Exception as e:
                # Log the error but don't fail the entire business creation
                print(f"Error storing features: {str(e)}")

            # Handle professional photo request (you might want to create a separate model for this)
            if photo_request:
                # You could create a PhotoRequest model or store it in business notes
                # For now, we'll just log it
                print(f"Photo request: {photo_request}, Notes: {photo_request_notes}")

            return business

        except serializers.ValidationError:
            # Re-raise validation errors
            raise
        except Exception as e:
            # Log the error and raise a generic error
            print(f"Error creating business: {str(e)}")
            raise serializers.ValidationError(f"Failed to create business: {str(e)}")


class FavoriteSerializer(serializers.ModelSerializer):
    business = BusinessSerializer(read_only=True)

    class Meta:
        model = Favorite
        fields = ['id', 'business', 'created_at']
