from user_auth.user_management.serializers import UserProfileSerializer, UpdateUserProfileSerializer, \
    ProfileImageURLSerializer
from user_auth.utils import success_response, error_response

from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import APIView


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