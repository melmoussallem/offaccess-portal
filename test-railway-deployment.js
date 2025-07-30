const axios = require('axios');

async function testRailwayDeployment() {
  console.log('🔍 Testing Railway Deployment...\n');

  const railwayUrl = 'https://offaccess-portal-production.up.railway.app';
  
  try {
    console.log('📡 Testing health endpoint...');
    const healthResponse = await axios.get(`${railwayUrl}/api/health`, {
      timeout: 10000
    });
    
    console.log('✅ Health check successful!');
    console.log('📋 Response:', healthResponse.data);
    
  } catch (error) {
    console.error('❌ Railway deployment test failed:');
    console.error('Error:', error.message);
    
    if (error.response) {
      console.error('Response Status:', error.response.status);
      console.error('Response Data:', error.response.data);
    }
    
    console.log('\n🔧 Troubleshooting Railway:');
    console.log('1. Check Railway dashboard for deployment logs');
    console.log('2. Verify environment variables are set');
    console.log('3. Check if MongoDB Atlas is accessible');
    console.log('4. Ensure Railway has proper build configuration');
  }
}

testRailwayDeployment(); 