const nodemailer = require('nodemailer');

async function testInfoEmail() {
  console.log('🔍 Testing info@offaccess.com Email...\n');

  // Test with info@offaccess.com (assuming it's a Gmail account)
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'info@offaccess.com',
      pass: 'wmyj okmb jeon vvbw' // This is the old password for melmoussallem@gmail.com
    }
  });

  try {
    console.log('📧 Testing email connection for info@offaccess.com...');
    
    // Verify the connection
    await transporter.verify();
    console.log('✅ Email connection successful!');
    
    // Try to send a test email
    console.log('📧 Sending test email...');
    const info = await transporter.sendMail({
      from: 'info@offaccess.com',
      to: 'melmoussallem@gmail.com',
      subject: 'Test Email from Off Access Portal',
      text: 'This is a test email to verify the info@offaccess.com email service is working.',
      html: '<p>This is a test email to verify the info@offaccess.com email service is working.</p>'
    });
    
    console.log('✅ Test email sent successfully!');
    console.log('📋 Message ID:', info.messageId);
    
  } catch (error) {
    console.error('❌ Email test failed:');
    console.error('Error:', error.message);
    
    if (error.code) {
      console.error('Error Code:', error.code);
    }
    
    if (error.code === 'EAUTH') {
      console.log('\n💡 This suggests the app password is incorrect for info@offaccess.com');
      console.log('💡 You need to generate a new app password for info@offaccess.com');
    }
  }
}

testInfoEmail();
