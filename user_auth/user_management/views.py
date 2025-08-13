from user_auth.user_management.serializers import UserProfileSerializer, UpdateUserProfileSerializer, \
    ProfileImageURLSerializer
from user_auth.utils import success_response, error_response

from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from ..models import User
from .serializers import UserProfileSerializer, UpdateUserProfileSerializer
import boto3
from botocore.exceptions import ClientError
import os
from django.conf import settings
import uuid
from datetime import datetime, timedelta


class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserProfileSerializer(request.user)
        return success_response("User profile retrieved successfully", serializer.data)


class UserProfileUpdateView(APIView):
    permission_classes = [IsAuthenticated]
    def put(self, request):
        serializer = UpdateUserProfileSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return success_response("User profile updated successfully", serializer.data)
        return error_response("Failed to update profile", serializer.errors)


class UploadAvatarView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ProfileImageURLSerializer(instance=request.user, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return success_response("Profile image updated successfully", serializer.data)
        return error_response("Invalid profile image URL", serializer.errors)

# Profile Photo Upload Endpoints
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def get_profile_photo_upload_url(request):
    """Get pre-signed URL for profile photo upload"""
    try:
        user = request.user
        
        # Get file info from request
        file_name = request.data.get('file_name')
        content_type = request.data.get('content_type')
        
        if not file_name or not content_type:
            return Response({'error': 'file_name and content_type are required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Generate unique file key
        file_extension = file_name.split('.')[-1]
        file_key = f"profiles/{user.id}/profile_{uuid.uuid4()}.{file_extension}"
        
        # Generate pre-signed URL using S3Service
        from utils.s3_service import S3Service
        s3_service = S3Service()
        
        result = s3_service.generate_presigned_upload_url(
            file_key=file_key,
            content_type=content_type,
            expiration_minutes=60
        )
        
        if not result['success']:
            return Response({'error': result['error']}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        presigned_url = result['presigned_url']
        
        return Response({
            'presigned_url': presigned_url,
            'file_key': file_key,
            'expires_in_minutes': 60
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_profile_photo(request):
    """Update user profile with uploaded photo"""
    try:
        user = request.user
        file_key = request.data.get('file_key')
        
        if not file_key:
            return Response({'error': 'file_key is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Generate S3 URL
        s3_url = f"https://{settings.AWS_STORAGE_BUCKET_NAME}.s3.{settings.AWS_S3_REGION_NAME}.amazonaws.com/{file_key}"
        
        # Update user profile image
        user.profile_image_url = s3_url
        user.save()
        
        return Response({
            'profile_image_url': user.profile_image_url,
            's3_url': s3_url
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)