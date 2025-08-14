from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.core.management import call_command
from business.models import Category, Business, Service, Product, BusinessHour, Review, Favorite
from django.utils.text import slugify
import random
from decimal import Decimal
import uuid

User = get_user_model()

class Command(BaseCommand):
    help = 'Seed local development database with sample data'

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
            help='Number of sample users to create (default: 10)'
        )
        parser.add_argument(
            '--businesses',
            type=int,
            default=20,
            help='Number of sample businesses to create (default: 20)'
        )
        parser.add_argument(
            '--categories-only',
            action='store_true',
            help='Only seed categories'
        )

    def handle(self, *args, **options):
        self.stdout.write(
            self.style.SUCCESS('🌱 FEM Family Business Directory - Local Data Seeding')
        )
        self.stdout.write('=' * 70)
        
        clear_data = options['clear']
        num_users = options['users']
        num_businesses = options['businesses']
        categories_only = options['categories_only']
        
        if clear_data:
            self.stdout.write('🗑️  Clearing existing data...')
            self.clear_all_data()
        
        # Always seed categories first
        self.stdout.write('📂 Seeding business categories...')
        self.seed_categories()
        
        if categories_only:
            self.stdout.write(self.style.SUCCESS('✅ Categories seeded successfully!'))
            return
        
        # Seed users
        self.stdout.write(f'👥 Creating {num_users} sample users...')
        users = self.seed_users(num_users)
        
        # Seed businesses
        self.stdout.write(f'🏢 Creating {num_businesses} sample businesses...')
        businesses = self.seed_businesses(num_businesses, users)
        
        # Seed services and products
        self.stdout.write('🛍️  Creating sample services and products...')
        self.seed_services_and_products(businesses)
        
        # Seed business hours
        self.stdout.write('🕐 Creating sample business hours...')
        self.seed_business_hours(businesses)
        
        # Seed reviews
        self.stdout.write('⭐ Creating sample reviews...')
        self.seed_reviews(businesses, users)
        
        # Seed favorites
        self.stdout.write('❤️  Creating sample favorites...')
        self.seed_favorites(businesses, users)
        
        self.stdout.write(self.style.SUCCESS('\n🎉 Local data seeding completed successfully!'))
        self.stdout.write(f'📊 Created: {len(users)} users, {len(businesses)} businesses')

    def clear_all_data(self):
        """Clear all existing data"""
        Favorite.objects.all().delete()
        Review.objects.all().delete()
        BusinessHour.objects.all().delete()
        Product.objects.all().delete()
        Service.objects.all().delete()
        Business.objects.all().delete()
        User.objects.all().delete()
        Category.objects.all().delete()
        self.stdout.write('✅ All data cleared')

    def seed_categories(self):
        """Seed business categories"""
        categories_data = [
            "Restaurant & Food",
            "Retail & Shopping",
            "Health & Wellness",
            "Automotive Services",
            "Real Estate",
            "Education & Training",
            "Technology & IT",
            "Beauty & Personal Care",
            "Home & Garden",
            "Legal Services",
            "Financial Services",
            "Entertainment",
            "Professional Services",
            "Construction",
            "Transportation",
            "Non-Profit",
            "Fitness & Sports",
            "Art & Culture",
            "Travel & Tourism",
            "Pet Services"
        ]
        
        for name in categories_data:
            Category.objects.get_or_create(
                name=name,
                defaults={'slug': slugify(name)}
            )
        
        self.stdout.write(f'✅ Created {len(categories_data)} categories')

    def seed_users(self, num_users):
        """Create sample users"""
        users = []
        user_types = ['community', 'business']
        
        for i in range(num_users):
            user_type = random.choice(user_types)
            user = User.objects.create_user(
                partnership_number=f'USER{i+1:03d}',
                password='password123',
                first_name=f'User{i+1}',
                last_name=f'LastName{i+1}',
                email=f'user{i+1}@example.com',
                phone=f'+254700{i+1:06d}',
                user_type=user_type,
                is_active=True,
                is_verified=True,
                email_verified=True,
                phone_verified=True
            )
            users.append(user)
        
        self.stdout.write(f'✅ Created {len(users)} users')
        return users

    def seed_businesses(self, num_businesses, users):
        """Create sample businesses"""
        businesses = []
        categories = list(Category.objects.all())
        business_names = [
            "Sunrise Cafe", "Tech Solutions Pro", "Green Gardens", "Health First Clinic",
            "Auto Care Plus", "Dream Homes Realty", "Learning Center", "Beauty Salon Elite",
            "Home Improvement Co", "Legal Associates", "Financial Partners", "Entertainment Hub",
            "Professional Services Inc", "Build Right Construction", "Quick Transport",
            "Community Foundation", "Fitness Zone", "Art Gallery", "Travel Adventures", "Pet Care Plus"
        ]
        
        for i in range(num_businesses):
            user = random.choice(users)
            category = random.choice(categories)
            business_name = business_names[i % len(business_names)]
            
            business = Business.objects.create(
                user=user,
                business_name=f"{business_name} {i+1}",
                category=category,
                description=f"Sample business description for {business_name}",
                long_description=f"This is a comprehensive description of {business_name}. We provide excellent services to our community.",
                phone=f"+254700{i+1:06d}",
                email=f"business{i+1}@example.com",
                website=f"https://www.{slugify(business_name)}.com",
                address=f"Sample Address {i+1}, Nairobi",
                city="Nairobi",
                county="Nairobi",
                state="Nairobi",
                zip_code=f"00100",
                latitude=Decimal('-1.2921') + Decimal(str(random.uniform(-0.01, 0.01))),
                longitude=Decimal('36.8219') + Decimal(str(random.uniform(-0.01, 0.01))),
                rating=Decimal(str(random.uniform(3.0, 5.0))).quantize(Decimal('0.1')),
                review_count=random.randint(0, 50),
                is_verified=random.choice([True, False]),
                is_featured=random.choice([True, False]),
                is_active=True
            )
            businesses.append(business)
        
        self.stdout.write(f'✅ Created {len(businesses)} businesses')
        return businesses

    def seed_services_and_products(self, businesses):
        """Create sample services and products"""
        services_data = [
            ("Consultation", "Professional consultation services", "KSh 500 - 2000", "1 hour"),
            ("Maintenance", "Regular maintenance services", "KSh 1000 - 5000", "2-4 hours"),
            ("Installation", "Installation and setup services", "KSh 2000 - 10000", "1-3 hours"),
            ("Training", "Professional training programs", "KSh 5000 - 20000", "1-5 days"),
            ("Repair", "Repair and restoration services", "KSh 1000 - 8000", "1-6 hours")
        ]
        
        products_data = [
            ("Premium Package", "High-quality premium package", Decimal('5000.00')),
            ("Standard Package", "Standard quality package", Decimal('2500.00')),
            ("Basic Package", "Basic quality package", Decimal('1000.00')),
            ("Deluxe Package", "Deluxe premium package", Decimal('8000.00')),
            ("Economy Package", "Economy package", Decimal('500.00'))
        ]
        
        for business in businesses:
            # Create services
            for name, description, price_range, duration in random.sample(services_data, random.randint(1, 3)):
                Service.objects.create(
                    business=business,
                    name=f"{name} - {business.business_name}",
                    description=description,
                    price_range=price_range,
                    duration=duration,
                    is_active=True
                )
            
            # Create products
            for name, description, price in random.sample(products_data, random.randint(1, 3)):
                Product.objects.create(
                    business=business,
                    name=f"{name} - {business.business_name}",
                    description=description,
                    price=price,
                    price_currency='KES',
                    in_stock=random.choice([True, False])
                )
        
        self.stdout.write('✅ Created services and products')

    def seed_business_hours(self, businesses):
        """Create sample business hours"""
        days_of_week = [0, 1, 2, 3, 4, 5, 6]  # Sunday to Saturday
        
        for business in businesses:
            for day in days_of_week:
                if day == 0:  # Sunday - closed
                    BusinessHour.objects.create(
                        business=business,
                        day_of_week=day,
                        is_closed=True
                    )
                else:
                    BusinessHour.objects.create(
                        business=business,
                        day_of_week=day,
                        open_time=f"{random.randint(8, 10)}:00:00",
                        close_time=f"{random.randint(17, 21)}:00:00",
                        is_closed=False
                    )
        
        self.stdout.write('✅ Created business hours')

    def seed_reviews(self, businesses, users):
        """Create sample reviews"""
        for business in businesses:
            num_reviews = random.randint(0, 10)
            reviewers = random.sample(users, min(num_reviews, len(users)))
            
            for reviewer in reviewers:
                Review.objects.create(
                    business=business,
                    user=reviewer,
                    rating=random.randint(1, 5),
                    review_text=f"Great service from {business.business_name}! Highly recommended.",
                    is_verified=random.choice([True, False])
                )
        
        self.stdout.write('✅ Created reviews')

    def seed_favorites(self, businesses, users):
        """Create sample favorites"""
        for user in users:
            num_favorites = random.randint(0, 5)
            favorite_businesses = random.sample(businesses, min(num_favorites, len(businesses)))
            
            for business in favorite_businesses:
                Favorite.objects.get_or_create(
                    user=user,
                    business=business
                )
        
        self.stdout.write('✅ Created favorites')
