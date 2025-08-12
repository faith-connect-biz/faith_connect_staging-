from django.core.management.base import BaseCommand
from business.models import Category
from django.utils.text import slugify

class Command(BaseCommand):
    help = 'Seed business categories'

    def handle(self, *args, **kwargs):
        categories = [
            "Restaurant", "Retail", "Services", "Health & Wellness", 
            "Automotive", "Real Estate", "Education", "Technology",
            "Beauty & Personal Care", "Home & Garden", "Legal Services",
            "Financial Services", "Entertainment", "Professional Services",
            "Construction", "Transportation", "Non-Profit"
        ]

        for name in categories:
            slug = slugify(name)
            category, created = Category.objects.get_or_create(name=name, defaults={'slug': slug})
            if created:
                self.stdout.write(self.style.SUCCESS(f"✅ Added category: {name}"))
            else:
                self.stdout.write(self.style.WARNING(f"⚠️ Already exists: {name}"))
