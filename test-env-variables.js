console.log('🔍 Checking Google Cloud Environment Variables...\n');

const googleVars = [
  'GOOGLE_APPLICATION_CREDENTIALS_JSON',
  'GOOGLE_OAUTH2_CLIENT_ID',
  'GOOGLE_OAUTH2_CLIENT_SECRET',
  'GOOGLE_OAUTH2_REFRESH_TOKEN',
  'GOOGLE_CLOUD_STORAGE_BUCKET'
];

googleVars.forEach(varName => {
  const value = process.env[varName];
  console.log(`${varName}:`);
  console.log(`  Exists: ${!!value}`);
  if (value) {
    console.log(`  Length: ${value.length}`);
    if (varName === 'GOOGLE_APPLICATION_CREDENTIALS_JSON') {
      try {
        const parsed = JSON.parse(value);
        console.log(`  Project ID: ${parsed.project_id}`);
        console.log(`  Client Email: ${parsed.client_email}`);
        console.log(`  Type: ${parsed.type}`);
      } catch (error) {
        console.log(`  Parse Error: ${error.message}`);
        console.log(`  Preview: ${value.substring(0, 100)}...`);
      }
    } else {
      console.log(`  Preview: ${value.substring(0, 50)}...`);
    }
  }
  console.log('');
});

console.log('🔍 All environment variables containing "GOOGLE":');
Object.keys(process.env)
  .filter(key => key.includes('GOOGLE'))
  .forEach(key => {
    console.log(`  ${key}: ${process.env[key] ? 'SET' : 'NOT SET'}`);
  });
