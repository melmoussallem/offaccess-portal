const mongoose = require('mongoose');

const StockFileSchema = new mongoose.Schema({
  brandId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Brand',
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  base64Data: {
    type: String,
    required: false
  }
});

module.exports = mongoose.models.StockFile || mongoose.model('StockFile', StockFileSchema); 