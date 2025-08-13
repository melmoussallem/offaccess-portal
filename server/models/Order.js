const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  buyerName: {
    type: String,
    required: true
  },
  companyName: {
    type: String,
    required: true
  },
  // Brand and StockFile information
  brand: {
    type: String,
    required: true
  },
  stockFile: {
    type: String,
    required: true
  },
  // Submitted Excel file from buyer
  excelFile: {
    type: String,
    required: false
  },
  // Original filename of the Excel file
  excelFileOriginalName: {
    type: String,
    required: false
  },
  // Base64 version of the Excel file
  excelFileBase64: {
    type: String,
    required: false
  },
  // Google Cloud Storage path for Excel file
  excelFileGCS: {
    type: String,
    required: false
  },
  // Invoice file uploaded by admin
  invoiceFile: {
    type: String,
    required: false
  },
  // Original filename of the invoice file
  invoiceFileOriginalName: {
    type: String,
    required: false
  },
  // Base64 version of the invoice file
  invoiceFileBase64: {
    type: String,
    required: false
  },
  // Google Cloud Storage path for invoice file
  invoiceFileGCS: {
    type: String,
    required: false
  },
  // Extracted data from Excel
  totalQuantity: {
    type: Number,
    required: true,
    default: 0
  },
  totalAmount: {
    type: Number,
    required: true,
    default: 0
  },
  // Order status according to new workflow
  status: {
    type: String,
    enum: [
      'Pending Review',                   // Buyer submitted order – awaiting admin review
          'Cancelled',                        // Buyer cancelled the order before admin review
    'Rejected',                         // Admin rejected order
      'Awaiting Payment',                 // Admin approved order – invoice uploaded, awaiting offline payment
      'Completed'                         // Admin manually confirmed payment received
    ],
    default: 'Pending Review'
  },
  // Rejection reason (optional)
  rejectionReason: {
    type: String
  },
  // Cancellation reason (optional)
  cancellationReason: {
    type: String
  },
  // Payment confirmation note
  paymentNote: {
    type: String
  },
  // Additional notes
  notes: {
    type: String
  },
  // Inventory tracking fields
  inventoryDeducted: {
    type: Boolean,
    default: false
  },
  inventoryFileId: {
    type: String,
    required: false
  },
  inventoryDeductionDate: {
    type: Date
  },
  inventoryRestored: {
    type: Boolean,
    default: false
  },
  inventoryRestorationDate: {
    type: Date
  },
  // New fields for inventory status tracking
  inventoryStatus: {
    type: String,
    enum: ['pending', 'success', 'error', 'not_applicable'],
    default: 'not_applicable'
  },
  inventoryError: {
    type: String,
    required: false
  },
  inventoryErrorDetails: {
    type: Object,
    required: false
  },
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  suppressReservedKeysWarning: true
});

// Generate order number
orderSchema.pre('save', async function(next) {
  if (this.isNew) {
    const date = new Date();
    const dateStr = date.getFullYear().toString() + 
                   (date.getMonth() + 1).toString().padStart(2, '0') + 
                   date.getDate().toString().padStart(2, '0');
    
    // Find the highest order number for today
    const todayOrders = await this.constructor.find({
      orderNumber: new RegExp(`^ORD-${dateStr}-`)
    }).sort({ orderNumber: -1 }).limit(1);
    
    let sequence = 1;
    if (todayOrders.length > 0) {
      const lastOrder = todayOrders[0];
      const lastSequence = parseInt(lastOrder.orderNumber.split('-')[2]);
      sequence = lastSequence + 1;
    }
    
    this.orderNumber = `ORD-${dateStr}-${sequence.toString().padStart(3, '0')}`;
  }
  next();
});

module.exports = mongoose.models.Order || mongoose.model('Order', orderSchema); 