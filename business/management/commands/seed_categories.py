from django.core.management.base import BaseCommand
from business.models import Category
from django.utils.text import slugify
from django.db import IntegrityError

class Command(BaseCommand):
    help = 'Seed business categories with specific IDs'

    def handle(self, *args, **kwargs):
        self.stdout.write("🌱 Seeding business categories...")
        
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
            (17, "Non-Profit", "non-profit", "Charitable organizations and non-profit services"),
            (18, "Baking & Food Services", "baking-food-services", "Comprehensive baking and food services including custom cakes, pastries, breads, catering, wedding cakes, artisan foods, desserts, confectionery, gluten-free options, and specialty dietary baked goods")
        ]

        created_count = 0
        updated_count = 0
        error_count = 0

        for category_id, name, slug, description in categories_data:
            try:
                # Try to get existing category or create new one
                category, created = Category.objects.get_or_create(
                    id=category_id,
                    defaults={
                        'name': name,
                        'slug': slug,
                        'description': description
                    }
                )
                
                if created:
                    self.stdout.write(self.style.SUCCESS(f"✅ Created category: {name} (ID: {category_id})"))
                    created_count += 1
                else:
                    # Update existing category if data has changed
                    if (category.name != name or category.slug != slug or category.description != description):
                        category.name = name
                        category.slug = slug
                        category.description = description
                        category.save()
                        self.stdout.write(self.style.WARNING(f"🔄 Updated category: {name} (ID: {category_id})"))
                        updated_count += 1
                    else:
                        self.stdout.write(self.style.SUCCESS(f"ℹ️  Category already exists: {name} (ID: {category_id})"))
                        
            except IntegrityError as e:
                self.stdout.write(self.style.ERROR(f"❌ Error creating category {name}: {e}"))
                error_count += 1
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"❌ Unexpected error creating category {name}: {e}"))
                error_count += 1
        
        self.stdout.write(self.style.SUCCESS(f"\n🎉 Categories seeding complete!"))
        self.stdout.write(f"   Created: {created_count}")
        self.stdout.write(f"   Updated: {updated_count}")
        self.stdout.write(f"   Errors: {error_count}")
        self.stdout.write(f"   Total processed: {len(categories_data)}")
