# ZeptoMail Template Integration Guide

This guide explains how to set up and use ZeptoMail's template system with FEM Connect.

## 🎯 **How It Works**

ZeptoMail uses a **template-based system** where:
1. **Templates are created** in ZeptoMail dashboard
2. **Template keys** are used to reference templates
3. **Merge info** provides dynamic data for templates
4. **ZeptoMail renders** and delivers the emails

## 📧 **Required Configuration**

### Environment Variables
Add these to your `.env` file:

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

## 🔑 **Getting Template Keys**

### Step 1: Access ZeptoMail Dashboard
1. Log into [ZeptoMail](https://zeptomail.com/)
2. Go to **Templates** section
3. Create or select existing templates

### Step 2: Get Template Keys
Each template has a unique key that looks like:
```
2d6f.625e18791e334fe4.k1.e64048f0-7696-11f0-8fbe-525400114fe6.198987ea2ff
```

### Step 3: Configure Environment
Add the template keys to your `.env` file.

## 📊 **Template Variables (Merge Info)**

### Available Variables
Your templates can use these variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `{{name}}` | User's full name | "John Doe" |
| `{{OTP}}` | Verification/reset code | "123456" |
| `{{team}}` | Team name | "FEM Connect" |
| `{{product_name}}` | Product name | "FEM Connect" |

### Template Examples

#### Email Verification Template
```html
<h2>Verify Your Email</h2>
<p>Hi {{name}},</p>
<p>Your verification code is: <strong>{{OTP}}</strong></p>
<p>Best regards,<br>{{team}}</p>
```

#### Password Reset Template
```html
<h2>Password Reset</h2>
<p>Hi {{name}},</p>
<p>Your reset code is: <strong>{{OTP}}</strong></p>
<p>Best regards,<br>{{team}}</p>
```

#### Welcome Template
```html
<h2>Welcome to {{product_name}}!</h2>
<p>Hi {{name}},</p>
<p>Welcome to our community!</p>
<p>Best regards,<br>{{team}}</p>
```

## 🚀 **Usage Examples**

### Basic Usage
```python
from utils.zeptomail import send_verification_email

# Send verification email
success, response = send_verification_email(
    email="user@example.com",
    token="123456",
    user_name="John Doe"
)
```

### Custom Template
```python
from utils.zeptomail import send_custom_template_email

# Send custom template email
merge_info = {
    "name": "John Doe",
    "OTP": "123456",
    "team": "FEM Connect",
    "product_name": "FEM Connect"
}

success, response = send_custom_template_email(
    email="user@example.com",
    user_name="John Doe",
    template_key="your-template-key-here",
    merge_info=merge_info
)
```

## 🔧 **API Endpoint**

The system uses ZeptoMail's template endpoint:
```
POST https://api.zeptomail.com/v1.1/email/template
```

### Request Payload
```json
{
    "mail_template_key": "your-template-key",
    "from": {
        "address": "noreply@faithconnect.biz",
        "name": "FEM Connect"
    },
    "to": [{
        "email_address": {
            "address": "user@example.com",
            "name": "User Name"
        }
    }],
    "merge_info": {
        "name": "User Name",
        "OTP": "123456",
        "team": "FEM Connect",
        "product_name": "FEM Connect"
    }
}
```

## 🧪 **Testing**

### Test Script
Run the test script to verify setup:
```bash
python test_zeptomail.py
```

### Manual Testing
Test individual functions:
```python
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

## 🐛 **Troubleshooting**

### Common Issues

1. **"Template key not configured"**
   - Check that template keys are set in `.env`
   - Verify template keys are correct

2. **"ZeptoMail API key not configured"**
   - Ensure `ZEPTO_API_KEY` is set
   - Check API key permissions

3. **"Failed to send template email"**
   - Verify template exists in ZeptoMail
   - Check template key spelling
   - Review API response for details

### Debug Mode
Enable detailed logging:
```python
import logging
logging.getLogger('utils.zeptomail').setLevel(logging.DEBUG)
```

### API Response Codes
- `200`: Success
- `400`: Bad Request (check payload)
- `401`: Unauthorized (check API key)
- `404`: Template not found (check template key)
- `500`: Server error (contact ZeptoMail support)

## 📈 **Best Practices**

### Template Design
1. **Keep it simple** - Focus on content, not complex styling
2. **Use merge variables** - Don't hardcode user-specific data
3. **Mobile responsive** - Ensure templates work on all devices
4. **Brand consistency** - Use your brand colors and fonts
5. **Clear call-to-action** - Make next steps obvious

### Variable Usage
1. **Use exact variable names** - `{{name}}`, `{{OTP}}`, etc.
2. **Provide fallbacks** - Handle missing variables gracefully
3. **Test thoroughly** - Verify all variables render correctly

## 🔒 **Security Considerations**

1. **API Key Security** - Never commit API keys to version control
2. **Template Validation** - Validate merge info before sending
3. **Rate Limiting** - Respect ZeptoMail's rate limits
4. **Error Handling** - Log errors but don't expose sensitive data

## 📚 **Additional Resources**

- [ZeptoMail API Documentation](https://docs.zeptomail.com/)
- [ZeptoMail Template Guide](https://zeptomail.com/templates)
- [ZeptoMail Support](https://zeptomail.com/support)

## 🎯 **Next Steps**

1. **Create templates** in ZeptoMail dashboard
2. **Get template keys** and add to `.env`
3. **Test with sample data** using test script
4. **Customize templates** with your brand styling
5. **Deploy to production** and monitor delivery
6. **Iterate and improve** based on user feedback

---

**Note**: This system provides professional email templates with reliable delivery through ZeptoMail's infrastructure.
