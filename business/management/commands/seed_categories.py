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
            (1, "Restaurant", "restaurant"),
            (2, "Retail", "retail"),
            (3, "Services", "services"),
            (4, "Health & Wellness", "health-wellness"),
            (5, "Automotive", "automotive"),
            (6, "Real Estate", "real-estate"),
            (7, "Education", "education"),
            (8, "Technology", "technology"),
            (9, "Beauty & Personal Care", "beauty-personal-care"),
            (10, "Home & Garden", "home-garden"),
            (11, "Legal Services", "legal-services"),
            (12, "Financial Services", "financial-services"),
            (13, "Entertainment", "entertainment"),
            (14, "Professional Services", "professional-services"),
            (15, "Construction", "construction"),
            (16, "Transportation", "transportation"),
            (17, "Non-Profit", "non-profit")
        ]

        for category_id, name, slug in categories_data:
            # Create category with specific ID
            category = Category.objects.create(
                id=category_id,
                name=name,
                slug=slug
            )
            self.stdout.write(self.style.SUCCESS(f"✅ Created category: {name} (ID: {category_id})"))
        
        self.stdout.write(self.style.SUCCESS(f"🎉 Successfully created {len(categories_data)} categories!"))
