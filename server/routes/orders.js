const express = require('express');
const router = express.Router();
const { authenticateToken: auth, requireApprovedBuyer } = require('../middleware/auth');
const Order = require('../models/Order');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const xlsx = require('xlsx');
const mongoose = require('mongoose');
const { notifyOrderStatusUpdate } = require('../utils/notificationService');
const inventoryConfig = require('../config/inventoryConfig');

// Safe model import for Brand
const Brand = mongoose.models.Brand || require('../models/Brand');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/orders';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.xlsx', '.xls', '.xlsm', '.pdf'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only Excel (.xlsx, .xls, .xlsm) and PDF files are allowed.'), false);
    }
  }
});

// Helper function to extract data from Excel file (from file path)
const extractExcelData = (filePath) => {
  try {
    console.log(`Attempting to read Excel file from: ${filePath}`);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.error(`File does not exist: ${filePath}`);
      return { totalQuantity: 0, totalAmount: 0 };
    }
    
    // Read Excel file
    const workbook = xlsx.readFile(filePath, { 
      cellFormula: true,
      cellDates: true,
      cellNF: false,
      cellStyles: false
    });
    
    console.log('Available sheets:', workbook.SheetNames);
    
    // Try to find the 'Buyer Order Form' sheet first, then fall back to first sheet
    let sheetName = workbook.SheetNames.find(name => name.trim().toLowerCase() === 'buyer order form');
    if (!sheetName) {
      // Fall back to first sheet if 'Buyer Order Form' not found
      sheetName = workbook.SheetNames[0];
      console.log(`Using first sheet: ${sheetName}`);
    } else {
      console.log(`Using 'Buyer Order Form' sheet: ${sheetName}`);
    }
    
    const worksheet = workbook.Sheets[sheetName];
    
    // Extract X1 and X2 from the selected sheet
    const totalQuantity = extractCellValue(worksheet, 'X1');
    const totalAmount = extractCellValue(worksheet, 'X2');
    
    console.log(`Extracted from '${sheetName}' sheet:`, { totalQuantity, totalAmount });
    
    return { totalQuantity, totalAmount };
  } catch (error) {
    console.error('Error extracting Excel data:', error);
    return { totalQuantity: 0, totalAmount: 0 };
  }
};

// Helper function to calculate sum of a column
const calculateColumnSum = (worksheet, columnLetter) => {
  try {
    let sum = 0;
    let row = 1;
    
    // Loop through rows until we find no more data
    while (true) {
      const cellAddress = `${columnLetter}${row}`;
      const cell = worksheet[cellAddress];
      
      if (!cell) {
        // No more data in this column
        break;
      }
      
      // Check if the cell contains a numeric value
      if (cell.t === 'n' && typeof cell.v === 'number') {
        sum += cell.v;
      }
      
      row++;
    }
    
    console.log(`Sum of column ${columnLetter}: ${sum}`);
    return sum;
  } catch (error) {
    console.error(`Error calculating sum for column ${columnLetter}:`, error);
    return 0;
  }
};

// Helper function to extract data from base64 Excel file
const extractExcelDataFromBase64 = (base64Data) => {
  try {
    // Remove data URL prefix if present
    const base64String = base64Data.startsWith('data:') 
      ? base64Data.split(',')[1] 
      : base64Data;
    
    // Convert base64 to buffer
    const buffer = Buffer.from(base64String, 'base64');
    
    // Read workbook from buffer with formula calculation enabled
    const workbook = xlsx.read(buffer, { 
      type: 'buffer',
      cellFormula: true,
      cellDates: true,
      cellNF: false,
      cellStyles: false
    });
    
    console.log('Available sheets (base64):', workbook.SheetNames);
    
    // Try to find the 'Buyer Order Form' sheet first, then fall back to first sheet
    let sheetName = workbook.SheetNames.find(name => name.trim().toLowerCase() === 'buyer order form');
    if (!sheetName) {
      // Fall back to first sheet if 'Buyer Order Form' not found
      sheetName = workbook.SheetNames[0];
      console.log(`Using first sheet (base64): ${sheetName}`);
    } else {
      console.log(`Using 'Buyer Order Form' sheet (base64): ${sheetName}`);
    }
    
    const worksheet = workbook.Sheets[sheetName];
    
    // Extract data from specific cells: X1 for Total Quantity, X2 for Total Amount
    const totalQuantity = extractCellValue(worksheet, 'X1');
    const totalAmount = extractCellValue(worksheet, 'X2');
    
    console.log(`Extracted from '${sheetName}' sheet (base64):`, { totalQuantity, totalAmount });
    
    return { totalQuantity, totalAmount };
  } catch (error) {
    console.error('Error extracting Excel data from base64:', error);
    return { totalQuantity: 0, totalAmount: 0 };
  }
};

