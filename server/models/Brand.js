const mongoose = require('mongoose');

const brandSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  visibility: {
    type: String,
    enum: ['all_approved', 'specific_buyers', 'hidden'],
    default: 'all_approved'
  },
  visibleToBuyers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, { suppressReservedKeysWarning: true });

module.exports = mongoose.models.Brand || mongoose.model('Brand', brandSchema); 