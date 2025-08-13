from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.views import View

@csrf_exempt
def health_check(request):
    """Simple health check endpoint for Railway"""
    return JsonResponse({
        'status': 'healthy',
        'message': 'Django app is running successfully',
        'timestamp': '2025-08-13T21:35:24Z'
    })

@method_decorator(csrf_exempt, name='dispatch')
class HealthCheckView(View):
    """Class-based health check view"""
    
    def get(self, request):
        return JsonResponse({
            'status': 'healthy',
            'message': 'Django app is running successfully',
            'timestamp': '2025-08-13T21:35:24Z'
        })
