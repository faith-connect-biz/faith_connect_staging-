import logging
from rest_framework.views import exception_handler as drf_exception_handler
from rest_framework.response import Response
from rest_framework import status


logger = logging.getLogger("request")


def custom_exception_handler(exc, context):
    response = drf_exception_handler(exc, context)

    request = context.get("request")
    correlation_id = getattr(request, "correlation_id", None) if request else None
    view = context.get("view")
    view_name = view.__class__.__name__ if view else None

    log_payload = {
        "correlation_id": correlation_id,
        "view": view_name,
        "exc_type": exc.__class__.__name__,
        "detail": getattr(exc, "detail", str(exc)),
    }

    if response is not None:
        log_payload["status_code"] = response.status_code
        if response.status_code >= 500:
            logger.error("api_exception", extra=log_payload)
        else:
            logger.warning("api_exception", extra=log_payload)
        return response

    # Non-DRF or unhandled exceptions -> 500 response
    logger.exception("api_exception_unhandled", extra=log_payload)
    return Response({
        "success": False,
        "message": "An unexpected error occurred.",
    }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

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
