from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.core.management import call_command
from business.models import Category, Business, Service, Product, BusinessHour, Review, Favorite
from django.utils.text import slugify
import random
from decimal import Decimal
import uuid
import os

User = get_user_model()

class Command(BaseCommand):
    help = 'Seed Railway production database with comprehensive test data'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear all existing data before seeding'
        )
        parser.add_argument(
            '--users',
            type=int,
            default=10,
            help='Number of users to create (default: 10)'
        )
        parser.add_argument(
            '--businesses',
            type=int,
            default=15,
            help='Number of businesses to create (default: 15)'
        )
        parser.add_argument(
            '--services-per-business',
            type=int,
            default=3,
            help='Number of services per business (default: 3)'
        )
        parser.add_argument(
            '--products-per-business',
            type=int,
            default=2,
            help='Number of products per business (default: 2)'
        )
        parser.add_argument(
            '--reviews-per-business',
            type=int,
            default=5,
            help='Number of reviews per business (default: 5)'
        )
        parser.add_argument(
            '--categories-only',
            action='store_true',
            help='Only seed categories (for initial setup)'
        )

    def handle(self, *args, **options):
        self.stdout.write(
            self.style.SUCCESS('🚀 Starting Railway Database Seeding...')
        )
        
        # Check if we're in production
        if os.environ.get('DJANGO_SETTINGS_MODULE') == 'core.settings.prod':
            self.stdout.write(
                self.style.WARNING('⚠️  Running in PRODUCTION mode!')
            )
            confirm = input('Are you sure you want to continue? (yes/no): ')
            if confirm.lower() != 'yes':
                self.stdout.write(
                    self.style.ERROR('Seeding cancelled.')
                )
                return

        if options['categories_only']:
            self.seed_categories()
            return

        if options['clear']:
            self.clear_existing_data()

        # Seed data
        self.seed_categories()
        users = self.seed_users(options['users'])
        businesses = self.seed_businesses(options['businesses'], users)
        self.seed_services(businesses, options['services_per_business'])
        self.seed_products(businesses, options['products_per_business'])
        self.seed_reviews(businesses, users, options['reviews_per_business'])
        self.seed_business_hours(businesses)
        self.seed_favorites(businesses, users)

        self.stdout.write(
            self.style.SUCCESS('✅ Railway Database Seeding Complete!')
        )

    def clear_existing_data(self):
        """Clear all existing data"""
        self.stdout.write('🗑️  Clearing existing data...')
        
        Favorite.objects.all().delete()
        Review.objects.all().delete()
        BusinessHour.objects.all().delete()
        Product.objects.all().delete()
        Service.objects.all().delete()
        Business.objects.all().delete()
        User.objects.filter(is_superuser=False).delete()
        
        self.stdout.write('✅ Existing data cleared')

    def seed_categories(self):
        """Seed business categories"""
        self.stdout.write('📂 Seeding business categories...')
        
        categories_data = [
            {'name': 'Technology & IT', 'slug': 'technology-it', 'description': 'Software, hardware, and IT services'},
            {'name': 'Health & Wellness', 'slug': 'health-wellness', 'description': 'Medical, fitness, and wellness services'},
            {'name': 'Food & Beverage', 'slug': 'food-beverage', 'description': 'Restaurants, cafes, and food services'},
            {'name': 'Professional Services', 'slug': 'professional-services', 'description': 'Legal, accounting, and consulting'},
            {'name': 'Home & Garden', 'slug': 'home-garden', 'description': 'Home improvement and gardening services'},
            {'name': 'Automotive', 'slug': 'automotive', 'description': 'Car repair, maintenance, and sales'},
            {'name': 'Education & Training', 'slug': 'education-training', 'description': 'Schools, training, and tutoring'},
            {'name': 'Beauty & Personal Care', 'slug': 'beauty-personal-care', 'description': 'Salons, spas, and beauty services'},
            {'name': 'Financial Services', 'slug': 'financial-services', 'description': 'Banking, insurance, and investment'},
            {'name': 'Real Estate', 'slug': 'real-estate', 'description': 'Property sales, rentals, and management'},
            {'name': 'Retail & Shopping', 'slug': 'retail-shopping', 'description': 'Stores, boutiques, and online shops'},
            {'name': 'Entertainment', 'slug': 'entertainment', 'description': 'Events, media, and entertainment services'},
            {'name': 'Transportation', 'slug': 'transportation', 'description': 'Delivery, logistics, and transport'},
            {'name': 'Construction', 'slug': 'construction', 'description': 'Building, renovation, and construction'},
            {'name': 'Manufacturing', 'slug': 'manufacturing', 'description': 'Production and manufacturing services'}
        ]

        created_categories = []
        for cat_data in categories_data:
            category, created = Category.objects.get_or_create(
                slug=cat_data['slug'],
                defaults=cat_data
            )
            if created:
                self.stdout.write(f'  ✅ Created category: {category.name}')
            created_categories.append(category)

        self.stdout.write(f'✅ Categories seeded: {len(created_categories)}')
        return created_categories

    def seed_users(self, count):
        """Seed users"""
        self.stdout.write(f'👥 Seeding {count} users...')
        
        users = []
        for i in range(count):
            user_data = {
                'partnership_number': f'USER{i+1:03d}',
                'first_name': f'User{i+1}',
                'last_name': f'Test{i+1}',
                'email': f'user{i+1}@test.com',
                'phone': f'+254700{i+1:06d}',
                'is_active': True,
                'user_type': 'business' if i < count * 0.7 else 'individual'
            }
            
            user, created = User.objects.get_or_create(
                partnership_number=user_data['partnership_number'],
                defaults=user_data
            )
            
            if created:
                user.set_password('testpass123')
                user.save()
                self.stdout.write(f'  ✅ Created user: {user.partnership_number}')
            
            users.append(user)

        self.stdout.write(f'✅ Users seeded: {len(users)}')
        return users

    def seed_businesses(self, count, users):
        """Seed businesses"""
        self.stdout.write(f'🏢 Seeding {count} businesses...')
        
        categories = Category.objects.all()
        business_names = [
            'Tech Solutions Pro', 'Health First Clinic', 'Gourmet Delights', 'Legal Eagles',
            'Home Sweet Home', 'Auto Care Plus', 'Learning Hub', 'Beauty Bliss',
            'Financial Freedom', 'Property Partners', 'Retail Revolution', 'Entertainment Express',
            'Swift Delivery', 'Build Right Construction', 'Quality Manufacturing'
        ]
        
        businesses = []
        for i in range(count):
            user = users[i % len(users)]
            category = categories[i % len(categories)]
            
            business_data = {
                'user': user,
                'business_name': business_names[i % len(business_names)] + f' {i+1}',
                'description': f'Professional {category.name.lower()} services with quality and reliability.',
                'category': category,
                'address': f'{random.randint(100, 999)} Main Street',
                'city': f'City {i+1}',
                'county': f'County {i+1}',
                'phone': f'+254700{i+1:06d}',
                'email': f'business{i+1}@test.com',
                'website': f'https://business{i+1}.com' if i % 3 != 0 else '',  # Some without websites
                'business_image_url': f'https://picsum.photos/400/300?random={i+1}',
                'business_logo_url': f'https://picsum.photos/200/200?random={i+1}',
                'is_active': True,
                'is_verified': i < count * 0.8,  # 80% verified
                'is_featured': i < count * 0.3,  # 30% featured
                'rating': round(random.uniform(3.0, 5.0), 1),
                'review_count': random.randint(0, 20)
            }
            
            business, created = Business.objects.get_or_create(
                business_name=business_data['business_name'],
                defaults=business_data
            )
            
            if created:
                self.stdout.write(f'  ✅ Created business: {business.business_name}')
            
            businesses.append(business)

        self.stdout.write(f'✅ Businesses seeded: {len(businesses)}')
        return businesses

    def seed_services(self, businesses, services_per_business):
        """Seed services for businesses"""
        self.stdout.write(f'🔧 Seeding services ({services_per_business} per business)...')
        
        service_names = [
            'Consultation', 'Installation', 'Maintenance', 'Repair', 'Training',
            'Design', 'Development', 'Support', 'Analysis', 'Implementation',
            'Testing', 'Deployment', 'Monitoring', 'Optimization', 'Consulting'
        ]
        
        total_services = 0
        for business in businesses:
            for i in range(services_per_business):
                service_data = {
                    'business': business,
                    'name': f"{service_names[i % len(service_names)]} Service",
                    'description': f'Professional {service_names[i % len(service_names)].lower()} for {business.business_name}',
                    'price': Decimal(random.uniform(50, 500)).quantize(Decimal('0.01')),
                    'is_active': True,
                    'service_image_url': f'https://picsum.photos/300/200?random={total_services + i}'
                }
                
                service, created = Service.objects.get_or_create(
                    business=business,
                    name=service_data['name'],
                    defaults=service_data
                )
                
                if created:
                    total_services += 1

        self.stdout.write(f'✅ Services seeded: {total_services}')

    def seed_products(self, businesses, products_per_business):
        """Seed products for businesses"""
        self.stdout.write(f'📦 Seeding products ({products_per_business} per business)...')
        
        product_names = [
            'Premium Package', 'Standard Kit', 'Professional Tool', 'Basic Set',
            'Advanced Solution', 'Essential Bundle', 'Complete System', 'Starter Pack'
        ]
        
        total_products = 0
        for business in businesses:
            for i in range(products_per_business):
                product_data = {
                    'business': business,
                    'name': f"{product_names[i % len(product_names)]} {i+1}",
                    'description': f'High-quality {product_names[i % len(product_names)].lower()} from {business.business_name}',
                    'price': Decimal(random.uniform(25, 300)).quantize(Decimal('0.01')),
                    'is_active': True,
                    'product_image_url': f'https://picsum.photos/300/200?random={total_products + i}'
                }
                
                product, created = Product.objects.get_or_create(
                    business=business,
                    name=product_data['name'],
                    defaults=product_data
                )
                
                if created:
                    total_products += 1

        self.stdout.write(f'✅ Products seeded: {total_products}')

    def seed_reviews(self, businesses, users, reviews_per_business):
        """Seed reviews for businesses"""
        self.stdout.write(f'⭐ Seeding reviews ({reviews_per_business} per business)...')
        
        review_texts = [
            'Excellent service and very professional!',
            'Great quality work, highly recommended.',
            'Very satisfied with the results.',
            'Professional and reliable service.',
            'Good value for money.',
            'Would definitely use again.',
            'Prompt and efficient service.',
            'Quality workmanship and attention to detail.',
            'Friendly staff and great communication.',
            'Exceeded my expectations!'
        ]
        
        total_reviews = 0
        for business in businesses:
            for i in range(reviews_per_business):
                user = users[random.randint(0, len(users) - 1)]
                review_data = {
                    'business': business,
                    'user': user.partnership_number,
                    'rating': random.randint(3, 5),
                    'review_text': review_texts[i % len(review_texts)],
                    'is_approved': True
                }
                
                review, created = Review.objects.get_or_create(
                    business=business,
                    user=user.partnership_number,
                    defaults=review_data
                )
                
                if created:
                    total_reviews += 1

        self.stdout.write(f'✅ Reviews seeded: {total_reviews}')

    def seed_business_hours(self, businesses):
        """Seed business hours"""
        self.stdout.write('🕒 Seeding business hours...')
        
        days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
        
        total_hours = 0
        for business in businesses:
            for day in days:
                if day in ['saturday', 'sunday']:
                    # Weekend hours
                    hours_data = {
                        'business': business,
                        'day': day,
                        'open_time': '09:00:00',
                        'close_time': '17:00:00',
                        'is_closed': random.choice([True, False])
                    }
                else:
                    # Weekday hours
                    hours_data = {
                        'business': business,
                        'day': day,
                        'open_time': '08:00:00',
                        'close_time': '18:00:00',
                        'is_closed': False
                    }
                
                hours, created = BusinessHour.objects.get_or_create(
                    business=business,
                    day=day,
                    defaults=hours_data
                )
                
                if created:
                    total_hours += 1

        self.stdout.write(f'✅ Business hours seeded: {total_hours}')

    def seed_favorites(self, businesses, users):
        """Seed favorites"""
        self.stdout.write('❤️ Seeding favorites...')
        
        total_favorites = 0
        for user in users:
            # Each user favorites 2-5 random businesses
            num_favorites = random.randint(2, 5)
            favorite_businesses = random.sample(businesses, min(num_favorites, len(businesses)))
            
            for business in favorite_businesses:
                favorite, created = Favorite.objects.get_or_create(
                    user=user.partnership_number,
                    business=business
                )
                
                if created:
                    total_favorites += 1

        self.stdout.write(f'✅ Favorites seeded: {total_favorites}')
