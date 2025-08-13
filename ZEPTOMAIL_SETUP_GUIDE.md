# 🚀 ZeptoMail Template Keys Setup Guide

## 📋 **What You Need to Configure:**

Based on your ZeptoMail interface, you have these templates that need keys:

### **1. Email Verification Template**
- **Template Name**: "Verify OTP" 
- **Template Key**: Copy the key from your ZeptoMail interface (e.g., `2d6f.625e187...`)
- **Environment Variable**: `ZEPTO_VERIFICATION_TEMPLATE_KEY`

### **2. Password Reset Template**
- **Template Name**: "Password Reset V1" or "Password Reset"
- **Template Key**: Copy the key from your ZeptoMail interface
- **Environment Variable**: `ZEPTO_PASSWORD_RESET_TEMPLATE_KEY`

### **3. Welcome Email Template**
- **Template Name**: Create a new welcome email template
- **Template Key**: Will be generated when you create it
- **Environment Variable**: `ZEPTO_WELCOME_TEMPLATE_KEY`

## 🔑 **How to Get Template Keys:**

1. **Go to your ZeptoMail Dashboard**
2. **Click on "Templates" tab**
3. **Find your template in the list**
4. **Copy the "Key" value** (click the copy icon)
5. **Use this key in your `.env` file**

## 📝 **Your `.env` File Should Look Like:**

```bash
# ZeptoMail Configuration
ZEPTO_API_KEY=your_actual_api_key_here
ZEPTO_FROM_EMAIL=noreply@faithconnect.biz
ZEPTO_FROM_NAME=FaithConnect
ZEPTO_VERIFICATION_TEMPLATE_KEY=2d6f.625e187...  # Copy from ZeptoMail
ZEPTO_PASSWORD_RESET_TEMPLATE_KEY=2d6f.625e187... # Copy from ZeptoMail
ZEPTO_WELCOME_TEMPLATE_KEY=your_welcome_template_key_here

# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_STORAGE_BUCKET_NAME=your_bucket_name
AWS_S3_REGION_NAME=us-east-1
USE_S3=True
```

## 🎯 **Template Key Mapping:**

| Django Function | ZeptoMail Template | Environment Variable |
|----------------|-------------------|---------------------|
| `send_verification_email()` | "Verify OTP" | `ZEPTO_VERIFICATION_TEMPLATE_KEY` |
| `send_password_reset_email()` | "Password Reset" | `ZEPTO_PASSWORD_RESET_TEMPLATE_KEY` |
| `send_welcome_email()` | "Welcome Email" | `ZEPTO_WELCOME_TEMPLATE_KEY` |

## ✅ **After Configuration:**

1. **Restart your Django server**
2. **The warning "No ZeptoMail template keys configured" should disappear**
3. **You can test email sending functionality**

## 🧪 **Testing Email Sending:**

Once configured, you can test by:
1. **Registering a new user** (verification email)
2. **Requesting password reset** (password reset email)
3. **Sending welcome emails** (welcome email)

## 🔍 **Troubleshooting:**

- **"No template keys configured"**: Check your `.env` file has all template keys
- **"API key not configured"**: Check `ZEPTO_API_KEY` in your `.env`
- **Template not found**: Verify the template key matches exactly what's in ZeptoMail

## 📞 **Need Help?**

- Check ZeptoMail API documentation
- Verify template keys in your ZeptoMail dashboard
- Ensure all environment variables are set correctly
