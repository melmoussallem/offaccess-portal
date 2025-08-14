const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const xlsx = require('xlsx');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { notifyNewStockFile } = require('../utils/notificationService');

// Safe model imports to prevent OverwriteModelError
const mongoose = require('mongoose');

// Get models safely without recompiling
let Brand, StockFile, Catalogue, User, ViewTracking, DownloadTracking;

// Safe model import for Brand
Brand = mongoose.models.Brand || require('../models/Brand');
Catalogue = mongoose.models.Catalogue || require('../models/Catalogue');
User = mongoose.models.User || require('../models/User');
ViewTracking = mongoose.models.ViewTracking || require('../models/ViewTracking');
DownloadTracking = mongoose.models.DownloadTracking || require('../models/DownloadTracking');

// Safe model import for StockFile
StockFile = mongoose.models.StockFile || require('../models/StockFile');

// Configure multer for file uploads (using memory storage for GCS)
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    const allowed = ['.xlsx', '.xlsm'];
    if (allowed.includes(path.extname(file.originalname).toLowerCase())) {
      cb(null, true);
    } else {
      cb(new Error('Only .xlsx and .xlsm files are allowed'));
    }
  }
});

// Import file storage service
const fileStorageService = require('../utils/fileStorageService');

// Get all brands (admin only)
router.get('/brands', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const brands = await Brand.find().sort({ name: 1 });
    res.json({ brands });
  } catch (error) {
    console.error('Get brands error:', error);
    res.status(500).json({ message: 'Failed to fetch brands' });
  }
});

// Get all approved buyers for brand access selection (admin only)
router.get('/buyers', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const buyers = await User.find({ 
      role: 'buyer', 
      status: 'approved', 
      isActive: true 
    }).select('name email companyName').sort({ name: 1 });
    
    res.json({ buyers });
  } catch (error) {
    console.error('Get buyers error:', error);
    res.status(500).json({ message: 'Failed to fetch buyers' });
  }
});

// Create a new brand (admin only)
router.post('/brand', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, visibility, visibleToBuyers } = req.body;
    console.log('Brand creation request:', { name, visibility, visibleToBuyers });
    
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Brand name required' });
    }
    
    // Validate visibility setting
    if (visibility && !['all_approved', 'specific_buyers', 'hidden'].includes(visibility)) {
      return res.status(400).json({ message: 'Invalid visibility setting' });
    }
    
    // If specific buyers selected, validate the list
    if (visibility === 'specific_buyers') {
      if (!Array.isArray(visibleToBuyers) || visibleToBuyers.length === 0) {
        return res.status(400).json({ message: 'At least one buyer must be selected for specific access' });
      }
      
      // Validate that all buyer IDs exist
      const validBuyers = await User.find({
        _id: { $in: visibleToBuyers },
        role: 'buyer',
        status: 'approved',
        isActive: true
      });
      
      if (validBuyers.length !== visibleToBuyers.length) {
        return res.status(400).json({ message: 'One or more selected buyers are invalid' });
      }
    }
    
    const brandData = {
      name: name.trim(),
      visibility: visibility || 'all_approved',
      visibleToBuyers: visibility === 'specific_buyers' ? visibleToBuyers : []
    };
    
    console.log('Creating brand with data:', brandData);
    
    const brand = new Brand(brandData);
    await brand.save();
    
    console.log('Brand created successfully:', { name: brand.name, visibility: brand.visibility });
    res.status(201).json({ message: 'Brand created', brand });
  } catch (error) {
    console.error('Create brand error:', error);
    if (error.code === 11000) {
      res.status(400).json({ message: 'Brand name already exists' });
    } else {
      res.status(500).json({ message: 'Failed to create brand' });
    }
  }
});

