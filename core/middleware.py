import logging
import time
import uuid

from django.utils.deprecation import MiddlewareMixin
from core.log_filters import request_context


SENSITIVE_KEYS = {"password", "new_password", "old_password"}


def _mask_payload(data):
    try:
        if not isinstance(data, dict):
            return None
        return {k: ("****" if k in SENSITIVE_KEYS else v) for k, v in data.items()}
    except Exception:
        return None


class RequestLoggingMiddleware(MiddlewareMixin):
    """
    Logs each request/response with a correlation ID and masked payloads.

    - Sets request.correlation_id
    - Logs start and end with timing and response status
    - Masks common sensitive keys in request body
    """

    def __init__(self, get_response=None):
        super().__init__(get_response)
        self.logger = logging.getLogger("request")

    def process_request(self, request):
        request.correlation_id = str(uuid.uuid4())
        request._start_time = time.time()

        try:
            method = request.method
            path = request.get_full_path()
            client_ip = self._get_client_ip(request)
            user_agent = request.META.get("HTTP_USER_AGENT", "-")
            user_id = getattr(getattr(request, "user", None), "id", None) or "-"

            body = None
            if method in {"POST", "PUT", "PATCH"}:
                # Accessing request.body consumes it; DRF handles parsing separately.
                # Prefer request.POST or request.data when available; fallback to None.
                if hasattr(request, "data"):
                    body = _mask_payload(getattr(request, "data", None) or {})
                else:
                    body = _mask_payload(getattr(request, "POST", None) or {})

            # Populate contextvars for standardized logging
            request_context.set({
                "correlation_id": request.correlation_id,
                "method": method,
                "path": path,
                "client_ip": client_ip,
                "user_id": user_id,
            })

            self.logger.info(
                "request_started",
                extra={
                    "correlation_id": request.correlation_id,
                    "method": method,
                    "path": path,
                    "client_ip": client_ip,
                    "user_agent": user_agent,
                    "body": body,
                },
            )
        except Exception:
            # Never break the request cycle due to logging
            pass

    def process_response(self, request, response):
        try:
            duration_ms = None
            if hasattr(request, "_start_time"):
                duration_ms = int((time.time() - request._start_time) * 1000)

            log_level = logging.INFO
            body_excerpt = None
            status_code = getattr(response, "status_code", None)
            if isinstance(status_code, int) and status_code >= 400:
                log_level = logging.WARNING if status_code < 500 else logging.ERROR
                try:
                    # Try to capture a safe excerpt of the response content
                    content = getattr(response, "data", None)
                    if content is None and hasattr(response, "content"):
                        content = response.content
                    body_excerpt = str(content)[:500]
                except Exception:
                    body_excerpt = None

            self.logger.log(
                log_level,
                "request_finished",
                extra={
                    "correlation_id": getattr(request, "correlation_id", None),
                    "status_code": status_code,
                    "duration_ms": duration_ms,
                    "response_excerpt": body_excerpt,
                },
            )
        except Exception:
            pass
        return response

    def process_exception(self, request, exception):
        try:
            self.logger.exception(
                "request_exception",
                extra={
                    "correlation_id": getattr(request, "correlation_id", None),
                    "path": getattr(request, "path", None),
                },
            )
        except Exception:
            pass

    @staticmethod
    def _get_client_ip(request):
        xff = request.META.get("HTTP_X_FORWARDED_FOR")
        if xff:
            return xff.split(",")[0].strip()
        return request.META.get("REMOTE_ADDR", "-")


