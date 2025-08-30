const nodemailer = require('nodemailer');

console.log('🔍 Testing Gmail SMTP Configuration\n');

// Test the exact configuration that will be used in Railway
const testGmailConfig = () => {
  console.log('📧 Testing Gmail SMTP Configuration:');
  console.log('Host: smtp.gmail.com');
  console.log('Port: 587');
  console.log('Secure: false');
  console.log('RequireTLS: true');
  console.log('Family: 4 (IPv4)');
  console.log('Timeouts: 30 seconds\n');

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
      user: process.env.EMAIL_USER || 'info@offaccess.com',
      pass: process.env.EMAIL_PASS || 'xcyn djju mtey dkcf'
    },
    family: 4, // Force IPv4 to avoid IPv6 issues
    connectionTimeout: 30000, // 30 seconds
    greetingTimeout: 30000,   // 30 seconds
    socketTimeout: 30000,     // 30 seconds
    logger: true, // Enable logging for debugging
    debug: true   // Enable debug output
  });

  console.log('🔍 Verifying SMTP connection...');
  
  return new Promise((resolve, reject) => {
    transporter.verify((error, success) => {
      if (error) {
        console.log('❌ SMTP connection failed:', error.message);
        console.log('📋 Error details:', error);
        reject(error);
      } else {
        console.log('✅ SMTP connection successful!');
        console.log('📋 Server response:', success);
        resolve(success);
      }
    });
  });
};

// Test sending an email
const testSendEmail = async () => {
  console.log('\n📤 Testing email sending...');
  
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
      user: process.env.EMAIL_USER || 'info@offaccess.com',
      pass: process.env.EMAIL_PASS || 'xcyn djju mtey dkcf'
    },
    family: 4,
    connectionTimeout: 30000,
    greetingTimeout: 30000,
    socketTimeout: 30000,
    logger: true,
    debug: true
  });

  const mailOptions = {
    from: process.env.ADMIN_EMAIL || process.env.EMAIL_USER || 'info@offaccess.com',
    to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER || 'info@offaccess.com',
    subject: 'Gmail SMTP Test - Off Access',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>🔧 Gmail SMTP Configuration Test</h2>
        <p>This email confirms that the Gmail SMTP configuration is working correctly.</p>
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3>Configuration Details:</h3>
          <ul>
            <li><strong>Host:</strong> smtp.gmail.com</li>
            <li><strong>Port:</strong> 587</li>
            <li><strong>Security:</strong> STARTTLS</li>
            <li><strong>IPv4:</strong> Forced</li>
            <li><strong>Timeout:</strong> 30 seconds</li>
          </ul>
        </div>
        <p>If you receive this email, the Railway email service should work correctly!</p>
      </div>
    `
  };

  try {
    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Test email sent successfully!');
    console.log('📧 Message ID:', result.messageId);
    return result;
  } catch (error) {
    console.log('❌ Test email failed:', error.message);
    console.log('📋 Error details:', error);
    throw error;
  }
};

// Run tests
const runTests = async () => {
  try {
    await testGmailConfig();
    await testSendEmail();
    console.log('\n🎉 All tests passed! Gmail SMTP configuration is working correctly.');
  } catch (error) {
    console.log('\n❌ Tests failed. Check the error details above.');
    console.log('\n🔧 Troubleshooting steps:');
    console.log('1. Verify Gmail app password is correct');
    console.log('2. Check if 2-factor authentication is enabled');
    console.log('3. Ensure Gmail SMTP is enabled');
    console.log('4. Check network connectivity to smtp.gmail.com:587');
  }
};

runTests().catch(console.error);
