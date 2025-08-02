from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import generics, filters
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from business.models import Business, Category
from business.permissions import IsBusinessUser
from business.serializers import BusinessSerializer, CategorySerializer
from core import settings
from user_auth.utils import success_response, error_response


# Create your views here.


class BusinessDetailAPIView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = BusinessSerializer
    queryset = Business.objects.filter(is_active=True)
    lookup_field = 'id'




class BusinessListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = BusinessSerializer
    permission_classes = [IsAuthenticated]
    queryset = Business.objects.filter(is_active=True).order_by('-created_at')

    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'city', 'county', 'is_featured']
    search_fields = ['business_name', 'description', 'city']
    ordering_fields = ['created_at', 'rating']

    def get_serializer_context(self):
        return {"request": self.request}

    def create(self, request, *args, **kwargs):
        user = request.user
        if user.user_type != 'business':
            return error_response(
                "Only business users can create a business.",
                status_code=status.HTTP_403_FORBIDDEN
            )

        # Remove 'user' if it exists in request.data to avoid conflict
        data = request.data.copy()
        data.pop('user', None)

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        business = serializer.save(user=user)

        return success_response("Business created successfully",
                                BusinessSerializer(business, context=self.get_serializer_context()).data)


class BusinessUpdateView(generics.UpdateAPIView):
    queryset = Business.objects.all()
    serializer_class = BusinessSerializer
    permission_classes = [IsBusinessUser]
    lookup_field = 'id'

class CategoryListAPIView(generics.ListAPIView):
    queryset = Category.objects.all().order_by('name')
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]


# class GenerateSASToken(APIView):
#     permission_classes = [IsAuthenticated]
#
#     def post(self, request):
#         try:
#             filename = request.data.get('filename', 'business.jpg')
#             blob_name = f"business_images/{uuid.uuid4()}_{filename}"
#
#             sas_token = generate_blob_sas(
#                 account_name=settings.AZURE_ACCOUNT_NAME,
#                 container_name=settings.AZURE_CONTAINER_NAME,
#                 blob_name=blob_name,
#                 account_key=settings.AZURE_ACCOUNT_KEY,
#                 permission=BlobSasPermissions(write=True),
#                 expiry=datetime.utcnow() + timedelta(minutes=15)
#             )
#
#             upload_url = f"https://{settings.AZURE_ACCOUNT_NAME}.blob.core.windows.net/{settings.AZURE_CONTAINER_NAME}/{urllib.parse.quote(blob_name)}?{sas_token}"
#             blob_url = upload_url.split('?')[0]
#
#             return Response({
#                 "upload_url": upload_url,
#                 "blob_url": blob_url
#             })
#         except Exception as e:
#             return Response({"detail": str(e)}, status=500)
