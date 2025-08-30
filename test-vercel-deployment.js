const axios = require('axios');

async function testVercelDeployment() {
  console.log('🔍 Testing Vercel Deployment...\n');

  // Test your Vercel URL
  const vercelUrl = 'https://offaccess-portal.vercel.app'; // Replace with your actual Vercel URL
  
  try {
    console.log('📡 Testing Vercel frontend...');
    const response = await axios.get(vercelUrl, {
      timeout: 10000
    });
    
    console.log('✅ Vercel frontend is accessible');
    console.log('📋 Status:', response.status);
    
    // Check if the page contains any API calls
    const html = response.data;
    if (html.includes('localhost:5000')) {
      console.log('❌ Found localhost:5000 in the page - environment variable not being used');
    } else if (html.includes('api.portal.offaccess.com')) {
      console.log('✅ Found Railway URL in the page - environment variable is being used');
    } else {
      console.log('⚠️ Could not determine which API URL is being used');
    }
    
  } catch (error) {
    console.error('❌ Vercel frontend test failed:');
    console.error('Error:', error.message);
  }
}

testVercelDeployment(); 