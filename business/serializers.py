from rest_framework import serializers
from .models import (
    Business, Category, Favorite, Product, Review, BusinessHour, 
    PhotoRequest, BusinessLike, ReviewLike, Service, ServiceReview, ProductReview
)
from .utils import validate_and_clean_image_url, convert_cloudfront_to_s3_url



class BusinessHourSerializer(serializers.ModelSerializer):
    day_of_week = serializers.ChoiceField(choices=BusinessHour.DAYS_OF_WEEK)

    class Meta:
        model = BusinessHour
        exclude = ['id', 'business']


class ServiceSerializer(serializers.ModelSerializer):
    business = serializers.SerializerMethodField()
    service_image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Service
        fields = [
            'id', 'business', 'name', 'description', 'price_range', 'duration',
            'service_image_url', 'images', 'is_active', 'created_at'
        ]
        read_only_fields = ['id', 'business', 'created_at']
    
    def get_business(self, obj):
        """Return business information"""
        if obj.business:
            return {
                'id': str(obj.business.id),
                'business_name': obj.business.business_name,
                'category': obj.business.category.name if obj.business.category else None,
                'city': obj.business.city,
                'county': obj.business.county
            }
        return None
    
    def get_service_image_url(self, obj):
        """Get service image URL with fallback"""
        if obj.service_image_url:
            # Try to convert CloudFront to S3 if needed
            url = convert_cloudfront_to_s3_url(obj.service_image_url)
            return validate_and_clean_image_url(url, 'service')
        return validate_and_clean_image_url(None, 'service')

class ProductSerializer(serializers.ModelSerializer):
    business = serializers.SerializerMethodField()
    product_image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = [
            'id', 'business', 'name', 'description', 'price', 'price_currency',
            'product_image_url', 'images', 'in_stock', 'is_active', 'created_at'
        ]
        read_only_fields = ['id', 'business', 'created_at']
    
    def get_business(self, obj):
        """Return business information"""
        if obj.business:
            return {
                'id': str(obj.business.id),
                'business_name': obj.business.business_name,
                'category': obj.business.category.name if obj.business.category else None,
                'city': obj.business.city,
                'county': obj.business.county
            }
        return None
    
    def get_product_image_url(self, obj):
        """Get product image URL with fallback"""
        if obj.product_image_url:
            # Try to convert CloudFront to S3 if needed
            url = convert_cloudfront_to_s3_url(obj.product_image_url)
            return validate_and_clean_image_url(url, 'product')
        return validate_and_clean_image_url(None, 'product')


class ReviewSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Review
        fields = ['id', 'user', 'rating', 'review_text', 'is_verified', 'created_at', 'updated_at']
        read_only_fields = ['is_verified', 'created_at', 'updated_at']
    
    def validate(self, data):
        """
        Custom validation to check for duplicate reviews
        Business owner validation is handled at the view level
        """
        # Get business_id from the context (passed from the view)
        business_id = self.context.get('business_id')
        if not business_id:
            raise serializers.ValidationError("Business ID is required.")
        
        # Check if business exists
        try:
            from .models import Business
            business = Business.objects.get(id=business_id)
        except Business.DoesNotExist:
            raise serializers.ValidationError("Business not found.")
        
        # Check for existing review (this is now protected by database unique constraint)
        # but we keep the check for better user experience
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            # For updates, exclude the current instance
            instance = self.instance
            existing_reviews = Review.objects.filter(business_id=business_id, user=request.user)
            if instance:
                existing_reviews = existing_reviews.exclude(pk=instance.pk)
            
            if existing_reviews.exists():
                raise serializers.ValidationError("You have already reviewed this business.")
        
        return data


class ServiceReviewSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = ServiceReview
        fields = ['id', 'user', 'rating', 'review_text', 'is_verified', 'created_at', 'updated_at']
        read_only_fields = ['is_verified', 'created_at', 'updated_at']
    
    def validate(self, data):
        """
        Custom validation to check for duplicate reviews
        Business owner validation is handled at the view level
        """
        # Get service_id from the context (passed from the view)
        service_id = self.context.get('service_id')
        if not service_id:
            raise serializers.ValidationError("Service ID is required.")
        
        # Check if service exists
        try:
            from .models import Service
            service = Service.objects.get(id=service_id)
        except Service.DoesNotExist:
            raise serializers.ValidationError("Service not found.")
        
        # Check for existing review
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            # For updates, exclude the current instance
            instance = self.instance
            existing_reviews = ServiceReview.objects.filter(service_id=service_id, user=request.user)
            if instance:
                existing_reviews = existing_reviews.exclude(pk=instance.pk)
            
            if existing_reviews.exists():
                raise serializers.ValidationError("You have already reviewed this service.")
        
        return data


class ProductReviewSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = ProductReview
        fields = ['id', 'user', 'rating', 'review_text', 'is_verified', 'created_at', 'updated_at']
        read_only_fields = ['is_verified', 'created_at', 'updated_at']
    
    def validate(self, data):
        """
        Custom validation to check for duplicate reviews
        Business owner validation is handled at the view level
        """
        # Get product_id from the context (passed from the view)
        product_id = self.context.get('product_id')
        if not product_id:
            raise serializers.ValidationError("Product ID is required.")
        
        # Check if product exists
        try:
            from .models import Product
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            raise serializers.ValidationError("Product not found.")
        
        # Check for existing review
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            # For updates, exclude the current instance
            instance = self.instance
            existing_reviews = ProductReview.objects.filter(product_id=product_id, user=request.user)
            if instance:
                existing_reviews = existing_reviews.exclude(pk=instance.pk)
            
            if existing_reviews.exists():
                raise serializers.ValidationError("You have already reviewed this product.")
        
        return data


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug']


class BusinessSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    category_id = serializers.IntegerField(write_only=True, required=True)
    user = serializers.SerializerMethodField()
    business_image_url = serializers.SerializerMethodField()
    business_logo_url = serializers.SerializerMethodField()
    hours = BusinessHourSerializer(many=True, read_only=True)
    services = ServiceSerializer(many=True, read_only=True)
    products = ProductSerializer(many=True, read_only=True)
    reviews = ReviewSerializer(many=True, read_only=True)
    
    class Meta:
        model = Business
        fields = [
            'id', 'user', 'business_name', 'category', 'category_id', 'description', 'long_description',
            'phone', 'email', 'website', 'address', 'city', 'county', 'state', 'zip_code',
            'latitude', 'longitude', 'rating', 'review_count', 'is_verified', 'is_featured',
            'is_active', 'business_image_url', 'business_logo_url', 'facebook_url',
            'instagram_url', 'twitter_url', 'youtube_url', 'created_at', 'updated_at',
            'hours', 'services', 'products', 'reviews'
        ]
        read_only_fields = ['id', 'rating', 'created_at', 'updated_at', 'user']
    
    def get_user(self, obj):
        """Return user information for the business"""
        if obj.user:
            return {
                'id': obj.user.id,
                'first_name': obj.user.first_name,
                'last_name': obj.user.last_name,
                'email': obj.user.email,
                'phone': obj.user.phone,
                'partnership_number': getattr(obj.user, 'partnership_number', None)
            }
        return None

    def get_business_image_url(self, obj):
        """Get business image URL with fallback"""
        if obj.business_image_url:
            # Try to convert CloudFront to S3 if needed
            url = convert_cloudfront_to_s3_url(obj.business_image_url)
            return validate_and_clean_image_url(url, 'business')
        return validate_and_clean_image_url(None, 'business')
    
    def get_business_logo_url(self, obj):
        """Get business logo URL with fallback"""
        if obj.business_logo_url:
            # Try to convert CloudFront to S3 if needed
            url = convert_cloudfront_to_s3_url(obj.business_logo_url)
            return validate_and_clean_image_url(url, 'logo')
        return validate_and_clean_image_url(None, 'logo')

    def create(self, validated_data):
        try:
            request = self.context.get('request')
            user = request.user if request else None

            if not user:
                raise serializers.ValidationError("User is required to create a business")

            # Remove 'user' from validated_data if present
            validated_data.pop('user', None)

            # Extract category_id and look up the Category object
            category_id = validated_data.pop('category_id', None)
            if category_id is None:
                raise serializers.ValidationError("Business category is required")
            
            try:
                category = Category.objects.get(id=category_id)
            except Category.DoesNotExist:
                available_categories = Category.objects.values_list('name', flat=True)
                raise serializers.ValidationError(
                    f"Category with ID {category_id} not found. Available categories: {', '.join(available_categories)}"
                )

            hours_data = validated_data.pop('hours', [])
            services_data = validated_data.pop('services', [])
            products_data = validated_data.pop('products', [])
            features_data = validated_data.pop('features', [])
            photo_request = validated_data.pop('photoRequest', False)
            photo_request_notes = validated_data.pop('photoRequestNotes', '')

            # Validate required fields
            if not validated_data.get('business_name'):
                raise serializers.ValidationError("Business name is required")
            
            if not validated_data.get('address'):
                raise serializers.ValidationError("Business address is required")

            # Create the business with the category
            business = Business.objects.create(user=user, category=category, **validated_data)

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
                # Create services from service objects
                for service_data in services_data:
                    if isinstance(service_data, dict):
                        name = service_data.get('name', '').strip()
                        if name:
                            Service.objects.create(
                                business=business,
                                name=name,
                                description=service_data.get('description', f"Service: {name}"),
                                price_range=service_data.get('price_range', ''),
                                duration=service_data.get('duration', ''),
                                service_image_url=service_data.get('photo', ''),
                                is_active=service_data.get('is_available', True)
                            )
                    elif isinstance(service_data, str) and service_data.strip():
                        # Handle legacy string format
                        Service.objects.create(
                            business=business,
                            name=service_data.strip(),
                            description=f"Service: {service_data.strip()}",
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
                        is_active=product.get('is_available', True),
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

    def update(self, instance, validated_data):
        try:
            # Extract category_id and look up the Category object if provided
            category_id = validated_data.pop('category_id', None)
            if category_id is not None:
                try:
                    category = Category.objects.get(id=category_id)
                    instance.category = category
                except Category.DoesNotExist:
                    available_categories = Category.objects.values_list('name', flat=True)
                    raise serializers.ValidationError(
                        f"Category with ID {category_id} not found. Available categories: {', '.join(available_categories)}"
                    )

            # Update other fields
            for attr, value in validated_data.items():
                setattr(instance, attr, value)

            instance.save()
            return instance

        except serializers.ValidationError:
            # Re-raise validation errors
            raise
        except Exception as e:
            # Log the error and raise a generic error
            print(f"Error updating business: {str(e)}")
            raise serializers.ValidationError(f"Failed to update business: {str(e)}")


class FavoriteSerializer(serializers.ModelSerializer):
    business = BusinessSerializer(read_only=True)

    class Meta:
        model = Favorite
        fields = ['id', 'business', 'created_at']


class PhotoRequestSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()
    business_name = serializers.SerializerMethodField()
    
    class Meta:
        model = PhotoRequest
        fields = [
            'id', 'business', 'user', 'user_name', 'business_name',
            'request_date', 'status', 'notes', 'business_response', 'completed_date'
        ]
        read_only_fields = ['id', 'request_date', 'business_response', 'completed_date']
    
    def get_user_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}"
    
    def get_business_name(self, obj):
        return obj.business.business_name
    
    def create(self, validated_data):
        # Ensure the user can only create one photo request per business
        user = self.context['request'].user
        business = validated_data['business']
        
        # Check if a photo request already exists
        existing_request = PhotoRequest.objects.filter(user=user, business=business).first()
        if existing_request:
            raise serializers.ValidationError("You have already submitted a photo request for this business.")
        
        validated_data['user'] = user
        return super().create(validated_data)


class BusinessLikeSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()
    business_name = serializers.SerializerMethodField()
    
    class Meta:
        model = BusinessLike
        fields = ['id', 'user', 'business', 'user_name', 'business_name', 'created_at']
        read_only_fields = ['id', 'created_at']
    
    def get_user_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}"
    
    def get_business_name(self, obj):
        return obj.business.business_name
    
    def validate(self, data):
        user = self.context['request'].user
        business = data['business']
        
        # Prevent users from liking their own business
        if user == business.user:
            raise serializers.ValidationError("You cannot like your own business.")
        
        return data


class ReviewLikeSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()
    review_text = serializers.SerializerMethodField()
    
    class Meta:
        model = ReviewLike
        fields = ['id', 'user', 'review', 'user_name', 'review_text', 'created_at']
        read_only_fields = ['id', 'created_at']
    
    def get_user_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}"
    
    def get_review_text(self, obj):
        return obj.review.review_text[:100] + "..." if obj.review.review_text and len(obj.review.review_text) > 100 else obj.review.review_text
    
    def validate(self, data):
        user = self.context['request'].user
        review = data['review']
        
        # Prevent users from liking their own reviews
        if user == review.user:
            raise serializers.ValidationError("You cannot like your own review.")
        
        return data
