console.log('🔧 Gmail App Password Update\n');

console.log('📋 Step 1: Update Local .env File');
console.log('In your .env file, change this line:');
console.log('');
console.log('OLD: EMAIL_PASS=opff jtwh uwcx jhmb');
console.log('NEW: EMAIL_PASS=xcyn djju mtey dkcf');
console.log('');

console.log('📋 Step 2: Update Railway Environment Variables');
console.log('1. Go to https://railway.app');
console.log('2. Select your project: offaccess-portal-production');
console.log('3. Go to Variables tab');
console.log('4. Find EMAIL_PASS variable');
console.log('5. Click Edit and change to: xcyn djju mtey dkcf');
console.log('6. Click Save');
console.log('');

console.log('📋 Step 3: Test the Update');
console.log('After updating Railway variables, test with:');
console.log('node test-railway-info-email.js');
console.log('');

console.log('🎯 New Gmail App Password: xcyn djju mtey dkcf');
console.log('📧 Email: info@offaccess.com');
console.log('');

console.log('✅ This should fix the Railway email connection timeout issue!');
