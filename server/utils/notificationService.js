const Notification = require('../models/Notification');
const User = require('../models/User');
const { 
  sendRegistrationConfirmation, 
  sendStatusUpdateEmail, 
  sendNewStockFileNotification, // <-- use this for stock file emails
  sendOrderStatusUpdate 
} = require('./emailService');

// Create and log notification
const createNotification = async (userId, type, title, message, emailData = null) => {
    try {
      const notification = new Notification({
      userId,
        type,
        title,
        message,
      emailData
      });

      await notification.save();
    console.log(`Notification created: ${type} for user ${userId}`);
    return notification;
    } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

// Send email notification and log it
const sendEmailNotification = async (userId, emailType, emailData, recipientEmail) => {
  try {
    console.log('📧 sendEmailNotification called:', { 
      userId, 
      emailType, 
      recipientEmail,
      emailDataKeys: Object.keys(emailData),
      emailDataName: emailData.name,
      emailDataEmail: emailData.email,
      emailDataStatus: emailData.status
    });
    
    let emailResult;
    
    switch (emailType) {
      case 'email_registration':
        emailResult = await sendRegistrationConfirmation(emailData);
        break;
      case 'email_status_update':
        emailResult = await sendStatusUpdateEmail(emailData, emailData.status, emailData.reason);
        break;
      case 'email_new_collection':
        // Fix: use sendNewStockFileNotification for stock file upload
        emailResult = await sendNewStockFileNotification([emailData.buyer], emailData.stockFile);
        break;
      case 'email_order_status_update':
        emailResult = await sendOrderStatusUpdate(emailData.buyer, emailData.order);
        break;
      default:
        throw new Error(`Unknown email type: ${emailType}`);
    }

    // Email sent successfully - no need to create in-app notification about it
    return emailResult;
    } catch (error) {
    console.error(`❌ Email notification failed for type ${emailType}:`, error);
    
    // Don't create in-app notification for email failures - just log to console
    console.error(`❌ Email notification failed for user ${userId}, type ${emailType}:`, error.message);

    throw error;
  }
};

// 1. Registration Completion Notification
const notifyRegistrationCompletion = async (buyer) => {
  try {
    // Create in-app notification
    await createNotification(
      buyer._id,
      'registration_confirmation',
      'Registration Confirmation',
      'Your registration has been received and is under review.',
      { buyer }
    );

    // Send email notification (separate from in-app notification)
    await sendEmailNotification(
      buyer._id,
      'email_registration',
      buyer,
      buyer.email
    );

    console.log(`Registration completion notification sent to ${buyer.email}`);
  } catch (error) {
    console.error('Registration completion notification failed:', error);
    throw error;
  }
};

// 2. Registration Status Decision Notification
const notifyRegistrationStatus = async (buyer, status, reason = null) => {
  try {
    const buyerObj = typeof buyer.toObject === 'function' ? buyer.toObject() : buyer;
    console.log('🔔 notifyRegistrationStatus called:', { 
      buyerId: buyerObj._id, 
      buyerEmail: buyerObj.email, 
      buyerName: buyerObj.name, 
      status, 
      reason 
    });
    
    const statusText = status === 'approved' ? 'approved' : 'rejected';
    const message = status === 'approved' 
      ? 'Your registration has been approved! You can now access the catalogue.'
      : 'Your registration has not been approved at this time.';

    // Create in-app notification
    await createNotification(
      buyerObj._id,
      'registration_status_update',
      `Registration ${statusText.charAt(0).toUpperCase() + statusText.slice(1)}`,
      message,
      { buyer: buyerObj, status, reason }
    );

    // Send email notification (separate from in-app notification)
    await sendEmailNotification(
      buyerObj._id,
      'email_status_update',
      { ...buyerObj, status, reason },
      buyerObj.email
    );

    console.log(`✅ Registration status notification sent to ${buyerObj.email} - Status: ${status}`);
  } catch (error) {
    console.error('❌ Registration status notification failed:', error);
    throw error;
  }
};

// 3. New Collection Available Notification
const notifyNewCollection = async (buyers, stockFile) => {
  try {
    const notifications = [];
    const emailPromises = [];

    for (const buyer of buyers) {
      // Create in-app notification for each buyer (frontend expects 'new_collection_available')
      const notification1 = await createNotification(
        buyer._id,
        'new_collection_available',
        'New Collection Available',
        `A new collection "${stockFile.name}" has been added to the catalogue.`,
        { buyer, stockFile }
      );
      notifications.push(notification1);
      // Also create a notification with type 'new_stock_file_available' for backend schema compatibility
      const notification2 = await createNotification(
        buyer._id,
        'new_stock_file_available',
        'New Stock File Available',
        `A new stock file "${stockFile.name}" has been uploaded to the catalogue.`,
        { buyer, stockFile }
      );
      notifications.push(notification2);

      // Prepare email notification (separate from in-app notification)
      emailPromises.push(
        sendEmailNotification(
          buyer._id,
          'email_new_collection',
          { buyer, stockFile },
          buyer.email
        )
      );
    }

    // Send all email notifications
    const emailResults = await Promise.allSettled(emailPromises);
    const successful = emailResults.filter(result => result.status === 'fulfilled').length;
    const failed = emailResults.filter(result => result.status === 'rejected').length;

    console.log(`New collection notification sent to ${successful} buyers, ${failed} failed`);
    return { successful, failed, notifications };
  } catch (error) {
    console.error('New collection notification failed:', error);
    throw error;
  }
};

// 4. Order Status Change Notification
const notifyOrderStatusUpdate = async (buyer, order) => {
  try {
    // Create in-app notification
    await createNotification(
      buyer._id,
      'order_status_update',
      'Order Status Updated',
      `Your order ${order.orderNumber} status has been updated to ${order.status}.`,
      { buyer, order }
    );

    // Send email notification (separate from in-app notification)
    await sendEmailNotification(
      buyer._id,
      'email_order_status_update',
      { buyer, order },
      buyer.email
    );

    console.log(`Order status notification sent to ${buyer.email} for order ${order.orderNumber}`);
  } catch (error) {
    console.error('Order status notification failed:', error);
    throw error;
  }
};

// Get notifications for a user with pagination
const getUserNotifications = async (userId, page = 1, limit = 20) => {
  try {
    const skip = (page - 1) * limit;
    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    const total = await Notification.countDocuments({ userId });
    return { notifications, total };
  } catch (error) {
    console.error('Error fetching user notifications:', error);
    throw error;
  }
};

// Mark notification as read
const markNotificationAsRead = async (notificationId, userId) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, userId },
      { isRead: true },
      { new: true }
    );
    
    return notification;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