// Helper function to extract cell value from worksheet
const extractCellValue = (worksheet, cellAddress) => {
  try {
    const cell = worksheet[cellAddress];
    if (!cell) {
      console.log(`Cell ${cellAddress} not found in worksheet`);
      return 0;
    }
    
    // Check if cell has a formula
    if (cell.f) {
      console.log(`Cell ${cellAddress} contains formula: ${cell.f}`);
      // Try to get the calculated value
      if (cell.v !== undefined) {
        const numericValue = parseFloat(cell.v);
        if (!isNaN(numericValue)) {
          console.log(`Formula result for ${cellAddress}: ${numericValue}`);
          return numericValue;
        }
      }
      console.log(`Could not extract numeric value from formula in ${cellAddress}`);
      return 0;
    }
    
    // Extract the value from the cell
    const value = cell.v;
    
    // Convert to number if possible
    const numericValue = parseFloat(value);
    if (!isNaN(numericValue)) {
      return numericValue;
    }
    
    console.log(`Cell ${cellAddress} contains non-numeric value: ${value}`);
    return 0;
  } catch (error) {
    console.error(`Error extracting value from cell ${cellAddress}:`, error);
    return 0;
  }
};

// Get all orders
router.get('/', auth, (req, res, next) => {
  if (req.user.role === 'buyer') {
    return requireApprovedBuyer(req, res, next);
  }
  next();
}, async (req, res) => {
  try {
    let query = {};
    
    if (req.user.role === 'buyer') {
      query.buyerId = req.user._id;
    }
    
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .populate('buyerId', 'name email companyName');

    // Debug: Log the type and value of order.buyerId for the first order
    if (orders.length > 0) {
      const firstOrder = orders[0];
      console.log('Raw order.buyerId type:', typeof firstOrder.buyerId, 'value:', firstOrder.buyerId);
    }
    const transformedOrders = orders.map(order => {
      // Ensure buyerId is a plain value
      let buyerIdValue = order.buyerId;
      if (buyerIdValue && typeof buyerIdValue === 'object' && buyerIdValue._id) {
        buyerIdValue = {
          _id: buyerIdValue._id,
          name: buyerIdValue.name,
          email: buyerIdValue.email,
          companyName: buyerIdValue.companyName
        };
      }
      return {
        _id: order._id,
        orderNumber: order.orderNumber,
        buyerId: buyerIdValue,
        buyerName: order.buyerId?.name || order.buyerName,
        companyName: order.buyerId?.companyName || order.companyName,
        brand: order.brand,
        stockFile: order.stockFile,
        status: order.status,
        totalAmount: order.totalAmount,
        totalQuantity: order.totalQuantity,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        excelFile: order.excelFile,
        invoiceFile: order.invoiceFile,
        notes: order.notes,
        rejectionReason: order.rejectionReason,
        cancellationReason: order.cancellationReason,
        paymentNote: order.paymentNote,
        inventoryDeducted: order.inventoryDeducted,
        inventoryDeductionDate: order.inventoryDeductionDate,
        inventoryRestored: order.inventoryRestored,
        inventoryRestorationDate: order.inventoryRestorationDate,
        inventoryStatus: order.inventoryStatus,
        inventoryError: order.inventoryError,
        inventoryErrorDetails: order.inventoryErrorDetails
      };
    });
    // Debug: Log the first transformed order to check for circular references
    if (transformedOrders.length > 0) {
      try {
        console.log('First transformed order:', JSON.stringify(transformedOrders[0], null, 2));
      } catch (err) {
        console.error('Error stringifying first transformed order:', err);
      }
    }
    res.json(transformedOrders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Create new order
router.post('/', auth, upload.single('excelFile'), async (req, res) => {
  try {
    const { brand, file, buyerId } = req.body;

    if (!brand || !file || !req.file) {
      return res.status(400).json({ error: 'Brand, file template, and uploaded Excel file are required' });
    }

    // For admin order creation, validate buyerId
    if (req.user.role === 'admin' && !buyerId) {
      return res.status(400).json({ error: 'Buyer ID is required for admin order creation' });
    }

    // Find the stock file by ID (use StockFile, not Catalogue)
    const StockFile = mongoose.models.StockFile || require('../models/StockFile');
    const stockFile = await StockFile.findById(file);
    if (!stockFile) {
      return res.status(404).json({ error: 'Stock file not found' });
    }

    // Verify the brand matches
    if (stockFile.brandId.toString() !== brand) {
      return res.status(400).json({ error: 'Stock file does not belong to the selected brand' });
    }

    // Check if buyer has access to this brand
    const brandDoc = await Brand.findById(brand);
    if (!brandDoc) {
      return res.status(404).json({ error: 'Brand not found' });
    }

    // Determine the buyer for this order
    let orderBuyer;
    if (req.user.role === 'admin') {
      // For admin order creation, get the buyer details
      orderBuyer = await require('../models/User').findById(buyerId);
      if (!orderBuyer || orderBuyer.role !== 'buyer') {
        return res.status(400).json({ error: 'Invalid buyer ID provided' });
      }
      if (orderBuyer.status !== 'approved') {
        return res.status(400).json({ error: 'Can only create orders for approved buyers' });
      }
      console.log('Admin creating order for buyer:', {
        buyerId: orderBuyer._id,
        buyerName: orderBuyer.name,
        companyName: orderBuyer.companyName,
        status: orderBuyer.status
      });
    } else {
      // For buyer order creation, use the current user
      orderBuyer = req.user;
      console.log('Buyer creating order:', {
        buyerId: orderBuyer._id,
        buyerName: orderBuyer.name,
        companyName: orderBuyer.companyName
      });
      // Check if buyer has access to this brand
      const hasAccess = brandDoc.visibility === 'all_approved' || 
                       (brandDoc.visibility === 'specific_buyers' && 
                        brandDoc.visibleToBuyers.includes(req.user._id));
      if (!hasAccess) {
        return res.status(403).json({ error: 'Access denied to this brand' });
      }
      // Check for existing pending order with same brand + stock file
      const existingPendingOrder = await Order.findOne({
        buyerId: req.user._id,
        brand: brandDoc.name,
        stockFile: stockFile.originalName || stockFile.fileName,
        status: 'Pending Review'
      });
      if (existingPendingOrder) {
        return res.status(400).json({ 
          error: 'You already have a pending order under this brand and stock file. Please update your existing order by replacing the attachment instead of creating a new one.',
          existingOrderId: existingPendingOrder._id,
          existingOrderNumber: existingPendingOrder.orderNumber
        });
      }
    }

    // Generate unique order number
    const orderNumber = 'ORD-' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '-' + 
                       String(Math.floor(Math.random() * 1000)).padStart(3, '0');

    // Extract data from the uploaded Excel file
    const { totalQuantity, totalAmount } = extractExcelData(req.file.path);

    // Convert file to base64
    const fileBuffer = fs.readFileSync(req.file.path);
    const base64File = fileBuffer.toString('base64');

    // Debug: Log the orderBuyer object before creating order data
    console.log('Final orderBuyer object:', {
      _id: orderBuyer._id,
      name: orderBuyer.name,
      companyName: orderBuyer.companyName,
      role: orderBuyer.role,
      status: orderBuyer.status
    });

    const orderData = {
      orderNumber,
      buyerId: orderBuyer._id,
      buyerName: orderBuyer.name,
      companyName: orderBuyer.companyName || 'N/A', // Fallback for missing company name
      brand: brandDoc.name,
      stockFile: stockFile.originalName || stockFile.fileName,
      status: 'Pending Review',
      totalQuantity,
      totalAmount,
      excelFile: req.file.filename,
      excelFileOriginalName: req.file.originalname,
      excelFileBase64: base64File,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Debug: Log the orderData object
    console.log('Order data being created:', {
      orderNumber,
      buyerId: orderData.buyerId,
      buyerName: orderData.buyerName,
      companyName: orderData.companyName,
      brand: orderData.brand,
      stockFile: orderData.stockFile
    });

    const order = new Order(orderData);
    await order.save();

    // Send notification to admins about new order
    // Create in-app notification for admins about new order
    const { notifyAdmins } = require('../utils/notificationService');
    await notifyAdmins(
      'new_order_submission',
      'New Order Submitted',
      `New order ${order.orderNumber} submitted by ${orderBuyer.name} (${orderBuyer.companyName})`,
      { order, buyer: orderBuyer }
    );

    res.status(201).json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Update existing order (replace attachment)
router.put('/:id/update', auth, upload.single('excelFile'), async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    if (req.user.role === 'buyer' && order.buyerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }
    if (order.status !== 'Pending Review') {
      return res.status(400).json({ error: 'Order can only be updated when status is "Pending Review"' });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'Excel file is required' });
    }
    // Extract data from the uploaded Excel file
    const { totalQuantity, totalAmount } = extractExcelData(req.file.path);
    // Convert file to base64
    const fileBuffer = fs.readFileSync(req.file.path);
    const base64File = fileBuffer.toString('base64');
    // Remove old file if it exists
    if (order.excelFile) {
      const oldFilePath = path.join(__dirname, '..', '..', 'uploads', 'orders', order.excelFile);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    }
    // Update order with new file and data
    order.excelFile = req.file.filename;
    order.excelFileOriginalName = req.file.originalname;
    order.excelFileBase64 = base64File;
    order.totalQuantity = totalQuantity;
    order.totalAmount = totalAmount;
    order.updatedAt = new Date();
    await order.save();
    res.json(order);
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ error: 'Failed to update order' });
  }
});

// Approve order
router.put('/:id/approve', auth, upload.single('invoiceFile'), async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.status !== 'Pending Review') {
      return res.status(400).json({ error: 'Order cannot be approved in current status' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Invoice file is required for approval' });
    }

    // === INVENTORY DEDUCTION USING GOOGLE SHEETS ===
    const googleSheetsService = require('../utils/googleSheetsService');
    let inventoryResult = { success: false, message: 'No inventory processing attempted' };
    
    try {
      console.log(`Processing inventory deduction for order ${order.orderNumber}`);
      console.log(`Brand: ${order.brand}, Collection: ${order.stockFile}`);
      console.log(`Google Sheets service status - Auth: ${!!googleSheetsService.auth}, Drive: ${!!googleSheetsService.drive}`);
      
      // Set inventory status to pending
      order.inventoryStatus = 'pending';
      order.inventoryError = null;
      order.inventoryErrorDetails = null;
      await order.save();
      
      // Check if Google Sheets service is available
      if (!googleSheetsService.drive) {
        console.warn('Google Sheets service not initialized - skipping inventory deduction');
        console.warn('Service account file path check needed');
        inventoryResult = { 
          success: false, 
          message: 'Google Sheets service not available - inventory deduction skipped',
          skipped: true
        };
        order.inventoryStatus = 'not_applicable';
        order.inventoryError = 'Google Sheets service not configured';
        await order.save();
      } else {
        console.log('Google Sheets service is available, proceeding with inventory deduction');
        // Process inventory deduction using Google Sheets (searches for file by collection name)
        inventoryResult = await googleSheetsService.processInventoryDeduction(order, { name: order.stockFile });
        
        if (inventoryResult.success) {
          // Update order with inventory deduction details
          order.inventoryDeducted = true;
          order.inventoryFileId = inventoryResult.googleSheetFile.id; // Store the found Google Sheet ID
          order.inventoryDeductionDate = new Date();
          order.inventoryStatus = 'success';
          order.inventoryError = null;
          order.inventoryErrorDetails = null;
          console.log('Inventory deduction successful');
        } else {
          console.warn('Inventory deduction failed:', inventoryResult.message);
          
          // Update order with error details
          order.inventoryStatus = 'error';
          order.inventoryError = inventoryResult.message;
          order.inventoryErrorDetails = {
            insufficientItems: inventoryResult.insufficientItems || [],
            timestamp: new Date()
          };
          await order.save();
          
          // If inventory deduction fails, return error to prevent order approval
          return res.status(400).json({ 
            error: 'Order cannot be approved due to inventory issues',
            inventoryError: inventoryResult.message,
            insufficientItems: inventoryResult.insufficientItems || []
          });
        }
      }
    } catch (error) {
      console.error('Error during inventory deduction:', error);
      
      // Update order with error details
      order.inventoryStatus = 'error';
      order.inventoryError = error.message;
      order.inventoryErrorDetails = {
        error: error.message,
        timestamp: new Date()
      };
      await order.save();
      
      // Don't fail the order approval if Google Sheets is not available
      if (error.message.includes('Google Drive service not initialized')) {
        console.warn('Google Sheets service not available - proceeding with order approval without inventory deduction');
        inventoryResult = { 
          success: false, 
          message: 'Google Sheets service not available - inventory deduction skipped',
          skipped: true
        };
        order.inventoryStatus = 'not_applicable';
        order.inventoryError = 'Google Sheets service not configured';
        await order.save();
      } else {
        return res.status(500).json({ 
          error: 'Failed to process inventory deduction',
          inventoryError: error.message
        });
      }
    }
    // === END INVENTORY DEDUCTION ===

    // Convert invoice file to base64 for backup
    const invoiceFileBuffer = fs.readFileSync(req.file.path);
    const invoiceBase64 = invoiceFileBuffer.toString('base64');

    // Update order status and save invoice
    order.status = 'Awaiting Payment';
    order.invoiceFile = req.file.filename;
    order.invoiceFileOriginalName = req.file.originalname;
    order.invoiceFileBase64 = invoiceBase64; // Save invoice as base64 for backup
    order.updatedAt = new Date();
    await order.save();

    // Notify buyer about order approval
    const buyer = await require('../models/User').findById(order.buyerId);
    await notifyOrderStatusUpdate(buyer, order);

    res.json({
      ...order.toObject(),
      inventoryDeduction: inventoryResult
    });
  } catch (error) {
    console.error('Error approving order:', error);
    res.status(500).json({ error: 'Failed to approve order' });
  }
});

// Reject order
router.put('/:id/reject', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.status !== 'Pending Review') {
      return res.status(400).json({ error: 'Order cannot be rejected in current status' });
    }

    // === INVENTORY RESTORATION (if inventory was previously deducted) ===
    let inventoryRestorationResult = null;
    if (order.inventoryDeducted && !order.inventoryRestored) {
      const googleSheetsService = require('../utils/googleSheetsService');
      
      try {
        console.log(`Processing inventory restoration for rejected order ${order.orderNumber}`);
        
        // Check if Google Sheets service is available
        if (!googleSheetsService.drive) {
          console.warn('Google Sheets service not initialized - skipping inventory restoration');
          inventoryRestorationResult = { 
            success: false, 
            message: 'Google Sheets service not available - inventory restoration skipped',
            skipped: true
          };
        } else {
          inventoryRestorationResult = await googleSheetsService.processInventoryRestoration(order, { name: order.stockFile });
          
          if (inventoryRestorationResult.success) {
            order.inventoryRestored = true;
            order.inventoryRestorationDate = new Date();
            console.log('Inventory restoration successful for rejected order');
          } else {
            console.warn('Inventory restoration failed for rejected order:', inventoryRestorationResult.message);
          }
        }
      } catch (error) {
        console.error('Error during inventory restoration for rejected order:', error);
        if (error.message.includes('Google Drive service not initialized')) {
          console.warn('Google Sheets service not available - skipping inventory restoration');
          inventoryRestorationResult = { 
            success: false, 
            message: 'Google Sheets service not available - inventory restoration skipped',
            skipped: true
          };
        }
      }
    }
    // === END INVENTORY RESTORATION ===

    // Update order status
    order.status = 'Rejected';
    order.rejectionReason = req.body.reason || '';
    order.updatedAt = new Date();
    await order.save();

    // Notify buyer about order rejection
    const buyer = await require('../models/User').findById(order.buyerId);
    await notifyOrderStatusUpdate(buyer, order);

    res.json({
      ...order.toObject(),
      inventoryRestoration: inventoryRestorationResult
    });
  } catch (error) {
    console.error('Error rejecting order:', error);
    res.status(500).json({ error: 'Failed to reject order' });
  }
});

