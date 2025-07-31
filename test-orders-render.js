console.log('🧪 Testing Orders component rendering...');

// Test if we can access the Orders component
try {
  console.log('📦 Testing Orders component access...');
  
  // Check if the file can be parsed
  const fs = require('fs');
  const path = require('path');
  
  const ordersFilePath = path.join(__dirname, 'client', 'src', 'pages', 'Orders', 'Orders.js');
  const content = fs.readFileSync(ordersFilePath, 'utf8');
  
  // Check for common syntax issues
  console.log('🔍 Checking for syntax issues...');
  
  // Check for unclosed brackets/parentheses
  const openBrackets = (content.match(/\{/g) || []).length;
  const closeBrackets = (content.match(/\}/g) || []).length;
  const openParens = (content.match(/\(/g) || []).length;
  const closeParens = (content.match(/\)/g) || []).length;
  
  console.log('📊 Bracket count - Open:', openBrackets, 'Close:', closeBrackets);
  console.log('📊 Parentheses count - Open:', openParens, 'Close:', closeParens);
  
  if (openBrackets !== closeBrackets) {
    console.error('❌ Mismatched brackets!');
  } else {
    console.log('✅ Bracket count matches');
  }
  
  if (openParens !== closeParens) {
    console.error('❌ Mismatched parentheses!');
  } else {
    console.log('✅ Parentheses count matches');
  }
  
  // Check for missing semicolons or other syntax issues
  const lines = content.split('\n');
  let syntaxIssues = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;
    
    // Check for common syntax issues
    if (line.includes('console.log') && !line.includes(';') && !line.trim().endsWith('}')) {
      console.log(`⚠️ Line ${lineNum}: console.log without semicolon`);
      syntaxIssues++;
    }
    
    // Check for unclosed strings
    const singleQuotes = (line.match(/'/g) || []).length;
    const doubleQuotes = (line.match(/"/g) || []).length;
    if (singleQuotes % 2 !== 0 || doubleQuotes % 2 !== 0) {
      console.log(`⚠️ Line ${lineNum}: Possible unclosed quotes`);
      syntaxIssues++;
    }
  }
  
  console.log(`📊 Syntax issues found: ${syntaxIssues}`);
  
  // Check for the specific console.log statements we added
  const expectedLogs = [
    '🔄 Orders component initializing...',
    '👤 User role:',
    '🎯 handleApproveOrder function called!',
    '🍽️ Approve menu item clicked!',
    '📋 Opening dialog:',
    '🔘 Approve button clicked!'
  ];
  
  console.log('🔍 Checking for expected console.log statements...');
  expectedLogs.forEach(expectedLog => {
    if (content.includes(expectedLog)) {
      console.log(`✅ Found: ${expectedLog}`);
    } else {
      console.log(`❌ Missing: ${expectedLog}`);
    }
  });
  
} catch (error) {
  console.error('❌ Error testing Orders component:', error.message);
}

console.log('✅ Test completed'); 