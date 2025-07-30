const axios = require('axios');

async function testRailwayURLs() {
  console.log('🔍 Testing possible Railway URLs...\n');
  
  const possibleURLs = [
    'https://offaccess-portal-production.up.railway.app',
    'https://offaccess-portal.up.railway.app',
    'https://offaccess-portal-production.railway.app',
    'https://offaccess-portal.railway.app'
  ];
  
  for (const url of possibleURLs) {
    try {
      console.log(`Testing: ${url}`);
      const response = await axios.get(`${url}/api/health`, { timeout: 5000 });
      console.log(`✅ SUCCESS! Your Railway URL is: ${url}`);
      console.log(`Response:`, response.data);
      return url;
    } catch (error) {
      console.log(`❌ Failed: ${error.message}`);
    }
  }
  
  console.log('\n❌ None of the guessed URLs worked.');
  console.log('Please check your Railway dashboard for the correct URL.');
}

testRailwayURLs(); 