from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.db.models import Avg
from .models import Review, Business


@receiver([post_save, post_delete], sender=Review)
def update_business_rating(sender, instance, **kwargs):
    """
    Update business rating and review count when a review is created, updated, or deleted
    """
    business = instance.business
    
    # Calculate new average rating from all reviews
    reviews = business.reviews.all()
    if reviews.exists():
        avg_rating = reviews.aggregate(Avg('rating'))['rating__avg']
        review_count = reviews.count()
    else:
        avg_rating = 0
        review_count = 0
    
    # Update business fields
    business.rating = round(avg_rating, 2) if avg_rating else 0
    business.review_count = review_count
    business.save(update_fields=['rating', 'review_count'])


@receiver(post_save, sender=Business)
def create_default_review_count(sender, instance, created, **kwargs):
    """
    Ensure new businesses have proper default values
    """
    if created:
        instance.review_count = 0
        instance.rating = 0
        instance.save(update_fields=['review_count', 'rating'])
