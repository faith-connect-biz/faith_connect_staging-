from django.core.management.base import BaseCommand
from django.core.cache import cache
import logging

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Clear OTP-related cache entries'

    def add_arguments(self, parser):
        parser.add_argument(
            '--all',
            action='store_true',
            help='Clear all cache',
        )
        parser.add_argument(
            '--token',
            type=str,
            help='Clear cache for specific registration token',
        )

    def handle(self, *args, **options):
        if options['all']:
            self.stdout.write('🧹 Clearing all cache...')
            cache.clear()
            self.stdout.write(
                self.style.SUCCESS('✅ All cache cleared successfully!')
            )
        elif options['token']:
            token = options['token']
            self.stdout.write(f'🧹 Clearing cache for token: {token}')
            
            registration_cache_key = f'registration_{token}'
            otp_cache_key = f'otp_{token}'
            
            cache.delete(registration_cache_key)
            cache.delete(otp_cache_key)
            
            self.stdout.write(
                self.style.SUCCESS('✅ Cache cleared for token!')
            )
        else:
            self.stdout.write('🧹 Clearing OTP-related cache...')
            
            # Try to clear OTP-related cache keys
            try:
                # This might not work with all cache backends
                keys = cache.keys('*')
                if keys:
                    cleared_count = 0
                    for key in keys:
                        if 'otp' in key or 'registration' in key:
                            cache.delete(key)
                            cleared_count += 1
                    
                    self.stdout.write(
                        self.style.SUCCESS(f'✅ Cleared {cleared_count} OTP-related cache entries!')
                    )
                else:
                    self.stdout.write(
                        self.style.WARNING('⚠️ No cache keys found or cache backend doesn\'t support key listing')
                    )
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f'❌ Error clearing cache: {e}')
                )
