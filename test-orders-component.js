console.log('🧪 Testing Orders component...');

// Test basic imports
try {
  console.log('📦 Testing React import...');
  const React = require('react');
  console.log('✅ React imported successfully');
} catch (error) {
  console.error('❌ React import failed:', error.message);
}

// Test Material-UI imports
try {
  console.log('📦 Testing Material-UI imports...');
  const { Container, Typography, Paper } = require('@mui/material');
  console.log('✅ Material-UI imports successful');
} catch (error) {
  console.error('❌ Material-UI imports failed:', error.message);
}

// Test if we can read the Orders.js file
try {
  console.log('📦 Testing Orders.js file read...');
  const fs = require('fs');
  const path = require('path');
  
  const ordersFilePath = path.join(__dirname, 'client', 'src', 'pages', 'Orders', 'Orders.js');
  console.log('📁 Orders.js path:', ordersFilePath);
  
  if (fs.existsSync(ordersFilePath)) {
    console.log('✅ Orders.js file exists');
    
    // Read first few lines to check for syntax
    const content = fs.readFileSync(ordersFilePath, 'utf8');
    const firstLines = content.split('\n').slice(0, 20).join('\n');
    console.log('📄 First 20 lines of Orders.js:');
    console.log(firstLines);
    
    // Check for console.log statements
    const consoleLogMatches = content.match(/console\.log\(/g);
    console.log('🔍 Found console.log statements:', consoleLogMatches ? consoleLogMatches.length : 0);
    
  } else {
    console.log('❌ Orders.js file not found');
  }
} catch (error) {
  console.error('❌ Error reading Orders.js:', error.message);
}

console.log('✅ Test completed'); 