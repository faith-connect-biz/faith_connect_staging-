import os
import uuid
import logging
from django.conf import settings
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
import base64
import mimetypes

logger = logging.getLogger(__name__)

class LocalStorageService:
    """Local file storage service for testing without S3"""
    
    def __init__(self):
        self.media_root = getattr(settings, 'MEDIA_ROOT', 'media/')
        self.media_url = getattr(settings, 'MEDIA_URL', '/media/')
        
    def generate_upload_path(self, business_id, image_type, file_extension):
        """Generate a local file path for uploads"""
        folder = 'business_logos' if image_type == 'logo' else 'business_images'
        filename = f"{uuid.uuid4()}.{file_extension}"
        return f"{folder}/{business_id}/{filename}"
    
    def save_file_from_url(self, image_url, business_id, image_type):
        """Download and save image from URL to local storage"""
        try:
            import requests
            
            # Download the image
            response = requests.get(image_url, timeout=10)
            response.raise_for_status()
            
            # Determine file extension from content type
            content_type = response.headers.get('content-type', 'image/jpeg')
            extension = mimetypes.guess_extension(content_type) or '.jpg'
            
            # Generate file path
            file_path = self.generate_upload_path(business_id, image_type, extension.lstrip('.'))
            
            # Save file to local storage
            file_content = ContentFile(response.content)
            saved_path = default_storage.save(file_path, file_content)
            
            # Get the URL for the saved file
            file_url = default_storage.url(saved_path)
            
            return {
                'success': True,
                'file_path': saved_path,
                'file_url': file_url,
                'content_type': content_type
            }
            
        except Exception as e:
            logger.error(f"Error saving file from URL: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def save_uploaded_file(self, file_obj, business_id, image_type):
        """Save an uploaded file to local storage"""
        try:
            # Generate file path
            file_extension = file_obj.name.split('.')[-1] if '.' in file_obj.name else 'jpg'
            file_path = self.generate_upload_path(business_id, image_type, file_extension)
            
            # Save file to local storage
            saved_path = default_storage.save(file_path, file_obj)
            
            # Get the URL for the saved file
            file_url = default_storage.url(saved_path)
            
            return {
                'success': True,
                'file_path': saved_path,
                'file_url': file_url,
                'content_type': file_obj.content_type
            }
            
        except Exception as e:
            logger.error(f"Error saving uploaded file: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def delete_file(self, file_path):
        """Delete a file from local storage"""
        try:
            if default_storage.exists(file_path):
                default_storage.delete(file_path)
                return {
                    'success': True,
                    'message': f'File {file_path} deleted successfully'
                }
            else:
                return {
                    'success': False,
                    'error': 'File not found'
                }
        except Exception as e:
            logger.error(f"Error deleting file: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def get_file_url(self, file_path):
        """Get the URL for a file in local storage"""
        return default_storage.url(file_path)
