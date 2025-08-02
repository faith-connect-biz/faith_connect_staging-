# authapp/urls.py

from django.urls import path
from .views import RegisterAPIView, LoginView, LogoutAPIView, CustomTokenRefreshView

urlpatterns = [
    path('register/', RegisterAPIView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutAPIView.as_view(), name='logout'),

    path('refresh-token', CustomTokenRefreshView.as_view(), name='custom_token_refresh'),

]
