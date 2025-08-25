# authapp/utils.py
from rest_framework.response import Response
from rest_framework import status
import logging
import re

logger = logging.getLogger(__name__)

def success_response(message, data=None, status_code=status.HTTP_200_OK):
    return Response({
        "success": True,
        "message": message,
        "data": data
    }, status=status_code)

def error_response(message, errors=None, status_code=status.HTTP_400_BAD_REQUEST):
    return Response({
        "success": False,
        "message": message,
        "errors": errors
    }, status=status_code)


def normalize_phone(phone: str) -> str:
    """
    Normalize Kenyan phone numbers to canonical 254XXXXXXXXX format.

    Accepts inputs like +2547XXXXXXXX, 2547XXXXXXXX, 07XXXXXXXX, 01XXXXXXXX, 7XXXXXXXXX, 1XXXXXXXXX.
    Removes spaces, hyphens, parentheses, and leading plus.

    Returns normalized string or raises ValueError if not a valid KE mobile.
    Rules:
      - Stored format: 254XXXXXXXXX (12 digits)
      - Local prefixes 07/01 become 2547/2541
      - Raw leading 7/1 will be prefixed with 254
      - After country code, total digits must be 9
    """
    if phone is None:
        raise ValueError("Phone is required")

    cleaned = re.sub(r"[\s\-()]+", "", str(phone).strip())
    if cleaned.startswith("+"):
        cleaned = cleaned[1:]

    # Convert known local formats to international without plus
    if cleaned.startswith("0") and len(cleaned) >= 10:
        # 07XXXXXXXX or 01XXXXXXXX -> drop leading 0
        cleaned = "254" + cleaned[1:]
    elif cleaned.startswith("254"):
        # Already has country code
        pass
    elif cleaned.startswith("7") or cleaned.startswith("1"):
        # 7XXXXXXXX or 1XXXXXXXX -> prepend 254
        cleaned = "254" + cleaned
    else:
        # Unsupported prefix
        raise ValueError("Invalid Kenyan phone number format")

    # At this point cleaned should be 254 + 9 digits
    if not cleaned.startswith("254"):
        raise ValueError("Invalid Kenyan phone number format")

    local_part = cleaned[3:]
    if not local_part.isdigit() or len(local_part) != 9:
        raise ValueError("Phone number must have 9 digits after 254")

    return "254" + local_part