// Get stock files for a specific brand (accessible to both admin and buyers)
router.get('/:brandId/stock-files', authenticateToken, async (req, res) => {
  try {
    const { brandId } = req.params;
    const user = req.user;
    
    // Find the brand
    const brand = await Brand.findById(brandId);
    if (!brand) {
      return res.status(404).json({ message: 'Brand not found' });
    }
    
    // Check access permissions for buyers
    if (user.role === 'buyer') {
      // Check if buyer has access to this brand
      const hasAccess = brand.visibility === 'all_approved' || 
                       (brand.visibility === 'specific_buyers' && 
                        brand.visibleToBuyers.includes(user._id));
      
      if (!hasAccess) {
        return res.status(403).json({ message: 'Access denied to this brand' });
      }
      
      // Track brand view for buyers only
      try {
        const now = new Date();
        const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

        await ViewTracking.create({
          buyerId: user._id,
          brandId: brandId,
          month: currentMonth,
          viewedAt: now
        });
      } catch (trackingError) {
        console.error('Error tracking brand view:', trackingError);
        // Don't fail the request if tracking fails
      }
    }
    
    // Get stock files for the brand
    const stockFiles = await StockFile.find({ brandId }).sort({ uploadedAt: -1 });
    res.json({ brand, stockFiles });
  } catch (error) {
    console.error('Get stock files error:', error);
    res.status(500).json({ message: 'Failed to fetch stock files' });
  }
});

// Upload Excel files to a brand (admin only)
router.post('/:brandId/upload', authenticateToken, requireAdmin, upload.array('files', 10), async (req, res) => {
  console.log('--- Upload route entered ---');
  try {
    const { brandId } = req.params;
    console.log('Upload params:', req.params);
    if (!req.files || !req.files.length) {
      console.log('No files uploaded');
      return res.status(400).json({ message: 'No files uploaded' });
    }
    const brand = await Brand.findById(brandId);
    if (!brand) {
      console.log('Brand not found:', brandId);
      return res.status(404).json({ message: 'Brand not found' });
    }
    const savedStockFiles = [];
    for (const file of req.files) {
      console.log('Uploading file to Google Cloud Storage:', {
        originalname: file.originalname,
        size: file.size,
        mimetype: file.mimetype
      });
      
      // Generate unique filename
      const fileName = fileStorageService.generateUniqueFileName(file.originalname, 'catalogue-');
      console.log('📝 Generated filename:', fileName);
      
      // Upload to Google Cloud Storage
      console.log('☁️ Uploading file to Google Cloud Storage...');
      const uploadResult = await fileStorageService.uploadFile(
        file.buffer,
        fileName,
        file.mimetype,
        'catalogue'
      );

      console.log('☁️ Upload result:', uploadResult);

      if (!uploadResult.success) {
        console.error('❌ Failed to upload file to cloud storage:', uploadResult.error);
        return res.status(500).json({ message: 'Failed to upload file to cloud storage: ' + uploadResult.error });
      }

      // Convert file to base64 for backup (same as orders)
      const base64File = file.buffer.toString('base64');
      
      console.log('File uploaded to GCS successfully:', uploadResult.filePath);
      
      const stockFile = new StockFile({
        brandId: brand._id,
        fileName: fileName,
        originalName: file.originalname,
        filePath: uploadResult.filePath,
        fileSize: file.size,
        mimeType: file.mimetype,
        base64Data: base64File // Add base64 backup like orders
      });
      await stockFile.save();
      console.log('Saved stockFile with originalName:', stockFile.originalName);
      savedStockFiles.push(stockFile);
    }
    // Send notifications to buyers with access to this brand
    for (const stockFile of savedStockFiles) {
      try {
        let buyers = [];
        if (brand.visibility === 'all_approved') {
          buyers = await User.find({ role: 'buyer', status: 'approved', isActive: true });
        } else if (brand.visibility === 'specific_buyers') {
          buyers = await User.find({ _id: { $in: brand.visibleToBuyers }, role: 'buyer', status: 'approved', isActive: true });
        }
        console.log('Buyers to notify:', buyers.map(b => ({ id: b._id, email: b.email, name: b.name })));
        const notificationPayload = {
          name: stockFile.originalName,
          brand: brand.name,
          category: brand.category || 'General',
          itemCount: 'Multiple'
        };
        console.log('Notification payload:', notificationPayload);
        if (buyers.length > 0) {
          const notifyResult = await notifyNewStockFile(buyers, notificationPayload);
          console.log('notifyNewStockFile result:', notifyResult);
        } else {
          console.log('No buyers to notify for this brand/stock file.');
        }
      } catch (notificationError) {
        console.error('Failed to send new collection notification:', notificationError);
        if (notificationError && notificationError.stack) {
          console.error(notificationError.stack);
        }
      }
    }
    res.status(201).json({ 
      message: `${savedStockFiles.length} file(s) uploaded successfully`,
      stockFiles: savedStockFiles 
    });
  } catch (error) {
    console.error('Upload stock files error (explicit log):', error);
    if (error && error.stack) {
      console.error(error.stack);
    }
    res.status(500).json({ message: 'Failed to upload files', error: error.message });
  }
});

