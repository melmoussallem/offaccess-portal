const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  console.log('--- AUTH MIDDLEWARE ENTERED ---');
  try {
    const authHeader = req.headers['authorization'];
    console.log('Auth header:', authHeader);
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    console.log('Extracted token:', token);

    if (!token) {
      console.log('No token provided');
      return res.status(401).json({ message: 'Access token required' });
    }

    const jwtSecret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';
    let decoded;
    try {
      decoded = jwt.verify(token, jwtSecret);
      console.log('Decoded JWT:', decoded);
    } catch (verifyError) {
      console.error('JWT verification error:', verifyError);
      return res.status(401).json({ message: 'Invalid token' });
    }
    const user = await User.findById(decoded.userId);
    console.log('User from DB:', user);

    if (!user || !user.isActive) {
      console.log('Invalid or inactive user');
      return res.status(401).json({ message: 'Invalid or inactive user' });
    }

    req.user = user;
    console.log('Auth successful, calling next()');
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    return res.status(500).json({ message: 'Authentication error' });
  }
};

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// Middleware to check if user is buyer
const requireBuyer = (req, res, next) => {
  if (req.user.role !== 'buyer') {
    return res.status(403).json({ message: 'Buyer access required' });
  }
  next();
};

// Middleware to require approved buyer
const requireApprovedBuyer = (req, res, next) => {
  if (!req.user || req.user.role !== 'buyer' || req.user.status !== 'approved') {
    return res.status(403).json({ message: 'Access denied. Buyer not approved.' });
  }
  next();
};

// Middleware to check if user can access specific resource
const canAccessResource = (resourceType) => {
  return async (req, res, next) => {
    try {
      const userId = req.user._id;
      
      switch (resourceType) {
        case 'own_orders':
          if (req.user.role === 'admin') return next();
          if (req.params.buyerId && req.params.buyerId !== userId.toString()) {
            return res.status(403).json({ message: 'Access denied' });
          }
          break;
          
        case 'catalogue_file':
          // This will be handled in the catalogue routes
          break;
          
        default:
          break;
      }
      
      next();
    } catch (error) {
      return res.status(500).json({ message: 'Authorization error' });
    }
  };
};

module.exports = {
  authenticateToken,
  requireAdmin,
  requireBuyer,
  requireApprovedBuyer,
  canAccessResource
}; 