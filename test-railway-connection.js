const axios = require('axios');

console.log('🔍 Testing Railway Backend Connection...\n');

const RAILWAY_URL = 'https://offaccess-portal-production.up.railway.app';

async function testRailwayConnection() {
  try {
    console.log('📡 Testing basic connectivity to Railway backend...');
    console.log(`🌐 URL: ${RAILWAY_URL}`);
    
    // Test 1: Basic health check
    console.log('\n1️⃣ Testing health check endpoint...');
    const healthResponse = await axios.get(`${RAILWAY_URL}/api/health`, {
      timeout: 10000
    });
    console.log('✅ Health check successful:', healthResponse.status);
    console.log('📋 Response:', healthResponse.data);
    
  } catch (error) {
    console.log('❌ Health check failed:', error.message);
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Data:', error.response.data);
    }
  }

  try {
    // Test 2: Test password reset endpoint (the one that's failing)
    console.log('\n2️⃣ Testing password reset endpoint...');
    const resetResponse = await axios.post(`${RAILWAY_URL}/api/auth/forgot-password`, {
      email: 'test@example.com'
    }, {
      timeout: 30000, // 30 seconds for email operations
      headers: {
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ Password reset endpoint successful:', resetResponse.status);
    console.log('📋 Response:', resetResponse.data);
    
  } catch (error) {
    console.log('❌ Password reset endpoint failed:', error.message);
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Data:', error.response.data);
      console.log('Headers:', error.response.headers);
    }
    
    // Check if it's a timeout error
    if (error.code === 'ECONNABORTED') {
      console.log('\n💡 This confirms the email service timeout issue!');
      console.log('💡 The backend is reachable but email sending is timing out.');
    }
  }

  try {
    // Test 3: Test registration endpoint
    console.log('\n3️⃣ Testing registration endpoint...');
    const timestamp = Date.now();
    const uniqueEmail = `test${timestamp}@example.com`;
    
    const registerResponse = await axios.post(`${RAILWAY_URL}/api/auth/register`, {
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
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ Registration endpoint successful:', registerResponse.status);
    console.log('📋 Response:', registerResponse.data);
    
  } catch (error) {
    console.log('❌ Registration endpoint failed:', error.message);
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Data:', error.response.data);
    }
    
    if (error.code === 'ECONNABORTED') {
      console.log('\n💡 Registration also times out - confirms email service issue!');
    }
  }

  try {
    // Test 4: Check Railway deployment status
    console.log('\n4️⃣ Checking Railway deployment info...');
    const infoResponse = await axios.get(`${RAILWAY_URL}/api/info`, {
      timeout: 10000
    });
    console.log('✅ Railway info endpoint successful:', infoResponse.status);
    console.log('📋 Deployment info:', infoResponse.data);
    
  } catch (error) {
    console.log('❌ Railway info endpoint failed:', error.message);
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Data:', error.response.data);
    }
  }

  console.log('\n🔍 Root Cause Analysis:');
  console.log('Based on the test results above:');
  console.log('1. If health check fails: Railway deployment issue');
  console.log('2. If health check passes but email endpoints timeout: Email service issue');
  console.log('3. If all endpoints fail: Network/configuration issue');
}

testRailwayConnection().catch(console.error);