// Delete a stock file (admin only)
router.delete('/:brandId/stock-file/:fileId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { fileId } = req.params;
    
    const stockFile = await StockFile.findById(fileId);
    if (!stockFile) {
      return res.status(404).json({ message: 'Stock file not found' });
    }
    
    // Delete the physical file from Google Cloud Storage
    if (stockFile.filePath) {
      try {
        const deleteResult = await fileStorageService.deleteFile(stockFile.filePath);
        if (deleteResult.success) {
          console.log('✅ File deleted from GCS:', stockFile.filePath);
        } else {
          console.log('⚠️ Could not delete file from GCS:', deleteResult.error);
        }
      } catch (deleteError) {
        console.log('⚠️ Error deleting file from GCS:', deleteError.message);
      }
    }
    
    // Delete from database
    await StockFile.findByIdAndDelete(fileId);
    
    res.json({ message: 'Stock file deleted successfully' });
    
  } catch (error) {
    console.error('Delete stock file error:', error);
    res.status(500).json({ message: 'Failed to delete stock file' });
  }
});

// Download a stock file (accessible to both admin and buyers)
router.get('/:brandId/stock-file/:fileId/download', authenticateToken, async (req, res) => {
  const { brandId, fileId } = req.params;
  const user = req.user;
  console.log('Download request:', { brandId, fileId, userRole: user.role });
  
  if (!brandId || !fileId || brandId === 'undefined' || fileId === 'undefined') {
    console.error('Download error: missing or invalid brandId or fileId', { brandId, fileId });
    return res.status(400).json({ message: 'Invalid download request: missing brand or file ID' });
  }
  
  try {
    // Find the brand first to check access permissions
    const brand = await Brand.findById(brandId);
    if (!brand) {
      return res.status(404).json({ message: 'Brand not found' });
    }
    
    // Check access permissions for buyers
    if (user.role === 'buyer') {
      const hasAccess = brand.visibility === 'all_approved' || 
                       (brand.visibility === 'specific_buyers' && 
                        brand.visibleToBuyers.includes(user._id));
      
      if (!hasAccess) {
        return res.status(403).json({ message: 'Access denied to this brand' });
      }
    }
    
    // Find the stock file
    const stockFile = await StockFile.findOne({ 
      _id: fileId, 
      brandId: brandId 
    });
    
    console.log('Found stockFile:', stockFile);
    console.log('StockFile originalName:', stockFile?.originalName);
    console.log('StockFile fileName:', stockFile?.fileName);
    
    if (!stockFile) {
      console.error('Download error: StockFile not found for fileId:', fileId, 'brandId:', brandId);
      return res.status(404).json({ message: 'File not found in database' });
    }
    
    // Track download for buyers only
    if (user.role === 'buyer') {
      try {
        const now = new Date();
        const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        console.log(`[DOWNLOAD TRACKING] Attempting to track download: user=${user._id}, fileId=${fileId}, month=${currentMonth}`);
        await DownloadTracking.create({
          buyerId: user._id,
          stockFileId: fileId,
          month: currentMonth,
          downloadedAt: now
        });
        console.log(`[DOWNLOAD TRACKING] Successfully tracked download: user=${user._id}, fileId=${fileId}, month=${currentMonth}`);
      } catch (trackingError) {
        console.error('[DOWNLOAD TRACKING] Error tracking download:', trackingError);
        // Don't fail the request if tracking fails
      }
    }
    
    // Determine the correct filename to use for download
    let downloadFilename = stockFile.originalName;
    
    // If originalName is not available, use fileName but preserve extension
    if (!downloadFilename) {
      downloadFilename = stockFile.fileName;
    }
    
    // Ensure we have a valid filename
    if (!downloadFilename) {
      downloadFilename = 'download.xlsx';
    }
    
    console.log('Final download filename:', downloadFilename);
    
    // Determine correct MIME type based on file extension
    const fileExtension = path.extname(downloadFilename).toLowerCase();
    let contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'; // default for .xlsx
    
    if (fileExtension === '.xlsm') {
      contentType = 'application/vnd.ms-excel.sheet.macroEnabled.12';
    } else if (fileExtension === '.xls') {
      contentType = 'application/vnd.ms-excel';
    }
    
    console.log('File extension:', fileExtension, 'Content-Type:', contentType);
    
    // Try Google Cloud Storage first (same as orders)
    if (stockFile.filePath) {
      console.log(`[DOWNLOAD] Attempting to download from Google Cloud Storage: ${stockFile.filePath}`);
      const downloadResult = await fileStorageService.downloadFile(stockFile.filePath);
      
      if (downloadResult.success) {
        console.log(`[DOWNLOAD] Serving from Google Cloud Storage for catalogue file ${stockFile._id}`);
        const contentDisposition = `attachment; filename="${downloadFilename}"; filename*=UTF-8''${encodeURIComponent(downloadFilename)}`;
        console.log(`[DOWNLOAD] Setting Content-Disposition: ${contentDisposition}`);
        res.setHeader('Content-Type', downloadResult.contentType || contentType);
        res.setHeader('Content-Disposition', contentDisposition);
        res.setHeader('Content-Length', downloadResult.buffer.length);
        res.setHeader('X-Original-Filename', downloadFilename);
        res.setHeader('X-File-Metadata', JSON.stringify({ originalName: stockFile.originalName, fileType: 'catalogue' }));
        console.log(`[DOWNLOAD] Headers set, sending buffer of size: ${downloadResult.buffer.length}`);
        return res.end(downloadResult.buffer);
      } else {
        console.log(`[DOWNLOAD] GCS download failed: ${downloadResult.error}`);
      }
    }
    
    // Fallback to base64 data (same as orders)
    if (stockFile.base64Data) {
      console.log(`[DOWNLOAD] Serving from base64 for catalogue file ${stockFile._id}`);
      const buffer = Buffer.from(stockFile.base64Data, 'base64');
      const contentDisposition = `attachment; filename="${downloadFilename}"; filename*=UTF-8''${encodeURIComponent(downloadFilename)}`;
      console.log(`[DOWNLOAD] Setting Content-Disposition: ${contentDisposition}`);
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', contentDisposition);
      res.setHeader('Content-Length', buffer.length);
      res.setHeader('X-Original-Filename', downloadFilename);
      res.setHeader('X-File-Metadata', JSON.stringify({ originalName: stockFile.originalName, fileType: 'catalogue' }));
      console.log(`[DOWNLOAD] Headers set, sending buffer of size: ${buffer.length}`);
      return res.end(buffer);
    }
    
    console.log(`[DOWNLOAD] File not found for catalogue file ${stockFile._id}`);
    return res.status(404).json({ message: 'File not found in cloud storage or database. Please contact support.' });
    
  } catch (error) {
    console.error('Download error:', error);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Error downloading file' });
    }
  }
});

