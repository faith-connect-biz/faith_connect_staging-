# 📧 ZeptoMail Email Templates Setup Guide

## 🎯 **Required Email Templates:**

You need to create **3 email templates** in your ZeptoMail dashboard:

### **1. Email Verification Template (Verify OTP)**
- **Purpose**: Send OTP codes for email verification
- **Template Name**: "Email Verification OTP"
- **Variables**: `{{otp}}`, `{{user_name}}`, `{{expiry_time}}`

**Template Content:**
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Email Verification</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb;">FaithConnect</h1>
        </div>
        
        <div style="background: #f8fafc; padding: 30px; border-radius: 10px; text-align: center;">
            <h2 style="color: #1e293b; margin-bottom: 20px;">Verify Your Email Address</h2>
            <p style="font-size: 16px; margin-bottom: 25px;">
                Hello {{user_name}},<br>
                Please use the verification code below to complete your email verification:
            </p>
            
            <div style="background: #ffffff; border: 2px solid #2563eb; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <h1 style="color: #2563eb; font-size: 32px; letter-spacing: 5px; margin: 0;">{{otp}}</h1>
            </div>
            
            <p style="font-size: 14px; color: #64748b; margin-bottom: 20px;">
                This code expires in {{expiry_time}} minutes.
            </p>
            
            <p style="font-size: 14px; color: #64748b;">
                If you didn't request this verification, please ignore this email.
            </p>
        </div>
        
        <div style="text-align: center; margin-top: 30px; color: #64748b; font-size: 12px;">
            <p>© 2025 FaithConnect. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
```

### **2. Password Reset Template**
- **Purpose**: Send password reset codes
- **Template Name**: "Password Reset"
- **Variables**: `{{reset_code}}`, `{{user_name}}`, `{{expiry_time}}`

**Template Content:**
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Password Reset</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #dc2626;">FaithConnect</h1>
        </div>
        
        <div style="background: #fef2f2; padding: 30px; border-radius: 10px; text-align: center;">
            <h2 style="color: #991b1b; margin-bottom: 20px;">Reset Your Password</h2>
            <p style="font-size: 16px; margin-bottom: 25px;">
                Hello {{user_name}},<br>
                We received a request to reset your password. Use the code below to proceed:
            </p>
            
            <div style="background: #ffffff; border: 2px solid #dc2626; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <h1 style="color: #dc2626; font-size: 32px; letter-spacing: 5px; margin: 0;">{{reset_code}}</h1>
            </div>
            
            <p style="font-size: 14px; color: #7f1d1d; margin-bottom: 20px;">
                This code expires in {{expiry_time}} minutes.
            </p>
            
            <p style="font-size: 14px; color: #7f1d1d;">
                If you didn't request a password reset, please ignore this email.
            </p>
        </div>
        
        <div style="text-align: center; margin-top: 30px; color: #64748b; font-size: 12px;">
            <p>© 2025 FaithConnect. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
```

### **3. Welcome Email Template**
- **Purpose**: Send welcome emails to new users
- **Template Name**: "Welcome Email"
- **Variables**: `{{user_name}}`, `{{business_name}}`

**Template Content:**
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Welcome to FaithConnect</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #059669;">FaithConnect</h1>
        </div>
        
        <div style="background: #f0fdf4; padding: 30px; border-radius: 10px; text-align: center;">
            <h2 style="color: #166534; margin-bottom: 20px;">Welcome to FaithConnect! 🎉</h2>
            <p style="font-size: 16px; margin-bottom: 25px;">
                Hello {{user_name}},<br>
                Welcome to FaithConnect! We're excited to have you join our community.
            </p>
            
            <div style="background: #ffffff; border: 2px solid #059669; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <h3 style="color: #059669; margin-bottom: 15px;">Getting Started</h3>
                <ul style="text-align: left; color: #166534;">
                    <li>Complete your business profile</li>
                    <li>Upload business images and logo</li>
                    <li>Connect with other businesses</li>
                    <li>Explore our directory</li>
                </ul>
            </div>
            
            <p style="font-size: 14px; color: #166534;">
                If you have any questions, feel free to reach out to our support team.
            </p>
        </div>
        
        <div style="text-align: center; margin-top: 30px; color: #64748b; font-size: 12px;">
            <p>© 2025 FaithConnect. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
```

## 🔑 **How to Create Templates in ZeptoMail:**

1. **Go to your ZeptoMail Dashboard**
2. **Click on "Templates" tab**
3. **Click "Add new template"**
4. **Fill in the details:**
   - **Name**: Template name (e.g., "Email Verification OTP")
   - **Subject**: Email subject line
   - **Content**: Copy the HTML content above
5. **Save the template**
6. **Copy the Template Key** (click the copy icon)
7. **Add to your `.env` file**

## 📝 **Update Your `.env` File:**

```bash
# ZeptoMail Configuration
ZEPTO_API_KEY=your_actual_api_key_here
ZEPTO_FROM_EMAIL=noreply@faithconnect.biz
ZEPTO_FROM_NAME=FaithConnect
ZEPTO_VERIFICATION_TEMPLATE_KEY=2d6f.625e187...  # From "Email Verification OTP"
ZEPTO_PASSWORD_RESET_TEMPLATE_KEY=2d6f.625e187... # From "Password Reset"
ZEPTO_WELCOME_TEMPLATE_KEY=2d6f.625e187...        # From "Welcome Email"

# SMS Configuration
SMS_API_KEY=your_ndovubase_api_key_here
SMS_SECRET=your_ndovubase_secret_here
SMS_FROM_NUMBER=CHOSENGCM
```

## 🧪 **Testing the Templates:**

1. **Run the test script**: `python test_otp_system.py`
2. **Check your email** for test messages
3. **Verify the templates** look correct
4. **Test with real users**

## 🎨 **Customizing Templates:**

- **Colors**: Change the hex color codes
- **Fonts**: Modify the font-family
- **Layout**: Adjust padding, margins, and borders
- **Branding**: Add your logo and company colors
- **Variables**: Use the merge variables in your Django code

## 📱 **Mobile Responsiveness:**

The templates are designed to work on both desktop and mobile devices. Test them on different screen sizes to ensure they look good everywhere.
