const mongoose = require('mongoose');
require('dotenv').config();

async function testDatabaseConnection() {
  console.log('🔍 Testing MongoDB Atlas Connection...\n');
  
  try {
    // Test connection
    console.log('📡 Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/digital-wholesale-catalogue', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Successfully connected to MongoDB Atlas!');
    console.log('📊 Database:', mongoose.connection.db.databaseName);
    console.log('🌐 Host:', mongoose.connection.host);
    console.log('🔌 Port:', mongoose.connection.port);
    
    // Test basic operations
    console.log('\n🧪 Testing basic database operations...');
    
    // Create a test collection
    const testCollection = mongoose.connection.db.collection('test_connection');
    
    // Insert a test document
    await testCollection.insertOne({
      test: true,
      timestamp: new Date(),
      message: 'Database connection test successful'
    });
    
    console.log('✅ Write operation successful');
    
    // Read the test document
    const result = await testCollection.findOne({ test: true });
    console.log('✅ Read operation successful');
    
    // Clean up test document
    await testCollection.deleteOne({ test: true });
    console.log('✅ Delete operation successful');
    
    console.log('\n🎉 All database operations working correctly!');
    console.log('✅ Your MongoDB Atlas connection is ready for production!');
    
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error('Error:', error.message);
    console.log('\n🔧 Troubleshooting tips:');
    console.log('1. Check your MONGODB_URI in .env file');
    console.log('2. Verify your MongoDB Atlas cluster is running');
    console.log('3. Check network access settings in Atlas');
    console.log('4. Verify username/password in connection string');
    console.log('5. Make sure your IP is whitelisted in Atlas');
    
  } finally {
    // Close connection
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('\n🔌 Database connection closed');
    }
    process.exit(0);
  }
}

// Run the test
testDatabaseConnection(); 