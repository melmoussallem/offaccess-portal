const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up deployment configuration...\n');

// Check if domain is provided
const domain = process.argv[2];
if (!domain) {
  console.error('❌ Please provide your domain name!');
  console.log('Usage: node deploy-setup.js yourdomain.com');
  console.log('Example: node deploy-setup.js myapp.com');
  process.exit(1);
}

console.log(`📋 Domain: ${domain}`);
console.log(`🔗 Frontend URL: https://${domain}`);
console.log(`🔗 Backend URL: https://api.${domain}\n`);

// Create production environment template
const productionEnv = `# Production Environment Configuration
# Generated for deployment to ${domain}

# Database Configuration
MONGODB_URI=mongodb+srv://melmoussallem:aQI5qbL23FKti3cV@cluster0.gjbkrwp.mongodb.net/digital-wholesale-catalogue?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=c4e636a44a346e72420e576d21bcd4ff6690e2d131d1e0b998fcb71a7e46ff8c

# Email Configuration
EMAIL_USER=melmoussallem@gmail.com
EMAIL_PASS=wmyj okmb jeon vvbw
ADMIN_EMAIL=melmoussallem@gmail.com

# Server Configuration
PORT=5000
NODE_ENV=production

# Frontend URL (for email links and CORS)
FRONTEND_URL=https://${domain}

# Google Drive Configuration (optional)
GOOGLE_DRIVE_KEY_FILE=path/to/your/google-drive-key.json
GOOGLE_DRIVE_FOLDER_ID=your-google-drive-folder-id
`;

// Create Railway environment variables
const railwayEnv = `MONGODB_URI=mongodb+srv://melmoussallem:aQI5qbL23FKti3cV@cluster0.gjbkrwp.mongodb.net/digital-wholesale-catalogue?retryWrites=true&w=majority
JWT_SECRET=c4e636a44a346e72420e576d21bcd4ff6690e2d131d1e0b998fcb71a7e46ff8c
EMAIL_USER=melmoussallem@gmail.com
EMAIL_PASS=wmyj okmb jeon vvbw
ADMIN_EMAIL=melmoussallem@gmail.com
NODE_ENV=production
FRONTEND_URL=https://${domain}`;

// Create Vercel environment variables
const vercelEnv = `REACT_APP_API_URL=https://api.${domain}`;

// Write files
try {
  fs.writeFileSync('env.production.template', productionEnv);
  fs.writeFileSync('railway-env.txt', railwayEnv);
  fs.writeFileSync('vercel-env.txt', vercelEnv);
  
  console.log('✅ Configuration files created:');
  console.log('   📄 env.production.template - Production environment template');
  console.log('   📄 railway-env.txt - Railway environment variables');
  console.log('   📄 vercel-env.txt - Vercel environment variables');
  
  console.log('\n🎯 Next Steps:');
  console.log('1. Push your code to GitHub');
  console.log('2. Deploy backend to Railway using railway-env.txt');
  console.log('3. Deploy frontend to Vercel using vercel-env.txt');
  console.log('4. Connect your domain to both services');
  console.log('5. Update environment variables with your domain');
  
  console.log('\n📋 Environment Variables to Set:');
  console.log('\n🚂 Railway (Backend):');
  console.log(railwayEnv);
  console.log('\n⚡ Vercel (Frontend):');
  console.log(vercelEnv);
  
  console.log('\n🌐 Your URLs will be:');
  console.log(`   Frontend: https://${domain}`);
  console.log(`   Backend: https://api.${domain}`);
  
} catch (error) {
  console.error('❌ Error creating configuration files:', error.message);
  process.exit(1);
} 