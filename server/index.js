const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const http = require('http');
const compression = require('compression');
require('dotenv').config();

// Environment variable checks for Railway deployment
console.log('🚀 Starting server...');
console.log('Environment:', process.env.NODE_ENV || 'development');
console.log('Port:', process.env.PORT || 5000);

if (!process.env.MONGODB_URI) {
  console.error('❌ MONGODB_URI environment variable is not set!');
  console.error('Please set MONGODB_URI in Railway environment variables.');
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.error('❌ JWT_SECRET environment variable is not set!');
  console.error('Please set JWT_SECRET in Railway environment variables.');
  process.exit(1);
}

console.log('✅ Environment variables check passed');

const authRoutes = require('./routes/auth');
const buyerRoutes = require('./routes/buyers');
const catalogueRoutes = require('./routes/catalogue');
const orderRoutes = require('./routes/orders');
const invoiceRoutes = require('./routes/invoices');
const notificationRoutes = require('./routes/notifications');
const brandRoutes = require('./routes/brands');
const dashboardRoutes = require('./routes/dashboard');
const fileSubmissionRoutes = require('./routes/fileSubmission');
const chatRoutes = require('./routes/chat');

const app = express();
const DEFAULT_PORT = process.env.PORT || 5000;

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
});

// Trust proxy for rate limiting
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());
app.use(cors({
  origin: true, // Allow all origins for now
  credentials: true
}));

// Enable gzip compression for all responses
app.use(compression());

// Rate limiting - more lenient for chat functionality
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000 // limit each IP to 1000 requests per windowMs
});

// Apply rate limiting to all routes except chat
app.use('/api/auth', limiter);
app.use('/api/buyers', limiter);
app.use('/api/catalogue', limiter);
app.use('/api/orders', limiter);
app.use('/api/invoices', limiter);
app.use('/api/notifications', limiter);
app.use('/api/brands', limiter);
app.use('/api/dashboard', limiter);
app.use('/api/file-submission', limiter);

// More lenient rate limiting for chat
const chatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50000 // allow 50,000 requests per IP per windowMs for chat
});
app.use('/api/chat', chatLimiter);

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static file serving for uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/digital-wholesale-catalogue', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Digital Wholesale Catalogue API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      auth: '/api/auth',
      buyers: '/api/buyers',
      catalogue: '/api/catalogue',
      orders: '/api/orders',
      invoices: '/api/invoices',
      notifications: '/api/notifications',
      health: '/api/health'
    }
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/buyers', buyerRoutes);
app.use('/api/catalogue', catalogueRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/file-submission', fileSubmissionRoutes);
app.use('/api/chat', chatRoutes);

// Health check endpoint (must come before debug route)
app.get('/api/health', (req, res) => {
  console.log('Health check requested');
  try {
    res.status(200).json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      port: process.env.PORT || 5000
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({ 
      status: 'ERROR', 
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Debug route to log unmatched requests
app.use('/api/*', (req, res, next) => {
  console.log('=== DEBUG: Unmatched API request ===');
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Original URL:', req.originalUrl);
  console.log('Path:', req.path);
  console.log('Base URL:', req.baseUrl);
  console.log('==============================');
  next();
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

function startServer(port) {
  const server = http.createServer(app);
  server.listen(port, '0.0.0.0', () => {
    console.log(`Server running on port ${port}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
  
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${port} is in use. Exiting.`);
      process.exit(1);
    } else {
      throw err;
    }
  });

  // Handle graceful shutdown
  process.on('SIGTERM', () => {
    console.log('Received SIGTERM, shutting down gracefully...');
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    console.log('Received SIGINT, shutting down gracefully...');
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });

  return server;
}

startServer(DEFAULT_PORT); 