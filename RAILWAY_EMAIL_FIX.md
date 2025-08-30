# 🚂 Railway Email Service Fix

## 🔍 Root Cause Identified

The Railway backend is working correctly, but the email service is failing because:

1. **Railway is using `info@offaccess.com`** with Gmail app password
2. **Gmail is blocking the connection** from Railway servers (connection timeout)
3. **The app password for `info@offaccess.com` may be expired or invalid**

## 🚀 Immediate Fix

### Option 1: Fix Gmail App Password (Recommended)

The issue is likely with the Gmail app password for `info@offaccess.com`. Let's fix it:

1. Go to [Railway Dashboard](https://railway.app)
2. Select your project: `offaccess-portal-production`
3. Go to **Variables** tab
4. Update these variables:

```env
EMAIL_USER=info@offaccess.com
EMAIL_PASS=your_new_gmail_app_password_for_info@offaccess.com
ADMIN_EMAIL=info@offaccess.com
```

**Note**: This keeps the same email configuration but with a fresh app password.

### Option 2: Generate New Gmail App Password

1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Sign in with `info@offaccess.com`
3. Go to **Security** → **2-Step Verification**
4. Enable 2-Step Verification if not already enabled
5. Go to **App passwords**
6. Generate a new app password for "Mail"
7. Update Railway environment variables with the new password

### Option 3: Use Alternative Email Service

For production reliability, consider using SendGrid:

1. Sign up at [SendGrid](https://sendgrid.com)
2. Create an API key
3. Update Railway environment variables:

```env
SENDGRID_API_KEY=your_sendgrid_api_key
EMAIL_FROM=info@offaccess.com
```

## 🔧 Testing the Fix

After updating Railway environment variables:

1. **Redeploy** the Railway service (it should auto-redeploy)
2. **Test password reset** at: https://portal.offaccess.com/forgot-password
3. **Test registration** at: https://portal.offaccess.com/register

## 📋 Current Railway Environment Variables

Based on the test results, Railway currently has:

```env
MONGODB_URI=mongodb+srv://melmoussallem:aQI5qbL23FKti3cV@cluster0.gjbkrwp.mongodb.net/digital-wholesale-catalogue?retryWrites=true&w=majority
JWT_SECRET=c4e636a44a346e72420e576d21bcd4ff6690e2d131d1e0b998fcb71a7e46ff8c
EMAIL_USER=info@offaccess.com
EMAIL_PASS=wmyj okmb jeon vvbw
ADMIN_EMAIL=info@offaccess.com
NODE_ENV=production
FRONTEND_URL=https://portal.offaccess.com
```

## 🎯 Recommended Action

**Use Option 2** (generate new Gmail app password) for immediate fix, then consider **Option 3** (SendGrid) for long-term reliability.

The issue is likely that the Gmail app password for `info@offaccess.com` has expired or is invalid.
