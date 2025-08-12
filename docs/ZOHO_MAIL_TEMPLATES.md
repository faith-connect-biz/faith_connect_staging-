# Zoho Mail Templates Integration Guide

This guide explains how to set up and use Zoho Mail templates with FEM Connect's email system.

## 🎯 **How It Works Now**

Instead of generating HTML in Python, the system now:
1. **Generates OTP codes** in Python
2. **Sends template data** to ZeptoMail API
3. **Zoho Mail renders** the actual email using your templates
4. **ZeptoMail delivers** the rendered email

## 📧 **Required Zoho Mail Templates**

You need to create these templates in your Zoho Mail dashboard:

### 1. **Email Verification Template**
**Template Name:** `email_verification`

**Template Variables Available:**
- `{{otp}}` - 6-digit verification code
- `{{user_name}}` - User's full name
- `{{expiry_minutes}}` - OTP expiry time (10 minutes)

**Example Template Content:**
```html
<h2>Verify Your Email - FEM Connect</h2>
<p>Hi {{user_name}},</p>
<p>Your verification code is: <strong>{{otp}}</strong></p>
<p>This code expires in {{expiry_minutes}} minutes.</p>
```

### 2. **Password Reset Template**
**Template Name:** `password_reset`

**Template Variables Available:**
- `{{otp}}` - 6-digit reset code
- `{{user_name}}` - User's full name
- `{{expiry_minutes}}` - OTP expiry time (10 minutes)

**Example Template Content:**
```html
<h2>Password Reset - FEM Connect</h2>
<p>Hi {{user_name}},</p>
<p>Your password reset code is: <strong>{{otp}}</strong></p>
<p>This code expires in {{expiry_minutes}} minutes.</p>
```

### 3. **Welcome Email Template**
**Template Name:** `welcome_email`

**Template Variables Available:**
- `{{user_name}}` - User's full name

**Example Template Content:**
```html
<h2>Welcome to FEM Connect!</h2>
<p>Hi {{user_name}},</p>
<p>Welcome to our community!</p>
```

## 🔧 **Template Setup in Zoho Mail**

### Step 1: Access Templates
1. Log into Zoho Mail
2. Go to **Settings** → **Templates**
3. Click **Create Template**

### Step 2: Create Template
1. **Name**: Use exact template names (e.g., `email_verification`)
2. **Subject**: Set default subject line
3. **Content**: Add your HTML with template variables
4. **Save** the template

### Step 3: Template Variables
Use these exact variable names in your templates:
- `{{otp}}` - For verification/reset codes
- `{{user_name}}` - For user names
- `{{expiry_minutes}}` - For expiry information

## 📊 **Template Data Structure**

The system sends this data structure for each template:

### Email Verification
```json
{
    "subject": "Verify Your Email - FEM Connect",
    "template_name": "email_verification",
    "otp": "123456",
    "user_name": "John Doe",
    "expiry_minutes": 10
}
```

### Password Reset
```json
{
    "subject": "Password Reset - FEM Connect",
    "template_name": "password_reset",
    "otp": "123456",
    "user_name": "John Doe",
    "expiry_minutes": 10
}
```

### Welcome Email
```json
{
    "subject": "Welcome to FEM Connect!",
    "template_name": "welcome_email",
    "user_name": "John Doe"
}
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
template_data = {
    "subject": "Custom Subject",
    "custom_field": "Custom Value",
    "user_name": "John Doe"
}

success, response = send_custom_template_email(
    email="user@example.com",
    user_name="John Doe",
    template_name="custom_template",
    template_data=template_data
)
```

## 🔍 **Testing Templates**

### 1. **Create Test Template**
Create a simple test template in Zoho Mail:
```html
<h2>Test Template</h2>
<p>Hello {{user_name}}!</p>
<p>OTP: {{otp}}</p>
```

### 2. **Test with Code**
```python
# Test custom template
success, response = send_custom_template_email(
    email="test@example.com",
    user_name="Test User",
    template_name="test_template",
    template_data={
        "subject": "Test Email",
        "otp": "123456",
        "user_name": "Test User"
    }
)
```

## 🎨 **Template Design Tips**

### Best Practices
1. **Keep it simple** - Focus on content, not complex styling
2. **Use template variables** - Don't hardcode user-specific data
3. **Mobile responsive** - Ensure templates work on all devices
4. **Brand consistency** - Use your brand colors and fonts
5. **Clear call-to-action** - Make next steps obvious

### Template Structure
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body>
    <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <!-- Header -->
        <div style="background: #007bff; color: white; padding: 20px; text-align: center;">
            <h1>FEM Connect</h1>
        </div>
        
        <!-- Content -->
        <div style="padding: 20px;">
            <h2>{{template_title}}</h2>
            <p>Hi {{user_name}},</p>
            <!-- Template-specific content -->
        </div>
        
        <!-- Footer -->
        <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666;">
            <p>© 2024 FEM Connect. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
```

## 🐛 **Troubleshooting**

### Common Issues

1. **Template not found**
   - Check template name spelling in Zoho Mail
   - Ensure template is published/active

2. **Variables not showing**
   - Verify variable names match exactly (e.g., `{{otp}}`, not `{{OTP}}`)
   - Check template syntax in Zoho Mail

3. **Email not sending**
   - Verify ZeptoMail configuration
   - Check Zoho Mail template status
   - Review application logs

### Debug Mode
Enable detailed logging to see what's happening:
```python
import logging
logging.getLogger('utils.zeptomail').setLevel(logging.DEBUG)
```

## 📈 **Benefits of This Approach**

1. **Professional templates** managed in Zoho Mail
2. **Easy maintenance** - no code changes for template updates
3. **Consistent branding** across all emails
4. **Design flexibility** - use Zoho Mail's template editor
5. **Better user experience** - professional-looking emails
6. **Faster development** - focus on logic, not HTML

## 🎯 **Next Steps**

1. **Create templates** in Zoho Mail dashboard
2. **Test with sample data** using the test script
3. **Customize templates** with your brand styling
4. **Deploy to production** and monitor email delivery
5. **Iterate and improve** templates based on user feedback

---

**Note**: This approach gives you the best of both worlds - professional email templates managed in Zoho Mail, with reliable delivery through ZeptoMail's API.
