# Email Notification System

## Overview

The Digital Wholesale Catalogue now includes a comprehensive automated email notification system that sends emails to buyers for various events. The system is designed to be reliable, scalable, and easily configurable.

## Features

### 1. Registration Completion Notification
- **Trigger**: When a buyer successfully registers
- **Action**: Sends a welcome email confirming registration receipt and review status
- **Template**: Professional welcome email with registration details

### 2. Registration Status Decision Notification
- **Trigger**: When an admin approves or denies a registration
- **Action**: Sends approval or denial email with optional reason
- **Template**: Status-specific email with next steps or explanation

### 3. New Collection Available Notification
- **Trigger**: When a new collection is uploaded to the catalogue
- **Action**: Notifies buyers with access to the brand about new collections
- **Template**: Collection announcement with direct link to view

### 4. Order Status Change Notification
- **Trigger**: When order status is updated (approved, rejected, payment received, etc.)
- **Action**: Sends email with new status and relevant details
- **Template**: Status update email with order details and next steps

## Configuration

### Email Service Setup

The system supports multiple email service providers:

#### Gmail (Default)
```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
ADMIN_EMAIL=admin@digitalwholesale.com
```

#### SMTP Configuration
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

#### SendGrid
```env
SENDGRID_API_KEY=your-sendgrid-api-key
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
```

#### Mailgun
```env
MAILGUN_API_KEY=your-mailgun-api-key
MAILGUN_DOMAIN=your-mailgun-domain
MAILGUN_FROM_EMAIL=noreply@yourdomain.com
```

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `EMAIL_USER` | Gmail account for sending emails | Yes (for Gmail) |
| `EMAIL_PASS` | Gmail app password | Yes (for Gmail) |
| `ADMIN_EMAIL` | Admin email address for notifications | Yes |
| `FRONTEND_URL` | Frontend URL for email links | Yes |
| `SMTP_HOST` | SMTP server host | No |
| `SMTP_PORT` | SMTP server port | No |
| `SMTP_SECURE` | Use SSL/TLS for SMTP | No |
| `SENDGRID_API_KEY` | SendGrid API key | No |
| `MAILGUN_API_KEY` | Mailgun API key | No |

## Email Templates

All email templates are HTML-based with consistent styling:

### Template Features
- Responsive design
- Professional branding
- Clear call-to-action buttons
- Company contact information
- Consistent color scheme

### Template Structure
```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
  <!-- Header -->
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #333; margin: 0;">Digital Wholesale Catalogue</h1>
  </div>
  
  <!-- Content -->
  <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">Title</h2>
  <p>Message content...</p>
  
  <!-- Action Button -->
  <div style="text-align: center; margin: 30px 0;">
    <a href="..." style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Action</a>
  </div>
  
  <!-- Footer -->
  <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center;">
    <p style="margin: 0; color: #666;">Best regards,<br><strong>Digital Wholesale Catalogue Team</strong></p>
  </div>
</div>
```

## API Endpoints

### Notification Management
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id/read` - Mark notification as read
- `PUT /api/notifications/read-all` - Mark all notifications as read
- `GET /api/notifications/stats` - Get notification statistics

### Query Parameters
- `limit` - Number of notifications to return (default: 50)
- `unreadOnly` - Return only unread notifications (true/false)

## Database Schema

### Notification Model
```javascript
{
  userId: ObjectId,           // User who receives the notification
  type: String,               // Notification type
  title: String,              // Notification title
  message: String,            // Notification message
  read: Boolean,              // Read status
  emailSent: Boolean,         // Email sent status
  emailSentAt: Date,          // Email sent timestamp
  emailRecipient: String,     // Email recipient
  emailSubject: String,       // Email subject
  emailTemplate: String,      // Email template used
  emailError: String,         // Email error message
  emailData: Mixed,           // Additional email data
  createdAt: Date             // Creation timestamp
}
```

## Testing

Run the email notification test script:

```bash
node test-email-notifications.js
```

This script will:
1. Test registration completion notifications
2. Test registration status update notifications
3. Test new collection notifications
4. Test order status update notifications
5. Check notification logs

## Error Handling

The system includes comprehensive error handling:

### Email Failures
- Failed emails are logged in the database
- Error messages are captured for debugging
- System continues to function even if emails fail

### Retry Logic
- Email failures don't break the main application flow
- Failed notifications are logged for manual review
- System provides detailed error messages

## Monitoring

### Notification Statistics
The system tracks:
- Total notifications sent
- Unread notifications
- Email success/failure rates
- Notification types and frequencies

### Logging
All email activities are logged:
- Successful email sends
- Failed email attempts
- Error messages and stack traces
- Performance metrics

## Security Considerations

### Email Security
- Uses secure SMTP connections
- Implements rate limiting
- Validates email addresses
- Sanitizes email content

### Data Protection
- Email addresses are encrypted in logs
- Personal data is handled securely
- Compliance with data protection regulations

## Performance Optimization

### Email Queuing
- Emails are sent asynchronously
- Batch processing for multiple recipients
- Rate limiting to prevent spam

### Database Optimization
- Indexed queries for fast retrieval
- Efficient notification storage
- Automatic cleanup of old notifications

## Troubleshooting

### Common Issues

1. **Emails not sending**
   - Check email service credentials
   - Verify SMTP settings
   - Check firewall/network settings

2. **Gmail authentication issues**
   - Enable 2-factor authentication
   - Generate app-specific password
   - Check Gmail security settings

3. **Template rendering issues**
   - Check HTML syntax
   - Verify template variables
   - Test with different email clients

### Debug Mode
Enable debug logging by setting:
```env
NODE_ENV=development
```

## Future Enhancements

### Planned Features
- Email templates customization
- Advanced scheduling
- A/B testing for templates
- Analytics dashboard
- Webhook notifications

### Scalability Improvements
- Redis-based email queuing
- Microservice architecture
- Cloud email service integration
- Advanced monitoring and alerting

## Support

For issues with the email notification system:
1. Check the logs for error messages
2. Verify email service configuration
3. Test with the provided test script
4. Contact the development team

## Changelog

### Version 1.0.0
- Initial email notification system
- Four core notification types
- Gmail SMTP integration
- Notification logging and tracking
- Comprehensive error handling 