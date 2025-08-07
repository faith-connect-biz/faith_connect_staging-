from django.core.management.base import BaseCommand
from django.db.models import Avg
from business.models import Business


class Command(BaseCommand):
    help = 'Fix business ratings based on their actual reviews'

    def handle(self, *args, **options):
        self.stdout.write('Starting to fix business ratings...')
        
        businesses = Business.objects.all()
        updated_count = 0
        
        for business in businesses:
            reviews = business.reviews.all()
            
            if reviews.exists():
                # Calculate average rating from reviews
                avg_rating = reviews.aggregate(Avg('rating'))['rating__avg']
                review_count = reviews.count()
                
                # Update business
                business.rating = round(avg_rating, 2)
                business.review_count = review_count
                business.save(update_fields=['rating', 'review_count'])
                
                self.stdout.write(
                    f'Updated {business.business_name}: '
                    f'rating={business.rating}, reviews={business.review_count}'
                )
                updated_count += 1
            else:
                # No reviews, set to 0
                business.rating = 0
                business.review_count = 0
                business.save(update_fields=['rating', 'review_count'])
                
                self.stdout.write(
                    f'Reset {business.business_name}: '
                    f'rating=0, reviews=0'
                )
                updated_count += 1
        
        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully updated {updated_count} businesses!'
            )
        )