// Confirm payment
router.put('/:id/payment', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.status !== 'Awaiting Payment') {
      return res.status(400).json({ error: 'Payment can only be confirmed for orders awaiting payment' });
    }

    order.status = 'Completed';
    order.paymentNote = req.body.note || '';
    order.updatedAt = new Date();
    await order.save();

    // Notify buyer about payment completion
    const buyer = await require('../models/User').findById(order.buyerId);
    await notifyOrderStatusUpdate(buyer, order);

    res.json(order);
  } catch (error) {
    console.error('Error confirming payment:', error);
    res.status(500).json({ error: 'Failed to confirm payment' });
  }
});

// Admin cancel order (can cancel regardless of status)
router.put('/:id/admin-cancel', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // === INVENTORY RESTORATION (if inventory was previously deducted) ===
    let inventoryRestorationResult = null;
    if (order.inventoryDeducted && !order.inventoryRestored) {
      const googleSheetsService = require('../utils/googleSheetsService');
      
      try {
        console.log(`Processing inventory restoration for cancelled order ${order.orderNumber}`);
        
        // Check if Google Sheets service is available
        if (!googleSheetsService.drive) {
          console.warn('Google Sheets service not initialized - skipping inventory restoration');
          inventoryRestorationResult = { 
            success: false, 
            message: 'Google Sheets service not available - inventory restoration skipped',
            skipped: true
          };
        } else {
          inventoryRestorationResult = await googleSheetsService.processInventoryRestoration(order, { name: order.stockFile });
          
          if (inventoryRestorationResult.success) {
            order.inventoryRestored = true;
            order.inventoryRestorationDate = new Date();
            console.log('Inventory restoration successful for cancelled order');
          } else {
            console.warn('Inventory restoration failed for cancelled order:', inventoryRestorationResult.message);
          }
        }
      } catch (error) {
        console.error('Error during inventory restoration for cancelled order:', error);
        if (error.message.includes('Google Drive service not initialized')) {
          console.warn('Google Sheets service not available - skipping inventory restoration');
          inventoryRestorationResult = { 
            success: false, 
            message: 'Google Sheets service not available - inventory restoration skipped',
            skipped: true
          };
        }
      }
    }
    // === END INVENTORY RESTORATION ===

    order.status = 'Cancelled';
    order.cancellationReason = req.body.reason || 'Cancelled by admin';
    order.updatedAt = new Date();
    await order.save();

    // Notify buyer about order cancellation
    const buyer = await require('../models/User').findById(order.buyerId);
    await notifyOrderStatusUpdate(buyer, order);

    res.json({
      ...order.toObject(),
      inventoryRestoration: inventoryRestorationResult
    });
  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({ error: 'Failed to cancel order' });
  }
});

