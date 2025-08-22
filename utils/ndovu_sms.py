"""
Ndovubase SMS Integration for FEM Connect
"""
import requests
import logging
import os
from typing import Dict, Optional, Tuple
from django.conf import settings

logger = logging.getLogger(__name__)


class NdovubaseSMS:
    """SMS service using Ndovubase API"""

    def __init__(self):
        self.api_url = "https://bulk.ndovubase.com/sms/v3/sendsms"
        self.api_key = getattr(settings, 'SMS_API_KEY', '')
        self.api_secret = getattr(settings, 'SMS_SECRET', '')
        self.shortcode = getattr(settings, 'SMS_FROM_NUMBER', 'CHOSENGCM')
        self.service = 0
        self.response_type = 'json'

        # Debug logging to see what's being loaded
        logger.info(f"SMS Configuration loaded - API Key: {'Set' if self.api_key else 'Not set'}, API Secret: {'Set' if self.api_secret else 'Not set'}, Shortcode: {self.shortcode}")

        if not self.api_key:
            logger.warning("SMS_API_KEY not configured. SMS sending will be simulated.")
        if not self.api_secret:
            logger.warning("SMS_SECRET not configured. SMS sending will be simulated.")

    def format_phone_number(self, phone_number: str) -> str:
        """
        Format phone number to Kenyan format (254XXXXXXXXX)

        Args:
            phone_number: Phone number in various formats

        Returns:
            Formatted phone number
        """
        # Remove any non-digit characters
        cleaned = ''.join(filter(str.isdigit, phone_number))

        # Handle different formats
        if cleaned.startswith('0'):
            # Convert 07XXXXXXXX to 2547XXXXXXXX
            return '254' + cleaned[1:]
        elif cleaned.startswith('254'):
            # Already in correct format
            return cleaned
        elif cleaned.startswith('7'):
            # Convert 7XXXXXXXX to 2547XXXXXXXX
            return '254' + cleaned
        else:
            # Assume it's already in international format
            return cleaned

  
    def send_sms(self, phone_number: str, message: str) -> Tuple[bool, Dict]:
        """
        Send SMS using Ndovubase API

        Args:
            phone_number: Recipient phone number
            message: SMS message content

        Returns:
            Tuple of (success: bool, response: dict)
        """
    
        # Format phone number
        formatted_number = self.format_phone_number(phone_number)

        # Check if API key is configured
        if not self.api_key:
            logger.warning(f"[SMS SIMULATED] No API key configured. Simulating SMS to {formatted_number}")
            return True, {
                'status_code': '1000',
                'status_desc': 'Success (Simulated)',
                'message_id': 'simulated',
                'mobile_number': formatted_number,
                'network_id': '1',
                'message_cost': 0,
                'credit_balance': 999
            }

        # Prepare request payload
        payload = {
            'api_key': self.api_key,
            'service': self.service,
            'mobile': formatted_number,
            'response_type': self.response_type,
            'shortcode': self.shortcode,
            'message': message
        }

        try:
            logger.info(f"[SMS SENDING] Sending SMS to {formatted_number}")

            # Make API request
            response = requests.post(
                self.api_url,
                json=payload,
                timeout=30,
                headers={
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            )

            # Check HTTP response
            response.raise_for_status()

            # Parse JSON response
            result = response.json()

            if isinstance(result, list) and len(result) > 0:
                sms_result = result[0]

                # Check if SMS was sent successfully
                if sms_result.get('status_code') == '1000':
                    logger.info(
                        f"[SMS SUCCESS] Message sent to {formatted_number}. Message ID: {sms_result.get('message_id')}")
                    return True, sms_result
                else:
                    error_msg = f"SMS failed: {sms_result.get('status_desc', 'Unknown error')}"
                    logger.error(f"[SMS ERROR] {error_msg} for {formatted_number}")
                    return False, sms_result
            else:
                error_msg = "Invalid response format from Ndovubase API"
                logger.error(f"[SMS ERROR] {error_msg}")
                return False, {
                    'status_code': '9999',
                    'status_desc': 'Invalid response format',
                    'message_id': '0',
                    'mobile_number': formatted_number,
                    'error': error_msg
                }

        except requests.exceptions.RequestException as e:
            error_msg = f"Network error: {str(e)}"
            logger.error(f"[SMS ERROR] {error_msg}")
            return False, {
                'status_code': '9998',
                'status_desc': 'Network error',
                'message_id': '0',
                'mobile_number': formatted_number,
                'error': error_msg
            }
        except Exception as e:
            error_msg = f"Unexpected error: {str(e)}"
            logger.error(f"[SMS ERROR] {error_msg}")
            return False, {
                'status_code': '9997',
                'status_desc': 'Unexpected error',
                'message_id': '0',
                'mobile_number': formatted_number,
                'error': error_msg
            }

    def send_otp(self, phone_number: str, otp: str) -> Tuple[bool, Dict]:
        """
        Send OTP SMS

        Args:
            phone_number: Recipient phone number
            otp: OTP code

        Returns:
            Tuple of (success: bool, response: dict)
        """
        message = f"Your Faith Connect verification code is: {otp}\n\nThis code expires in 10 minutes."
        return self.send_sms(phone_number, message)

    def send_welcome_message(self, phone_number: str, user_name: str) -> Tuple[bool, Dict]:
        """
        Send welcome SMS

        Args:
            phone_number: Recipient phone number
            user_name: User's name

        Returns:
            Tuple of (success: bool, response: dict)
        """
        message = f"Welcome to Faith Connect, {user_name}!\n\nYour account has been successfully created."
        return self.send_sms(phone_number, message)

    def send_password_reset(self, phone_number: str, reset_code: str) -> Tuple[bool, Dict]:
        """
        Send password reset SMS

        Args:
            phone_number: Recipient phone number
            reset_code: Reset code

        Returns:
            Tuple of (success: bool, response: dict)
        """
        message = f"Your Faith Connect password reset code is: {reset_code}\n\nThis code expires in 15 minutes."
        return self.send_sms(phone_number, message)


# Global SMS service instance
sms_service = NdovubaseSMS()


def send_sms(phone_number: str, message: str) -> Tuple[bool, Dict]:
    """
    Send SMS using Ndovubase API

    Args:
        phone_number: Recipient phone number
        message: SMS message content

    Returns:
        Tuple of (success: bool, response: dict)
    """
    return sms_service.send_sms(phone_number, message)


def send_otp_sms(phone_number: str, otp: str) -> Tuple[bool, Dict]:
    """
    Send OTP SMS

    Args:
        phone_number: Recipient phone number
        otp: OTP code

    Returns:
        Tuple of (success: bool, response: dict)
    """
    return sms_service.send_otp(phone_number, otp)


def send_welcome_sms(phone_number: str, user_name: str) -> Tuple[bool, Dict]:
    """
    Send welcome SMS

    Args:
        phone_number: Recipient phone number
        user_name: User's name

    Returns:
        Tuple of (success: bool, response: dict)
    """
    return sms_service.send_welcome_message(phone_number, user_name)


def send_password_reset_sms(phone_number: str, reset_code: str) -> Tuple[bool, Dict]:
    """
    Send password reset SMS

    Args:
        phone_number: Recipient phone number
        reset_code: Reset code

    Returns:
        Tuple of (success: bool, response: dict)
    """
    return sms_service.send_password_reset(phone_number, reset_code)