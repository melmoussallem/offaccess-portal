const axios = require('axios');

async function testEmailService() {
  console.log('🔍 Testing Email Service...\n');

  const baseUrl = 'https://offaccess-portal-production.up.railway.app';
  
  try {
    console.log('📡 Testing forgot password with correct email...');
    const response = await axios.post(`${baseUrl}/api/auth/forgot-password`, {
      email: 'mmoussallem@mba2025.hbs.edu'
    }, {
      timeout: 15000, // Increased timeout
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Forgot password endpoint successful!');
    console.log('📋 Status:', response.status);
    console.log('📋 Response:', response.data);
    
  } catch (error) {
    console.error('❌ Forgot password endpoint failed:');
    console.error('Error:', error.message);
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
      console.error('Headers:', error.response.headers);
    }
  }
}

testEmailService();
