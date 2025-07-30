# Email Notification Setup Guide

## Current Status
- ✅ Login system is working
- ✅ In-app notifications are working (bell icon with badge)
- ❌ Email notifications are not configured

## To Enable Email Notifications

### Option 1: Gmail Setup (Recommended for testing)

1. **Create a Gmail App Password:**
   - Go to your Google Account settings
   - Navigate to Security > 2-Step Verification
   - Create an App Password for "Mail"
   - Copy the generated password

2. **Set Environment Variables:**
   Create a `.env` file in the root directory with:
   ```
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   ADMIN_EMAIL=admin@digitalwholesale.com
   FRONTEND_URL=http://localhost:3000
   ```

3. **Restart the server** after adding the environment variables

### Option 2: SendGrid Setup (Production)

1. **Create a SendGrid account**
2. **Generate an API key**
3. **Set environment variables:**
   ```
   SENDGRID_API_KEY=your-sendgrid-api-key
   SENDGRID_FROM_EMAIL=noreply@yourdomain.com
   ```

### Option 3: Mailgun Setup (Production)

1. **Create a Mailgun account**
2. **Get your API key and domain**
3. **Set environment variables:**
   ```
   MAILGUN_API_KEY=your-mailgun-api-key
   MAILGUN_DOMAIN=your-mailgun-domain
   MAILGUN_FROM_EMAIL=noreply@yourdomain.com
   ```

## Testing Email Notifications

Once configured, you can test email notifications by:

1. **Uploading a file** as admin (triggers notifications to buyers)
2. **Creating an order** as buyer (triggers notifications to admin)
3. **Using the test endpoint:**
   ```bash
   curl -X POST http://localhost:5000/api/test-email \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "to": "test@example.com",
       "subject": "Test Email",
       "message": "This is a test email"
     }'
   ```

## Current Working Features

- ✅ User authentication (login/logout)
- ✅ In-app notifications with bell icon and badge
- ✅ Notification dropdown with read/unread status
- ✅ Smart routing based on notification type
- ✅ Backend notification system
- ✅ Email templates ready

## Next Steps

1. Configure email environment variables
2. Test email notifications
3. Verify both in-app and email notifications work together

The system is now ready for both in-app and email notifications once the email configuration is complete. 