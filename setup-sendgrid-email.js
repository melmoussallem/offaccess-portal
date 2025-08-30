const nodemailer = require('nodemailer');

console.log('📧 Setting up SendGrid Email Service for Railway\n');

// SendGrid SMTP Configuration (more reliable than Gmail on Railway)
const createSendGridTransporter = () => {
  console.log('🔧 Creating SendGrid SMTP transporter...');
  
  return nodemailer.createTransport({
    host: 'smtp.sendgrid.net',
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
      user: 'apikey', // SendGrid always uses 'apikey' as username
      pass: process.env.SENDGRID_API_KEY
    },
    family: 4, // Force IPv4
    connectionTimeout: 30000,
    greetingTimeout: 30000,
    socketTimeout: 30000,
    logger: true,
    debug: true
  });
};

// Test SendGrid configuration
const testSendGrid = async () => {
  console.log('🧪 Testing SendGrid configuration...');
  
  if (!process.env.SENDGRID_API_KEY) {
    console.log('❌ SENDGRID_API_KEY not found in environment variables');
    console.log('📋 Please set SENDGRID_API_KEY in your Railway environment variables');
    return false;
  }

  const transporter = createSendGridTransporter();
  
  try {
    // Verify connection
    console.log('🔍 Verifying SendGrid SMTP connection...');
    await new Promise((resolve, reject) => {
      transporter.verify((error, success) => {
        if (error) {
          console.log('❌ SendGrid connection failed:', error.message);
          reject(error);
        } else {
          console.log('✅ SendGrid connection successful!');
          resolve(success);
        }
      });
    });

    // Test email sending
    console.log('📤 Testing SendGrid email sending...');
    const mailOptions = {
      from: process.env.ADMIN_EMAIL || 'info@offaccess.com',
      to: process.env.ADMIN_EMAIL || 'info@offaccess.com',
      subject: 'SendGrid Test - Off Access',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>📧 SendGrid Email Test</h2>
          <p>This email confirms that SendGrid is working correctly on Railway.</p>
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3>Configuration:</h3>
            <ul>
              <li><strong>Provider:</strong> SendGrid</li>
              <li><strong>Host:</strong> smtp.sendgrid.net</li>
              <li><strong>Port:</strong> 587</li>
              <li><strong>Security:</strong> STARTTLS</li>
            </ul>
          </div>
          <p>If you receive this email, SendGrid is working and can replace Gmail SMTP!</p>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ SendGrid test email sent successfully!');
    console.log('📧 Message ID:', result.messageId);
    return true;
    
  } catch (error) {
    console.log('❌ SendGrid test failed:', error.message);
    return false;
  }
};

// Instructions for setting up SendGrid
const showSetupInstructions = () => {
  console.log('\n📋 SENDGRID SETUP INSTRUCTIONS:');
  console.log('=====================================');
  console.log('1. Go to https://sendgrid.com/');
  console.log('2. Create a free account (100 emails/day free)');
  console.log('3. Go to Settings > API Keys');
  console.log('4. Create a new API Key with "Mail Send" permissions');
  console.log('5. Copy the API Key');
  console.log('');
  console.log('6. Add to Railway environment variables:');
  console.log('   SENDGRID_API_KEY=your_api_key_here');
  console.log('');
  console.log('7. Update your email service to use SendGrid:');
  console.log('   - Replace Gmail SMTP with SendGrid SMTP');
  console.log('   - Or use SendGrid HTTP API (even more reliable)');
  console.log('');
  console.log('8. Test the configuration');
  console.log('');
  console.log('💡 ADVANTAGES OF SENDGRID:');
  console.log('- More reliable than Gmail SMTP on Railway');
  console.log('- Better deliverability');
  console.log('- Detailed analytics');
  console.log('- HTTP API option (no SMTP needed)');
};

// Run the setup
const runSetup = async () => {
  console.log('🚀 Starting SendGrid setup...\n');
  
  const success = await testSendGrid();
  
  if (success) {
    console.log('\n🎉 SendGrid is working! You can now use it instead of Gmail SMTP.');
    console.log('📧 Update your email service configuration to use SendGrid.');
  } else {
    console.log('\n⚠️  SendGrid test failed. Please follow the setup instructions below.');
    showSetupInstructions();
  }
};

// Show instructions if no API key
if (!process.env.SENDGRID_API_KEY) {
  showSetupInstructions();
} else {
  runSetup().catch(console.error);
}
