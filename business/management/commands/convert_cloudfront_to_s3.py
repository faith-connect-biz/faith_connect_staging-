from django.core.management.base import BaseCommand
from django.conf import settings
from business.models import Business, Service, Product
from business.utils import convert_cloudfront_to_s3_url


class Command(BaseCommand):
    help = 'Convert CloudFront URLs to direct S3 URLs in the database'

    def handle(self, *args, **options):
        self.stdout.write('Starting CloudFront to S3 URL conversion...')
        
        # Convert Business images
        businesses_updated = 0
        for business in Business.objects.all():
            updated = False
            
            if business.business_image_url and 'cloudfront.net' in business.business_image_url:
                old_url = business.business_image_url
                new_url = convert_cloudfront_to_s3_url(old_url)
                if new_url != old_url:
                    business.business_image_url = new_url
                    updated = True
                    self.stdout.write(f'  Business {business.id}: {old_url} -> {new_url}')
            
            if business.business_logo_url and 'cloudfront.net' in business.business_logo_url:
                old_url = business.business_logo_url
                new_url = convert_cloudfront_to_s3_url(old_url)
                if new_url != old_url:
                    business.business_logo_url = new_url
                    updated = True
                    self.stdout.write(f'  Business {business.id}: {old_url} -> {new_url}')
            
            if updated:
                business.save()
                businesses_updated += 1
        
        # Convert Service images
        services_updated = 0
        for service in Service.objects.all():
            updated = False
            
            if service.service_image_url and 'cloudfront.net' in service.service_image_url:
                old_url = service.service_image_url
                new_url = convert_cloudfront_to_s3_url(old_url)
                if new_url != old_url:
                    service.service_image_url = new_url
                    updated = True
                    self.stdout.write(f'  Service {service.id}: {old_url} -> {new_url}')
            
            if updated:
                service.save()
                services_updated += 1
        
        # Convert Product images
        products_updated = 0
        for product in Product.objects.all():
            updated = False
            
            if product.product_image_url and 'cloudfront.net' in product.product_image_url:
                old_url = product.product_image_url
                new_url = convert_cloudfront_to_s3_url(old_url)
                if new_url != old_url:
                    product.product_image_url = new_url
                    updated = True
                    self.stdout.write(f'  Product {product.id}: {old_url} -> {new_url}')
            
            if updated:
                product.save()
                products_updated += 1
        
        self.stdout.write(
            self.style.SUCCESS(
                f'Conversion complete! Updated: {businesses_updated} businesses, '
                f'{services_updated} services, {products_updated} products'
            )
        )