// Cancel order (buyer only - pending orders only)
router.put('/:id/cancel', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (req.user.role === 'buyer' && order.buyerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (order.status !== 'Pending Review') {
      return res.status(400).json({ error: 'Order cannot be cancelled in current status' });
    }

    order.status = 'Cancelled';
    order.updatedAt = new Date();
    await order.save();

    // Notify admins about order cancellation by buyer
    const buyer = await require('../models/User').findById(order.buyerId);
    // Create in-app notification for admins about order cancellation
    const { notifyAdmins } = require('../utils/notificationService');
    await notifyAdmins(
      'order_cancellation',
      'Order Cancelled by Buyer',
      `Order ${order.orderNumber} was cancelled by ${buyer.name} (${buyer.companyName})`,
      { order, buyer }
    );

    res.json(order);
  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({ error: 'Failed to cancel order' });
  }
});

// Get file metadata (filename info)
router.get('/:id/file-info/:fileType', auth, async (req, res) => {
  try {
    const { id, fileType } = req.params;
    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (req.user.role === 'buyer' && order.buyerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    let originalName;
    let fileExtension;

    if (fileType === 'order' && order.excelFile) {
      originalName = order.excelFileOriginalName || order.excelFile;
      fileExtension = require('path').extname(originalName).toLowerCase();
    } else if (fileType === 'invoice' && order.invoiceFile) {
      originalName = order.invoiceFileOriginalName || order.invoiceFile;
      fileExtension = require('path').extname(originalName).toLowerCase();
    } else {
      return res.status(404).json({ error: 'File not found' });
    }

    res.json({
      originalName,
      fileExtension,
      fileType
    });
  } catch (error) {
    console.error('Error getting file info:', error);
    res.status(500).json({ error: 'Failed to get file info' });
  }
});

// Download file
router.get('/:id/download/:fileType', auth, async (req, res) => {
  try {
    const { id, fileType } = req.params;
    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (req.user.role === 'buyer' && order.buyerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    let filename;
    let originalName;
    let base64Data;
    let fileExtension;
    let contentType;

    if (fileType === 'order' && order.excelFile) {
      filename = order.excelFile;
      originalName = order.excelFileOriginalName || filename;
      base64Data = order.excelFileBase64;
      fileExtension = require('path').extname(originalName).toLowerCase();
    } else if (fileType === 'invoice' && order.invoiceFile) {
      filename = order.invoiceFile;
      originalName = order.invoiceFileOriginalName || order.invoiceFile;
      base64Data = order.invoiceFileBase64;
      fileExtension = require('path').extname(originalName).toLowerCase();
    } else {
      return res.status(404).json({ error: 'File not found' });
    }

    // Determine correct MIME type
    contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'; // default for .xlsx
    if (fileExtension === '.xlsm') {
      contentType = 'application/vnd.ms-excel.sheet.macroEnabled.12';
    } else if (fileExtension === '.xls') {
      contentType = 'application/vnd.ms-excel';
    } else if (fileExtension === '.pdf') {
      contentType = 'application/pdf';
    }

    const filePath = require('path').join(__dirname, '..', '..', 'uploads', 'orders', filename);
    const fs = require('fs');

    // Debug logging
    console.log(`[DOWNLOAD] Order: ${order.orderNumber}, fileType: ${fileType}, filename: ${filename}, originalName: ${originalName}`);
    if (base64Data) {
      console.log(`[DOWNLOAD] Serving from base64 for order ${order.orderNumber}`);
      const buffer = Buffer.from(base64Data, 'base64');
      const contentDisposition = `attachment; filename="${originalName}"; filename*=UTF-8''${encodeURIComponent(originalName)}`;
      console.log(`[DOWNLOAD] Setting Content-Disposition: ${contentDisposition}`);
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', contentDisposition);
      res.setHeader('Content-Length', buffer.length);
      // Also set a custom header as fallback in case Content-Disposition is stripped
      res.setHeader('X-Original-Filename', originalName);
      // Add filename to response body as metadata
      res.setHeader('X-File-Metadata', JSON.stringify({ originalName, fileType }));
      console.log(`[DOWNLOAD] Headers set, sending buffer of size: ${buffer.length}`);
      return res.end(buffer);
    } else if (fs.existsSync(filePath)) {
      console.log(`[DOWNLOAD] Serving from disk for order ${order.orderNumber}`);
      const contentDisposition = `attachment; filename="${originalName}"; filename*=UTF-8''${encodeURIComponent(originalName)}`;
      console.log(`[DOWNLOAD] Setting Content-Disposition: ${contentDisposition}`);
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', contentDisposition);
      res.setHeader('Content-Length', fs.statSync(filePath).size);
      // Also set a custom header as fallback in case Content-Disposition is stripped
      res.setHeader('X-Original-Filename', originalName);
      // Add filename to response body as metadata
      res.setHeader('X-File-Metadata', JSON.stringify({ originalName, fileType }));
      console.log(`[DOWNLOAD] Headers set, streaming file from disk`);
      const fileStream = fs.createReadStream(filePath);
      return fileStream.pipe(res);
    } else {
      console.log(`[DOWNLOAD] File not found for order ${order.orderNumber}`);
      return res.status(404).json({ error: 'File not found on server or in database. Please contact support.' });
    }
  } catch (error) {
    console.error('Error downloading file:', error);
    res.status(500).json({ error: 'Failed to download file' });
  }
});

// Delete order (admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can delete orders' });
    }

    const orderId = req.params.id;
    
    // Find the order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Delete any uploaded files if they exist
    if (order.excelFile) {
      try {
        const filePath = path.join(__dirname, '..', '..', 'uploads', 'orders', order.excelFile);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log(`Deleted order file: ${order.excelFile}`);
        }
      } catch (fileError) {
        console.error('Error deleting order file:', fileError);
        // Continue with deletion even if file deletion fails
      }
    }

    // Delete invoice file if it exists
    if (order.invoiceFile) {
      try {
        const invoicePath = path.join(__dirname, '..', '..', 'uploads', 'orders', order.invoiceFile);
        if (fs.existsSync(invoicePath)) {
          fs.unlinkSync(invoicePath);
          console.log(`Deleted invoice file: ${order.invoiceFile}`);
        }
      } catch (fileError) {
        console.error('Error deleting invoice file:', fileError);
        // Continue with deletion even if file deletion fails
      }
    }

    // Delete the order from database
    await Order.findByIdAndDelete(orderId);

    console.log(`Order ${orderId} deleted successfully`);
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ error: 'Failed to delete order' });
  }
});

