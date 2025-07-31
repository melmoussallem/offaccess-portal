console.log('🔍 Testing Environment Variable...\n');

console.log('REACT_APP_API_URL:', process.env.REACT_APP_API_URL);
console.log('NODE_ENV:', process.env.NODE_ENV);

// Simulate what happens in the browser
const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
console.log('Final API URL:', apiUrl);

if (apiUrl === 'http://localhost:5000') {
  console.log('❌ Environment variable is not set - using localhost fallback');
} else {
  console.log('✅ Environment variable is set correctly');
} 