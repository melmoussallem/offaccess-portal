const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Get User model
const User = require('./server/models/User');

async function updateAdminEmail() {
  try {
    console.log('🔄 Updating admin email...');
    
    // Find the existing admin user
    const existingAdmin = await User.findOne({ email: 'admin@example.com' });
    
    if (existingAdmin) {
      console.log('📧 Found existing admin user:', existingAdmin.email);
      
      // Update the email
      existingAdmin.email = 'info@offaccess.com';
      await existingAdmin.save();
      
      console.log('✅ Admin email updated successfully to: info@offaccess.com');
    } else {
      console.log('ℹ️  No admin user found with email: admin@example.com');
      
      // Check if admin with new email already exists
      const newAdmin = await User.findOne({ email: 'info@offaccess.com' });
      if (newAdmin) {
        console.log('✅ Admin user already exists with email: info@offaccess.com');
      } else {
        console.log('⚠️  No admin user found. You may need to create one.');
      }
    }
    
    // List all admin users
    const allAdmins = await User.find({ role: 'admin' });
    console.log('\n📋 All admin users:');
    allAdmins.forEach(admin => {
      console.log(`   - ${admin.email} (${admin.name})`);
    });
    
  } catch (error) {
    console.error('❌ Error updating admin email:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

updateAdminEmail();