// Reverse inventory deduction (admin only)
router.put('/:id/reverse-inventory', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (!order.inventoryDeducted) {
      return res.status(400).json({ error: 'No inventory was deducted for this order' });
    }

    if (order.inventoryRestored) {
      return res.status(400).json({ error: 'Inventory has already been restored for this order' });
    }

    if (!order.inventoryFileId) {
      return res.status(400).json({ error: 'No inventory file ID found for this order' });
    }

    // Restore inventory
    const googleSheetsService = require('../utils/googleSheetsService');
    const spreadsheetId = inventoryConfig.getSpreadsheetId(order.brand, order.stockFile);
    
    if (!spreadsheetId) {
      return res.status(400).json({ error: 'No inventory sheet configured for this brand/collection' });
    }

    try {
      console.log(`Manually reversing inventory for order ${order.orderNumber}`);
      const inventoryRestorationResult = await googleSheetsService.processInventoryRestoration(order, { name: order.stockFile });
      
      if (inventoryRestorationResult.success) {
        order.inventoryRestored = true;
        order.inventoryRestorationDate = new Date();
        order.updatedAt = new Date();
        await order.save();
        
        console.log('Manual inventory restoration successful');
        
        res.json({
          success: true,
          message: 'Inventory restored successfully',
          order: order.toObject(),
          inventoryRestoration: inventoryRestorationResult
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to restore inventory',
          inventoryError: inventoryRestorationResult.message
        });
      }
    } catch (error) {
      console.error('Error during manual inventory restoration:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to restore inventory',
        inventoryError: error.message
      });
    }
    
  } catch (error) {
    console.error('Error reversing inventory:', error);
    res.status(500).json({ error: 'Failed to reverse inventory' });
  }
});

