"""
URL configuration for core project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse
from core.admin_dashboard import admin_site

def api_root(request):
    """Root API endpoint for healthcheck"""
    return JsonResponse({
        'message': 'FEM Family Business Directory API',
        'status': 'healthy',
        'version': '1.0.0'
    })

urlpatterns = [
    path('', api_root, name='api_root'),  # Root endpoint
    path('api/', api_root, name='api_root'),  # API root for healthcheck
    path('admin/', admin_site.urls),  # Use enhanced admin site
    path('api/auth/', include('user_auth.urls')),
    path('api/users/', include('user_auth.user_management.urls')),
    path('api/business/', include('business.urls')),
]

# Serve static files in production
urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
