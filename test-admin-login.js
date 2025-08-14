const axios = require('axios');

async function testAdminLogin() {
  console.log('🔐 Testing Admin Login...\n');
  
  try {
    // Wait for server to start
    console.log('⏳ Waiting for server to start...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('📡 Testing login API...');
    const response = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'info@offaccess.com',
      password: 'password123'
    });
    
    console.log('✅ Login successful!');
    console.log('📋 Response:', {
      success: response.data.success,
      token: response.data.token ? '***TOKEN***' : 'NO TOKEN',
      user: {
        id: response.data.user._id,
        name: response.data.user.name,
        email: response.data.user.email,
        role: response.data.user.role
      }
    });
    
    console.log('\n🎉 Admin login is working correctly!');
    console.log('✅ You can now login with:');
            console.log('   Email: info@offaccess.com');
    console.log('   Password: password123');
    
  } catch (error) {
    console.error('❌ Login failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Message:', error.response.data.message || error.response.data);
    } else {
      console.error('Error:', error.message);
    }
    
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure the server is running on port 5000');
    console.log('2. Check if admin user exists in database');
    console.log('3. Verify the password is correct');
  }
}

testAdminLogin(); 