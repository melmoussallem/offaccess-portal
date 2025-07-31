const axios = require('axios');

async function testRailwaySimple() {
  console.log('🔍 Testing Railway Simple Connection...\n');

  const railwayUrl = 'https://offaccess-portal-production.up.railway.app';
  
  try {
    console.log('📡 Testing root endpoint...');
    const rootResponse = await axios.get(`${railwayUrl}/`, {
      timeout: 10000
    });
    
    console.log('✅ Root endpoint successful!');
    console.log('📋 Response:', rootResponse.data);
    
  } catch (error) {
    console.error('❌ Root endpoint failed:');
    console.error('Error:', error.message);
    
    if (error.response) {
      console.error('Response Status:', error.response.status);
      console.error('Response Data:', error.response.data);
    }
  }

  try {
    console.log('\n📡 Testing health endpoint...');
    const healthResponse = await axios.get(`${railwayUrl}/api/health`, {
      timeout: 10000
    });
    
    console.log('✅ Health endpoint successful!');
    console.log('📋 Response:', healthResponse.data);
    
  } catch (error) {
    console.error('❌ Health endpoint failed:');
    console.error('Error:', error.message);
    
    if (error.response) {
      console.error('Response Status:', error.response.status);
      console.error('Response Data:', error.response.data);
    }
  }
}

testRailwaySimple(); 