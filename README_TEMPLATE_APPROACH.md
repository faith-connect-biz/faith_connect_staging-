# 🎯 **New Approach: Zoho Mail Templates + ZeptoMail API**

## 🔄 **What Changed**

Instead of generating HTML in Python, we now use a **hybrid approach**:

1. **Python generates OTP codes** and user data
2. **ZeptoMail API sends** template data to Zoho Mail
3. **Zoho Mail renders** professional email templates
4. **ZeptoMail delivers** the rendered emails

## 📧 **How It Works Now**

### **Before (Old Approach)**
```python
# Generated full HTML in Python
html_body = f"""
<div style="...">
    <h2>Verify Your Email</h2>
    <p>Your code: {token}</p>
</div>
"""
send_email(email, html_body)
```

### **Now (New Approach)**
```python
# Send template data only
template_data = {
    "otp": token,
    "user_name": user_name,
    "expiry_minutes": 10
}
send_verification_email(email, token, user_name)  # Uses Zoho Mail template
```

## 🎨 **Benefits of New Approach**

✅ **Professional templates** managed in Zoho Mail  
✅ **Easy maintenance** - no code changes for template updates  
✅ **Consistent branding** across all emails  
✅ **Design flexibility** - use Zoho Mail's template editor  
✅ **Better user experience** - professional-looking emails  
✅ **Faster development** - focus on logic, not HTML  

## 📋 **Required Zoho Mail Templates**

You need to create these **exact template names** in Zoho Mail:

| Template Name | Purpose | Variables |
|---------------|---------|-----------|
| `email_verification` | Email verification codes | `{{otp}}`, `{{user_name}}`, `{{expiry_minutes}}` |
| `password_reset` | Password reset codes | `{{otp}}`, `{{user_name}}`, `{{expiry_minutes}}` |
| `welcome_email` | Welcome messages | `{{user_name}}` |

## 🚀 **Quick Start**

### 1. **Set Environment Variables**
```bash
ZEPTO_SEND_MAIL_TOKEN=your-token-here
ZEPTO_DOMAIN=your-domain-here
```

### 2. **Create Templates in Zoho Mail**
- Log into Zoho Mail
- Go to Settings → Templates
- Create templates with exact names above
- Use template variables: `{{otp}}`, `{{user_name}}`, etc.

### 3. **Test Integration**
```bash
python test_zeptomail.py
```

## 📊 **Template Data Structure**

The system automatically sends this data for each template:

### **Email Verification**
```json
{
    "subject": "Verify Your Email - FEM Connect",
    "template_name": "email_verification",
    "otp": "123456",
    "user_name": "John Doe",
    "expiry_minutes": 10
}
```

### **Password Reset**
```json
{
    "subject": "Password Reset - FEM Connect",
    "template_name": "password_reset",
    "otp": "123456",
    "user_name": "John Doe",
    "expiry_minutes": 10
}
```

## 🔧 **Usage Examples**

### **Basic Usage**
```python
from utils.zeptomail import send_verification_email

# Send verification email using Zoho Mail template
success, response = send_verification_email(
    email="user@example.com",
    token="123456",
    user_name="John Doe"
)
```

### **Custom Template**
```python
from utils.zeptomail import send_custom_template_email

# Send any custom template
success, response = send_custom_template_email(
    email="user@example.com",
    user_name="John Doe",
    template_name="custom_template",
    template_data={
        "subject": "Custom Subject",
        "custom_field": "Custom Value"
    }
)
```

## 🎨 **Template Design Tips**

### **Template Variables**
Use these exact names in your Zoho Mail templates:
- `{{otp}}` - For verification/reset codes
- `{{user_name}}` - For user names
- `{{expiry_minutes}}` - For expiry information

### **Template Structure**
```html
<h2>Verify Your Email - FEM Connect</h2>
<p>Hi {{user_name}},</p>
<p>Your verification code is: <strong>{{otp}}</strong></p>
<p>This code expires in {{expiry_minutes}} minutes.</p>
```

## 🔍 **Testing & Debugging**

### **Test Script**
```bash
python test_zeptomail.py
```

### **Debug Mode**
```python
import logging
logging.getLogger('utils.zeptomail').setLevel(logging.DEBUG)
```

### **Common Issues**
1. **Template not found** - Check template name spelling
2. **Variables not showing** - Verify variable names match exactly
3. **Email not sending** - Check ZeptoMail configuration

## 📚 **Documentation**

- **`docs/ZOHO_MAIL_TEMPLATES.md`** - Detailed template setup guide
- **`docs/API_ENDPOINTS.md`** - Complete API documentation
- **`README_ZEПTOMAIL.md`** - General integration guide

## 🎯 **Next Steps**

1. **Create templates** in Zoho Mail dashboard
2. **Test with sample data** using test script
3. **Customize templates** with your brand styling
4. **Deploy to production** and monitor delivery
5. **Iterate and improve** based on user feedback

---

## 🚨 **Important Notes**

- **Template names must match exactly** (case-sensitive)
- **Variable names must match exactly** (e.g., `{{otp}}`, not `{{OTP}}`)
- **ZeptoMail handles delivery**, Zoho Mail handles templates
- **No HTML generation in Python** - all styling in Zoho Mail
- **Backward compatible** - existing functionality unchanged

This approach gives you **professional email templates** with **reliable delivery** - the best of both worlds! 🎉
