const axios = require('axios');

async function testRailwayEmailEnv() {
  console.log('🔍 Testing Railway Email Environment Variables...\n');

  const baseUrl = 'https://offaccess-portal-production.up.railway.app';
  
  // Generate unique email
  const timestamp = Date.now();
  const uniqueEmail = `test${timestamp}@example.com`;
  
  try {
    console.log('📡 Testing registration endpoint to see email service...');
    console.log(`📧 Using unique email: ${uniqueEmail}`);
    
    const response = await axios.post(`${baseUrl}/api/auth/register`, {
      name: 'Test User',
      email: uniqueEmail,
      password: 'testpassword123',
      phone: '+1234567890',
      phoneCountryCode: 'us',
      companyName: 'Test Company',
      companyAddress: { 
        street: 'Test Street 123', 
        city: 'Test City', 
        country: 'Test Country' 
      },
      buyerType: 'Retail'
    }, {
      timeout: 20000, // 20 second timeout
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Registration endpoint successful!');
    console.log('📋 Status:', response.status);
    console.log('📋 Response:', response.data);
    
  } catch (error) {
    console.error('❌ Registration endpoint failed:');
    console.error('Error:', error.message);
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
      console.error('Headers:', error.response.headers);
    }
    
    if (error.code === 'ECONNABORTED') {
      console.log('\n💡 This suggests the email service is timing out');
      console.log('💡 Railway might still be using old environment variables');
    }
  }
}

testRailwayEmailEnv();
