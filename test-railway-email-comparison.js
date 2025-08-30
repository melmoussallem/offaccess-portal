const axios = require('axios');

console.log('🔍 Testing Railway Email Service Comparison...\n');

const RAILWAY_URL = 'https://offaccess-portal-production.up.railway.app';

async function testEmailComparison() {
  const testEmails = [
    'info@offaccess.com',
    'test@example.com',
    'mmoussallem@mba2025.hbs.edu'
  ];

  for (const email of testEmails) {
    try {
      console.log(`📧 Testing password reset for: ${email}`);
      
      const response = await axios.post(`${RAILWAY_URL}/api/auth/forgot-password`, {
        email: email
      }, {
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`✅ SUCCESS for ${email}:`, response.status);
      console.log('📋 Response:', response.data);
      
    } catch (error) {
      console.log(`❌ FAILED for ${email}:`, error.response?.status || error.code);
      console.log('📋 Error:', error.response?.data?.message || error.message);
    }
    
    console.log('---\n');
  }

  console.log('🔍 Analysis:');
  console.log('If all emails fail with 500 error: Gmail connection issue');
  console.log('If some emails work: Email-specific issue');
  console.log('If all emails work: Previous test was a temporary issue');
}

testEmailComparison().catch(console.error);
