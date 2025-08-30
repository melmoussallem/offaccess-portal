require('dotenv').config();
const nodemailer = require('nodemailer');

console.log('🔍 Testing Railway Email Environment...\n');

// Check environment variables
console.log('📧 Environment Variables:');
console.log('EMAIL_USER:', process.env.EMAIL_USER || 'NOT SET');
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '***SET***' : 'NOT SET');
console.log('ADMIN_EMAIL:', process.env.ADMIN_EMAIL || 'NOT SET');
console.log('NODE_ENV:', process.env.NODE_ENV || 'NOT SET');
console.log('FRONTEND_URL:', process.env.FRONTEND_URL || 'NOT SET');

// Test email configuration
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.log('\n❌ Email credentials not found in environment variables');
  console.log('Please set EMAIL_USER and EMAIL_PASS in your Railway environment variables');
  process.exit(1);
}

// Create transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  connectionTimeout: 15000, // 15 seconds
  greetingTimeout: 15000,   // 15 seconds
  socketTimeout: 15000      // 15 seconds
});

console.log('\n🔍 Testing email connection...');

// Test connection
transporter.verify((error, success) => {
  if (error) {
    console.log('❌ Email connection failed:', error.message);
    console.log('\n🔧 Troubleshooting steps:');
    console.log('1. Check if the Gmail app password is still valid');
    console.log('2. Verify that 2-factor authentication is enabled for info@offaccess.com');
    console.log('3. Generate a new app password if needed');
    console.log('4. Check if Gmail is blocking connections from Railway servers');
    console.log('5. Consider using a different email service (SendGrid, Mailgun, etc.)');
  } else {
    console.log('✅ Email connection verified successfully!');
    
    // Test sending an email
    console.log('\n📤 Testing email sending...');
    
    const mailOptions = {
      from: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
      subject: 'Railway Email Test - Off Access',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>🚂 Railway Email Test</h2>
          <p>This is a test email from your Railway deployment to verify email functionality.</p>
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3>Test Details:</h3>
            <ul>
              <li><strong>From:</strong> ${process.env.EMAIL_USER}</li>
              <li><strong>To:</strong> ${process.env.ADMIN_EMAIL || process.env.EMAIL_USER}</li>
              <li><strong>Environment:</strong> ${process.env.NODE_ENV}</li>
              <li><strong>Timestamp:</strong> ${new Date().toISOString()}</li>
            </ul>
          </div>
          <p>If you receive this email, your Railway email configuration is working correctly!</p>
        </div>
      `
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log('❌ Email sending failed:', error.message);
        console.log('\n🔧 Possible solutions:');
        console.log('1. Check Gmail app password validity');
        console.log('2. Verify sender email permissions');
        console.log('3. Check Railway network connectivity');
        console.log('4. Consider alternative email services');
      } else {
        console.log('✅ Test email sent successfully!');
        console.log('📧 Message ID:', info.messageId);
        console.log('\n🎉 Railway email configuration is working!');
      }
    });
  }
});
