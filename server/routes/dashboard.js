const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { authenticateToken, requireApprovedBuyer } = require('../middleware/auth');

// Safe model imports to prevent OverwriteModelError
let Order, User, Catalogue, Brand, ViewTracking, DownloadTracking;

try {
  Order = mongoose.model('Order');
} catch (error) {
  Order = require('../models/Order');
}

try {
  User = mongoose.model('User');
} catch (error) {
  User = require('../models/User');
}

try {
  Catalogue = mongoose.model('Catalogue');
} catch (error) {
  Catalogue = require('../models/Catalogue');
}

try {
  Brand = mongoose.model('Brand');
} catch (error) {
  Brand = require('../models/Brand');
}

try {
  ViewTracking = mongoose.model('ViewTracking');
} catch (error) {
  ViewTracking = require('../models/ViewTracking');
}

try {
  DownloadTracking = mongoose.model('DownloadTracking');
} catch (error) {
  DownloadTracking = require('../models/DownloadTracking');
}

const StockFile = require('../models/StockFile');

// Get dashboard data based on user type
router.get('/', authenticateToken, (req, res, next) => {
  if (req.user.role === 'buyer') {
    return requireApprovedBuyer(req, res, next);
  }
  next();
}, async (req, res) => {
  try {
    // Set cache control headers to prevent caching
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    const { role } = req.user;
    console.log('Dashboard request - Full user object:', JSON.stringify(req.user, null, 2));
    console.log('Dashboard request - User ID:', req.user.id, 'User Role:', role);
    console.log('Role comparison - role === "admin":', role === 'admin');
    console.log('Role comparison - role === "buyer":', role === 'buyer');
    console.log('Role type:', typeof role);
    console.log('Role length:', role ? role.length : 'undefined');

    if (role === 'admin') {
      // Admin dashboard data
      console.log('Loading admin dashboard data');
      const adminData = await getAdminDashboardData();
      res.json(adminData);
    } else {
      // Buyer dashboard data
      console.log('Loading buyer dashboard data for role:', role);
      const buyerData = await getBuyerDashboardData(req.user.id);
      res.json(buyerData);
    }
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Failed to load dashboard data' });
  }
});

