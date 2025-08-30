const nodemailer = require('nodemailer');

async function testEmailCredentials() {
  console.log('🔍 Testing Email Credentials...\n');

  // Use the same email configuration as the server
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'melmoussallem@gmail.com',
      pass: 'wmyj okmb jeon vvbw'
    }
  });

  try {
    console.log('📧 Testing email connection...');
    
    // Verify the connection
    await transporter.verify();
    console.log('✅ Email connection successful!');
    
    // Try to send a test email
    console.log('📧 Sending test email...');
    const info = await transporter.sendMail({
      from: 'melmoussallem@gmail.com',
      to: 'melmoussallem@gmail.com',
      subject: 'Test Email from Off Access Portal',
      text: 'This is a test email to verify the email service is working.',
      html: '<p>This is a test email to verify the email service is working.</p>'
    });
    
    console.log('✅ Test email sent successfully!');
    console.log('📋 Message ID:', info.messageId);
    
  } catch (error) {
    console.error('❌ Email test failed:');
    console.error('Error:', error.message);
    
    if (error.code) {
      console.error('Error Code:', error.code);
    }
  }
}

testEmailCredentials();
