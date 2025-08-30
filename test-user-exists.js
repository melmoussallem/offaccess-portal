const axios = require('axios');

async function testUserExists() {
  console.log('🔍 Testing User Exists...\n');

  const baseUrl = 'https://offaccess-portal-production.up.railway.app';
  
  // Test different possible admin emails
  const testEmails = [
    'info@offaccess.com',
    'admin@example.com',
    'mmoussallem@mba2025.hbs.edu'
  ];
  
  for (const email of testEmails) {
    try {
      console.log(`📡 Testing login for: ${email}`);
      const response = await axios.post(`${baseUrl}/api/auth/login`, {
        email: email,
        password: 'password123'
      }, {
        timeout: 5000,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`✅ Login successful for: ${email}`);
      console.log('📋 Status:', response.status);
      console.log('📋 User:', {
        name: response.data.user?.name,
        email: response.data.user?.email,
        role: response.data.user?.role
      });
      
    } catch (error) {
      console.log(`❌ Login failed for: ${email}`);
      if (error.response) {
        console.log('Status:', error.response.status);
        console.log('Message:', error.response.data?.message);
      } else {
        console.log('Error:', error.message);
      }
    }
    console.log('---');
  }
}

testUserExists();
