from django.core.management.base import BaseCommand
from business.models import Business
from user_auth.models import User


class Command(BaseCommand):
    help = 'Fix businesses that do not have user associations'

    def handle(self, *args, **options):
        # Get all businesses without user associations
        orphaned_businesses = Business.objects.filter(user__isnull=True)
        
        if not orphaned_businesses.exists():
            self.stdout.write(
                self.style.SUCCESS('✅ All businesses already have user associations')
            )
            return
        
        self.stdout.write(f'Found {orphaned_businesses.count()} businesses without user associations')
        
        # Get or create a default business user
        default_user, created = User.objects.get_or_create(
            email='default-business@example.com',
            defaults={
                'first_name': 'Default',
                'last_name': 'Business',
                'user_type': 'business',
                'is_active': True
            }
        )
        
        if created:
            default_user.set_password('defaultpassword123')
            default_user.save()
            self.stdout.write('✅ Created default business user')
        
        # Update orphaned businesses
        updated_count = 0
        for business in orphaned_businesses:
            business.user = default_user
            business.save()
            updated_count += 1
            self.stdout.write(f'  - Associated "{business.business_name}" with default user')
        
        self.stdout.write(
            self.style.SUCCESS(f'✅ Successfully associated {updated_count} businesses with default user')
        )
