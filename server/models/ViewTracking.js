const mongoose = require('mongoose');

const viewTrackingSchema = new mongoose.Schema({
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  brandId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Brand',
    required: true
  },
  viewedAt: {
    type: Date,
    default: Date.now
  },
  month: {
    type: String,
    required: true,
    index: true
  }
}, { 
  timestamps: true,
  suppressReservedKeysWarning: true 
});

// Compound index to ensure one view per buyer per brand per month
viewTrackingSchema.index({ buyerId: 1, brandId: 1, month: 1 }, { unique: true });

module.exports = mongoose.models.ViewTracking || mongoose.model('ViewTracking', viewTrackingSchema); 