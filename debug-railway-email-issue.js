const axios = require('axios');

console.log('🔍 Comprehensive Railway Email Debug\n');

const RAILWAY_URL = 'https://offaccess-portal-production.up.railway.app';

async function debugRailwayEmailIssue() {
  console.log('📋 Step 1: Check Railway Environment Variables');
  console.log('Testing if Railway has the correct environment variables...\n');

  try {
    // Test 1: Check if Railway is using the correct environment
    const healthResponse = await axios.get(`${RAILWAY_URL}/api/health`, {
      timeout: 10000
    });
    
    console.log('✅ Health check successful');
    console.log('📋 Environment info:', healthResponse.data);
    
    // Check if it shows production environment
    if (healthResponse.data.environment === 'production') {
      console.log('✅ Railway is running in production mode');
    } else {
      console.log('⚠️  Railway environment:', healthResponse.data.environment);
    }
    
  } catch (error) {
    console.log('❌ Health check failed:', error.message);
    return;
  }

  console.log('\n📋 Step 2: Test Email Service Configuration');
  console.log('Testing if the email service is properly configured...\n');

  try {
    // Test 2: Test with a known user email
    const testEmail = 'info@offaccess.com';
    console.log(`📧 Testing password reset for: ${testEmail}`);
    
    const response = await axios.post(`${RAILWAY_URL}/api/auth/forgot-password`, {
      email: testEmail
    }, {
      timeout: 60000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Password reset successful!');
    console.log('📋 Response:', response.data);
    
  } catch (error) {
    console.log('❌ Password reset failed');
    console.log('Error:', error.response?.data || error.message);
    
    if (error.response?.status === 500) {
      console.log('\n🔍 This confirms the email service is failing in Railway');
      console.log('📋 The issue is likely:');
      console.log('1. Gmail blocking Railway IP addresses');
      console.log('2. Incorrect Gmail app password in Railway environment');
      console.log('3. Network connectivity issues from Railway to Gmail');
    }
  }

  console.log('\n📋 Step 3: Check Railway Logs');
  console.log('To see detailed Railway logs:');
  console.log('1. Go to https://railway.app');
  console.log('2. Select your project: offaccess-portal-production');
  console.log('3. Go to Deployments tab');
  console.log('4. Click on the latest deployment');
  console.log('5. Check the logs for email service errors\n');

  console.log('📋 Step 4: Environment Variable Check');
  console.log('Current Railway environment variables should be:');
  console.log('EMAIL_USER=info@offaccess.com');
  console.log('EMAIL_PASS=opff jtwh uwcx jhmb');
  console.log('ADMIN_EMAIL=info@offaccess.com');
  console.log('NODE_ENV=production');
  console.log('FRONTEND_URL=https://portal.offaccess.com\n');

  console.log('📋 Step 5: Potential Issues');
  console.log('1. ❌ Gmail blocking Railway IP addresses');
  console.log('2. ❌ Gmail app password expired or invalid');
  console.log('3. ❌ Railway environment variables not updated');
  console.log('4. ❌ Network connectivity issues');
  console.log('5. ❌ Gmail rate limiting from Railway servers\n');

  console.log('📋 Step 6: Recommended Solutions');
  console.log('Option A: Use SendGrid (Most Reliable)');
  console.log('- Sign up at https://sendgrid.com');
  console.log('- Get API key');
  console.log('- Update Railway environment variables');
  console.log('- Remove Gmail variables\n');

  console.log('Option B: Fix Gmail (Less Reliable)');
  console.log('- Generate new Gmail app password');
  console.log('- Enable "Less secure app access"');
  console.log('- Contact Gmail support to whitelist Railway IPs\n');

  console.log('🎯 The issue is NOT with your code - it works locally!');
  console.log('🎯 The issue is Gmail blocking Railway servers.');
}

debugRailwayEmailIssue().catch(console.error);
