import os
import logging

logger = logging.getLogger(__name__)

SIMULATE_VERIFICATION = True

def send_email_verification_code(email: str, token: str):
    if SIMULATE_VERIFICATION:
        logger.info(f"[SIMULATED EMAIL] Sent token {token} to {email}")
        print(f"📧 Simulated: Token {token} sent to email {email}")
    else:
        # Replace this with real email sending (e.g., SendGrid)
        raise NotImplementedError("Real email sending not implemented")


def send_sms(phone_number: str, otp: str):
    if SIMULATE_VERIFICATION:
        logger.info(f"[SIMULATED SMS] Sent OTP {otp} to {phone_number}")
        print(f"📱 Simulated: OTP {otp} sent to phone {phone_number}")
    else:
        # Replace this with real SMS sending (e.g., Twilio, Africa's Talking)
        raise NotImplementedError("Real SMS sending not implemented")
