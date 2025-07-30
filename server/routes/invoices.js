const express = require('express');
const PDFDocument = require('pdfkit');
const fs = require('fs').promises;
const path = require('path');
const Order = require('../models/Order');
const { authenticateToken, requireAdmin, requireApprovedBuyer } = require('../middleware/auth');
const { sendOrderNotification } = require('../utils/emailService');

const router = express.Router();

// Generate Pro Forma Invoice (Admin only)
router.post('/generate-proforma/:orderId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate('buyerId', 'name email companyName companyAddress');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    const invoiceNumber = `PRO-${order.orderNumber}`;
    const invoicePath = path.join(__dirname, `../../uploads/invoices/${invoiceNumber}.pdf`);
    
    // Ensure invoices directory exists
    await fs.mkdir(path.dirname(invoicePath), { recursive: true });
    
    // Generate PDF
    const doc = new PDFDocument();
    const writeStream = fs.createWriteStream(invoicePath);
    doc.pipe(writeStream);
    
    // Add company header
    doc.fontSize(20).text('Digital Wholesale Catalogue', { align: 'center' });
    doc.fontSize(12).text('Pro Forma Invoice', { align: 'center' });
    doc.moveDown();
    
    // Invoice details
    doc.fontSize(14).text(`Invoice Number: ${invoiceNumber}`);
    doc.fontSize(12).text(`Order Number: ${order.orderNumber}`);
    doc.fontSize(12).text(`Date: ${new Date().toLocaleDateString()}`);
    doc.fontSize(12).text(`Due Date: ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}`);
    doc.moveDown();
    
    // Buyer information
    doc.fontSize(14).text('Bill To:');
    doc.fontSize(12).text(order.buyerId.name);
    doc.fontSize(12).text(order.buyerId.companyName);
    if (order.buyerId.companyAddress) {
      doc.fontSize(12).text(`${order.buyerId.companyAddress.street}`);
      doc.fontSize(12).text(`${order.buyerId.companyAddress.city}, ${order.buyerId.companyAddress.country}`);
    }
    doc.moveDown();
    
    // Items table
    doc.fontSize(14).text('Items:');
    doc.moveDown();
    
    // Table headers
    const tableTop = doc.y;
    doc.fontSize(10);
    doc.text('SKU', 50, tableTop);
    doc.text('Product', 150, tableTop);
    doc.text('Qty', 300, tableTop);
    doc.text('Price', 350, tableTop);
    doc.text('Total', 450, tableTop);
    doc.moveDown();
    
    // Table rows
    let currentY = doc.y;
    order.items.forEach((item, index) => {
      doc.text(item.sku, 50, currentY);
      doc.text(item.productName, 150, currentY);
      doc.text(item.desiredQuantity.toString(), 300, currentY);
      doc.text(`$${item.unitPrice.toFixed(2)}`, 350, currentY);
      doc.text(`$${item.totalPrice.toFixed(2)}`, 450, currentY);
      currentY += 20;
    });
    
    doc.moveDown();
    
    // Totals
    doc.fontSize(12);
    doc.text(`Subtotal: $${order.subtotal.toFixed(2)}`, { align: 'right' });
    doc.text(`Tax: $${order.tax.toFixed(2)}`, { align: 'right' });
    doc.text(`Shipping: $${order.shipping.toFixed(2)}`, { align: 'right' });
    doc.fontSize(14).text(`Total: $${order.total.toFixed(2)}`, { align: 'right' });
    doc.moveDown();
    
    // Payment instructions
    doc.fontSize(12).text('Payment Instructions:');
    doc.fontSize(10).text('Bank: Sample Bank');
    doc.fontSize(10).text('Account: 1234567890');
    doc.fontSize(10).text('Routing: 987654321');
    doc.fontSize(10).text('Please include invoice number in payment reference.');
    doc.moveDown();
    
    doc.fontSize(10).text('This is a pro forma invoice and does not constitute a tax document.');
    
    doc.end();
    
    // Wait for PDF to be written
    await new Promise((resolve, reject) => {
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
    });
    
    // Update order with invoice information
    order.proFormaInvoice = {
      filePath: invoicePath,
      generatedAt: new Date(),
      generatedBy: req.user._id
    };
    
    order.updateStatus('invoiced', 'Pro forma invoice generated', req.user._id);
    await order.save();
    
    // Send notification
    try {
      await sendOrderNotification(order, 'invoiceGenerated');
    } catch (emailError) {
      console.error('Invoice notification failed:', emailError);
    }
    
    res.json({
      message: 'Pro forma invoice generated successfully',
      invoicePath: `/uploads/invoices/${invoiceNumber}.pdf`,
      order: order.toObject()
    });
    
  } catch (error) {
    console.error('Generate pro forma invoice error:', error);
    res.status(500).json({ message: 'Failed to generate invoice' });
  }
});

