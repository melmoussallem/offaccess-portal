const nodemailer = require('nodemailer');
require('dotenv').config();

async function testEmailConfiguration() {
  console.log('📧 Testing Email Configuration...\n');
  
  // Check if email credentials are set
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('❌ Email credentials not found in .env file');
    console.log('\n🔧 Please add these to your .env file:');
    console.log('EMAIL_USER=your-gmail@gmail.com');
    console.log('EMAIL_PASS=your-16-character-app-password');
    console.log('ADMIN_EMAIL=your-gmail@gmail.com');
    return;
  }

  console.log('✅ Email credentials found in .env file');
  console.log('📧 Email User:', process.env.EMAIL_USER);
  console.log('🔐 Email Pass:', process.env.EMAIL_PASS ? '***SET***' : 'NOT SET');
  console.log('👤 Admin Email:', process.env.ADMIN_EMAIL || 'NOT SET');
  
  try {
    // Create transporter
    console.log('\n🔧 Creating email transporter...');
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Verify connection
    console.log('🔍 Verifying email connection...');
    await transporter.verify();
    console.log('✅ Email connection verified successfully!');

    // Send test email
    console.log('\n📤 Sending test email...');
    const testEmail = {
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
      subject: '🧪 Digital Wholesale Catalogue - Email Test',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2e7d32;">✅ Email Configuration Test Successful!</h2>
          <p>This is a test email to verify that your email configuration is working correctly.</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3>📋 Test Details:</h3>
            <ul>
              <li><strong>From:</strong> ${process.env.EMAIL_USER}</li>
              <li><strong>To:</strong> ${process.env.ADMIN_EMAIL || process.env.EMAIL_USER}</li>
              <li><strong>Service:</strong> Gmail</li>
              <li><strong>Authentication:</strong> App Password</li>
            </ul>
          </div>
          <p>Your email configuration is ready for production! 🚀</p>
          <hr style="margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">
            This email was sent automatically by the Digital Wholesale Catalogue system.
          </p>
        </div>
      `
    };

    const info = await transporter.sendMail(testEmail);
    console.log('✅ Test email sent successfully!');
    console.log('📧 Message ID:', info.messageId);
    console.log('📬 Email sent to:', testEmail.to);

    console.log('\n🎉 Email configuration test completed successfully!');
    console.log('✅ Your email system is ready for production!');
    console.log('\n📧 This email will be used for:');
    console.log('   - Buyer registration notifications');
    console.log('   - Order status updates');
    console.log('   - Admin notifications');
    console.log('   - Password reset emails');
    console.log('   - System alerts');

  } catch (error) {
    console.error('❌ Email configuration test failed:');
    console.error('Error:', error.message);
    
    console.log('\n🔧 Troubleshooting tips:');
    console.log('1. Check your EMAIL_USER and EMAIL_PASS in .env file');
    console.log('2. Verify 2-Factor Authentication is enabled on Gmail');
    console.log('3. Make sure you\'re using an App Password (not regular password)');
    console.log('4. Check that your Gmail account allows "less secure apps" or use App Password');
    console.log('5. Verify your internet connection');
    
    if (error.code === 'EAUTH') {
      console.log('\n🔐 Authentication Error:');
      console.log('- Make sure you\'re using an App Password, not your regular Gmail password');
      console.log('- Generate a new App Password if needed');
    }
    
    if (error.code === 'ECONNECTION') {
      console.log('\n🌐 Connection Error:');
      console.log('- Check your internet connection');
      console.log('- Verify Gmail servers are accessible');
    }
  }
}

// Run the test
testEmailConfiguration(); 