const net = require('net');
const dns = require('dns');
const https = require('https');
const http = require('http');

console.log('🔍 Railway Network Connectivity Diagnostic\n');

// Test 1: DNS Resolution
const testDNS = () => {
  console.log('1️⃣ Testing DNS Resolution...');
  return new Promise((resolve, reject) => {
    dns.resolve4('smtp.gmail.com', (err, addresses) => {
      if (err) {
        console.log('❌ DNS resolution failed:', err.message);
        reject(err);
      } else {
        console.log('✅ DNS resolution successful!');
        console.log('📋 IP addresses:', addresses);
        resolve(addresses);
      }
    });
  });
};

// Test 2: Basic TCP Connection (no TLS)
const testTCPConnection = (host, port) => {
  console.log(`\n2️⃣ Testing TCP connection to ${host}:${port}...`);
  return new Promise((resolve, reject) => {
    const socket = net.connect({
      host: host,
      port: port,
      family: 4, // Force IPv4
      timeout: 10000 // 10 seconds
    });

    socket.on('connect', () => {
      console.log(`✅ TCP connection successful to ${host}:${port}`);
      socket.end();
      resolve();
    });

    socket.on('timeout', () => {
      console.log(`❌ TCP connection timeout to ${host}:${port}`);
      socket.destroy();
      reject(new Error('TCP timeout'));
    });

    socket.on('error', (err) => {
      console.log(`❌ TCP connection error to ${host}:${port}:`, err.message);
      reject(err);
    });
  });
};

// Test 3: HTTP/HTTPS connectivity (to verify general internet access)
const testHTTPS = () => {
  console.log('\n3️⃣ Testing HTTPS connectivity (general internet access)...');
  return new Promise((resolve, reject) => {
    const req = https.get('https://www.google.com', (res) => {
      console.log('✅ HTTPS connectivity successful!');
      console.log('📋 Status:', res.statusCode);
      resolve();
    });

    req.on('error', (err) => {
      console.log('❌ HTTPS connectivity failed:', err.message);
      reject(err);
    });

    req.setTimeout(10000, () => {
      console.log('❌ HTTPS request timeout');
      req.destroy();
      reject(new Error('HTTPS timeout'));
    });
  });
};

// Test 4: SMTP-specific connectivity with detailed logging
const testSMTPConnectivity = () => {
  console.log('\n4️⃣ Testing SMTP-specific connectivity...');
  return new Promise((resolve, reject) => {
    const socket = net.connect({
      host: 'smtp.gmail.com',
      port: 587,
      family: 4,
      timeout: 15000
    });

    let dataReceived = false;

    socket.on('connect', () => {
      console.log('✅ TCP connection to SMTP server established');
      console.log('📋 Local address:', socket.localAddress + ':' + socket.localPort);
      console.log('📋 Remote address:', socket.remoteAddress + ':' + socket.remotePort);
    });

    socket.on('data', (data) => {
      if (!dataReceived) {
        console.log('✅ Received SMTP greeting from server');
        console.log('📋 Server response:', data.toString().trim());
        dataReceived = true;
        socket.end();
        resolve();
      }
    });

    socket.on('timeout', () => {
      console.log('❌ SMTP connection timeout - Railway cannot reach Gmail SMTP');
      console.log('🔧 This indicates an egress block or network issue');
      socket.destroy();
      reject(new Error('SMTP timeout - egress issue detected'));
    });

    socket.on('error', (err) => {
      console.log('❌ SMTP connection error:', err.message);
      console.log('📋 Error code:', err.code);
      socket.destroy();
      reject(err);
    });
  });
};

// Test 5: Alternative ports
const testAlternativePorts = async () => {
  console.log('\n5️⃣ Testing alternative SMTP ports...');
  
  const ports = [465, 25];
  
  for (const port of ports) {
    try {
      console.log(`\n🔍 Testing port ${port}...`);
      await testTCPConnection('smtp.gmail.com', port);
      console.log(`✅ Port ${port} is accessible`);
    } catch (error) {
      console.log(`❌ Port ${port} failed:`, error.message);
    }
  }
};

// Test 6: Other SMTP providers (to see if it's Gmail-specific)
const testOtherSMTPProviders = async () => {
  console.log('\n6️⃣ Testing other SMTP providers...');
  
  const providers = [
    { name: 'SendGrid', host: 'smtp.sendgrid.net', port: 587 },
    { name: 'Mailgun', host: 'smtp.mailgun.org', port: 587 },
    { name: 'AWS SES', host: 'email-smtp.us-east-1.amazonaws.com', port: 587 }
  ];
  
  for (const provider of providers) {
    try {
      console.log(`\n🔍 Testing ${provider.name}...`);
      await testTCPConnection(provider.host, provider.port);
      console.log(`✅ ${provider.name} is accessible`);
    } catch (error) {
      console.log(`❌ ${provider.name} failed:`, error.message);
    }
  }
};

// Main diagnostic function
const runDiagnostics = async () => {
  console.log('🚀 Starting Railway Network Connectivity Diagnostics...\n');
  
  try {
    // Test 1: DNS
    await testDNS();
    
    // Test 2: General internet access
    await testHTTPS();
    
    // Test 3: SMTP connectivity
    try {
      await testSMTPConnectivity();
    } catch (error) {
      console.log('\n⚠️  SMTP connectivity failed - this is the root cause!');
    }
    
    // Test 4: Alternative ports
    await testAlternativePorts();
    
    // Test 5: Other providers
    await testOtherSMTPProviders();
    
    console.log('\n📊 DIAGNOSTIC SUMMARY:');
    console.log('=====================================');
    console.log('If SMTP connectivity failed but HTTPS works:');
    console.log('🔧 SOLUTION: Railway blocks outbound SMTP');
    console.log('💡 FIX: Switch to HTTP-based email API (SendGrid, Mailgun, etc.)');
    console.log('');
    console.log('If all connectivity failed:');
    console.log('🔧 SOLUTION: Railway network configuration issue');
    console.log('💡 FIX: Contact Railway support');
    console.log('');
    console.log('If only Gmail failed but other SMTP works:');
    console.log('🔧 SOLUTION: Gmail-specific block');
    console.log('💡 FIX: Use alternative email provider');
    
  } catch (error) {
    console.log('\n❌ Diagnostic failed:', error.message);
  }
};

// Run the diagnostics
runDiagnostics().catch(console.error);
