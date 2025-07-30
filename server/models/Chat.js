const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  senderRole: {
    type: String,
    enum: ['admin', 'buyer'],
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  isRead: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const chatSchema = new mongoose.Schema({
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  buyerName: {
    type: String,
    required: true
  },
  buyerEmail: {
    type: String,
    required: true
  },
  messages: [messageSchema],
  lastMessageAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  unreadCount: {
    admin: {
      type: Number,
      default: 0
    },
    buyer: {
      type: Number,
      default: 0
    }
  },
  deletedForAdmin: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
chatSchema.index({ buyerId: 1 }, { unique: true });
chatSchema.index({ lastMessageAt: -1 });
chatSchema.index({ 'unreadCount.admin': 1 });
chatSchema.index({ 'unreadCount.buyer': 1 });

// Method to add a message to the chat
chatSchema.methods.addMessage = function(senderId, senderRole, content) {
  const message = {
    senderId,
    senderRole,
    content,
    createdAt: new Date()
  };
  
  this.messages.push(message);
  this.lastMessageAt = new Date();
  
  // Update unread counts
  if (senderRole === 'admin') {
    this.unreadCount.buyer += 1;
  } else {
    this.unreadCount.admin += 1;
  }
  
  return this.save();
};

// Method to mark messages as read
chatSchema.methods.markAsRead = function(userRole) {
  if (userRole === 'admin') {
    this.unreadCount.admin = 0;
    this.messages.forEach(msg => {
      if (msg.senderRole === 'buyer' && !msg.isRead) {
        msg.isRead = true;
      }
    });
  } else {
    this.unreadCount.buyer = 0;
    this.messages.forEach(msg => {
      if (msg.senderRole === 'admin' && !msg.isRead) {
        msg.isRead = true;
      }
    });
  }
  
  return this.save();
};

module.exports = mongoose.models.Chat || mongoose.model('Chat', chatSchema); 