// Get admin dashboard data
async function getAdminDashboardData() {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
    const sevenDaysAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    // Section 1: Buyers
    const totalBuyers = await User.countDocuments({ role: 'buyer', status: 'approved' });
    const activeBuyers = await User.countDocuments({ 
      role: 'buyer', 
      status: 'approved',
      lastLogin: { $gte: sevenDaysAgo } 
    });
    const pendingBuyerApprovals = await User.countDocuments({ 
      role: 'buyer', 
      status: 'pending' 
    });

    // Section 2: Orders - Only count approved orders
    const approvedStatuses = ['Awaiting Payment', 'Completed'];
    const totalOrders = await Order.countDocuments({
      status: { $in: approvedStatuses }
    });
    const ordersThisMonth = await Order.countDocuments({
      status: { $in: approvedStatuses },
      createdAt: { $gte: startOfMonth }
    });
    const pendingOrders = await Order.countDocuments({
      status: { $in: ['Awaiting Payment', 'Pending Review'] }
    });

    // Section 3: Catalogue - Fixed counts
    const totalBrands = await Brand.countDocuments();
    // FIX: Use StockFile for stock file counts
    const totalStockFiles = await StockFile.countDocuments();
    const newStockFilesThisMonth = await StockFile.countDocuments({
      uploadedAt: { $gte: startOfMonth }
    });
    // Remove legacy totalCollections
    // const totalCollections = await Catalogue.countDocuments();

    // Section 4: KPIs - Fixed calculations
    // Total Revenue - sum of order values from all approved orders
    const totalRevenueData = await Order.aggregate([
      { 
        $match: { 
          status: { $in: ['Completed', 'Awaiting Payment'] } 
        } 
      },
      { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = totalRevenueData.length > 0 ? totalRevenueData[0].totalRevenue : 0;

    // Revenue This Month
    const revenueThisMonthData = await Order.aggregate([
      { 
        $match: { 
          status: { $in: ['Completed', 'Awaiting Payment'] },
          createdAt: { $gte: startOfMonth }
        } 
      },
      { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
    ]);
    const revenueThisMonth = revenueThisMonthData.length > 0 ? revenueThisMonthData[0].totalRevenue : 0;

    // Total Units Sold - Fixed to count from totalQuantity field
    const totalUnitsData = await Order.aggregate([
      { 
        $match: { 
          status: { $in: ['Completed', 'Awaiting Payment'] } 
        } 
      },
      { $group: { _id: null, totalUnits: { $sum: '$totalQuantity' } } }
    ]);
    const totalUnitsSold = totalUnitsData.length > 0 ? totalUnitsData[0].totalUnits : 0;

    // Units Sold This Month - Fixed to count from totalQuantity field
    const unitsThisMonthData = await Order.aggregate([
      { 
        $match: { 
          status: { $in: ['Completed', 'Awaiting Payment'] },
          createdAt: { $gte: startOfMonth }
        } 
      },
      { $group: { _id: null, totalUnits: { $sum: '$totalQuantity' } } }
    ]);
    const unitsSoldThisMonth = unitsThisMonthData.length > 0 ? unitsThisMonthData[0].totalUnits : 0;

    // Top 5 Viewed Brands This Month - Real data
    const topViewedBrandsData = await ViewTracking.aggregate([
      { $match: { month: currentMonth } },
      { $group: { _id: '$brandId', views: { $sum: 1 } } },
      { $sort: { views: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'brands',
          localField: '_id',
          foreignField: '_id',
          as: 'brand'
        }
      },
      { $unwind: '$brand' },
      { $project: { name: '$brand.name', views: 1 } }
    ]);

    const topViewedBrands = topViewedBrandsData.map(item => ({
      name: item.name,
      views: item.views
    }));

    // Top 5 Downloaded Stock Files This Month - Real data
    const topDownloadedStockFilesData = await DownloadTracking.aggregate([
      { $match: { month: currentMonth } },
      { $group: { _id: '$stockFileId', downloads: { $sum: 1 } } },
      { $sort: { downloads: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'stockfiles',
          localField: '_id',
          foreignField: '_id',
          as: 'stockfile'
        }
      },
      { $unwind: '$stockfile' },
      { $project: { name: '$stockfile.originalName', downloads: 1 } }
    ]);

    const topDownloadedStockFiles = topDownloadedStockFilesData.map(item => ({
      name: item.name,
      downloads: item.downloads
    }));

    // Get recent orders for compatibility
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('buyerId', 'companyName email');

    // Get recent catalogues for compatibility
    const recentCatalogues = await Catalogue.find()
      .sort({ createdAt: -1 })
      .limit(3);

    console.log('Returning admin dashboard data:', JSON.stringify({
      totalStockFiles,
      newStockFilesThisMonth,
      catalogue: {
        totalBrands: totalBrands,
        totalStockFiles: typeof totalStockFiles === 'number' ? totalStockFiles : 0,
        newStockFilesThisMonth: typeof newStockFilesThisMonth === 'number' ? newStockFilesThisMonth : 0
      }
    }));
    return {
      // Section 1: Buyers
      buyers: {
        totalRegisteredBuyers: totalBuyers,
        activeBuyers: activeBuyers,
        pendingBuyerApprovals: pendingBuyerApprovals
      },
      // Section 2: Orders
      orders: {
        totalOrders: totalOrders,
        ordersThisMonth: ordersThisMonth,
        pendingOrders: pendingOrders
      },
      // Section 3: Catalogue
      catalogue: {
        totalBrands: totalBrands,
        totalStockFiles: typeof totalStockFiles === 'number' ? totalStockFiles : 0,
        newStockFilesThisMonth: typeof newStockFilesThisMonth === 'number' ? newStockFilesThisMonth : 0
      },
      // Section 4: KPIs
      kpis: {
        totalRevenue: totalRevenue,
        revenueThisMonth: revenueThisMonth,
        totalUnitsSold: totalUnitsSold,
        unitsSoldThisMonth: unitsSoldThisMonth,
        topViewedBrands: topViewedBrands,
        topDownloadedStockFiles: topDownloadedStockFiles
      },
      // Remove legacy data for compatibility
      // summary: {
      //   totalBuyers,
      //   totalOrders,
      //   totalStockFiles: totalBrands + totalStockFiles,
      //   pendingOrders,
      //   totalRevenue,
      //   activeUsers: totalBuyers
      // },
      recentOrders: recentOrders.map(order => ({
        id: order._id,
        orderNumber: order.orderNumber,
        date: order.createdAt,
        status: order.status,
        total: order.totalAmount,
        buyer: order.buyerId?.companyName || order.companyName || 'Unknown'
      })),
      recentCatalogues: recentCatalogues.map(cat => ({
        id: cat._id,
        name: cat.name,
        description: cat.description,
        lastUpdated: cat.updatedAt,
        items: cat.items?.length || 0
      })),
      systemAlerts: [
        {
          id: 1,
          type: 'orders',
          title: 'New Orders',
          description: `${pendingOrders} orders pending processing`,
          priority: pendingOrders > 10 ? 'high' : 'medium'
        },
        {
          id: 2,
          type: 'users',
          title: 'User Activity',
          description: `${totalBuyers} active buyers in system`,
          priority: 'low'
        }
      ],
      role: 'admin'
    };
  } catch (error) {
    console.error('Error getting admin dashboard data:', error);
    throw error;
  }
}

// Get buyer dashboard data
async function getBuyerDashboardData(userId) {
  try {
    console.log('Getting buyer dashboard data for user ID:', userId);
    
    // Get user's orders
    const userOrders = await Order.find({ buyerId: userId });
    console.log('User orders found:', userOrders.length);
    console.log('User orders:', JSON.stringify(userOrders, null, 2));
    
    // Calculate current date and month boundaries
    const now = new Date();
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfCurrentMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    
    // Define approved order statuses
    const approvedStatuses = ['Awaiting Payment', 'Completed'];
    
    // Calculate approved orders (only completed orders, excluding rejected/cancelled/pending)
    const approvedOrders = userOrders.filter(order => 
      approvedStatuses.includes(order.status)
    );
    const totalApprovedOrders = approvedOrders.length;
    console.log('Total approved orders:', totalApprovedOrders);
    
    // Calculate approved orders this month (strictly current calendar month)
    const approvedOrdersThisMonth = approvedOrders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= startOfCurrentMonth && orderDate <= endOfCurrentMonth;
    }).length;
    console.log('Approved orders this month:', approvedOrdersThisMonth);
    
    // Calculate pending orders (orders awaiting approval or payment)
    const pendingOrders = userOrders.filter(order => 
      ['Pending Review', 'Awaiting Payment'].includes(order.status)
    ).length;
    console.log('Pending orders:', pendingOrders);
    
    // Calculate total amount bought (from approved orders only)
    const totalAmountBought = approvedOrders
      .reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    console.log('Total amount bought:', totalAmountBought);
    
    // Calculate amount bought this month (strictly current calendar month, approved orders only)
    const amountBoughtThisMonth = approvedOrders
      .filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= startOfCurrentMonth && orderDate <= endOfCurrentMonth;
      })
      .reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    console.log('Amount bought this month:', amountBoughtThisMonth);
    
    // Calculate quantity bought (from approved orders only) - use totalQuantity field
    const quantityBought = approvedOrders
      .reduce((sum, order) => sum + (order.totalQuantity || 0), 0);
    console.log('Quantity bought:', quantityBought);
    
    // Calculate quantity bought this month (strictly current calendar month, approved orders only)
    const quantityBoughtThisMonth = approvedOrders
      .filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= startOfCurrentMonth && orderDate <= endOfCurrentMonth;
      })
      .reduce((sum, order) => sum + (order.totalQuantity || 0), 0);
    console.log('Quantity bought this month:', quantityBoughtThisMonth);

    // Get user info
    const user = await User.findById(userId);
    console.log('User found:', user ? 'Yes' : 'No');
    
    // Get available catalogues for the user's brands
    let availableCatalogues = [];
    let totalStockFiles = 0;
    let brandsAvailable = 0;
    
    try {
      // Get brands based on visibility settings (not user's brandAccess array)
      let accessibleBrands;
      if (user.role === 'admin') {
        // Admins see all brands
        accessibleBrands = await Brand.find();
      } else {
        // Buyers see brands based on visibility settings
        accessibleBrands = await Brand.find({
          $or: [
            { visibility: 'all_approved' },
            { 
              visibility: 'specific_buyers',
              visibleToBuyers: user._id
            }
          ]
        });
      }
      
      console.log('All brands in database:', accessibleBrands.map(b => ({ name: b.name, id: b._id, visibility: b.visibility })));
      brandsAvailable = accessibleBrands.length;
      
      if (accessibleBrands.length > 0) {
        // Get brand IDs that user has access to
        const accessibleBrandIds = accessibleBrands.map(brand => brand._id);
        
        // Get collections for accessible brands (not catalogues)
        const collections = await Catalogue.find({ brandId: { $in: accessibleBrandIds } })
          .sort({ updatedAt: -1 })
          .exec();
        
        // Also get catalogues for backward compatibility
        const catalogues = await Catalogue.find({ brandId: { $in: accessibleBrandIds } })
          .sort({ updatedAt: -1 })
          .exec();
        
        availableCatalogues = catalogues.map(cat => ({
          id: cat._id,
          name: cat.name || 'Unnamed Catalogue',
          description: cat.description || 'No description available',
          lastUpdated: cat.updatedAt || cat.createdAt,
          items: cat.items?.length || 0
        }));
        
        // Use collections count for the dashboard
        totalStockFiles = collections.length;
      } else {
        // If no accessible brands, show empty state
        availableCatalogues = [];
        totalStockFiles = 0;
        brandsAvailable = 0;
      }
      
      console.log('Total collections found:', totalStockFiles);
      console.log('Brands available:', brandsAvailable);
      console.log('Available catalogues:', availableCatalogues.length);
    } catch (catalogueError) {
      console.error('Error fetching catalogues:', catalogueError);
      availableCatalogues = [];
      totalStockFiles = 0;
      brandsAvailable = 0;
    }

    // Get recent orders
    const recentOrders = userOrders
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map(order => ({
        id: order._id,
        orderNumber: order.orderNumber,
        date: order.createdAt,
        status: order.status,
        total: order.totalAmount,
        items: order.items?.length || 0
      }));

    // In getBuyerDashboardData, replace all 'collection' terminology for returned fields and variables
    let availableStockFiles = [];
    let totalStockFilesAvailable = 0;
    
    try {
      // Get brands based on visibility settings (not user's brandAccess array)
      let accessibleBrands;
      if (user.role === 'admin') {
        // Admins see all brands
        accessibleBrands = await Brand.find();
      } else {
        // Buyers see brands based on visibility settings
        accessibleBrands = await Brand.find({
          $or: [
            { visibility: 'all_approved' },
            { 
              visibility: 'specific_buyers',
              visibleToBuyers: user._id
            }
          ]
        });
      }
      brandsAvailable = accessibleBrands.length;
      if (accessibleBrands.length > 0) {
        const accessibleBrandIds = accessibleBrands.map(brand => brand._id);
        // Fetch StockFile documents for these brands
        const stockFiles = await StockFile.find({ brandId: { $in: accessibleBrandIds } });
        availableStockFiles = stockFiles.map(file => ({
          id: file._id,
          name: file.originalName || file.fileName || 'Unnamed Stock File',
          description: file.description || '',
          lastUpdated: file.updatedAt || file.uploadedAt || file.createdAt,
          items: file.items?.length || 0
        }));
        totalStockFilesAvailable = stockFiles.length;
      } else {
        availableStockFiles = [];
        totalStockFilesAvailable = 0;
        brandsAvailable = 0;
      }
    } catch (stockFileError) {
      console.error('Error fetching stock files:', stockFileError);
      availableStockFiles = [];
      totalStockFilesAvailable = 0;
      brandsAvailable = 0;
    }

    const result = {
      summary: {
        totalApprovedOrders,
        approvedOrdersThisMonth,
        pendingOrders,
        totalAmountBought,
        amountBoughtThisMonth,
        quantityBought,
        quantityBoughtThisMonth
      },
      recentOrders,
      availableStockFiles,
      brandsAvailable: brandsAvailable,
      stockFilesAvailable: totalStockFilesAvailable,
      role: 'buyer'
    };
    
    console.log('Returning buyer dashboard data:', JSON.stringify(result, null, 2));
    return result;
  } catch (error) {
    console.error('Error getting buyer dashboard data:', error);
    throw error;
  }
}

module.exports = router; 