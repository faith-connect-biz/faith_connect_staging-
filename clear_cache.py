#!/usr/bin/env python
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings.dev')
django.setup()

from django.core.cache import cache

print("🧹 Clearing Django cache...")

# Clear all cache
cache.clear()

print("✅ Cache cleared successfully!")

# Also clear specific OTP-related cache keys
print("🔍 Checking for OTP cache keys...")

# List all cache keys (this might not work with all cache backends)
try:
    # Try to get cache keys (Redis supports this)
    keys = cache.keys('*')
    if keys:
        print(f"Found {len(keys)} cache keys")
        for key in keys:
            if 'otp' in key or 'registration' in key:
                print(f"Clearing: {key}")
                cache.delete(key)
    else:
        print("No cache keys found or cache backend doesn't support key listing")
except Exception as e:
    print(f"Could not list cache keys: {e}")

print("✅ OTP cache cleanup completed!")
