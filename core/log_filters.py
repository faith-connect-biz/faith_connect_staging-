import logging
from typing import Any, Dict
import contextvars
from datetime import datetime
from zoneinfo import ZoneInfo


# Context variables populated by middleware per request
request_context: contextvars.ContextVar[Dict[str, Any]] = contextvars.ContextVar(
    "request_context", default={}
)


class RequestContextFilter(logging.Filter):
    """Attach request context fields to every log record so format is standardized."""

    def filter(self, record: logging.LogRecord) -> bool:
        ctx = request_context.get({}) or {}

        # Ensure fields exist to avoid KeyError in formatters
        record.correlation_id = ctx.get("correlation_id", "-")
        record.http_method = ctx.get("method", "-")
        record.http_path = ctx.get("path", "-")
        record.user_id = ctx.get("user_id", "-")
        record.client_ip = ctx.get("client_ip", "-")
        return True


class KenyaTimeFormatter(logging.Formatter):
    """Formatter that renders asctime in Africa/Nairobi time (EAT, UTC+3)."""

    def formatTime(self, record: logging.LogRecord, datefmt=None) -> str:
        dt = datetime.fromtimestamp(record.created, ZoneInfo("Africa/Nairobi"))
        if datefmt:
            return dt.strftime(datefmt)
        # ISO-like default with timezone offset
        return dt.strftime("%Y-%m-%d %H:%M:%S%z")