// Upload Excel files to the Catalogue model (admin only, with columns)
router.post('/:brandId/catalogue-upload', authenticateToken, requireAdmin, upload.array('files', 10), async (req, res) => {
  try {
    const { brandId } = req.params;
    const { brandName, description, columns } = req.body;
    if (!req.files || !req.files.length) {
      return res.status(400).json({ message: 'No files uploaded' });
    }
    if (!brandName) {
      return res.status(400).json({ message: 'Brand name required' });
    }
    
    let parsedColumns = [];
    if (columns) {
      if (typeof columns === 'string') {
        try {
          parsedColumns = JSON.parse(columns);
        } catch (e) {
          parsedColumns = [];
        }
      } else if (Array.isArray(columns)) {
        parsedColumns = columns;
      }
    }
    
    // Validate each column object
    parsedColumns = parsedColumns.filter(col => {
      return col && typeof col === 'object' && col.name && col.type;
    }).map(col => ({
      name: String(col.name),
      type: String(col.type),
      editable: Boolean(col.editable)
    }));

    const savedFiles = [];
    
    for (const file of req.files) {
      console.log('Uploading catalogue file to Google Cloud Storage:', {
        originalname: file.originalname,
        size: file.size,
        mimetype: file.mimetype
      });
      
      // Generate unique filename
      const fileName = fileStorageService.generateUniqueFileName(file.originalname, 'catalogue-');
      
      // Upload to Google Cloud Storage
      const uploadResult = await fileStorageService.uploadFile(
        file.buffer,
        fileName,
        file.mimetype,
        'catalogue'
      );
      
      if (!uploadResult.success) {
        console.error('Failed to upload catalogue file to GCS:', uploadResult.error);
        return res.status(500).json({ message: 'Failed to upload file to cloud storage' });
      }
      
      console.log('Catalogue file uploaded to GCS successfully:', uploadResult.filePath);
      
      const catalogueEntry = new Catalogue({
        brandId: brandId,
        brandName: brandName,
        description: description || '',
        fileName: fileName,
        originalName: file.originalname,
        filePath: uploadResult.filePath,
        fileSize: file.size,
        mimeType: file.mimetype,
        columns: parsedColumns,
        uploadedBy: req.user._id,
        uploadedAt: new Date()
      });
      
      await catalogueEntry.save();
      savedFiles.push(catalogueEntry);
    }
    
    res.status(201).json({ 
      message: `${savedFiles.length} file(s) uploaded successfully to catalogue`,
      files: savedFiles 
    });
    
  } catch (error) {
    console.error('Catalogue upload error:', error);
    res.status(500).json({ message: 'Failed to upload files to catalogue' });
  }
});

