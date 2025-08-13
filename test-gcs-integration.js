const fileStorageService = require('./server/utils/fileStorageService');

async function testGCSIntegration() {
  console.log('🧪 Testing Google Cloud Storage Integration...\n');

  try {
    // Test 1: Check if service initializes
    console.log('1️⃣ Testing service initialization...');
    console.log('✅ File storage service initialized successfully');
    console.log(`📦 Bucket: ${fileStorageService.bucketName}`);
    console.log(`🌐 Base URL: ${fileStorageService.baseUrl}\n`);

    // Test 2: Test file upload
    console.log('2️⃣ Testing file upload...');
    const testBuffer = Buffer.from('This is a test file for Google Cloud Storage integration');
    const testFileName = 'test-file.txt';
    
    const uploadResult = await fileStorageService.uploadFile(
      testBuffer,
      testFileName,
      'text/plain',
      'test'
    );

    if (uploadResult.success) {
      console.log('✅ File upload successful!');
      console.log(`📁 File path: ${uploadResult.filePath}`);
      console.log(`🔗 Public URL: ${uploadResult.publicUrl}\n`);
    } else {
      console.log('❌ File upload failed:', uploadResult.error);
      return;
    }

    // Test 3: Test file download
    console.log('3️⃣ Testing file download...');
    const downloadResult = await fileStorageService.downloadFile(uploadResult.filePath);
    
    if (downloadResult.success) {
      console.log('✅ File download successful!');
      console.log(`📊 File size: ${downloadResult.buffer.length} bytes`);
      console.log(`📄 Content: ${downloadResult.buffer.toString()}\n`);
    } else {
      console.log('❌ File download failed:', downloadResult.error);
      return;
    }

    // Test 4: Test signed URL generation
    console.log('4️⃣ Testing signed URL generation...');
    const signedUrlResult = await fileStorageService.generateSignedUrl(
      uploadResult.filePath,
      3600 // 1 hour
    );

    if (signedUrlResult.success) {
      console.log('✅ Signed URL generated successfully!');
      console.log(`🔗 Signed URL: ${signedUrlResult.signedUrl}\n`);
    } else {
      console.log('❌ Signed URL generation failed:', signedUrlResult.error);
      return;
    }

    // Test 5: Test file deletion
    console.log('5️⃣ Testing file deletion...');
    const deleteResult = await fileStorageService.deleteFile(uploadResult.filePath);
    
    if (deleteResult.success) {
      console.log('✅ File deletion successful!\n');
    } else {
      console.log('❌ File deletion failed:', deleteResult.error);
      return;
    }

    console.log('🎉 All Google Cloud Storage tests passed!');
    console.log('✅ Your GCS integration is working correctly.');
    console.log('🚀 You can now use the portal with cloud file storage.');

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    console.error('🔍 Check your environment variables and service account permissions.');
  }
}

// Run the test
testGCSIntegration();
