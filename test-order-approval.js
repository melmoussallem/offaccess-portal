const fs = require('fs');
const path = require('path');

async function testOrderApproval() {
  console.log('🧪 Testing Order Approval Process...');
  
  // Check if we have a test order file
  const testOrderPath = path.join(__dirname, 'test-order-approval.json');
  
  if (!fs.existsSync(testOrderPath)) {
    console.log('Creating test order data...');
    const testOrder = {
      orderId: 'test-order-id',
      orderNumber: 'TEST-001',
      brand: 'Test Brand',
      stockFile: 'Test Collection',
      status: 'Pending Review'
    };
    
    fs.writeFileSync(testOrderPath, JSON.stringify(testOrder, null, 2));
    console.log('✅ Test order data created');
  }
  
  // Check Google Sheets service
  console.log('\n🔍 Checking Google Sheets service...');
  try {
    const googleSheetsService = require('./server/utils/googleSheetsService');
    
    console.log('Google Sheets service status:');
    console.log('- Auth initialized:', !!googleSheetsService.auth);
    console.log('- Sheets initialized:', !!googleSheetsService.sheets);
    console.log('- Drive initialized:', !!googleSheetsService.drive);
    
    if (googleSheetsService.drive) {
      console.log('✅ Google Sheets service is working');
      
      // Test finding a Google Sheet
      try {
        console.log('\n🧪 Testing Google Sheet search...');
        const testFile = await googleSheetsService.findGoogleSheetByName('Test Collection');
        console.log('✅ Found Google Sheet:', testFile.name);
      } catch (error) {
        console.log('⚠️ Google Sheet search test failed (expected if no test file exists):', error.message);
      }
    } else {
      console.log('❌ Google Sheets service is not working');
    }
  } catch (error) {
    console.error('❌ Error testing Google Sheets service:', error.message);
  }
  
  // Check server routes
  console.log('\n🔍 Checking server routes...');
  try {
    const express = require('express');
    const app = express();
    
    // Test if the orders route is properly configured
    const ordersRoute = require('./server/routes/orders');
    console.log('✅ Orders route loaded successfully');
    
    // Check if the approve route exists
    const routes = ordersRoute.stack || [];
    const approveRoute = routes.find(route => 
      route.route && route.route.path && route.route.path.includes('approve')
    );
    
    if (approveRoute) {
      console.log('✅ Approve route found');
    } else {
      console.log('❌ Approve route not found');
    }
    
  } catch (error) {
    console.error('❌ Error checking server routes:', error.message);
  }
}

testOrderApproval().catch(console.error); 