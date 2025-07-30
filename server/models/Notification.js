const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: [
      'order', 'chat', 'system', 
      'registration_confirmation', 'registration_status_update', 'new_stock_file_available', 'order_status_update',
      'new_order_submission', 'order_cancellation', 'new_buyer_registration',
      'email_registration', 'email_status_update', 'email_new_stock_file', 'email_order_status', 'email_order_status_update',
      'new_collection_available' // <-- add this type for compatibility with notificationService
    ],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  isRead: {
    type: Boolean,
    default: false
  },
  // Email notification specific fields
  emailSent: {
    type: Boolean,
    default: false
  },
  emailSentAt: {
    type: Date
  },
  emailRecipient: {
    type: String
  },
  emailSubject: {
    type: String
  },
  emailTemplate: {
    type: String
  },
  emailError: {
    type: String
  },
  // Additional data for email notifications
  emailData: {
    type: mongoose.Schema.Types.Mixed
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient queries
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ type: 1, createdAt: -1 });
notificationSchema.index({ emailSent: 1, emailSentAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema); 