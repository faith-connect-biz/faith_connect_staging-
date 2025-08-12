# ZeptoMail Integration Guide

This document explains how to set up and use ZeptoMail for email functionality in FEM Connect.

## Overview

ZeptoMail is integrated to handle:
- Email verification codes
- Password reset emails
- Welcome emails
- Other transactional emails

## Configuration

### 1. Environment Variables

Add these variables to your `.env` file:

```bash
# ZeptoMail Configuration
ZEPTO_SEND_MAIL_TOKEN=your-zeptomail-send-mail-token-here
ZEPTO_DOMAIN=your-zeptomail-domain-here
```

### 2. Get ZeptoMail Credentials

1. Sign up at [ZeptoMail](https://zeptomail.com/)
2. Verify your domain
3. Get your Send Mail Token from the dashboard
4. Use your verified domain

## API Endpoints

### Forgot Password (Supports both Email and Phone)

**Endpoint:** `POST /api/auth/forgot-password/`

**Request Body:**
```json
{
    "identifier": "user@example.com"  // or "254712345678"
}
```

**Response:**
```json
{
    "success": true,
    "message": "Password reset OTP sent to your email successfully.",
    "data": null
}
```

### Email Verification

**Endpoint:** `POST /api/auth/send-email-verification/`

**Request Body:**
```json
{
    "email": "user@example.com"
}
```

## Email Templates

### 1. Verification Email
- Subject: "Verify Your Email - FEM Connect"
- Contains: 6-digit verification code
- Expires: 10 minutes

### 2. Password Reset Email
- Subject: "Password Reset - FEM Connect"
- Contains: 6-digit reset code
- Expires: 10 minutes

### 3. Welcome Email
- Subject: "Welcome to FEM Connect!"
- Contains: Welcome message and features

## Code Structure

### Main Service Class
```python
class ZeptoMailService:
    def send_email(self, to_email, to_name, subject, html_body, from_name=None)
    def send_verification_email(self, email, token, user_name)
    def send_password_reset_email(self, email, token, user_name)
    def send_welcome_email(self, email, user_name)
```

### Usage Examples

```python
from utils.zeptomail import zeptomail_service

# Send custom email
success, response = zeptomail_service.send_email(
    to_email="user@example.com",
    to_name="John Doe",
    subject="Custom Subject",
    html_body="<h1>Custom HTML content</h1>"
)

# Send verification email
success, response = zeptomail_service.send_verification_email(
    email="user@example.com",
    token="123456",
    user_name="John Doe"
)
```

## Error Handling

The service returns tuples: `(success: bool, response: dict)`

```python
success, response = send_verification_email(email, token, user_name)

if success:
    print("Email sent successfully")
else:
    print(f"Failed to send email: {response}")
```

## Testing

### 1. Simulation Mode
Set `SIMULATE_VERIFICATION = True` in `utils/communication.py` to test without sending real emails.

### 2. Real Testing
Set `SIMULATE_VERIFICATION = False` and ensure your ZeptoMail credentials are configured.

## Troubleshooting

### Common Issues

1. **"ZeptoMail not configured"**
   - Check that `ZEPTO_SEND_MAIL_TOKEN` and `ZEPTO_DOMAIN` are set in `.env`

2. **"Failed to send email"**
   - Verify your domain is verified in ZeptoMail
   - Check your Send Mail Token is correct
   - Ensure your domain is properly configured

3. **Rate Limiting**
   - ZeptoMail has rate limits; check your plan details

### Debug Mode

Enable debug logging to see detailed API responses:

```python
import logging
logging.getLogger('utils.zeptomail').setLevel(logging.DEBUG)
```

## Security Considerations

1. **Token Security**: Never commit your ZeptoMail token to version control
2. **Domain Verification**: Only use verified domains to prevent spoofing
3. **Rate Limiting**: Implement proper rate limiting for email endpoints
4. **OTP Expiration**: OTPs expire after 10 minutes for security

## API Limits

Check your ZeptoMail plan for:
- Daily email limits
- Rate limiting per second/minute
- Domain verification requirements
- Support for custom domains

## Support

For ZeptoMail-specific issues:
- [ZeptoMail Documentation](https://docs.zeptomail.com/)
- [ZeptoMail Support](https://zeptomail.com/support)

For FEM Connect integration issues:
- Check the application logs
- Verify environment variables
- Test with simulation mode first
