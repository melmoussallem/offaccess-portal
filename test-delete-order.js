const fetch = require('node-fetch');

async function testDeleteOrder() {
  try {
    // You'll need to replace these with actual values
    const orderId = 'YOUR_ORDER_ID_HERE';
    const token = 'YOUR_ADMIN_TOKEN_HERE';
    
    console.log('Testing delete order endpoint...');
    console.log('Order ID:', orderId);
    console.log('Token:', token ? 'Present' : 'Missing');
    
    const response = await fetch(`http://localhost:5000/api/orders/${orderId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);
    
    const data = await response.json();
    console.log('Response data:', data);
    
    if (response.ok) {
      console.log('✅ Delete order test passed!');
    } else {
      console.log('❌ Delete order test failed!');
    }
  } catch (error) {
    console.error('Error testing delete order:', error);
  }
}

testDeleteOrder(); 