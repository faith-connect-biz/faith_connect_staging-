import boto3
from botocore.exceptions import ClientError
from django.conf import settings
import logging
from datetime import datetime, timedelta
import uuid
import os
from decouple import config

logger = logging.getLogger(__name__)

class S3Service:
    def __init__(self):
        # Get AWS credentials from environment variables using decouple
        aws_access_key_id = config('AWS_ACCESS_KEY_ID', default='')
        aws_secret_access_key = config('AWS_SECRET_ACCESS_KEY', default='')
        aws_region = config('AWS_S3_REGION_NAME', default='us-east-1')
        bucket_name = config('AWS_STORAGE_BUCKET_NAME', default='')
        
        if not all([aws_access_key_id, aws_secret_access_key, bucket_name]):
            raise ValueError("Missing required AWS environment variables")
        
        self.s3_client = boto3.client(
            's3',
            aws_access_key_id=aws_access_key_id,
            aws_secret_access_key=aws_secret_access_key,
            region_name=aws_region,
            endpoint_url=f"https://s3.{aws_region}.amazonaws.com"
        )
        self.bucket_name = bucket_name

    def generate_presigned_upload_url(self, file_key, content_type, expiration_minutes=5):
        """
        Generate a pre-signed URL for uploading a file to S3
        
        Args:
            file_key (str): The key/path where the file will be stored in S3
            content_type (str): The MIME type of the file
            expiration_minutes (int): How long the URL is valid (default: 5 minutes)
            
        Returns:
            dict: Contains the presigned URL and file key
        """
        try:
            # Generate unique file key if not provided
            if not file_key:
                file_extension = content_type.split('/')[-1] if '/' in content_type else 'bin'
                file_key = f"business_images/{uuid.uuid4()}.{file_extension}"
            
            # Generate presigned URL for S3 upload
            presigned_url = self.s3_client.generate_presigned_url(
                'put_object',
                Params={
                    'Bucket': self.bucket_name,
                    'Key': file_key,
                    'ContentType': content_type,
                },
                ExpiresIn=expiration_minutes * 60  # Convert to seconds
            )
            
            return {
                'success': True,
                'presigned_url': presigned_url,
                'file_key': file_key,
                'expires_in_minutes': expiration_minutes
            }
            
        except ClientError as e:
            logger.error(f"Error generating presigned URL: {e}")
            return {
                'success': False,
                'error': str(e)
            }
        except Exception as e:
            logger.error(f"Unexpected error generating presigned URL: {e}")
            return {
                'success': False,
                'error': str(e)
            }

    def generate_presigned_download_url(self, file_key, expiration_minutes=60):
        """
        Generate a pre-signed URL for downloading a file from S3
        
        Args:
            file_key (str): The key/path of the file in S3
            expiration_minutes (int): How long the URL is valid (default: 60 minutes)
            
        Returns:
            dict: Contains the presigned URL
        """
        try:
            presigned_url = self.s3_client.generate_presigned_url(
                'get_object',
                Params={
                    'Bucket': self.bucket_name,
                    'Key': file_key,
                },
                ExpiresIn=expiration_minutes * 60
            )
            
            return {
                'success': True,
                'presigned_url': presigned_url,
                'expires_in_minutes': expiration_minutes
            }
            
        except ClientError as e:
            logger.error(f"Error generating download URL: {e}")
            return {
                'success': False,
                'error': str(e)
            }

    def delete_file(self, file_key):
        """
        Delete a file from S3
        
        Args:
            file_key (str): The key/path of the file in S3
            
        Returns:
            dict: Success status
        """
        try:
            self.s3_client.delete_object(
                Bucket=self.bucket_name,
                Key=file_key
            )
            
            return {
                'success': True,
                'message': f'File {file_key} deleted successfully'
            }
            
        except ClientError as e:
            logger.error(f"Error deleting file: {e}")
            return {
                'success': False,
                'error': str(e)
            }

    def get_file_url(self, file_key):
        """
        Get the public URL for a file (if bucket is public)
        
        Args:
            file_key (str): The key/path of the file in S3
            
        Returns:
            str: The public URL of the file
        """
        custom_domain = config('AWS_S3_CUSTOM_DOMAIN', default='')
        region_name = config('AWS_S3_REGION_NAME', default='us-east-1')
        
        if custom_domain:
            return f"https://{custom_domain}/{file_key}"
        else:
            return f"https://{self.bucket_name}.s3.{region_name}.amazonaws.com/{file_key}"

    def upload_file_from_url(self, image_url, folder="business_images"):
        """
        Download an image from URL and upload to S3
        Useful for importing images like the ones from Eclat Flash Media
        
        Args:
            image_url (str): The URL of the image to download
            folder (str): The folder in S3 to store the image
            
        Returns:
            dict: Contains the S3 file key and URL
        """
        try:
            import requests
            from PIL import Image
            from io import BytesIO
            
            # Download the image
            response = requests.get(image_url)
            response.raise_for_status()
            
            # Get image info
            image = Image.open(BytesIO(response.content))
            content_type = f"image/{image.format.lower()}"
            
            # Generate unique filename
            file_extension = image.format.lower()
            file_key = f"{folder}/{uuid.uuid4()}.{file_extension}"
            
            # Upload to S3
            self.s3_client.put_object(
                Bucket=self.bucket_name,
                Key=file_key,
                Body=response.content,
                ContentType=content_type,
                ACL='public-read'
            )
            
            return {
                'success': True,
                'file_key': file_key,
                's3_url': self.get_file_url(file_key),
                'content_type': content_type
            }
            
        except Exception as e:
            logger.error(f"Error uploading file from URL: {e}")
            return {
                'success': False,
                'error': str(e)
            }
