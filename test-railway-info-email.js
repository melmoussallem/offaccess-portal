const axios = require('axios');

console.log('🔍 Testing Railway Email Service with info@offaccess.com...\n');

const RAILWAY_URL = 'https://offaccess-portal-production.up.railway.app';

async function testInfoEmailService() {
  try {
    console.log('📧 Testing password reset for info@offaccess.com...');
    console.log('🌐 Railway URL:', RAILWAY_URL);
    console.log('📧 Test email: info@offaccess.com\n');
    
    const response = await axios.post(`${RAILWAY_URL}/api/auth/forgot-password`, {
      email: 'info@offaccess.com'
    }, {
      timeout: 60000, // 60 seconds to capture full error
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Password reset successful!');
    console.log('📋 Response:', response.data);
    console.log('\n🎉 Email service is working correctly!');
    
  } catch (error) {
    console.log('❌ Password reset failed with details:');
    console.log('Error message:', error.message);
    console.log('Error code:', error.code);
    
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Status text:', error.response.statusText);
      console.log('Response data:', error.response.data);
    }
    
    if (error.code === 'ECONNABORTED') {
      console.log('\n💡 This confirms the email service timeout issue!');
      console.log('💡 The Gmail app password for info@offaccess.com may be expired or invalid.');
    }
    
    console.log('\n🔧 Next Steps:');
    console.log('1. Check if 2-factor authentication is enabled for info@offaccess.com');
    console.log('2. Generate a new Gmail app password');
    console.log('3. Update Railway environment variables with the new password');
  }
}

console.log('🔍 This test will verify if the Railway email service works with info@offaccess.com');
console.log('📋 If it fails, the Gmail app password needs to be regenerated\n');

testInfoEmailService().catch(console.error);
