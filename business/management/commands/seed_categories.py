from django.core.management.base import BaseCommand
from business.models import Category
from django.utils.text import slugify

class Command(BaseCommand):
    help = 'Seed business categories with specific IDs'

    def handle(self, *args, **kwargs):
        # First, clear all existing categories to avoid conflicts
        self.stdout.write("🗑️ Clearing existing categories...")
        Category.objects.all().delete()
        
        categories_data = [
            (1, "Restaurant", "restaurant", "Restaurants, cafes, and food service businesses"),
            (2, "Retail", "retail", "Retail stores, boutiques, and shopping centers"),
            (3, "Services", "services", "General service businesses and professional services"),
            (4, "Health & Wellness", "health-wellness", "Medical, fitness, and wellness services"),
            (5, "Automotive", "automotive", "Car repair, maintenance, and automotive services"),
            (6, "Real Estate", "real-estate", "Property sales, rentals, and real estate services"),
            (7, "Education", "education", "Schools, training centers, and educational services"),
            (8, "Technology", "technology", "IT services, software, and technology solutions"),
            (9, "Beauty & Personal Care", "beauty-personal-care", "Salons, spas, and beauty services"),
            (10, "Home & Garden", "home-garden", "Home improvement and gardening services"),
            (11, "Legal Services", "legal-services", "Legal advice, law firms, and legal services"),
            (12, "Financial Services", "financial-services", "Banking, insurance, and financial services"),
            (13, "Entertainment", "entertainment", "Events, media, and entertainment services"),
            (14, "Professional Services", "professional-services", "Consulting, accounting, and professional services"),
            (15, "Construction", "construction", "Building, renovation, and construction services"),
            (16, "Transportation", "transportation", "Delivery, logistics, and transport services"),
            (17, "Non-Profit", "non-profit", "Charitable organizations and non-profit services")
        ]

        for category_id, name, slug, description in categories_data:
            # Create category with specific ID
            category = Category.objects.create(
                id=category_id,
                name=name,
                slug=slug,
                description=description
            )
            self.stdout.write(self.style.SUCCESS(f"✅ Created category: {name} (ID: {category_id})"))
        
        self.stdout.write(self.style.SUCCESS(f"🎉 Successfully created {len(categories_data)} categories!"))
