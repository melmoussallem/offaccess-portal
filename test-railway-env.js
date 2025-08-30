const axios = require('axios');

async function testRailwayEnv() {
  console.log('🔍 Testing Railway Environment Variables...\n');

  const baseUrl = 'https://offaccess-portal-production.up.railway.app';
  
  try {
    console.log('📡 Testing environment variables endpoint...');
    const response = await axios.get(`${baseUrl}/api/health`, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Health endpoint successful!');
    console.log('📋 Status:', response.status);
    console.log('📋 Environment:', response.data.environment);
    console.log('📋 Timestamp:', response.data.timestamp);
    
    // Try a simple auth endpoint to see if it responds
    console.log('\n📡 Testing auth endpoint...');
    const authResponse = await axios.get(`${baseUrl}/api/auth`, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Auth endpoint successful!');
    console.log('📋 Status:', authResponse.status);
    
  } catch (error) {
    console.error('❌ Test failed:');
    console.error('Error:', error.message);
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

testRailwayEnv();
