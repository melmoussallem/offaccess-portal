const express = require('express');
const Chat = require('../models/Chat');
const User = require('../models/User');
const { authenticateToken, requireAdmin, requireApprovedBuyer } = require('../middleware/auth');
const mongoose = require('mongoose');

const router = express.Router();

// Get all chat conversations (Admin only)
router.get('/conversations', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Use aggregation to get the most recent conversation per buyer in one query
    const conversations = await Chat.aggregate([
      { $match: { isActive: true } },
      { $lookup: { from: 'users', localField: 'buyerId', foreignField: '_id', as: 'buyer' } },
      { $unwind: { path: '$buyer', preserveNullAndEmptyArrays: true } },
      { $sort: { lastMessageAt: -1 } },
      {
        $group: {
          _id: '$buyerId',
          conversation: { $first: '$$ROOT' }
        }
      },
      { $replaceRoot: { newRoot: '$conversation' } },
      { $sort: { lastMessageAt: -1 } }
    ]);

    // Filter out conversations with missing or invalid buyer data
    const validConversations = conversations.filter(conv => {
      // Check if buyer data exists and is valid
      if (!conv.buyer || !conv.buyer._id) {
        console.warn('Skipping conversation with invalid buyerId:', conv._id);
        return false;
      }
      
      // Additional validation to ensure buyer is actually a buyer
      if (conv.buyer.role !== 'buyer') {
        console.warn('Skipping conversation with non-buyer user:', conv.buyer._id);
        return false;
      }
      
      if (conv.deletedForAdmin) return false;

      return true;
    });

    // Filter out chats where deletedForAdmin is true
    const activeConversations = validConversations.filter(conv => !conv.deletedForAdmin);

    // Format conversations for admin view
    const formattedConversations = activeConversations.map(conv => ({
      id: conv._id,
      buyerId: conv.buyerId,
      buyerName: conv.buyer.name || 'Unknown Buyer',
      buyerEmail: conv.buyer.email || 'No email',
      companyName: conv.buyer.companyName || 'No company',
      lastMessage: conv.messages.length > 0 ? conv.messages[conv.messages.length - 1].content : '',
      lastMessageAt: conv.lastMessageAt,
      unreadCount: conv.unreadCount.admin,
      hasUnread: conv.unreadCount.admin > 0,
      messageCount: conv.messages.length
    }));

    res.json({ conversations: formattedConversations });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ message: 'Failed to fetch conversations' });
  }
});

// Get buyer's chat with admin (Buyer only)
router.get('/my-chat', authenticateToken, requireApprovedBuyer, async (req, res) => {
  try {
    let chat = await Chat.findOne({ 
      buyerId: req.user._id,
      isActive: true 
    });

    // Create chat if it doesn't exist
    if (!chat) {
      chat = new Chat({
        buyerId: req.user._id,
        buyerName: req.user.name,
        buyerEmail: req.user.email
      });
      await chat.save();
    }

    // Don't automatically mark as read - only mark when chat is opened
    // The frontend will call markAsRead when the chat window is opened

    res.json({ 
      chat: {
        id: chat._id,
        messages: chat.messages,
        unreadCount: chat.unreadCount.buyer
      }
    });
  } catch (error) {
    console.error('Get buyer chat error:', error);
    res.status(500).json({ message: 'Failed to fetch chat' });
  }
});

// Get specific conversation (Admin only)
router.get('/conversation/:buyerId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { buyerId } = req.params;
    console.log('[DEBUG] GET /conversation/:buyerId called with', buyerId);
    // Verify the buyer exists
    const buyer = await User.findById(buyerId);
    if (!buyer || buyer.role !== 'buyer') {
      console.log('[DEBUG] Buyer not found for', buyerId);
      return res.status(404).json({ message: 'Buyer not found' });
    }
    let chat = await Chat.findOne({ 
      buyerId: buyerId,
      isActive: true 
    }).populate('buyerId', 'name email companyName');
    console.log('[DEBUG] Chat found:', chat ? chat._id : null, 'deletedForAdmin:', chat ? chat.deletedForAdmin : null);
    if (chat && chat.deletedForAdmin) {
      chat.deletedForAdmin = false;
      chat.lastMessageAt = Date.now();
      await chat.save();
      console.log('[DEBUG] Chat undeleted for admin:', chat._id);
    }
    if (!chat) {
      // Create new chat for this buyer
      chat = new Chat({
        buyerId: buyerId,
        buyerName: buyer.name,
        buyerEmail: buyer.email,
        lastMessageAt: Date.now()
      });
      // Add a dummy system message to ensure chat appears in list
      chat.messages.push({
        senderId: req.user._id,
        senderRole: 'admin',
        content: 'Chat started',
        isRead: true,
        createdAt: Date.now()
      });
      await chat.save();
      console.log('[DEBUG] Created new chat for', buyerId, 'chatId:', chat._id);
      return res.json({ 
        chat: {
          id: chat._id,
          buyerId: buyerId,
          buyerName: buyer.name,
          buyerEmail: buyer.email,
          companyName: buyer.companyName || 'No company',
          messages: chat.messages,
          unreadCount: 0
        }
      });
    }
    console.log('[DEBUG] Found existing chat for', buyerId, 'chatId:', chat._id, 'messages:', chat.messages.length);
    res.json({ 
      chat: {
        id: chat._id,
        buyerId: chat.buyerId._id,
        buyerName: chat.buyerId.name || buyer.name,
        buyerEmail: chat.buyerId.email || buyer.email,
        companyName: chat.buyerId.companyName || buyer.companyName || 'No company',
        messages: chat.messages,
        unreadCount: chat.unreadCount.admin
      }
    });
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ message: 'Failed to fetch conversation' });
  }
});

