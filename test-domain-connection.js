const axios = require('axios');

async function testDomainConnection() {
  console.log('🔍 Testing Domain Connection...\n');

  const domainUrl = 'https://api.portal.offaccess.com';
  
  try {
    console.log('📡 Testing health endpoint...');
    const healthResponse = await axios.get(`${domainUrl}/api/health`, {
      timeout: 10000
    });
    
    console.log('✅ Domain connection successful!');
    console.log('📋 Response:', healthResponse.data);
    
  } catch (error) {
    console.error('❌ Domain connection failed:');
    console.error('Error:', error.message);
    
    if (error.response) {
      console.error('Response Status:', error.response.status);
      console.error('Response Data:', error.response.data);
    }
    
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check if DNS has propagated (can take 24 hours)');
    console.log('2. Verify Railway domain is set to api.portal.offaccess.com');
    console.log('3. Check if CNAME record is correct');
  }
}

testDomainConnection(); 