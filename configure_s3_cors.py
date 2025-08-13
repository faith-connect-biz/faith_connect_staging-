#!/usr/bin/env python3
"""
Script to configure S3 bucket CORS settings for image uploads
"""

import boto3
import os
from botocore.exceptions import ClientError
from decouple import config

def configure_s3_cors():
    """Configure S3 bucket CORS settings"""
    
    # Get S3 configuration from environment
    aws_access_key_id = config('AWS_ACCESS_KEY_ID')
    aws_secret_access_key = config('AWS_SECRET_ACCESS_KEY')
    aws_region = config('AWS_S3_REGION_NAME', default='af-south-1')
    s3_bucket_name = config('AWS_STORAGE_BUCKET_NAME')
    
    if not all([aws_access_key_id, aws_secret_access_key, s3_bucket_name]):
        print("❌ Missing required environment variables:")
        print("   - AWS_ACCESS_KEY_ID")
        print("   - AWS_SECRET_ACCESS_KEY") 
        print("   - AWS_S3_BUCKET_NAME")
        return False
    
    try:
        # Create S3 client
        s3_client = boto3.client(
            's3',
            aws_access_key_id=aws_access_key_id,
            aws_secret_access_key=aws_secret_access_key,
            region_name=aws_region
        )
        
        # CORS configuration for image uploads
        cors_configuration = {
            'CORSRules': [
                {
                    'AllowedHeaders': ['*'],
                    'AllowedMethods': ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'],
                    'AllowedOrigins': [
                        'http://localhost:3000',  # Local development
                        'http://localhost:8080',  # Vite dev server
                        'http://localhost:5173',  # Vite default dev server
                        'http://localhost:4173',  # Vite preview server
                        'https://fem-family-business-directory-rosy.vercel.app',  # Production
                        'https://*.vercel.app'  # Vercel previews
                    ],
                    'ExposeHeaders': [
                        'ETag',
                        'x-amz-version-id',
                        'x-amz-delete-marker',
                        'x-amz-request-id',
                        'x-amz-id-2'
                    ],
                    'MaxAgeSeconds': 86400
                }
            ]
        }
        
        # Apply CORS configuration
        s3_client.put_bucket_cors(
            Bucket=s3_bucket_name,
            CORSConfiguration=cors_configuration
        )
        
        print(f"✅ Successfully configured CORS for S3 bucket: {s3_bucket_name}")
        print("   Allowed origins:")
        for origin in cors_configuration['CORSRules'][0]['AllowedOrigins']:
            print(f"   - {origin}")
        
        return True
        
    except ClientError as e:
        print(f"❌ Error configuring S3 CORS: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

def verify_cors_configuration():
    """Verify the current CORS configuration"""
    
    aws_access_key_id = config('AWS_ACCESS_KEY_ID')
    aws_secret_access_key = config('AWS_SECRET_ACCESS_KEY')
    aws_region = config('AWS_S3_REGION_NAME', default='af-south-1')
    s3_bucket_name = config('AWS_STORAGE_BUCKET_NAME')
    
    if not all([aws_access_key_id, aws_secret_access_key, s3_bucket_name]):
        print("❌ Missing required environment variables")
        return False
    
    try:
        s3_client = boto3.client(
            's3',
            aws_access_key_id=aws_access_key_id,
            aws_secret_access_key=aws_secret_access_key,
            region_name=aws_region
        )
        
        response = s3_client.get_bucket_cors(Bucket=s3_bucket_name)
        print(f"✅ Current CORS configuration for bucket: {s3_bucket_name}")
        print("CORS Rules:")
        for i, rule in enumerate(response['CORSRules']):
            print(f"  Rule {i+1}:")
            print(f"    Allowed Origins: {rule.get('AllowedOrigins', [])}")
            print(f"    Allowed Methods: {rule.get('AllowedMethods', [])}")
            print(f"    Allowed Headers: {rule.get('AllowedHeaders', [])}")
        
        return True
        
    except ClientError as e:
        if e.response['Error']['Code'] == 'NoSuchCORSConfiguration':
            print(f"❌ No CORS configuration found for bucket: {s3_bucket_name}")
        else:
            print(f"❌ Error getting CORS configuration: {e}")
        return False

if __name__ == "__main__":
    print("🔧 S3 CORS Configuration Script")
    print("=" * 40)
    
    # Check if we want to verify or configure
    import sys
    if len(sys.argv) > 1 and sys.argv[1] == 'verify':
        verify_cors_configuration()
    else:
        print("Configuring S3 CORS settings...")
        configure_s3_cors()
        print("\nVerifying configuration...")
        verify_cors_configuration()