// Update brand name (admin only)
router.put('/brand/:brandId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { brandId } = req.params;
    const { name } = req.body;
    
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Brand name required' });
    }
    
    const brand = await Brand.findById(brandId);
    if (!brand) {
      return res.status(404).json({ message: 'Brand not found' });
    }
    
    // Check if new name already exists (excluding current brand)
    const existingBrand = await Brand.findOne({ name: name.trim(), _id: { $ne: brandId } });
    if (existingBrand) {
      return res.status(400).json({ message: 'Brand name already exists' });
    }
    
    brand.name = name.trim();
    await brand.save();
    
    res.json({ message: 'Brand updated successfully', brand });
  } catch (error) {
    console.error('Update brand error:', error);
    res.status(500).json({ message: 'Failed to update brand' });
  }
});

// Delete brand and all associated files (admin only)
router.delete('/brand/:brandId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { brandId } = req.params;
    
    const brand = await Brand.findById(brandId);
    if (!brand) {
      return res.status(404).json({ message: 'Brand not found' });
    }
    
    // Find all collections for this brand
    const stockFiles = await StockFile.find({ brandId });
    
    // Delete physical files
    for (const stockFile of stockFiles) {
      if (fs.existsSync(stockFile.filePath)) {
        fs.unlinkSync(stockFile.filePath);
      }
    }
    
    // Delete all collections from database
    await StockFile.deleteMany({ brandId });
    
    // Delete the brand
    await Brand.findByIdAndDelete(brandId);
    
    res.json({ message: 'Brand and all associated files deleted successfully' });
  } catch (error) {
    console.error('Delete brand error:', error);
    res.status(500).json({ message: 'Failed to delete brand' });
  }
});

// Update file name (admin only)
router.put('/:brandId/stock-file/:fileId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { brandId, fileId } = req.params;
    const { originalName } = req.body;
    
    if (!originalName || !originalName.trim()) {
      return res.status(400).json({ message: 'File name required' });
    }
    
    const stockFile = await StockFile.findOne({ _id: fileId, brandId });
    if (!stockFile) {
      return res.status(404).json({ message: 'File not found' });
    }
    
    // Ensure the filename has the correct extension
    let newName = originalName.trim();
    const currentExt = path.extname(stockFile.originalName);
    const newExt = path.extname(newName);
    
    if (!newExt || newExt.toLowerCase() !== currentExt.toLowerCase()) {
      newName += currentExt;
    }
    
    stockFile.originalName = newName;
    await stockFile.save();
    
    res.json({ message: 'File renamed successfully', stockFile });
  } catch (error) {
    console.error('Update file name error:', error);
    res.status(500).json({ message: 'Failed to rename file' });
  }
});

