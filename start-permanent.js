const { spawn } = require('child_process');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./server/models/User');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/digital-wholesale-catalogue';

async function ensureDatabaseIsClean() {
  try {
    await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('🔧 Ensuring database is clean...');

    // 1. Fix all users with invalid buyerType
    const validBuyerTypes = ['Wholesale', 'Retail', 'Online'];
    const usersWithInvalidBuyerType = await User.find({
      buyerType: { $nin: validBuyerTypes }
    });
    
    for (const user of usersWithInvalidBuyerType) {
      console.log(`   Fixing ${user.email}: buyerType "${user.buyerType}" -> "Retail"`);
      user.buyerType = 'Retail';
      await user.save();
    }

    // 2. Ensure admin user exists and has correct password
    let admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      console.log('   Creating admin user...');
      const adminPassword = 'admin123';
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(adminPassword, salt);
      
      admin = new User({
        name: 'Admin User',
        email: 'info@offaccess.com',
        password: hashedPassword,
        role: 'admin',
        status: 'approved',
        isActive: true,
        companyName: 'Admin Company',
        buyerType: 'Retail'
      });
      await admin.save();
              console.log('   ✅ Created admin user: info@offaccess.com / admin123');
    } else {
      // Verify admin password works
      const isMatch = await admin.comparePassword('admin123');
      if (!isMatch) {
        console.log('   Fixing admin password...');
        const adminPassword = 'admin123';
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(adminPassword, salt);
        
        await User.updateOne(
          { role: 'admin' },
          { $set: { password: hashedPassword } }
        );
        console.log('   ✅ Fixed admin password');
      } else {
        console.log('   ✅ Admin password is correct');
      }
    }

    // 3. Ensure test buyer exists
    let buyer = await User.findOne({ email: 'buyer@example.com' });
    if (!buyer) {
      console.log('   Creating test buyer...');
      const buyerPassword = 'test123';
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(buyerPassword, salt);
      
      buyer = new User({
        name: 'Test Buyer',
        email: 'buyer@example.com',
        password: hashedPassword,
        role: 'buyer',
        status: 'approved',
        isActive: true,
        companyName: 'Test Company',
        buyerType: 'Retail'
      });
      await buyer.save();
      console.log('   ✅ Created test buyer: buyer@example.com / test123');
    }

    console.log('✅ Database is clean and ready!');
    await mongoose.disconnect();
    
  } catch (error) {
    console.error('❌ Error ensuring database is clean:', error);
    await mongoose.disconnect();
  }
}

async function startServers() {
  console.log('🚀 Starting servers...');
  
  // Start backend
  const backend = spawn('npm', ['run', 'server'], { 
    stdio: 'inherit',
    shell: true,
    cwd: process.cwd()
  });
  
  // Wait a moment for backend to start
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Start frontend
  const frontend = spawn('npm', ['start'], { 
    stdio: 'inherit',
    shell: true,
    cwd: process.cwd() + '/client'
  });
  
  console.log('\n🎉 Both servers are starting!');
  console.log('\n📋 Login Credentials:');
          console.log('   Admin: info@offaccess.com / admin123');
  console.log('   Buyer: buyer@example.com / test123');
  console.log('\n🌐 Frontend: http://localhost:3000');
  console.log('🔧 Backend: http://localhost:5001');
  
  // Handle process termination
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down servers...');
    backend.kill();
    frontend.kill();
    process.exit();
  });
}

async function main() {
  await ensureDatabaseIsClean();
  await startServers();
}

main().catch(console.error); 