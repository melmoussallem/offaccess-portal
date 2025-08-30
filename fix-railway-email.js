const nodemailer = require('nodemailer');

console.log('🔧 Railway Email Fix Script\n');

// Solution 1: Test with current credentials
console.log('📋 Solution 1: Test Current Railway Credentials');
console.log('Current Railway environment variables:');
console.log('EMAIL_USER=info@offaccess.com');
console.log('EMAIL_PASS=wmyj okmb jeon vvbw');
console.log('ADMIN_EMAIL=info@offaccess.com\n');

// Solution 2: Alternative email service setup
console.log('📋 Solution 2: Alternative Email Services');
console.log('If Gmail continues to fail, consider these alternatives:\n');

console.log('Option A: SendGrid (Recommended)');
console.log('1. Sign up at sendgrid.com');
console.log('2. Create an API key');
console.log('3. Update Railway environment variables:');
console.log('   SENDGRID_API_KEY=your_sendgrid_api_key');
console.log('   EMAIL_FROM=info@offaccess.com\n');

console.log('Option B: Mailgun');
console.log('1. Sign up at mailgun.com');
console.log('2. Get API key and domain');
console.log('3. Update Railway environment variables:');
console.log('   MAILGUN_API_KEY=your_mailgun_api_key');
console.log('   MAILGUN_DOMAIN=your_domain.com\n');

console.log('Option C: AWS SES');
console.log('1. Set up AWS SES');
console.log('2. Get access keys');
console.log('3. Update Railway environment variables:');
console.log('   AWS_ACCESS_KEY_ID=your_aws_access_key');
console.log('   AWS_SECRET_ACCESS_KEY=your_aws_secret_key');
console.log('   AWS_REGION=us-east-1\n');

// Solution 3: Gmail troubleshooting
console.log('📋 Solution 3: Gmail Troubleshooting Steps');
console.log('1. Check if 2-factor authentication is enabled for info@offaccess.com');
console.log('2. Generate a new app password:');
console.log('   - Go to Google Account settings');
console.log('   - Security > 2-Step Verification > App passwords');
console.log('   - Generate new password for "Mail"');
console.log('3. Update Railway environment variables with new password');
console.log('4. Check if Gmail is blocking Railway IP addresses\n');

// Solution 4: Immediate fix with working credentials
console.log('📋 Solution 4: Immediate Fix (Use Working Gmail)');
console.log('Since melmoussallem@gmail.com works locally, use it temporarily:');
console.log('Update Railway environment variables to:');
console.log('EMAIL_USER=melmoussallem@gmail.com');
console.log('EMAIL_PASS=your_working_app_password');
console.log('ADMIN_EMAIL=info@offaccess.com\n');

console.log('📋 Solution 5: Enhanced Email Service Configuration');
console.log('Update the emailService.js to handle multiple providers:');

const enhancedEmailConfig = `
// Enhanced email configuration with fallback
const createTransporter = () => {
  // Try SendGrid first
  if (process.env.SENDGRID_API_KEY) {
    return nodemailer.createTransport({
      host: 'smtp.sendgrid.net',
      port: 587,
      secure: false,
      auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY
      }
    });
  }
  
  // Try Mailgun
  if (process.env.MAILGUN_API_KEY && process.env.MAILGUN_DOMAIN) {
    return nodemailer.createTransport({
      host: \`smtp.mailgun.org\`,
      port: 587,
      secure: false,
      auth: {
        user: \`postmaster@\${process.env.MAILGUN_DOMAIN}\`,
        pass: process.env.MAILGUN_API_KEY
      }
    });
  }
  
  // Fallback to Gmail
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    connectionTimeout: 20000,
    greetingTimeout: 20000,
    socketTimeout: 20000
  });
};
`;

console.log(enhancedEmailConfig);

console.log('🚀 Next Steps:');
console.log('1. Try Solution 4 first (use working Gmail credentials)');
console.log('2. If that works, then implement Solution 5 (enhanced configuration)');
console.log('3. For long-term reliability, consider Solution 2 (alternative services)');
console.log('4. Test the fix by triggering a password reset or registration');
