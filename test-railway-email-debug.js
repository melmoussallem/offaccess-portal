const axios = require('axios');

console.log('🔍 Testing Railway Email Service Debug...\n');

const RAILWAY_URL = 'https://offaccess-portal-production.up.railway.app';

async function testEmailService() {
  try {
    console.log('📧 Testing password reset with detailed error capture...');
    
    const response = await axios.post(`${RAILWAY_URL}/api/auth/forgot-password`, {
      email: 'info@offaccess.com'
    }, {
      timeout: 60000, // 60 seconds to capture full error
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Password reset successful:', response.data);
    
  } catch (error) {
    console.log('❌ Password reset failed with details:');
    console.log('Error message:', error.message);
    console.log('Error code:', error.code);
    
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Status text:', error.response.statusText);
      console.log('Response data:', error.response.data);
      console.log('Response headers:', error.response.headers);
    }
    
    if (error.request) {
      console.log('Request was made but no response received');
      console.log('Request details:', error.request);
    }
  }
}

console.log('🔍 This test will help identify the exact email service error in Railway');
console.log('📋 The error logs should show the specific nodemailer/Gmail connection issue\n');

testEmailService().catch(console.error);
