console.log('🔍 Frontend URL Debug Info...\n');

// Simulate what the frontend environment variable would be
const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
console.log('Frontend API URL:', apiUrl);

// Test different possible URLs
const possibleUrls = [
  'http://localhost:5000',
  'https://offaccess-portal-production.up.railway.app',
  'https://api.offaccess.com',
  'https://offaccess-portal.vercel.app',
  'https://your-vercel-domain.vercel.app'
];

console.log('\n📋 Possible URLs your frontend might be using:');
possibleUrls.forEach((url, index) => {
  console.log(`${index + 1}. ${url}`);
});

console.log('\n🔧 To fix this:');
console.log('1. Go to Vercel dashboard');
console.log('2. Settings → Environment Variables');
console.log('3. Update REACT_APP_API_URL to: https://offaccess-portal-production.up.railway.app');
console.log('4. Redeploy your Vercel project'); 