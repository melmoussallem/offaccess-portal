const fs = require('fs');
const path = require('path');

console.log('🔧 Gmail Email Setup for Digital Wholesale Catalogue');
console.log('===================================================\n');

// Check if .env file already exists
const envPath = path.join(__dirname, '.env');
const envExists = fs.existsSync(envPath);

if (envExists) {
  console.log('⚠️  .env file already exists!');
  console.log('Please manually update your .env file with the following email settings:\n');
} else {
  console.log('📝 Creating .env file with Gmail configuration...\n');
}

// Email configuration template
const emailConfig = `# Email Configuration - Gmail Setup
EMAIL_USER=info@offaccess.com
EMAIL_PASS=your-gmail-app-password
ADMIN_EMAIL=info@offaccess.com`;

console.log('📧 Email Configuration to add to your .env file:');
console.log('===============================================');
console.log(emailConfig);
console.log('\n');

console.log('📋 Next Steps:');
console.log('==============');
console.log('1. Create a .env file in the root directory if it doesn\'t exist');
console.log('2. Add the email configuration above to your .env file');
console.log('3. Set up Gmail App Password (see GMAIL_EMAIL_SETUP.md)');
console.log('4. Replace "your-gmail-app-password" with your actual app password');
console.log('5. Restart your server');
console.log('6. Test the email system with: node test-email-notifications.js');
console.log('\n');

console.log('🔐 Gmail App Password Setup:');
console.log('=============================');
console.log('1. Go to your Google Account settings');
console.log('2. Navigate to Security');
console.log('3. Enable 2-Step Verification if not already enabled');
console.log('4. Go to "App passwords" under "Signing in to Google"');
console.log('5. Select "Mail" as the app and "Other" as the device');
console.log('6. Click "Generate" and copy the 16-character password');
console.log('7. Replace "your-gmail-app-password" in .env with this password');
console.log('\n');

console.log('✅ Once configured, all email notifications will be sent from:');
console.log('   From: info@offaccess.com');
console.log('   To: Buyer email addresses');
console.log('\n');

console.log('📖 For detailed instructions, see: GMAIL_EMAIL_SETUP.md');
console.log('🧪 To test the setup, run: node test-email-notifications.js'); 