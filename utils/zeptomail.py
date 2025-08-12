import os
import logging
import requests
from typing import Dict, List, Optional, Tuple
from decouple import config

logger = logging.getLogger(__name__)

class ZeptoMailService:
    """ZeptoMail email service integration using templates"""
    
    def __init__(self):
        self.api_url = "https://api.zeptomail.com/v1.1/email/template"
        self.api_key = config('ZEPTO_API_KEY', default='')
        self.from_email = config('ZEPTO_FROM_EMAIL', default='noreply@faithconnect.biz')
        self.from_name = config('ZEPTO_FROM_NAME', default='FEM Connect')
        
        # Template keys for different email types
        self.template_keys = {
            'email_verification': config('ZEPTO_VERIFICATION_TEMPLATE_KEY', default=''),
            'password_reset': config('ZEPTO_PASSWORD_RESET_TEMPLATE_KEY', default=''),
            'welcome_email': config('ZEPTO_WELCOME_TEMPLATE_KEY', default='')
        }
        
        if not self.api_key:
            logger.warning("ZEPTO_API_KEY not configured")
        if not any(self.template_keys.values()):
            logger.warning("No ZeptoMail template keys configured")
    
    def send_template_email(
        self,
        to_email: str,
        to_name: str,
        template_key: str,
        merge_info: Dict,
        from_email: Optional[str] = None,
        from_name: Optional[str] = None
    ) -> Tuple[bool, Dict]:
        """
        Send email using ZeptoMail template system
        
        Args:
            to_email: Recipient email address
            to_name: Recipient name
            template_key: ZeptoMail template key
            merge_info: Template variables for merging
            from_email: Sender email (optional)
            from_name: Sender name (optional)
            
        Returns:
            Tuple of (success: bool, response: dict)
        """
        if not self.api_key:
            logger.error("ZeptoMail API key not configured")
            return False, {"error": "ZeptoMail API key not configured"}
        
        if not template_key:
            logger.error("Template key not provided")
            return False, {"error": "Template key not provided"}
        
        headers = {
            'accept': "application/json",
            'content-type': "application/json",
            'authorization': self.api_key
        }
        
        payload = {
            "mail_template_key": template_key,
            "from": {
                "address": from_email or self.from_email,
                "name": from_name or self.from_name
            },
            "to": [{
                "email_address": {
                    "address": to_email,
                    "name": to_name
                }
            }],
            "merge_info": merge_info
        }
        
        # Debug logging
        logger.info(f"Sending template email to {to_email}")
        logger.info(f"API URL: {self.api_url}")
        logger.info(f"Template Key: {template_key}")
        logger.info(f"From Email: {from_email or self.from_email}")
        logger.info(f"Headers: {headers}")
        logger.info(f"Payload: {payload}")
        
        try:
            response = requests.post(
                self.api_url,
                json=payload,
                headers=headers,
                timeout=30
            )
            
            logger.info(f"Response Status: {response.status_code}")
            logger.info(f"Response Headers: {dict(response.headers)}")
            logger.info(f"Response Text: {response.text}")
            
            if response.status_code in [200, 201, 202]:
                logger.info(f"Template email sent successfully to {to_email} using template: {template_key}")
                return True, response.json()
            else:
                logger.error(f"Failed to send template email to {to_email}. Status: {response.status_code}, Response: {response.text}")
                return False, {
                    "status_code": response.status_code,
                    "response": response.text,
                    "headers": dict(response.headers)
                }
                
        except requests.exceptions.RequestException as e:
            logger.error(f"Error sending template email to {to_email}: {str(e)}")
            return False, {"error": str(e)}
    
    def send_verification_email(self, email: str, token: str, user_name: str) -> Tuple[bool, Dict]:
        """Send email verification code using ZeptoMail template"""
        template_key = self.template_keys.get('email_verification')
        if not template_key:
            logger.error("Email verification template key not configured")
            return False, {"error": "Template key not configured"}
        
        merge_info = {
            "name": user_name,
            "OTP": token,
            "team": "Faith Connect",
            "product_name": "Faith Connect"
        }
        
        return self.send_template_email(
            email, 
            user_name, 
            template_key, 
            merge_info
        )
    
    def send_password_reset_email(self, email: str, token: str, user_name: str, reset_link: str = None) -> Tuple[bool, Dict]:
        """Send password reset email using ZeptoMail template"""
        template_key = self.template_keys.get('password_reset')
        if not template_key:
            logger.error("Password reset template key not configured")
            return False, {"error": "Template key not configured"}
        
        merge_info = {
            "name": user_name,
            "OTP": token,
            "team": "Faith Connect",
            "product_name": "Faith Connect"
        }
        
        # Add password reset link if provided
        if reset_link:
            merge_info["password_reset_link"] = reset_link
        
        return self.send_template_email(
            email, 
            user_name, 
            template_key, 
            merge_info
        )
    
    def send_welcome_email(self, email: str, user_name: str) -> Tuple[bool, Dict]:
        """Send welcome email using ZeptoMail template"""
        template_key = self.template_keys.get('welcome_email')
        if not template_key:
            logger.error("Welcome email template key not configured")
            return False, {"error": "Template key not configured"}
        
        merge_info = {
            "name": user_name,
            "team": "Faith Connect",
            "product_name": "Faith Connect"
        }
        
        return self.send_template_email(
            email, 
            user_name, 
            template_key, 
            merge_info
        )
    
    def send_custom_template_email(
        self, 
        email: str, 
        user_name: str, 
        template_key: str, 
        merge_info: Dict
    ) -> Tuple[bool, Dict]:
        """Send email using any custom ZeptoMail template"""
        return self.send_template_email(
            email, 
            user_name, 
            template_key, 
            merge_info
        )


# Global instance
zeptomail_service = ZeptoMailService()


def send_email_verification_code(email: str, token: str, user_name: str = "User") -> Tuple[bool, Dict]:
    """Send email verification code using ZeptoMail template"""
    return zeptomail_service.send_verification_email(email, token, user_name)


def send_password_reset_email(email: str, token: str, user_name: str = "User", reset_link: str = None) -> Tuple[bool, Dict]:
    """Send password reset email using ZeptoMail template"""
    return zeptomail_service.send_password_reset_email(email, token, user_name, reset_link)


def send_welcome_email(email: str, user_name: str) -> Tuple[bool, Dict]:
    """Send welcome email using ZeptoMail template"""
    return zeptomail_service.send_welcome_email(email, user_name)


def send_custom_template_email(email: str, user_name: str, template_key: str, merge_info: Dict) -> Tuple[bool, Dict]:
    """Send email using any custom ZeptoMail template"""
    return zeptomail_service.send_custom_template_email(email, user_name, template_key, merge_info)