// Generate Final Invoice (Admin only)
router.post('/generate-final/:orderId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate('buyerId', 'name email companyName companyAddress');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    const invoiceNumber = `FIN-${order.orderNumber}`;
    const invoicePath = path.join(__dirname, `../../uploads/invoices/${invoiceNumber}.pdf`);
    
    // Ensure invoices directory exists
    await fs.mkdir(path.dirname(invoicePath), { recursive: true });
    
    // Generate PDF (similar to pro forma but with final invoice details)
    const doc = new PDFDocument();
    const writeStream = fs.createWriteStream(invoicePath);
    doc.pipe(writeStream);
    
    // Add company header
    doc.fontSize(20).text('Digital Wholesale Catalogue', { align: 'center' });
    doc.fontSize(12).text('Final Invoice', { align: 'center' });
    doc.moveDown();
    
    // Invoice details
    doc.fontSize(14).text(`Invoice Number: ${invoiceNumber}`);
    doc.fontSize(12).text(`Order Number: ${order.orderNumber}`);
    doc.fontSize(12).text(`Date: ${new Date().toLocaleDateString()}`);
    doc.moveDown();
    
    // Buyer information
    doc.fontSize(14).text('Bill To:');
    doc.fontSize(12).text(order.buyerId.name);
    doc.fontSize(12).text(order.buyerId.companyName);
    if (order.buyerId.companyAddress) {
      doc.fontSize(12).text(`${order.buyerId.companyAddress.street}`);
      doc.fontSize(12).text(`${order.buyerId.companyAddress.city}, ${order.buyerId.companyAddress.country}`);
    }
    doc.moveDown();
    
    // Items table
    doc.fontSize(14).text('Items:');
    doc.moveDown();
    
    // Table headers
    const tableTop = doc.y;
    doc.fontSize(10);
    doc.text('SKU', 50, tableTop);
    doc.text('Product', 150, tableTop);
    doc.text('Qty', 300, tableTop);
    doc.text('Price', 350, tableTop);
    doc.text('Total', 450, tableTop);
    doc.moveDown();
    
    // Table rows
    let currentY = doc.y;
    order.items.forEach((item, index) => {
      doc.text(item.sku, 50, currentY);
      doc.text(item.productName, 150, currentY);
      doc.text(item.desiredQuantity.toString(), 300, currentY);
      doc.text(`$${item.unitPrice.toFixed(2)}`, 350, currentY);
      doc.text(`$${item.totalPrice.toFixed(2)}`, 450, currentY);
      currentY += 20;
    });
    
    doc.moveDown();
    
    // Totals
    doc.fontSize(12);
    doc.text(`Subtotal: $${order.subtotal.toFixed(2)}`, { align: 'right' });
    doc.text(`Tax: $${order.tax.toFixed(2)}`, { align: 'right' });
    doc.text(`Shipping: $${order.shipping.toFixed(2)}`, { align: 'right' });
    doc.fontSize(14).text(`Total: $${order.total.toFixed(2)}`, { align: 'right' });
    doc.moveDown();
    
    // Payment status
    if (order.paymentReceipt && order.paymentReceipt.verified) {
      doc.fontSize(12).text('Payment Status: Paid', { color: 'green' });
      doc.fontSize(10).text(`Payment Date: ${order.paymentReceipt.verifiedAt.toLocaleDateString()}`);
    } else {
      doc.fontSize(12).text('Payment Status: Pending', { color: 'red' });
    }
    
    doc.end();
    
    // Wait for PDF to be written
    await new Promise((resolve, reject) => {
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
    });
    
    // Update order with final invoice information
    order.finalInvoice = {
      filePath: invoicePath,
      generatedAt: new Date(),
      generatedBy: req.user._id
    };
    
    order.updateStatus('completed', 'Final invoice generated', req.user._id);
    await order.save();
    
    // Send notification
    try {
      await sendOrderNotification(order, 'finalInvoiceGenerated');
    } catch (emailError) {
      console.error('Final invoice notification failed:', emailError);
    }
    
    res.json({
      message: 'Final invoice generated successfully',
      invoicePath: `/uploads/invoices/${invoiceNumber}.pdf`,
      order: order.toObject()
    });
    
  } catch (error) {
    console.error('Generate final invoice error:', error);
    res.status(500).json({ message: 'Failed to generate final invoice' });
  }
});

