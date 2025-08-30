const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Get User model
const User = require('./server/models/User');

async function addMissingBuyer() {
  try {
    console.log('🔄 Adding missing buyer account...');
    
    // Check if buyer already exists
    const existingBuyer = await User.findOne({ email: 'mmoussallem@mba2025.hbs.edu' });
    
    if (existingBuyer) {
      console.log('✅ Buyer already exists:', existingBuyer.email);
      return;
    }
    
    // Create the buyer account
    const buyer = new User({
      name: 'Mel Moussallem',
      email: 'mmoussallem@mba2025.hbs.edu',
      password: 'password123',
      companyName: 'MBA 2025',
      buyerType: 'retailer',
      role: 'buyer',
      status: 'approved',
      approvedAt: new Date()
    });
    
    await buyer.save();
    console.log('✅ Created buyer account:', buyer.email);
    
    // List all users
    const allUsers = await User.find({});
    console.log('\n📋 All users in database:');
    allUsers.forEach(user => {
      console.log(`   - ${user.email} (${user.name}) - ${user.role} - ${user.status}`);
    });
    
  } catch (error) {
    console.error('❌ Error adding buyer:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

addMissingBuyer();