// Get inventory status for an order
router.get('/:id/inventory-status', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({
      orderId: order._id,
      orderNumber: order.orderNumber,
      inventoryDeducted: order.inventoryDeducted,
      inventoryDeductionDate: order.inventoryDeductionDate,
      inventoryRestored: order.inventoryRestored,
      inventoryRestorationDate: order.inventoryRestorationDate,
      inventoryFileId: order.inventoryFileId,
      canReverse: order.inventoryDeducted && !order.inventoryRestored
    });
  } catch (error) {
    console.error('Error getting inventory status:', error);
    res.status(500).json({ error: 'Failed to get inventory status' });
  }
});

// Manually reverse inventory for an order (admin only)
router.put('/:id/reverse-inventory', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (!order.inventoryDeducted) {
      return res.status(400).json({ error: 'Order has no inventory to reverse' });
    }

    if (order.inventoryRestored) {
      return res.status(400).json({ error: 'Inventory has already been restored for this order' });
    }

    // === INVENTORY RESTORATION ===
    const googleSheetsService = require('../utils/googleSheetsService');
    const spreadsheetId = inventoryConfig.getSpreadsheetId(order.brand, order.stockFile);
    
    if (!spreadsheetId) {
      return res.status(400).json({ error: 'No inventory sheet configured for this brand/collection' });
    }

    try {
      console.log(`Manually reversing inventory for order ${order.orderNumber}`);
      
      // Check if Google Sheets service is available
      if (!googleSheetsService.drive) {
        console.warn('Google Sheets service not initialized - cannot perform manual inventory restoration');
        return res.status(400).json({
          success: false,
          error: 'Google Sheets service not available',
          inventoryError: 'Google Sheets service not configured'
        });
      }
      
      const inventoryRestorationResult = await googleSheetsService.processInventoryRestoration(order, { name: order.stockFile });
      
      if (inventoryRestorationResult.success) {
        order.inventoryRestored = true;
        order.inventoryRestorationDate = new Date();
        order.updatedAt = new Date();
        await order.save();
        
        console.log('Manual inventory restoration successful');
        
        res.json({
          success: true,
          message: 'Inventory restored successfully',
          order: order.toObject(),
          inventoryRestoration: inventoryRestorationResult
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to restore inventory',
          inventoryError: inventoryRestorationResult.message
        });
      }
    } catch (error) {
      console.error('Error during manual inventory restoration:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to restore inventory',
        inventoryError: error.message
      });
    }
    // === END INVENTORY RESTORATION ===
    
  } catch (error) {
    console.error('Error reversing inventory:', error);
    if (error.message.includes('Google Drive service not initialized')) {
      res.status(400).json({
        success: false,
        error: 'Google Sheets service not available',
        inventoryError: 'Google Sheets service not configured'
      });
    } else {
      res.status(500).json({ error: 'Failed to reverse inventory' });
    }
  }
});

