const axios = require('axios');

async function testApiEndpoints() {
  console.log('🔍 Testing API Endpoints...\n');

  const baseUrl = 'https://api.portal.offaccess.com';
  
  // Test dashboard endpoint
  try {
    console.log('📡 Testing dashboard endpoint...');
    const dashboardResponse = await axios.get(`${baseUrl}/api/dashboard`, {
      timeout: 10000,
      headers: {
        'Authorization': 'Bearer test-token'
      }
    });
    console.log('✅ Dashboard endpoint successful!');
    console.log('📋 Status:', dashboardResponse.status);
  } catch (error) {
    console.error('❌ Dashboard endpoint failed:');
    console.error('Status:', error.response?.status);
    console.error('Data:', error.response?.data);
  }

  // Test orders endpoint
  try {
    console.log('\n📡 Testing orders endpoint...');
    const ordersResponse = await axios.get(`${baseUrl}/api/orders`, {
      timeout: 10000,
      headers: {
        'Authorization': 'Bearer test-token'
      }
    });
    console.log('✅ Orders endpoint successful!');
    console.log('📋 Status:', ordersResponse.status);
  } catch (error) {
    console.error('❌ Orders endpoint failed:');
    console.error('Status:', error.response?.status);
    console.error('Data:', error.response?.data);
  }

  // Test root endpoint
  try {
    console.log('\n📡 Testing root endpoint...');
    const rootResponse = await axios.get(`${baseUrl}/`, {
      timeout: 10000
    });
    console.log('✅ Root endpoint successful!');
    console.log('📋 Status:', rootResponse.status);
  } catch (error) {
    console.error('❌ Root endpoint failed:');
    console.error('Status:', error.response?.status);
    console.error('Data:', error.response?.data);
  }
}

testApiEndpoints(); 