// Update stock file name (admin only)
router.put('/:brandId/stock-file/:fileId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { fileId } = req.params;
    const { originalName } = req.body;
    
    if (!originalName || !originalName.trim()) {
      return res.status(400).json({ message: 'File name is required' });
    }
    
    const stockFile = await StockFile.findById(fileId);
    if (!stockFile) {
      return res.status(404).json({ message: 'Stock file not found' });
    }
    
    stockFile.originalName = originalName.trim();
    await stockFile.save();
    
    res.json({ message: 'File renamed successfully', stockFile });
    
  } catch (error) {
    console.error('Rename stock file error:', error);
    res.status(500).json({ message: 'Failed to rename file' });
  }
});



// Replace stock file (admin only)
router.put('/:brandId/stock-file/:fileId/replace', authenticateToken, requireAdmin, upload.array('files', 1), async (req, res) => {
  try {
    const { fileId } = req.params;
    
    if (!req.files || !req.files.length) {
      return res.status(400).json({ message: 'No replacement file uploaded' });
    }
    
    const stockFile = await StockFile.findById(fileId);
    if (!stockFile) {
      return res.status(404).json({ message: 'Stock file not found' });
    }
    
    const newFile = req.files[0];
    
    // Delete the old file
    if (fs.existsSync(stockFile.filePath)) {
      fs.unlinkSync(stockFile.filePath);
    }
    
    // Update stockFile with new file info
    const relativePath = path.relative(path.join(__dirname, '../../'), newFile.path);
    stockFile.fileName = newFile.filename;
    stockFile.originalName = newFile.originalname;
    stockFile.filePath = relativePath;
    stockFile.uploadedAt = new Date();
    
    await stockFile.save();
    
    res.json({ message: 'File replaced successfully', stockFile });
    
  } catch (error) {
    console.error('Replace stock file error:', error);
    res.status(500).json({ message: 'Failed to replace file' });
  }
});

// Get all buyers for access management (admin only)
router.get('/buyers', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const buyers = await User.find({ 
      role: 'buyer', 
      status: 'approved',
      isActive: true 
    }).select('name email companyName buyerType');
    
    res.json(buyers);
  } catch (error) {
    console.error('Error fetching buyers:', error);
    res.status(500).json({ message: 'Failed to fetch buyers' });
  }
});

// Update brand visibility settings (admin only)
router.put('/brand/:brandId/visibility', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { brandId } = req.params;
    const { visibility, visibleToBuyers } = req.body;
    
    const brand = await Brand.findById(brandId);
    if (!brand) {
      return res.status(404).json({ message: 'Brand not found' });
    }
    
    // Validate visibility setting
    if (!['all_approved', 'specific_buyers', 'hidden'].includes(visibility)) {
      return res.status(400).json({ message: 'Invalid visibility setting' });
    }
    
    // Update brand visibility
    brand.visibility = visibility;
    
    // If specific buyers selected, validate and update the list
    if (visibility === 'specific_buyers') {
      if (!Array.isArray(visibleToBuyers) || visibleToBuyers.length === 0) {
        return res.status(400).json({ message: 'At least one buyer must be selected for specific access' });
      }
      
      // Validate that all buyer IDs exist
      const validBuyers = await User.find({
        _id: { $in: visibleToBuyers },
        role: 'buyer',
        status: 'approved',
        isActive: true
      });
      
      if (validBuyers.length !== visibleToBuyers.length) {
        return res.status(400).json({ message: 'One or more selected buyers are invalid' });
      }
      
      brand.visibleToBuyers = visibleToBuyers;
    } else {
      // Clear visibleToBuyers for other visibility settings
      brand.visibleToBuyers = [];
    }
    
    await brand.save();
    
    res.json({ message: 'Brand visibility updated successfully', brand });
  } catch (error) {
    console.error('Error updating brand visibility:', error);
    res.status(500).json({ message: 'Failed to update brand visibility' });
  }
});

