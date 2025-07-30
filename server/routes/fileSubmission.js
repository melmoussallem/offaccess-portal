const express = require('express');
const router = express.Router();
const { authenticateToken, requireAdmin, requireBuyer, requireApprovedBuyer, canAccessResource } = require('../middleware/auth');
const Order = require('../models/Order');
const User = require('../models/User');
const mongoose = require('mongoose');
const xlsx = require('xlsx');

// Helper function to extract data from base64 Excel file
const extractExcelDataFromBase64 = (base64Data) => {
  try {
    // Remove data URL prefix if present
    const base64String = base64Data.startsWith('data:') 
      ? base64Data.split(',')[1] 
      : base64Data;
    
    // Convert base64 to buffer
    const buffer = Buffer.from(base64String, 'base64');
    
    // Read workbook from buffer
    const workbook = xlsx.read(buffer, { type: 'buffer' });
    
    console.log('Available sheets (fileSubmission):', workbook.SheetNames);
    
    // Try to find the 'Buyer Order Form' sheet first, then fall back to first sheet
    let sheetName = workbook.SheetNames.find(name => name.trim().toLowerCase() === 'buyer order form');
    if (!sheetName) {
      // Fall back to first sheet if 'Buyer Order Form' not found
      sheetName = workbook.SheetNames[0];
      console.log(`Using first sheet (fileSubmission): ${sheetName}`);
    } else {
      console.log(`Using 'Buyer Order Form' sheet (fileSubmission): ${sheetName}`);
    }
    
    const worksheet = workbook.Sheets[sheetName];
    
    // Extract data from specific cells: X1 for Total Quantity, X2 for Total Amount
    const totalQuantity = extractCellValue(worksheet, 'X1');
    const totalAmount = extractCellValue(worksheet, 'X2');
    
    console.log(`Extracted from '${sheetName}' sheet (fileSubmission):`, { totalQuantity, totalAmount });
    
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

// Test endpoint to verify the route is working
router.get('/', (req, res) => {
  console.log('File submission route test endpoint hit');
  res.json({
    success: true,
    message: 'File submission route is working',
    endpoints: {
      submitExcel: 'POST /submit-excel',
      testSubmit: 'POST /test-submit',
      orders: 'GET /orders',
      orderFile: 'GET /orders/:orderId/file'
    }
  });
});

// POST /api/file-submission/submit-excel
// Endpoint to receive Excel files from VBA and create orders automatically
// TEMPORARILY DISABLED AUTH FOR TESTING - UNCOMMENT THE AUTH MIDDLEWARE BELOW WHEN READY
router.post('/submit-excel', /* auth, */ async (req, res) => {
  console.log('=== SUBMIT EXCEL ENDPOINT HIT ===');
  console.log('Request method:', req.method);
  console.log('Request URL:', req.url);
  console.log('Request headers:', req.headers);
  console.log('Request body keys:', Object.keys(req.body));
  
  try {
    const { 
      fileData, 
      fileName, 
      brandName, 
      catalogueFileId 
    } = req.body;

    console.log('Received file submission request:', {
      fileName,
      brandName,
      catalogueFileId,
      fileDataLength: fileData ? fileData.length : 0
    });

    // Validate required fields
    if (!fileData || !fileName || !brandName) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: fileData, fileName, brandName',
        received: { fileName, brandName, hasFileData: !!fileData }
      });
    }

    // Validate that fileData is base64
    if (typeof fileData !== 'string' || !fileData.startsWith('data:')) {
      return res.status(400).json({
        success: false,
        message: 'fileData must be a valid base64 string starting with "data:"',
        received: fileData ? fileData.substring(0, 50) + '...' : 'undefined'
      });
    }

    // Calculate file size from base64
    const base64Data = fileData.split(',')[1]; // Remove data URL prefix
    const fileSize = Buffer.byteLength(base64Data, 'base64');

    // For testing without auth, create a mock user ID
    const buyerId = req.user ? req.user._id : '685a03d4a64696075ffda03a'; // Use the buyer ID from your system

    // Generate a unique order number using timestamp to ensure uniqueness
    const timestamp = Date.now();
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}${mm}${dd}`;
    
    // Generate a unique order number with retry logic
    let orderNumber;
    let attempts = 0;
    const maxAttempts = 10;
    
    do {
      attempts++;
      // Use timestamp + random suffix to ensure uniqueness
      const randomSuffix = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
      orderNumber = `EXCEL-${dateStr}-${randomSuffix}`;
      
      // Check if this order number already exists
      const existingOrder = await Order.findOne({ orderNumber: orderNumber });
      if (!existingOrder) {
        break; // Found a unique order number
      }
      
      console.log(`Order number ${orderNumber} already exists, trying again... (attempt ${attempts})`);
    } while (attempts < maxAttempts);
    
    if (attempts >= maxAttempts) {
      throw new Error('Unable to generate unique order number after maximum attempts');
    }

    console.log('Generated unique order number:', orderNumber);
    console.log('Attempts needed:', attempts);

    // Extract Total Quantity and Total Amount from the Excel file
    const { totalQuantity, totalAmount } = extractExcelDataFromBase64(fileData);
    
    console.log('Extracted order data:', { totalQuantity, totalAmount });

    // Save file to disk for consistency with other order creation methods
    const fs = require('fs');
    const path = require('path');
    const uploadDir = path.join(__dirname, '../../uploads/orders');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const savedFilename = `excelFile-${uniqueSuffix}${path.extname(fileName)}`;
    const filePath = path.join(uploadDir, savedFilename);
    
    // Convert base64 to buffer and save to disk
    const fileBuffer = Buffer.from(base64Data, 'base64');
    fs.writeFileSync(filePath, fileBuffer);
    
    console.log('File saved to disk:', savedFilename);
    console.log('Saving order with fields:', {
      excelFile: savedFilename,
      excelFileOriginalName: fileName,
      excelFileBase64Length: fileData.length,
      fileExists: fs.existsSync(filePath)
    });

    // Create a new order with the submitted file
    const newOrder = new Order({
      orderNumber: orderNumber,
      buyerId: req.user._id, // Use the authenticated user's ID
      buyerName: req.user.name, // Use the authenticated user's name
      companyName: req.user.companyName, // Use the authenticated user's company name
      brand: brandName, // Use brand instead of brandName for consistency
      stockFile: fileName, // Use fileName as stock file name
      // Only set catalogueFile if it's a valid ObjectId, otherwise omit it
      ...(catalogueFileId && mongoose.Types.ObjectId.isValid(catalogueFileId) && {
        catalogueFile: catalogueFileId
      }),
      // Store the Excel file data - both on disk and as base64
      excelFile: savedFilename,
      excelFileOriginalName: fileName,
      excelFileBase64: fileData, // Store the complete base64 data
      // Use extracted totals
      totalQuantity: totalQuantity,
      totalAmount: totalAmount,
      // Set status
      status: 'Pending Review',
      // Set timestamps
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Save the order
    await newOrder.save();

    // Populate buyer information for response
    await newOrder.populate('buyerId', 'name email companyName');
    console.log('Populated buyerId:', newOrder.buyerId);

    res.status(201).json({
      success: true,
      message: 'Excel file submitted successfully and order created',
      order: {
        orderNumber: newOrder.orderNumber,
        id: newOrder._id,
        status: newOrder.status,
        buyer: newOrder.buyerId, // This should now be populated
        brandName: newOrder.brandName,
        fileName: newOrder.fileName
      }
    });

  } catch (error) {
    console.error('Error submitting Excel file:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Test endpoint without authentication
router.post('/test-submit', async (req, res) => {
  try {
    console.log('Test endpoint hit with body:', req.body);
    res.json({
      success: true,
      message: 'Test endpoint working',
      received: req.body
    });
  } catch (error) {
    console.error('Test endpoint error:', error);
    res.status(500).json({
      success: false,
      message: 'Test endpoint error',
      error: error.message
    });
  }
});

// GET /api/file-submission/orders/:orderId/file
// Endpoint to retrieve the submitted Excel file
router.get('/orders/:orderId/file', authenticateToken, async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId)
      .populate('buyerId', 'name email companyName');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user has access to this order
    if (req.user.role === 'buyer' && order.buyerId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    if (!order.submittedFile || !order.submittedFile.fileData) {
      return res.status(404).json({
        success: false,
        message: 'No file found for this order'
      });
    }

    // Return the file data
    res.json({
      success: true,
      file: {
        fileName: order.submittedFile.fileName,
        fileData: order.submittedFile.fileData,
        fileSize: order.submittedFile.fileSize,
        mimeType: order.submittedFile.mimeType,
        submittedAt: order.submittedFile.submittedAt
      }
    });

  } catch (error) {
    console.error('Error retrieving file:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// GET /api/file-submission/orders
// Get all orders with submitted files for the authenticated user
router.get('/orders', authenticateToken, requireApprovedBuyer, async (req, res) => {
  try {
    let query = {};
    
    // If user is a buyer, only show their orders
    if (req.user.role === 'buyer') {
      query.buyerId = req.user._id;
    }

    // Only return orders that have submitted files
    query['submittedFile.fileData'] = { $exists: true, $ne: null };

    const orders = await Order.find(query)
      .populate('buyerId', 'name email companyName')
      .select('orderNumber buyerId brandName fileName status submittedFile.status submittedFile.submittedAt createdAt')
      .sort({ 'submittedFile.submittedAt': -1 });

    res.json({
      success: true,
      orders: orders
    });

  } catch (error) {
    console.error('Error retrieving orders:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// GET /api/file-submission/orders/by-number/:orderNumber
// Get a specific order by order number
router.get('/orders/by-number/:orderNumber', authenticateToken, requireApprovedBuyer, async (req, res) => {
  try {
    const { orderNumber } = req.params;

    let query = { orderNumber: orderNumber };
    
    // If user is a buyer, only show their orders
    if (req.user.role === 'buyer') {
      query.buyerId = req.user._id;
    }

    // Only return orders that have submitted files
    query['submittedFile.fileData'] = { $exists: true, $ne: null };

    const order = await Order.findOne(query)
      .populate('buyerId', 'name email companyName')
      .select('_id orderNumber buyerId brandName fileName status submittedFile.status submittedFile.submittedAt createdAt');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      order: order
    });

  } catch (error) {
    console.error('Error retrieving order by number:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

module.exports = router; 