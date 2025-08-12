# ZeptoMail Template Integration & Enhanced Forgot Password

This document explains the ZeptoMail template integration and enhanced forgot password functionality in FEM Connect.

## 🚀 **New Features**

### 1. **ZeptoMail Template Integration**
- **Professional email templates** managed in ZeptoMail dashboard
- **Template-based system** using template keys and merge info
- **Dynamic content** with variables like `{{name}}`, `{{OTP}}`, `{{team}}`
- **Reliable delivery** through ZeptoMail's infrastructure

### 2. **Enhanced Forgot Password**
- **Dual support**: Use either phone number OR email address
- **Smart detection**: Automatically detects if input is email or phone
- **Unified API**: Single endpoint for both methods
- **Consistent experience**: Same OTP flow regardless of method

## 📧 **ZeptoMail Setup**

### Step 1: Get ZeptoMail Account
1. Sign up at [ZeptoMail](https://zeptomail.com/)
2. Create email templates in the dashboard
3. Get your API key and template keys

### Step 2: Configure Environment
Add these variables to your `.env` file:

```bash
# ZeptoMail API Configuration
ZEPTO_API_KEY=your-zeptomail-api-key-here
ZEPTO_FROM_EMAIL=noreply@faithconnect.biz
ZEPTO_FROM_NAME=FEM Connect

# Template Keys (get these from ZeptoMail dashboard)
ZEPTO_VERIFICATION_TEMPLATE_KEY=your-verification-template-key
ZEPTO_PASSWORD_RESET_TEMPLATE_KEY=your-password-reset-template-key
ZEPTO_WELCOME_TEMPLATE_KEY=your-welcome-template-key
```

### Step 3: Test Integration
Run the test script to verify setup:

```bash
python test_zeptomail.py
```

## 🔐 **Forgot Password Usage**

### API Endpoint
**POST** `/api/auth/forgot-password/`

### Request Examples

**Using Email:**
```json
{
    "identifier": "user@example.com"
}
```

**Using Phone:**
```json
{
    "identifier": "254712345678"
}
```

### Response Examples

**Email Response:**
```json
{
    "success": true,
    "message": "Password reset OTP sent to your email successfully.",
    "data": null
}
```

**Phone Response:**
```json
{
    "success": true,
    "message": "OTP sent successfully to your phone.",
    "data": null
}
```

## 📱 **Reset Password**

### API Endpoint
**POST** `/api/auth/reset-password/`

### Request Examples

**Using Email:**
```json
{
    "identifier": "user@example.com",
    "otp": "123456",
    "new_password": "newsecurepass123"
}
```

**Using Phone:**
```json
{
    "identifier": "254712345678",
    "otp": "123456",
    "new_password": "newsecurepass123"
}
```

## 🎨 **Template Variables**

Your ZeptoMail templates can use these variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `{{name}}` | User's full name | "John Doe" |
| `{{OTP}}` | Verification/reset code | "123456" |
| `{{team}}` | Team name | "FEM Connect" |
| `{{product_name}}` | Product name | "FEM Connect" |

### Template Example
```html
<h2>Verify Your Email</h2>
<p>Hi {{name}},</p>
<p>Your verification code is: <strong>{{OTP}}</strong></p>
<p>Best regards,<br>{{team}}</p>
```

## 🧪 **Testing**

### Test Script
```bash
python test_zeptomail.py
```

### Manual Testing
```python
from utils.zeptomail import send_verification_email

# Test verification email
success, response = send_verification_email(
    email="test@example.com",
    token="123456",
    user_name="Test User"
)

if success:
    print("Email sent successfully!")
else:
    print(f"Failed: {response}")
```

## 📁 **File Structure**

```
utils/
├── zeptomail.py          # ZeptoMail template service
└── communication.py      # Updated communication module

user_auth/
├── views.py              # Updated views with dual support
└── UserSerializer/
    └── Serializers.py    # Updated serializers

docs/
├── ZEPTOMAIL_TEMPLATES.md  # Detailed template guide
└── API_ENDPOINTS.md        # Complete API documentation

test_zeptomail.py        # Test script for template functionality
```

## 🔧 **Configuration Options**

### Environment Variables
- `ZEPTO_API_KEY`: Your ZeptoMail API key
- `ZEPTO_FROM_EMAIL`: Sender email address
- `ZEPTO_FROM_NAME`: Sender display name
- `ZEPTO_*_TEMPLATE_KEY`: Template keys for different email types

### Template Management
- **Create templates** in ZeptoMail dashboard
- **Use template keys** to reference templates
- **Customize variables** for dynamic content
- **Professional styling** managed in ZeptoMail

## 🚨 **Security Features**

1. **API Key Security**: Never commit API keys to version control
2. **Template Validation**: Validate merge info before sending
3. **OTP Expiration**: All OTPs expire after 10 minutes
4. **Token Clearing**: OTPs are cleared after use
5. **Rate Limiting**: Built-in protection against abuse

## 📊 **Monitoring & Logging**

All email operations are logged with:
- Success/failure status
- Recipient information
- Template usage
- Error details
- API responses

## 🐛 **Troubleshooting**

### Common Issues

1. **"Template key not configured"**
   - Check `.env` file for template keys
   - Verify template keys are correct

2. **"ZeptoMail API key not configured"**
   - Ensure `ZEPTO_API_KEY` is set
   - Check API key permissions

3. **"Failed to send template email"**
   - Verify template exists in ZeptoMail
   - Check template key spelling
   - Review error logs for details

### Debug Mode
Enable detailed logging:

```python
import logging
logging.getLogger('utils.zeptomail').setLevel(logging.DEBUG)
```

## 🔄 **Migration Guide**

### From Old System
1. Update environment variables
2. Create templates in ZeptoMail dashboard
3. Get template keys and configure
4. Test with template system
5. Monitor logs for any issues

### Backward Compatibility
- All existing phone-based functionality remains unchanged
- New email functionality is additive
- No breaking changes to existing APIs

## 📈 **Performance**

- **Email Delivery**: Typically 1-5 seconds
- **API Response**: Under 100ms
- **Rate Limits**: Check your ZeptoMail plan
- **Scalability**: Handles high-volume email sending

## 🆘 **Support**

### ZeptoMail Issues
- [ZeptoMail Documentation](https://docs.zeptomail.com/)
- [ZeptoMail Support](https://zeptomail.com/support)

### FEM Connect Issues
- Check application logs
- Verify configuration
- Test with template system
- Review error responses

## 🎯 **Next Steps**

1. **Set up ZeptoMail account**
2. **Create email templates** in dashboard
3. **Get template keys** and configure environment
4. **Test with template system**
5. **Customize templates** with your brand styling
6. **Deploy to production** and monitor delivery

---

**Note**: This integration provides **professional email templates** with **reliable delivery** through ZeptoMail's infrastructure, while maintaining backward compatibility with existing SMS functionality.
