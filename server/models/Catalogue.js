const mongoose = require('mongoose');

const catalogueSchema = new mongoose.Schema({
  brandId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Brand',
    required: true
  },
  brandName: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  fileName: {
    type: String,
    required: true,
    trim: true
  },
  originalName: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number
  },
  mimeType: {
    type: String
  },
  columns: {
    type: [{
      name: String,
      type: String,
      editable: {
        type: Boolean,
        default: false
      }
    }],
    default: []
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  suppressReservedKeysWarning: true
});

// Pre-save middleware to ensure columns is always an array
catalogueSchema.pre('save', function(next) {
  if (this.columns && typeof this.columns === 'string') {
    try {
      this.columns = JSON.parse(this.columns);
    } catch (error) {
      console.error('Error parsing columns string:', error);
      this.columns = [];
    }
  }
  
  if (!Array.isArray(this.columns)) {
    this.columns = [];
  }
  
  // Ensure each column object has the correct structure
  this.columns = this.columns.map(col => {
    if (typeof col === 'string') {
      return { name: col, type: 'string', editable: false };
    }
    return {
      name: col.name || 'Column',
      type: col.type || 'string',
      editable: col.editable || false
    };
  });
  
  next();
});

// Indexes for efficient queries
catalogueSchema.index({ brandId: 1 });
catalogueSchema.index({ brandName: 1 });
catalogueSchema.index({ uploadedBy: 1 });

// Method to check if a buyer can access a specific file
catalogueSchema.methods.canBuyerAccessFile = function(fileId, buyerId) {
  const file = this.files.id(fileId);
  if (!file) return false;
  
  if (file.visibility === 'hidden') return false;
  if (file.visibility === 'all_approved') return true;
  if (file.visibility === 'specific_buyers') {
    return file.visibleToBuyers.includes(buyerId);
  }
  return false;
};

// Method to get files visible to a specific buyer
catalogueSchema.methods.getVisibleFilesForBuyer = function(buyerId) {
  return this.files.filter(file => {
    if (file.visibility === 'hidden') return false;
    if (file.visibility === 'all_approved') return true;
    if (file.visibility === 'specific_buyers') {
      return file.visibleToBuyers.includes(buyerId);
    }
    return false;
  });
};

// Static method to find catalogues with visible files for a buyer
catalogueSchema.statics.findVisibleForBuyer = function(buyerId) {
  return this.find({
    isActive: true,
    $or: [
      { 'files.visibility': 'all_approved' },
      { 'files.visibleToBuyers': buyerId }
    ]
  }).populate('files.uploadedBy', 'name email');
};

module.exports = mongoose.models.Catalogue || mongoose.model('Catalogue', catalogueSchema); 