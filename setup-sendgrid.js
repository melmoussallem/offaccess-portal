console.log('🚀 SendGrid Email Service Setup\n');

console.log('📋 Step 1: Sign up for SendGrid');
console.log('1. Go to: https://sendgrid.com');
console.log('2. Click "Start for Free"');
console.log('3. Create an account (Free tier: 100 emails/day)\n');

console.log('📋 Step 2: Create API Key');
console.log('1. Go to Settings → API Keys');
console.log('2. Click "Create API Key"');
console.log('3. Name it: "Off Access Portal"');
console.log('4. Select "Restricted Access"');
console.log('5. Check "Mail Send" permissions');
console.log('6. Click "Create & View"');
console.log('7. Copy the API key (starts with "SG.")\n');

console.log('📋 Step 3: Update Railway Environment Variables');
console.log('1. Go to: https://railway.app');
console.log('2. Select your project: offaccess-portal-production');
console.log('3. Go to Variables tab');
console.log('4. Add these variables:');
console.log('');
console.log('   SENDGRID_API_KEY=your_api_key_here');
console.log('   EMAIL_FROM=info@offaccess.com');
console.log('');
console.log('5. Remove or comment out Gmail variables:');
console.log('   # EMAIL_USER=info@offaccess.com');
console.log('   # EMAIL_PASS=opff jtwh uwcx jhmb');
console.log('');

console.log('📋 Step 4: Test the Setup');
console.log('After Railway redeploys, test with:');
console.log('node test-railway-info-email.js\n');

console.log('🎯 Benefits of SendGrid:');
console.log('✅ No IP blocking issues');
console.log('✅ Designed for cloud platforms');
console.log('✅ Reliable email delivery');
console.log('✅ Good reputation with email providers');
console.log('✅ Free tier available');
console.log('✅ Easy API integration');

console.log('\n🔧 The email service code already supports SendGrid!');
console.log('Just update the environment variables and it will work automatically.');