// Get brands filtered by buyer access
router.get('/brands/accessible', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    
    let brands;
    
    if (user.role === 'admin') {
      // Admins see all brands
      brands = await Brand.find().sort({ name: 1 });
    } else {
      // Buyers see brands based on visibility settings
      brands = await Brand.find({
        $or: [
          { visibility: 'all_approved' },
          { 
            visibility: 'specific_buyers',
            visibleToBuyers: user._id
          }
        ]
      }).sort({ name: 1 });
    }
    
    res.json(brands);
  } catch (error) {
    console.error('Error fetching accessible brands:', error);
    res.status(500).json({ message: 'Failed to fetch brands' });
  }
});



// Replace file (admin only) - matches frontend call
router.put('/replace-file/:fileId', authenticateToken, requireAdmin, upload.array('files', 1), async (req, res) => {
  try {
    const { fileId } = req.params;
    
    if (!req.files || !req.files.length) {
      return res.status(400).json({ message: 'No replacement file uploaded' });
    }
    
    const stockFile = await StockFile.findById(fileId);
    if (!stockFile) {
      return res.status(404).json({ message: 'File not found' });
    }
    
    const newFile = req.files[0];
    
    console.log('Replacing file in Google Cloud Storage:', {
      fileId: fileId,
      oldFilePath: stockFile.filePath,
      newFileName: newFile.originalname,
      newFileSize: newFile.size
    });
    
    // Delete the old file from Google Cloud Storage
    if (stockFile.filePath) {
      try {
        const deleteResult = await fileStorageService.deleteFile(stockFile.filePath);
        if (deleteResult.success) {
          console.log('✅ Old file deleted from GCS:', stockFile.filePath);
        } else {
          console.log('⚠️ Could not delete old file from GCS:', deleteResult.error);
        }
      } catch (deleteError) {
        console.log('⚠️ Error deleting old file from GCS:', deleteError.message);
      }
    }
    
    // Generate unique filename for new file
    const fileName = fileStorageService.generateUniqueFileName(newFile.originalname, 'catalogue-');
    console.log('📝 Generated replacement filename:', fileName);
    
    // Upload new file to Google Cloud Storage
    console.log('☁️ Uploading replacement file to Google Cloud Storage...');
    const uploadResult = await fileStorageService.uploadFile(
      newFile.buffer,
      fileName,
      newFile.mimetype,
      'catalogue'
    );

    console.log('☁️ Replacement upload result:', uploadResult);
    
    if (!uploadResult.success) {
      console.error('❌ Failed to upload replacement file to cloud storage:', uploadResult.error);
      return res.status(500).json({ message: 'Failed to upload replacement file to cloud storage: ' + uploadResult.error });
    }

    // Convert file to base64 for backup (same as orders)
    const base64File = newFile.buffer.toString('base64');
    
    console.log('✅ Replacement file uploaded to GCS:', uploadResult.filePath);
    
    // Update stockFile with new file info
    stockFile.fileName = fileName;
    stockFile.originalName = newFile.originalname;
    stockFile.filePath = uploadResult.filePath;
    stockFile.fileSize = newFile.size;
    stockFile.mimeType = newFile.mimetype;
    stockFile.base64Data = base64File; // Add base64 backup like orders
    stockFile.uploadedAt = new Date();
    
    await stockFile.save();
    
    res.json({ message: 'File replaced successfully', stockFile });
    
  } catch (error) {
    console.error('Replace file error:', error);
    res.status(500).json({ message: 'Failed to replace file' });
  }
});

// Rename brand (admin only)
router.put('/rename-brand', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { brandId, newName } = req.body;
    
    if (!brandId || !newName || !newName.trim()) {
      return res.status(400).json({ message: 'Brand ID and new name are required' });
    }
    
    const brand = await Brand.findById(brandId);
    if (!brand) {
      return res.status(404).json({ message: 'Brand not found' });
    }
    
    // Check if new name already exists
    const existingBrand = await Brand.findOne({ name: newName.trim(), _id: { $ne: brandId } });
    if (existingBrand) {
      return res.status(400).json({ message: 'Brand name already exists' });
    }
    
    brand.name = newName.trim();
    await brand.save();
    
    res.json({ message: 'Brand renamed successfully', brand });
    
  } catch (error) {
    console.error('Rename brand error:', error);
    res.status(500).json({ message: 'Failed to rename brand' });
  }
});

module.exports = router; 