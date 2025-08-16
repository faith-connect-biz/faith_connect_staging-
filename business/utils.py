import re
from urllib.parse import urlparse
from django.conf import settings

def is_valid_image_url(url):
    """Check if a URL is a valid image URL"""
    if not url:
        return False
    
    # Check if it's a valid URL
    try:
        parsed = urlparse(url)
        if not parsed.scheme or not parsed.netloc:
            return False
    except:
        return False
    
    # Check if it's an S3 URL
    if 's3.amazonaws.com' in url or 's3.' in url:
        return True
    
    # Check if it's a CloudFront URL (legacy support)
    if 'cloudfront.net' in url:
        return True
    
    # Check if it's a local URL
    if 'localhost' in url or '127.0.0.1' in url:
        return True
    
    return False

def get_image_fallback_url(image_type='profile'):
    """Get fallback image URL based on type"""
    fallback_images = {
        'profile': '/static/images/default-profile.png',
        'logo': '/static/images/default-logo.png',
        'business': '/static/images/default-business.png',
        'service': '/static/images/default-service.png',
        'product': '/static/images/default-product.png',
    }
    return fallback_images.get(image_type, '/static/images/default-image.png')

def convert_cloudfront_to_s3_url(cloudfront_url):
    """Convert CloudFront URL to direct S3 URL if possible"""
    if not cloudfront_url or 'cloudfront.net' not in cloudfront_url:
        return cloudfront_url
    
    # Extract the path from CloudFront URL
    try:
        parsed = urlparse(cloudfront_url)
        path = parsed.path
        
        # Remove leading slash if present
        if path.startswith('/'):
            path = path[1:]
        
        # Construct S3 URL
        s3_url = f"https://{settings.AWS_STORAGE_BUCKET_NAME}.s3.{settings.AWS_S3_REGION_NAME}.amazonaws.com/{path}"
        return s3_url
    except:
        return cloudfront_url

def get_optimized_image_url(original_url, image_type='profile', size='medium'):
    """Get optimized image URL with size parameters"""
    if not is_valid_image_url(original_url):
        return get_image_fallback_url(image_type)
    
    # For S3 URLs, we can add size parameters
    if 's3.amazonaws.com' in original_url:
        # Add size parameter to URL for optimization
        size_params = {
            'small': '?size=small',
            'medium': '?size=medium', 
            'large': '?size=large'
        }
        return original_url + size_params.get(size, '')
    
    return original_url

def validate_and_clean_image_url(url):
    """Validate and clean image URL, return fallback if invalid"""
    if not url:
        return get_image_fallback_url()
    
    # Clean the URL
    url = url.strip()
    
    # Check if it's valid
    if is_valid_image_url(url):
        return url
    
    # Try to convert CloudFront to S3
    s3_url = convert_cloudfront_to_s3_url(url)
    if s3_url != url and is_valid_image_url(s3_url):
        return s3_url
    
    # Return fallback if all else fails
    return get_image_fallback_url()
