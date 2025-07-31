console.log('🧪 Testing component loading...');

// Test if the component file exists and can be read
try {
  const fs = require('fs');
  const path = require('path');
  
  const ordersFilePath = path.join(__dirname, 'client', 'src', 'pages', 'Orders', 'Orders.js');
  
  if (fs.existsSync(ordersFilePath)) {
    console.log('✅ Orders.js file exists');
    
    // Check if the component exports correctly
    const content = fs.readFileSync(ordersFilePath, 'utf8');
    
    // Check for the component definition
    if (content.includes('const Orders = () => {')) {
      console.log('✅ Orders component is defined');
    } else {
      console.log('❌ Orders component definition not found');
    }
    
    // Check for the export
    if (content.includes('export default Orders;')) {
      console.log('✅ Orders component is exported');
    } else {
      console.log('❌ Orders component export not found');
    }
    
    // Check for console.log statements
    const consoleLogCount = (content.match(/console\.log\(/g) || []).length;
    console.log(`📊 Found ${consoleLogCount} console.log statements`);
    
    // Check for specific debugging statements
    const debugStatements = [
      '🔄 Orders component initializing...',
      '👤 User role:',
      '🎯 handleApproveOrder function called!',
      '🍽️ Approve menu item clicked!',
      '📋 Opening dialog:',
      '🔘 Approve button clicked!'
    ];
    
    console.log('🔍 Checking for debugging statements:');
    debugStatements.forEach(statement => {
      if (content.includes(statement)) {
        console.log(`✅ Found: ${statement}`);
      } else {
        console.log(`❌ Missing: ${statement}`);
      }
    });
    
  } else {
    console.log('❌ Orders.js file not found');
  }
  
} catch (error) {
  console.error('❌ Error testing component loading:', error.message);
}

console.log('✅ Component loading test completed'); 