// Mark all notifications as read for a user
const markAllNotificationsAsRead = async (userId) => {
  try {
    const result = await Notification.updateMany(
      { userId, isRead: false },
      { isRead: true }
    );
    
    return result;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

// Get notification statistics
const getNotificationStats = async (userId) => {
  try {
    const stats = await Notification.aggregate([
      { $match: { userId: userId } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          unread: { $sum: { $cond: [{ $eq: ['$isRead', false] }, 1, 0] } },
          emailSent: { $sum: { $cond: [{ $eq: ['$emailSent', true] }, 1, 0] } },
          emailFailed: { $sum: { $cond: [{ $ne: ['$emailError', null] }, 1, 0] } }
        }
      }
    ]);

    return stats[0] || { total: 0, unread: 0, emailSent: 0, emailFailed: 0 };
  } catch (error) {
    console.error('Error getting notification stats:', error);
    throw error;
  }
};

// Legacy notification functions for backward compatibility
const notifyAdmins = async (type, title, message, data = {}, priority = 'medium') => {
  try {
    const admins = await User.find({ role: 'admin' });
    const notifications = [];

    for (const admin of admins) {
      const notification = await createNotification(
        admin._id,
        type,
        title,
        message,
        data
      );
      notifications.push(notification);
    }

    return notifications;
  } catch (error) {
    console.error('Error notifying admins:', error);
    throw error;
  }
};

const notifyBuyer = async (buyerId, type, title, message, data = {}, priority = 'medium') => {
  try {
    const notification = await createNotification(
      buyerId,
      type,
      title,
      message,
      data
    );
    return notification;
  } catch (error) {
    console.error('Error notifying buyer:', error);
    throw error;
  }
};

const notifyBuyers = async (buyerIds, type, title, message, data = {}, priority = 'medium') => {
  try {
    const notifications = [];

    for (const buyerId of buyerIds) {
      const notification = await createNotification(
        buyerId,
        type,
        title,
        message,
        data
      );
      notifications.push(notification);
    }

    return notifications;
  } catch (error) {
    console.error('Error notifying buyers:', error);
    throw error;
  }
};

module.exports = {
  createNotification,
  sendEmailNotification,
  notifyRegistrationCompletion,
  notifyRegistrationStatus,
  notifyNewCollection,
  notifyNewStockFile: notifyNewCollection, // Add this line for alias
  notifyOrderStatusUpdate,
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getNotificationStats,
  notifyAdmins,
  notifyBuyer,
  notifyBuyers
}; 