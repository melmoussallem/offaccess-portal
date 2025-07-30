const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['admin', 'buyer'],
    default: 'buyer'
  },
  // Buyer-specific fields
  phone: {
    type: String,
    trim: true
  },
  companyName: {
    type: String,
    trim: true
  },
  companyWebsite: {
    type: String,
    trim: true
  },
  companyAddress: {
    street: String,
    city: String,
    country: String
  },
  buyerType: {
    type: String,
    enum: ['Wholesale', 'Retail', 'Online'],
    default: 'Retail'
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  // Admin notes for buyer management
  adminNotes: {
    type: String,
    trim: true
  },
  // Account management
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  // Brand access management
  brandAccess: [{
    type: String,
    trim: true
  }],
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  // Password reset fields
  resetPasswordToken: {
    type: String
  },
  resetPasswordExpires: {
    type: Date
  }
}, {
  timestamps: true,
  suppressReservedKeysWarning: true
});

// Index for efficient queries
userSchema.index({ email: 1 });
userSchema.index({ role: 1, status: 1 });

// Pre-save middleware to hash password and validate buyerType
userSchema.pre('save', async function(next) {
  // Fix invalid buyerType values
  if (this.role === 'buyer' && this.buyerType) {
    const validBuyerTypes = ['Wholesale', 'Retail', 'Online'];
    if (!validBuyerTypes.includes(this.buyerType)) {
      console.log(`⚠️  Invalid buyerType "${this.buyerType}" detected, fixing to "Retail"`);
      this.buyerType = 'Retail';
    }
  }
  
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to get public profile (without password)
userSchema.methods.toPublicJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

// Static method to find by email
userSchema.statics.findByEmail = function(email) {
  if (!email || typeof email !== 'string') {
    return null;
  }
  return this.findOne({ email: email.toLowerCase() });
};

// Method to generate password reset token
userSchema.methods.generatePasswordResetToken = function() {
  const crypto = require('crypto');
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  // Hash the token before saving to database
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  
  // Set expiration (15 minutes from now)
  this.resetPasswordExpires = Date.now() + 15 * 60 * 1000;
  
  return resetToken;
};

// Method to clear password reset token
userSchema.methods.clearPasswordResetToken = function() {
  this.resetPasswordToken = undefined;
  this.resetPasswordExpires = undefined;
};

// Static method to find by reset token
userSchema.statics.findByResetToken = function(token) {
  const crypto = require('crypto');
  const hashedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
  
  return this.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() }
  });
};

// Pre-deleteOne middleware to delete all orders when a buyer is deleted
userSchema.pre('deleteOne', { document: true }, async function(next) {
  try {
    // Only delete orders if this is a buyer
    if (this.role === 'buyer') {
      const Order = mongoose.model('Order');
      const deletedOrders = await Order.deleteMany({ buyerId: this._id });
      console.log(`🗑️  Deleted ${deletedOrders.deletedCount} orders for buyer ${this.email} (${this._id})`);
    }
    next();
  } catch (error) {
    console.error('Error deleting orders for buyer:', error);
    next(error);
  }
});

// Pre-deleteOne middleware (for deleteOne operations on queries)
userSchema.pre('deleteOne', { query: true }, async function(next) {
  try {
    const filter = this.getFilter();
    const user = await this.model.findOne(filter);
    
    if (user && user.role === 'buyer') {
      const Order = mongoose.model('Order');
      const deletedOrders = await Order.deleteMany({ buyerId: user._id });
      console.log(`🗑️  Deleted ${deletedOrders.deletedCount} orders for buyer ${user.email} (${user._id})`);
    }
    next();
  } catch (error) {
    console.error('Error deleting orders for buyer:', error);
    next(error);
  }
});

// Pre-deleteMany middleware (for deleteMany operations)
userSchema.pre('deleteMany', { query: true }, async function(next) {
  try {
    const filter = this.getFilter();
    const users = await this.model.find(filter);
    
    for (const user of users) {
      if (user.role === 'buyer') {
        const Order = mongoose.model('Order');
        const deletedOrders = await Order.deleteMany({ buyerId: user._id });
        console.log(`🗑️  Deleted ${deletedOrders.deletedCount} orders for buyer ${user.email} (${user._id})`);
      }
    }
    next();
  } catch (error) {
    console.error('Error deleting orders for buyers:', error);
    next(error);
  }
});

module.exports = mongoose.models.User || mongoose.model('User', userSchema); 