// Add a new endpoint:
router.delete('/conversation/:buyerId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { buyerId } = req.params;
    console.log('[DEBUG] DELETE CHAT: buyerId param =', buyerId, 'type:', typeof buyerId);
    // Validate buyerId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(buyerId)) {
      console.log('[DEBUG] DELETE CHAT: Invalid ObjectId:', buyerId);
      return res.status(400).json({ message: 'Invalid buyerId' });
    }
    // Use buyerId as a string, let Mongoose cast it
    const chat = await Chat.findOne({ buyerId: buyerId, isActive: true });
    console.log('[DEBUG] DELETE CHAT: Chat found =', chat ? chat._id : null);
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }
    chat.deletedForAdmin = true;
    await chat.save();
    res.json({ message: 'Chat deleted for admin view only' });
  } catch (error) {
    console.error('Delete chat error:', error);
    res.status(500).json({ message: 'Failed to delete chat' });
  }
});

// Send message (Both admin and buyer)
router.post('/send-message', authenticateToken, async (req, res) => {
  try {
    const { content, buyerId } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Message content is required' });
    }

    let chat;

    if (req.user.role === 'admin') {
      // Admin sending message to specific buyer
      if (!buyerId) {
        return res.status(400).json({ message: 'Buyer ID is required for admin messages' });
      }

      // Verify the buyer exists
      const buyer = await User.findById(buyerId);
      if (!buyer || buyer.role !== 'buyer') {
        return res.status(404).json({ message: 'Buyer not found' });
      }

      chat = await Chat.findOne({ 
        buyerId: buyerId,
        isActive: true 
      });

      if (!chat) {
        // Create new chat for this buyer
        chat = new Chat({
          buyerId: buyerId,
          buyerName: buyer.name,
          buyerEmail: buyer.email
        });
      }
    } else {
      // Buyer sending message to admin
      chat = await Chat.findOne({ 
        buyerId: req.user._id,
        isActive: true 
      });

      if (!chat) {
        chat = new Chat({
          buyerId: req.user._id,
          buyerName: req.user.name,
          buyerEmail: req.user.email
        });
      }
    }

    // If a buyer is sending a message and the chat was deleted for admin, undelete it and update lastMessageAt
    if (req.user.role === 'buyer' && chat.deletedForAdmin) {
      chat.deletedForAdmin = false;
      chat.lastMessageAt = new Date();
      await chat.save();
    }
    await chat.addMessage(req.user._id, req.user.role, content.trim());

    // Populate sender info for response
    const message = chat.messages[chat.messages.length - 1];
    const sender = await User.findById(message.senderId).select('name');

    res.json({
      message: {
        id: message._id,
        content: message.content,
        senderId: message.senderId,
        senderName: sender?.name || 'Unknown',
        senderRole: message.senderRole,
        createdAt: message.createdAt
      },
      chatId: chat._id
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Failed to send message' });
  }
});

// Mark messages as read
router.put('/mark-read', authenticateToken, async (req, res) => {
  try {
    const { chatId } = req.body;

    if (!chatId) {
      return res.status(400).json({ message: 'Chat ID is required' });
    }

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Verify user has access to this chat
    if (req.user.role === 'buyer' && chat.buyerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await chat.markAsRead(req.user.role);

    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({ message: 'Failed to mark messages as read' });
  }
});

// Clear chat history (Admin or Buyer)
router.post('/:chatId/clear', authenticateToken, async (req, res) => {
  try {
    const { chatId } = req.params;
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }
    // Check if user is a participant
    if (
      (req.user.role === 'admin') ||
      (req.user.role === 'buyer' && chat.buyerId.toString() === req.user._id.toString())
    ) {
      chat.messages = [];
      chat.lastMessageAt = null;
      chat.unreadCount = { admin: 0, buyer: 0 };
      await chat.save();
      return res.json({ message: 'Chat history cleared', chat: { id: chat._id, messages: chat.messages } });
    } else {
      return res.status(403).json({ message: 'Access denied' });
    }
  } catch (error) {
    console.error('Clear chat error:', error);
    res.status(500).json({ message: 'Failed to clear chat history' });
  }
});

// Get unread message count
router.get('/unread-count', authenticateToken, async (req, res) => {
  try {
    let unreadCount = 0;

    if (req.user.role === 'admin') {
      // Get total unread messages across all conversations - optimized query
      const result = await Chat.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: null, total: { $sum: '$unreadCount.admin' } } }
      ]);
      unreadCount = result.length > 0 ? result[0].total : 0;
    } else {
      // Get unread messages for buyer - optimized query
      const result = await Chat.aggregate([
        { $match: { buyerId: req.user._id, isActive: true } },
        { $project: { unreadCount: '$unreadCount.buyer' } }
      ]);
      unreadCount = result.length > 0 ? result[0].unreadCount : 0;
    }

    res.json({ unreadCount });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ message: 'Failed to get unread count' });
  }
});

module.exports = router; 