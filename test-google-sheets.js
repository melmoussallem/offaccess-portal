const googleSheetsService = require('./server/utils/googleSheetsService');

async function testGoogleSheetsService() {
  console.log('🔍 Testing Google Sheets Service...');
  
  // Check environment variables
  console.log('Environment variables:');
  console.log('- NODE_ENV:', process.env.NODE_ENV);
  console.log('- GOOGLE_DRIVE_KEY_FILE:', process.env.GOOGLE_DRIVE_KEY_FILE);
  
  // Check if service account file exists
  const fs = require('fs');
  const path = require('path');
  
  const defaultPath = path.join(__dirname, 'google-sheets-key.json');
  const envPath = process.env.GOOGLE_DRIVE_KEY_FILE;
  
  console.log('\nFile paths:');
  console.log('- Default path:', defaultPath);
  console.log('- Environment path:', envPath);
  console.log('- Default path exists:', fs.existsSync(defaultPath));
  console.log('- Environment path exists:', envPath ? fs.existsSync(envPath) : 'N/A');
  
  // Wait a moment for initialization
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  console.log('\nService status:');
  console.log('- Auth initialized:', !!googleSheetsService.auth);
  console.log('- Sheets initialized:', !!googleSheetsService.sheets);
  console.log('- Drive initialized:', !!googleSheetsService.drive);
  
  if (googleSheetsService.drive) {
    console.log('✅ Google Sheets service is working!');
    
    // Test a simple operation
    try {
      console.log('\n🧪 Testing Drive API...');
      const response = await googleSheetsService.drive.files.list({
        pageSize: 1,
        fields: 'files(id, name)'
      });
      console.log('✅ Drive API test successful');
      console.log('Files found:', response.data.files.length);
    } catch (error) {
      console.error('❌ Drive API test failed:', error.message);
    }
  } else {
    console.log('❌ Google Sheets service is not working!');
  }
}

testGoogleSheetsService().catch(console.error); 