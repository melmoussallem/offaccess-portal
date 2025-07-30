const express = require('express');
const User = require('../models/User');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { notifyRegistrationStatus } = require('../utils/notificationService');

const router = express.Router();

// Get all buyers (Admin only)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status, search } = req.query;
    
    // Include all buyers (approved, pending, rejected)
    let query = { role: 'buyer' };
    if (status && status !== 'all') {
      query.status = status;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { companyName: { $regex: search, $options: 'i' } }
      ];
    }
    // Return all buyers (no pagination)
    const buyers = await User.find(query).select('-password').sort({ createdAt: -1 });
    res.json({ buyers });
  } catch (error) {
    console.error('Get buyers error:', error);
    res.status(500).json({ message: 'Failed to fetch buyers' });
  }
});

// Get buyer by ID (Admin only)
router.get('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const buyer = await User.findById(req.params.id).select('-password');
    
    if (!buyer || buyer.role !== 'buyer') {
      return res.status(404).json({ message: 'Buyer not found' });
    }
    
    res.json({ buyer });
    
  } catch (error) {
    console.error('Get buyer error:', error);
    res.status(500).json({ message: 'Failed to fetch buyer' });
  }
});

// Update buyer status (Admin only)
router.put('/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status, notes, rejectionReason } = req.body;
    
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    const buyer = await User.findById(req.params.id);
    
    if (!buyer || buyer.role !== 'buyer') {
      return res.status(404).json({ message: 'Buyer not found' });
    }
    
    const oldStatus = buyer.status;
    buyer.status = status;
    
    if (notes !== undefined) {
      buyer.adminNotes = notes;
    }
    
    await buyer.save();
    
    // Send status update notification if status changed
    if (oldStatus !== status) {
      try {
        // For rejections, pass the rejection reason
        const reason = status === 'rejected' ? rejectionReason : null;
        await notifyRegistrationStatus(buyer, status, reason);
      } catch (notificationError) {
        console.error('Status update notification failed:', notificationError);
      }
    }
    
    res.json({
      message: 'Buyer status updated successfully',
      buyer: buyer.toPublicJSON()
    });
    
  } catch (error) {
    console.error('Update buyer status error:', error);
    res.status(500).json({ message: 'Failed to update buyer status' });
  }
});

// Update buyer profile (Admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const {
      name,
      phone,
      companyName,
      companyWebsite,
      companyAddress,
      buyerType,
      isActive
    } = req.body;
    
    const buyer = await User.findById(req.params.id);
    
    if (!buyer || buyer.role !== 'buyer') {
      return res.status(404).json({ message: 'Buyer not found' });
    }
    
    // Update allowed fields
    if (name !== undefined) buyer.name = name;
    if (phone !== undefined) buyer.phone = phone;
    if (companyName !== undefined) buyer.companyName = companyName;
    if (companyWebsite !== undefined) buyer.companyWebsite = companyWebsite;
    if (companyAddress !== undefined) buyer.companyAddress = companyAddress;
    if (buyerType !== undefined) buyer.buyerType = buyerType;
    if (isActive !== undefined) buyer.isActive = isActive;
    
    await buyer.save();
    
    res.json({
      message: 'Buyer profile updated successfully',
      buyer: buyer.toPublicJSON()
    });
    
  } catch (error) {
    console.error('Update buyer error:', error);
    res.status(500).json({ message: 'Failed to update buyer profile' });
  }
});

// Update buyer brand access (Admin only)
router.put('/:id/brand-access', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { brandAccess } = req.body;
    
    if (!Array.isArray(brandAccess)) {
      return res.status(400).json({ message: 'Brand access must be an array' });
    }
    
    const buyer = await User.findById(req.params.id);
    
    if (!buyer || buyer.role !== 'buyer') {
      return res.status(404).json({ message: 'Buyer not found' });
    }
    
    buyer.brandAccess = brandAccess;
    await buyer.save();
    
    res.json({
      message: 'Brand access updated successfully',
      buyer: buyer.toPublicJSON()
    });
    
  } catch (error) {
    console.error('Update brand access error:', error);
    res.status(500).json({ message: 'Failed to update brand access' });
  }
});

// Delete buyer (Admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const buyer = await User.findById(req.params.id);
    
    if (!buyer || buyer.role !== 'buyer') {
      return res.status(404).json({ message: 'Buyer not found' });
    }
    
    // Delete the buyer - this will automatically trigger the middleware to delete associated orders
    await buyer.deleteOne();
    
    res.json({
      message: 'Buyer and all associated orders deleted successfully'
    });
    
  } catch (error) {
    console.error('Delete buyer error:', error);
    res.status(500).json({ message: 'Failed to delete buyer' });
  }
});

// Get rejected buyers (Admin only)
router.get('/rejected', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const query = { role: 'buyer', status: 'rejected' };
    const skip = (page - 1) * limit;
    
    const rejectedBuyers = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await User.countDocuments(query);
    
    res.json({
      buyers: rejectedBuyers,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        totalRecords: total
      }
    });
    
  } catch (error) {
    console.error('Get rejected buyers error:', error);
    res.status(500).json({ message: 'Failed to fetch rejected buyers' });
  }
});

// Get buyer statistics (Admin only)
router.get('/stats/overview', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const stats = await User.aggregate([
      { $match: { role: 'buyer' } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const buyerTypeStats = await User.aggregate([
      { $match: { role: 'buyer' } },
      {
        $group: {
          _id: '$buyerType',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const totalBuyers = await User.countDocuments({ role: 'buyer' });
    const activeBuyers = await User.countDocuments({ role: 'buyer', isActive: true });
    
    res.json({
      statusBreakdown: stats,
      buyerTypeBreakdown: buyerTypeStats,
      totalBuyers,
      activeBuyers
    });
    
  } catch (error) {
    console.error('Get buyer stats error:', error);
    res.status(500).json({ message: 'Failed to fetch buyer statistics' });
  }
});

// Bulk update buyer status (Admin only)
router.put('/bulk/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { buyerIds, status, notes } = req.body;
    
    if (!Array.isArray(buyerIds) || buyerIds.length === 0) {
      return res.status(400).json({ message: 'Buyer IDs array is required' });
    }
    
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    const updateData = { status };
    if (notes) updateData.adminNotes = notes;
    
    const result = await User.updateMany(
      { _id: { $in: buyerIds }, role: 'buyer' },
      updateData
    );
    
    // Send email notifications for status changes
    if (result.modifiedCount > 0) {
      const buyers = await User.find({ _id: { $in: buyerIds } });
      for (const buyer of buyers) {
        try {
          await sendStatusUpdateEmail(buyer.email, status, buyer.name);
        } catch (emailError) {
          console.error('Bulk status update email failed:', emailError);
        }
      }
    }
    
    res.json({
      message: `Updated ${result.modifiedCount} buyers successfully`,
      modifiedCount: result.modifiedCount
    });
    
  } catch (error) {
    console.error('Bulk update error:', error);
    res.status(500).json({ message: 'Failed to update buyers' });
  }
});

module.exports = router; 