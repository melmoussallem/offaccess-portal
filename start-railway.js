const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Railway deployment...');
console.log('Environment:', process.env.NODE_ENV || 'development');
console.log('Port:', process.env.PORT || 5000);

// Check if MongoDB URI is set
if (!process.env.MONGODB_URI) {
  console.error('❌ MONGODB_URI environment variable is not set!');
  console.error('Please set MONGODB_URI in Railway environment variables.');
  process.exit(1);
}

// Check if JWT_SECRET is set
if (!process.env.JWT_SECRET) {
  console.error('❌ JWT_SECRET environment variable is not set!');
  console.error('Please set JWT_SECRET in Railway environment variables.');
  process.exit(1);
}

console.log('✅ Environment variables check passed');

// Start the server
const server = spawn('node', ['server/index.js'], {
  stdio: 'inherit',
  env: process.env
});

server.on('error', (error) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});

server.on('exit', (code) => {
  console.log(`Server exited with code ${code}`);
  process.exit(code);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully...');
  server.kill('SIGTERM');
});

process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down gracefully...');
  server.kill('SIGINT');
}); 