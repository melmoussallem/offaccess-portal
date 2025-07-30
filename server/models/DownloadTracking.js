const mongoose = require('mongoose');

const downloadTrackingSchema = new mongoose.Schema({
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  stockFileId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StockFile',
    required: true
  },
  downloadedAt: {
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

// Compound index to ensure one download per buyer per stock file per month
downloadTrackingSchema.index({ buyerId: 1, stockFileId: 1, month: 1 }, { unique: true });

module.exports = mongoose.models.DownloadTracking || mongoose.model('DownloadTracking', downloadTrackingSchema); 