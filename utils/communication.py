import os
import logging
from .ndovu_sms import send_otp_sms, send_welcome_sms, send_password_reset_sms
from .zeptomail import send_email_verification_code as send_zeptomail_verification, send_welcome_email as send_zeptomail_welcome

logger = logging.getLogger(__name__)

SIMULATE_VERIFICATION = True  # Set to True for local development - simulates email/SMS

# Debug: Print the current simulation mode
print(f"🔧 DEBUG: SIMULATE_VERIFICATION = {SIMULATE_VERIFICATION}")


def send_email_verification_code(email: str, token: str, user_name: str = "User"):
    """Send email verification code using ZeptoMail"""
    if SIMULATE_VERIFICATION:
        logger.info(f"[SIMULATED EMAIL] Sent token {token} to {email}")
        print(f"📧 Simulated: Token {token} sent to email {email}")
        return True, {"simulated": True}
    else:
        # Use ZeptoMail for real email sending
        return send_zeptomail_verification(email, token, user_name)


def send_welcome_email(email: str, user_name: str):
    """Send welcome email using ZeptoMail"""
    if SIMULATE_VERIFICATION:
        logger.info(f"[SIMULATED EMAIL] Welcome email sent to {email}")
        print(f"📧 Simulated: Welcome email sent to {email} for {user_name}")
        return True, {"simulated": True}
    else:
        # Use ZeptoMail for real email sending
        return send_zeptomail_welcome(email, user_name)


def send_otp_sms(phone_number: str, otp: str):
    """
    Send OTP SMS using Ndovubase API (alias for send_sms)

    Args:
        phone_number: Recipient phone number
        otp: OTP code

    Returns:
        Tuple of (success: bool, response: dict)
    """
    return send_sms(phone_number, otp)


def send_sms(phone_number: str, otp: str):
    """
    Send SMS using Ndovubase API

    Args:
        phone_number: Recipient phone number
        otp: OTP code

    Returns:
        Tuple of (success: bool, response: dict)
    """
    if SIMULATE_VERIFICATION:
        logger.info(f"[SIMULATED SMS] OTP {otp} sent to {phone_number}")
        print(f"📱 Simulated: OTP {otp} sent to {phone_number}")
        return True, {"simulated": True, "status_desc": "Simulated SMS for local development"}
    
    success, response = send_otp_sms(phone_number, otp)

    if success:
        logger.info(f"[SMS SUCCESS] OTP {otp} sent to {phone_number}")
        print(f"📱 SMS sent: OTP {otp} to {phone_number}")
    else:
        logger.error(
            f"[SMS ERROR] Failed to send OTP to {phone_number}: {response.get('status_desc', 'Unknown error')}")
        print(f"❌ SMS failed: {response.get('status_desc', 'Unknown error')} for {phone_number}")

    return success, response


def send_welcome_message(phone_number: str, user_name: str):
    """
    Send welcome SMS

    Args:
        phone_number: Recipient phone number
        user_name: User's name

    Returns:
        Tuple of (success: bool, response: dict)
    """
    if SIMULATE_VERIFICATION:
        logger.info(f"[SIMULATED SMS] Welcome message sent to {phone_number}")
        print(f"📱 Simulated: Welcome message sent to {phone_number} for {user_name}")
        return True, {"simulated": True, "status_desc": "Simulated welcome SMS for local development"}
    
    success, response = send_welcome_sms(phone_number, user_name)

    if success:
        logger.info(f"[SMS SUCCESS] Welcome message sent to {phone_number}")
        print(f"📱 Welcome SMS sent to {phone_number}")
    else:
        logger.error(
            f"[SMS ERROR] Failed to send welcome message to {phone_number}: {response.get('status_desc', 'Unknown error')}")
        print(f"❌ Welcome SMS failed: {response.get('status_desc', 'Unknown error')} for {phone_number}")

    return success, response


def send_password_reset_message(phone_number: str, reset_code: str):
    """
    Send password reset SMS

    Args:
        phone_number: Recipient phone number
        reset_code: Reset code

    Returns:
        Tuple of (success: bool, response: dict)
    """
    if SIMULATE_VERIFICATION:
        logger.info(f"[SIMULATED SMS] Password reset message sent to {phone_number}")
        print(f"📱 Simulated: Password reset message sent to {phone_number} with code {reset_code}")
        return True, {"simulated": True, "status_desc": "Simulated password reset SMS for local development"}
    
    success, response = send_password_reset_sms(phone_number, reset_code)

    if success:
        logger.info(f"[SMS SUCCESS] Password reset message sent to {phone_number}")
        print(f"📱 Password reset SMS sent to {phone_number}")
    else:
        logger.error(
            f"[SMS ERROR] Failed to send password reset message to {phone_number}: {response.get('status_desc', 'Unknown error')}")
        print(f"❌ Password reset SMS failed: {response.get('status_desc', 'Unknown error')} for {phone_number}")

    return success, response