// Get invoice by order ID
router.get('/order/:orderId', authenticateToken, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate('buyerId', 'name email companyName');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Check access permissions
    if (req.user.role === 'buyer' && order.buyerId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const invoices = {
      proForma: order.proFormaInvoice ? {
        filePath: order.proFormaInvoice.filePath,
        generatedAt: order.proFormaInvoice.generatedAt
      } : null,
      final: order.finalInvoice ? {
        filePath: order.finalInvoice.filePath,
        generatedAt: order.finalInvoice.generatedAt
      } : null
    };
    
    res.json({ invoices });
    
  } catch (error) {
    console.error('Get invoice error:', error);
    res.status(500).json({ message: 'Failed to fetch invoice' });
  }
});

// Get bank details (static)
router.get('/bank-details', authenticateToken, async (req, res) => {
  try {
    const bankDetails = {
      bankName: 'Sample Bank',
      accountNumber: '1234567890',
      routingNumber: '987654321',
      swiftCode: 'SAMPUS33',
      iban: 'US12SAMP1234567890',
      instructions: 'Please include invoice number in payment reference'
    };
    
    res.json({ bankDetails });
    
  } catch (error) {
    console.error('Get bank details error:', error);
    res.status(500).json({ message: 'Failed to fetch bank details' });
  }
});

// Get invoice statistics (Admin only)
router.get('/stats/overview', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const stats = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          ordersWithProForma: {
            $sum: { $cond: [{ $ne: ['$proFormaInvoice', null] }, 1, 0] }
          },
          ordersWithFinal: {
            $sum: { $cond: [{ $ne: ['$finalInvoice', null] }, 1, 0] }
          },
          totalValue: { $sum: '$total' }
        }
      }
    ]);
    
    const monthlyInvoices = await Order.aggregate([
      {
        $match: {
          $or: [
            { 'proFormaInvoice.generatedAt': { $exists: true } },
            { 'finalInvoice.generatedAt': { $exists: true } }
          ]
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$proFormaInvoice.generatedAt' },
            month: { $month: '$proFormaInvoice.generatedAt' }
          },
          proFormaCount: { $sum: 1 },
          finalCount: {
            $sum: { $cond: [{ $ne: ['$finalInvoice', null] }, 1, 0] }
          },
          totalValue: { $sum: '$total' }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);
    
    res.json({
      overview: stats[0] || {
        totalOrders: 0,
        ordersWithProForma: 0,
        ordersWithFinal: 0,
        totalValue: 0
      },
      monthlyInvoices
    });
    
  } catch (error) {
    console.error('Get invoice stats error:', error);
    res.status(500).json({ message: 'Failed to fetch invoice statistics' });
  }
});

module.exports = router; 