require('dotenv').config();

console.log('🔍 Testing Google Cloud Storage Environment Variables...\n');

// Check if the environment variable exists
const credentialsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
console.log('GOOGLE_APPLICATION_CREDENTIALS_JSON:');
console.log('  Exists:', !!credentialsJson);
console.log('  Length:', credentialsJson ? credentialsJson.length : 0);

if (credentialsJson) {
  try {
    const parsed = JSON.parse(credentialsJson);
    console.log('  Project ID:', parsed.project_id);
    console.log('  Client Email:', parsed.client_email);
    console.log('  Type:', parsed.type);
    console.log('  ✅ JSON parsed successfully');
  } catch (error) {
    console.log('  ❌ JSON parse error:', error.message);
    console.log('  Preview:', credentialsJson.substring(0, 100) + '...');
  }
}

console.log('\nGOOGLE_CLOUD_STORAGE_BUCKET:', process.env.GOOGLE_CLOUD_STORAGE_BUCKET);

console.log('\n🔍 All Google-related environment variables:');
Object.keys(process.env)
  .filter(key => key.includes('GOOGLE'))
  .forEach(key => {
    const value = process.env[key];
    console.log(`  ${key}: ${value ? `SET (${value.length} chars)` : 'NOT SET'}`);
  });