// Custom storage for replace-attachment to preserve original filename
const replaceAttachmentStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/orders';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Keep the original filename
    cb(null, file.originalname);
  }
});

const replaceAttachmentUpload = multer({ 
  storage: replaceAttachmentStorage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.xlsx', '.xls', '.xlsm', '.pdf'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only Excel (.xlsx, .xls, .xlsm) and PDF files are allowed.'), false);
    }
  }
});

// Replace order attachment (buyer only)
router.put('/:id/replace-attachment', auth, replaceAttachmentUpload.single('excelFile'), async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Only allow buyers to replace attachments for their own orders
    if (req.user.role !== 'buyer' || order.buyerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Only allow replacement for pending orders
    if (order.status !== 'Pending Review') {
      return res.status(400).json({ error: 'Can only replace attachments for pending orders' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Delete old file if it exists
    if (order.excelFile) {
      const oldFilePath = path.join(__dirname, '..', '..', 'uploads', 'orders', order.excelFile);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
        console.log(`Deleted old file: ${order.excelFile}`);
      }
    }

    // Extract data from new Excel file
    const newFilePath = path.resolve(req.file.path);
    console.log(`Reading file from: ${newFilePath}`);
    const excelData = extractExcelData(newFilePath);

    // Convert file to base64 and save original name
    const fileBuffer = fs.readFileSync(newFilePath);
    const base64File = fileBuffer.toString('base64');

    // Update order with new file and data
    order.excelFile = req.file.filename;
    order.excelFileOriginalName = req.file.originalname;
    order.excelFileBase64 = base64File;
    order.totalQuantity = excelData.totalQuantity;
    order.totalAmount = excelData.totalAmount;
    order.updatedAt = new Date();

    await order.save();

    console.log(`Order attachment replaced for order ${order.orderNumber}`);
    console.log(`New file: ${req.file.filename}`);
    console.log(`New totals: Quantity=${excelData.totalQuantity}, Amount=${excelData.totalAmount}`);

    res.json({
      success: true,
      message: 'Order attachment replaced successfully',
      order: order,
      newFile: req.file.filename,
      newTotals: {
        totalQuantity: excelData.totalQuantity,
        totalAmount: excelData.totalAmount
      }
    });

  } catch (error) {
    console.error('Error replacing order attachment:', error);
    res.status(500).json({ error: 'Failed to replace order attachment' });
  }
});

// Admin replace order attachment (admin only - for pending orders)
router.put('/:id/admin-replace-attachment', auth, replaceAttachmentUpload.single('excelFile'), async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied - Admin only' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Only allow replacement for pending orders
    if (order.status !== 'Pending Review') {
      return res.status(400).json({ error: 'Can only replace attachments for orders with status "Pending Review"' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Delete old file if it exists
    if (order.excelFile) {
      const oldFilePath = path.join(__dirname, '..', '..', 'uploads', 'orders', order.excelFile);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
        console.log(`Admin deleted old file: ${order.excelFile}`);
      }
    }

    // Extract data from new Excel file
    const newFilePath = path.resolve(req.file.path);
    console.log(`Reading file from: ${newFilePath}`);
    const excelData = extractExcelData(newFilePath);
    
    // Update order with new file and data
    order.excelFile = req.file.filename;
    order.excelFileOriginalName = req.file.originalname;
    order.totalQuantity = excelData.totalQuantity;
    order.totalAmount = excelData.totalAmount;
    order.updatedAt = new Date();
    
    await order.save();

    console.log(`Admin replaced order attachment for order ${order.orderNumber}`);
    console.log(`New file: ${req.file.filename}`);
    console.log(`New totals: Quantity=${excelData.totalQuantity}, Amount=${excelData.totalAmount}`);

    res.json({
      success: true,
      message: 'Order attachment replaced successfully by admin',
      order: order.toObject(),
      newFile: req.file.filename,
      newTotals: {
        totalQuantity: excelData.totalQuantity,
        totalAmount: excelData.totalAmount
      }
    });

  } catch (error) {
    console.error('Error replacing order attachment by admin:', error);
    res.status(500).json({ error: 'Failed to replace order attachment' });
  }
});

// Get available inventory mappings (admin only)
router.get('/inventory-mappings', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const mappings = inventoryConfig.getAllMappings();
    res.json(mappings);
  } catch (error) {
    console.error('Error getting inventory mappings:', error);
    res.status(500).json({ error: 'Failed to get inventory mappings' });
  }
});

module.exports = router; 