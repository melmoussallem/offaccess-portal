const axios = require('axios');

console.log('🔍 Testing Buyer Management API\n');

// Test configuration
const API_BASE_URL = 'https://offaccess-portal-production.up.railway.app';

// Test buyer API endpoints
const testBuyerAPI = async () => {
  console.log('📋 Testing Buyer API Endpoints...\n');

  try {
    // Test 1: Health check
    console.log('1️⃣ Testing API health...');
    const healthResponse = await axios.get(`${API_BASE_URL}/api/health`);
    console.log('✅ API Health:', healthResponse.data);
  } catch (error) {
    console.log('❌ API Health failed:', error.message);
  }

  try {
    // Test 2: Get all buyers (public endpoint)
    console.log('\n2️⃣ Testing GET /api/buyers...');
    const buyersResponse = await axios.get(`${API_BASE_URL}/api/buyers`);
    console.log('✅ Buyers Response Status:', buyersResponse.status);
    console.log('✅ Buyers Data:', buyersResponse.data);
    console.log('✅ Number of buyers:', buyersResponse.data.buyers?.length || 0);
    
    if (buyersResponse.data.buyers && buyersResponse.data.buyers.length > 0) {
      console.log('✅ Sample buyer:', buyersResponse.data.buyers[0]);
    }
  } catch (error) {
    console.log('❌ Buyers API failed:', error.message);
    if (error.response) {
      console.log('❌ Response status:', error.response.status);
      console.log('❌ Response data:', error.response.data);
    }
  }

  try {
    // Test 3: Database connection test
    console.log('\n3️⃣ Testing database connection...');
    const dbResponse = await axios.get(`${API_BASE_URL}/api/test-db`);
    console.log('✅ Database test:', dbResponse.data);
  } catch (error) {
    console.log('❌ Database test failed:', error.message);
  }

  try {
    // Test 4: Check environment variables
    console.log('\n4️⃣ Testing environment variables...');
    const envResponse = await axios.get(`${API_BASE_URL}/api/test-env`);
    console.log('✅ Environment test:', envResponse.data);
  } catch (error) {
    console.log('❌ Environment test failed:', error.message);
  }
};

// Test local vs Railway
const testLocalVsRailway = async () => {
  console.log('\n🔄 Testing Local vs Railway...\n');

  const endpoints = [
    { name: 'Local', url: 'http://localhost:5000' },
    { name: 'Railway', url: API_BASE_URL }
  ];

  for (const endpoint of endpoints) {
    console.log(`📍 Testing ${endpoint.name} (${endpoint.url})...`);
    
    try {
      const response = await axios.get(`${endpoint.url}/api/buyers`, {
        timeout: 10000
      });
      console.log(`✅ ${endpoint.name} - Status: ${response.status}`);
      console.log(`✅ ${endpoint.name} - Buyers count: ${response.data.buyers?.length || 0}`);
    } catch (error) {
      console.log(`❌ ${endpoint.name} - Error: ${error.message}`);
    }
  }
};

// Run tests
const runTests = async () => {
  console.log('🚀 Starting Buyer API Diagnostics...\n');
  
  await testBuyerAPI();
  await testLocalVsRailway();
  
  console.log('\n📊 DIAGNOSTIC SUMMARY:');
  console.log('=====================================');
  console.log('If buyers count is 0:');
  console.log('🔧 POSSIBLE CAUSES:');
  console.log('1. Database connection issue');
  console.log('2. Environment variables missing');
  console.log('3. API endpoint changed');
  console.log('4. Data was accidentally deleted');
  console.log('5. Railway deployment issue');
  console.log('');
  console.log('💡 SOLUTIONS:');
  console.log('1. Check Railway logs');
  console.log('2. Verify database connection');
  console.log('3. Check environment variables');
  console.log('4. Restore from backup');
  console.log('5. Migrate to Google Cloud');
};

runTests().catch(console.error);
