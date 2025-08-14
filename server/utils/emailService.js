const nodemailer = require('nodemailer');

// Logo HTML template
const logoHtml = `
  <div style="text-align: center; margin-bottom: 30px; padding: 20px 0;">
    <img src="https://portal.offaccess.com/Off Access Black.png" alt="Off Access Logo" style="height: 60px; width: auto; margin-bottom: 10px;">
    <h1 style="color: #1976d2; margin: 0; font-size: 24px; font-weight: 600;">Off Access</h1>
  </div>
`;

// Create transporter
const transporter = nodemailer.createTransport(
  process.env.SMTP_HOST ? {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER || process.env.EMAIL_USER,
      pass: process.env.SMTP_PASS || process.env.EMAIL_PASS
    }
  } : {
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  }
);

// Email templates
const emailTemplates = {
  // 1. Registration Completion
  registrationConfirmation: (user) => ({
    subject: 'Registration Confirmation - Off Access',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        ${logoHtml}
        <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">Welcome to Off Access</h2>
        <p>Dear ${user.name},</p>
        <p>Thank you for registering with Off Access. Your application has been received and is currently under review by our team.</p>
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">Registration Details:</h3>
          <ul style="margin: 0; padding-left: 20px;">
            <li><strong>Name:</strong> ${user.name}</li>
            <li><strong>Company:</strong> ${user.companyName || 'Not specified'}</li>
            <li><strong>Email:</strong> ${user.email}</li>
            <li><strong>Buyer Type:</strong> ${user.buyerType}</li>
            <li><strong>Registration Date:</strong> ${new Date().toLocaleDateString()}</li>
        </ul>
        </div>
        <p>We will review your application and notify you via email once a decision has been made. This process typically takes 1-2 business days.</p>
        <p>If you have any questions, please don't hesitate to contact our support team.</p>
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center;">
          <p style="margin: 0; color: #666;">Best regards,<br><strong>Off Access Team</strong></p>
          <p style="margin: 5px 0 0 0; color: #666; font-size: 12px;">
            ${process.env.ADMIN_EMAIL || 'support@offaccess.com'}
          </p>
        </div>
      </div>
    `
  }),

  // 2. Registration Status Decision
  statusUpdate: (data) => {
    const { name, status, reason } = data;
    const statusMessages = {
      approved: {
        subject: 'Application Approved - Off Access',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
            ${logoHtml}
            <h2 style="color: #28a745; border-bottom: 2px solid #28a745; padding-bottom: 10px;">🎉 Application Approved!</h2>
            <p>Dear ${name},</p>
            <p>Great news! Your application has been approved. You can now access our wholesale catalogue and start placing orders.</p>
            <div style="background-color: #d4edda; border: 1px solid #c3e6cb; border-radius: 5px; padding: 15px; margin: 20px 0;">
              <h3 style="color: #155724; margin-top: 0;">Next Steps:</h3>
              <ul style="margin: 0; padding-left: 20px;">
                <li>Log into your account using your registered email</li>
                <li>Browse our latest collections and products</li>
                <li>Place orders through our streamlined process</li>
                <li>Track your orders in real-time</li>
              </ul>
            </div>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Access Portal</a>
            </div>
            <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center;">
              <p style="margin: 0; color: #666;">Best regards,<br><strong>Off Access Team</strong></p>
              <p style="margin: 5px 0 0 0; color: #666; font-size: 12px;">
                ${process.env.ADMIN_EMAIL || 'support@offaccess.com'}
              </p>
            </div>
          </div>
        `
      },
      rejected: {
        subject: 'Application Status - Off Access',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
            ${logoHtml}
            <h2 style="color: #dc3545; border-bottom: 2px solid #dc3545; padding-bottom: 10px;">Application Update</h2>
            <p>Dear ${name},</p>
            <p>We regret to inform you that your application has not been approved at this time.</p>
            ${reason ? `<div style="background-color: #f8d7da; border: 1px solid #f5c6cb; border-radius: 5px; padding: 15px; margin: 20px 0;">
              <h3 style="color: #721c24; margin-top: 0;">Reason for Rejection:</h3>
              <p style="margin: 0;">${reason}</p>
            </div>` : ''}
            <p>If you believe this decision was made in error or if you have additional information to provide, please contact our support team for further assistance.</p>
            <p>You may also reapply in the future if your circumstances change.</p>
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center;">
              <p style="margin: 0; color: #666;">Best regards,<br><strong>Off Access Team</strong></p>
              <p style="margin: 5px 0 0 0; color: #666; font-size: 12px;">
                ${process.env.ADMIN_EMAIL || 'support@offaccess.com'}
              </p>
            </div>
          </div>
        `
      }
    };
    return statusMessages[status];
  },

  // 3. New Stock File Available
  newStockFileAvailable: (data) => {
    const { user, stockFile } = data;
    return {
      subject: `New Stock File Available - ${stockFile.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          ${logoHtml}
          <h2 style="color: #007bff; border-bottom: 2px solid #007bff; padding-bottom: 10px;">🆕 New Stock File Available!</h2>
          <p>Dear ${user.name},</p>
          <p>We're excited to announce that a new Stock File has been added to our catalogue and is now available for your review.</p>
          <div style="background-color: #e3f2fd; border: 1px solid #bbdefb; border-radius: 5px; padding: 15px; margin: 20px 0;">
            <h3 style="color: #1565c0; margin-top: 0;">Stock File Details:</h3>
            <ul style="margin: 0; padding-left: 20px;">
              <li><strong>Stock File Name:</strong> ${stockFile.name}</li>
              <li><strong>Brand:</strong> ${stockFile.brand}</li>
            </ul>
          </div>
          <p>Don't miss out on these exclusive wholesale opportunities. Log into your portal to view the complete Stock File and place your orders.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/catalogue" style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">View Stock File</a>
          </div>
          <p>If you have any questions about this Stock File or need assistance with your order, please contact our support team.</p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center;">
            <p style="margin: 0; color: #666;">Best regards,<br><strong>Off Access Team</strong></p>
            <p style="margin: 5px 0 0 0; color: #666; font-size: 12px;">
              ${process.env.ADMIN_EMAIL || 'support@offaccess.com'}
            </p>
          </div>
        </div>
      `
    };
  },

  // 4. Order Status Change
  orderStatusUpdate: (data) => {
    const { user, order } = data;
    return {
      subject: `Order Status Update - ${order.orderNumber || 'Order'}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          ${logoHtml}
          <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">📦 Order Status Update</h2>
          <p>Dear ${user.name},</p>
          <p>Your order status has been updated. Here are the latest details:</p>
          <div style="background-color: #f8f9fa; border: 1px solid #e9ecef; border-radius: 5px; padding: 15px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Order Details:</h3>
            <ul style="margin: 0; padding-left: 20px;">
              <li><strong>Order Number:</strong> ${order.orderNumber || 'N/A'}</li>
              <li><strong>Current Status:</strong> <span style="color: #007bff; font-weight: bold;">${order.status || 'N/A'}</span></li>
              <li><strong>Brand:</strong> ${order.brandName || order.brand || 'N/A'}</li>
              <li><strong>StockFile:</strong> ${order.stockFileName || order.stockFile || 'N/A'}</li>
              <li><strong>Total Items:</strong> ${order.totalQuantity || order.items?.length || 'N/A'}</li>
              <li><strong>Total Amount:</strong> $${order.totalAmount ? order.totalAmount.toFixed(2) : (order.total ? order.total.toFixed(2) : 'N/A')}</li>
              <li><strong>Last Updated:</strong> ${new Date(order.updatedAt || Date.now()).toLocaleString()}</li>
            </ul>
          </div>
          ${order.notes || order.rejectionReason ? `<div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; padding: 15px; margin: 20px 0;">
            <h3 style="color: #856404; margin-top: 0;">Additional Notes:</h3>
            <p style="margin: 0;">${order.notes || order.rejectionReason || ''}</p>
          </div>` : ''}
          <p>You can track your order progress and view all details in your portal dashboard.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/orders" style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">View Order</a>
          </div>
          <p>If you have any questions about this status update, please contact our support team.</p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center;">
            <p style="margin: 0; color: #666;">Best regards,<br><strong>Off Access Team</strong></p>
            <p style="margin: 5px 0 0 0; color: #666; font-size: 12px;">
              ${process.env.ADMIN_EMAIL || 'support@offaccess.com'}
            </p>
          </div>
        </div>
      `
    };
  },

  // Legacy templates (keeping for backward compatibility)
  orderReceived: (order) => ({
    subject: `Order Received - ${order.orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        ${logoHtml}
        <h2 style="color: #007bff; border-bottom: 2px solid #007bff; padding-bottom: 10px;">📦 Order Received</h2>
        <p>Dear ${order.buyer.name},</p>
        <p>Thank you for your order! We have received your order and it is now being processed.</p>
        <div style="background-color: #f8f9fa; border: 1px solid #e9ecef; border-radius: 5px; padding: 15px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">Order Details:</h3>
          <ul style="margin: 0; padding-left: 20px;">
            <li><strong>Order Number:</strong> ${order.orderNumber}</li>
            <li><strong>Brand:</strong> ${order.brandName || order.brand}</li>
            <li><strong>StockFile:</strong> ${order.stockFileName || order.stockFile}</li>
            <li><strong>Total Items:</strong> ${order.totalQuantity || order.items?.length}</li>
            <li><strong>Total Amount:</strong> $${order.totalAmount ? order.totalAmount.toFixed(2) : (order.total ? order.total.toFixed(2) : '0.00')}</li>
            <li><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</li>
          </ul>
        </div>
        <p>We will keep you updated on the status of your order. You can track your order progress in your portal dashboard.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/orders" style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">View Order</a>
        </div>
        <p>If you have any questions about your order, please contact our support team.</p>
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center;">
          <p style="margin: 0; color: #666;">Best regards,<br><strong>Off Access Team</strong></p>
          <p style="margin: 5px 0 0 0; color: #666; font-size: 12px;">
            ${process.env.ADMIN_EMAIL || 'support@offaccess.com'}
          </p>
        </div>
      </div>
    `
  }),

  // Password Reset Email
  passwordReset: (userName, resetUrl) => ({
    subject: 'Password Reset Request - Off Access',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        ${logoHtml}
        <h2 style="color: #dc3545; border-bottom: 2px solid #dc3545; padding-bottom: 10px;">🔐 Password Reset Request</h2>
        <p>Dear ${userName},</p>
        <p>We received a request to reset your password for your Off Access account.</p>
        <div style="background-color: #f8f9fa; border: 1px solid #e9ecef; border-radius: 5px; padding: 15px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">Important Information:</h3>
          <ul style="margin: 0; padding-left: 20px;">
            <li>This link will expire in <strong>15 minutes</strong></li>
            <li>If you didn't request this reset, please ignore this email</li>
            <li>For security, this link can only be used once</li>
          </ul>
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #dc3545; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
        </div>
        <p>If the button above doesn't work, you can copy and paste this link into your browser:</p>
        <p style="word-break: break-all; background-color: #f8f9fa; padding: 10px; border-radius: 5px; font-family: monospace; font-size: 12px;">${resetUrl}</p>
        <p>If you have any questions or need assistance, please contact our support team.</p>
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center;">
          <p style="margin: 0; color: #666;">Best regards,<br><strong>Off Access Team</strong></p>
          <p style="margin: 5px 0 0 0; color: #666; font-size: 12px;">
            ${process.env.ADMIN_EMAIL || 'support@offaccess.com'}
          </p>
        </div>
      </div>
    `
  }),

  orderReceived: (order) => ({
    subject: `Order Received - ${order.orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        ${logoHtml}
        <h2 style="color: #007bff; border-bottom: 2px solid #007bff; padding-bottom: 10px;">📦 Order Received</h2>
        <p>Dear ${order.buyer.name},</p>
        <p>We have received your order and it is currently under review.</p>
        <div style="background-color: #f8f9fa; border: 1px solid #e9ecef; border-radius: 5px; padding: 15px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">Order Details:</h3>
          <ul style="margin: 0; padding-left: 20px;">
            <li><strong>Order Number:</strong> ${order.orderNumber}</li>
            <li><strong>Brand:</strong> ${order.brandName}</li>
            <li><strong>Total Items:</strong> ${order.items.length}</li>
            <li><strong>Total Amount:</strong> $${order.total.toFixed(2)}</li>
          </ul>
        </div>
        <p>We will notify you once your order has been reviewed and approved.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/orders" style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">View Order</a>
        </div>
        <p>If you have any questions, please contact our support team.</p>
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center;">
          <p style="margin: 0; color: #666;">Best regards,<br><strong>Off Access Team</strong></p>
          <p style="margin: 5px 0 0 0; color: #666; font-size: 12px;">
            ${process.env.ADMIN_EMAIL || 'support@offaccess.com'}
          </p>
        </div>
      </div>
    `
  }),

  invoiceGenerated: (order, invoiceType) => ({
    subject: `${invoiceType === 'proforma' ? 'Pro Forma' : 'Final'} Invoice Generated - ${order.orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        ${logoHtml}
        <h2 style="color: #007bff; border-bottom: 2px solid #007bff; padding-bottom: 10px;">📄 ${invoiceType === 'proforma' ? 'Pro Forma' : 'Final'} Invoice</h2>
        <p>Dear ${order.buyer.name},</p>
        <p>A ${invoiceType === 'proforma' ? 'pro forma' : 'final'} invoice has been generated for your order.</p>
        <div style="background-color: #f8f9fa; border: 1px solid #e9ecef; border-radius: 5px; padding: 15px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">Invoice Details:</h3>
          <ul style="margin: 0; padding-left: 20px;">
            <li><strong>Order Number:</strong> ${order.orderNumber}</li>
            <li><strong>Total Amount:</strong> $${order.total.toFixed(2)}</li>
            <li><strong>Due Date:</strong> ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</li>
          </ul>
        </div>
        <p>Please log into your portal to view and download the invoice.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/orders" style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">View Order</a>
        </div>
        <p>If you have any questions, please contact our support team.</p>
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center;">
          <p style="margin: 0; color: #666;">Best regards,<br><strong>Off Access Team</strong></p>
          <p style="margin: 5px 0 0 0; color: #666; font-size: 12px;">
            ${process.env.ADMIN_EMAIL || 'support@offaccess.com'}
          </p>
        </div>
      </div>
    `
  }),

  paymentOverdue: (order) => ({
    subject: `Payment Overdue - ${order.orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        ${logoHtml}
        <h2 style="color: #dc3545; border-bottom: 2px solid #dc3545; padding-bottom: 10px;">⚠️ Payment Overdue</h2>
        <p>Dear ${order.buyer.name},</p>
        <p>This is a reminder that payment for your order is overdue.</p>
        <div style="background-color: #f8d7da; border: 1px solid #f5c6cb; border-radius: 5px; padding: 15px; margin: 20px 0;">
          <h3 style="color: #721c24; margin-top: 0;">Payment Details:</h3>
          <ul style="margin: 0; padding-left: 20px;">
            <li><strong>Order Number:</strong> ${order.orderNumber}</li>
            <li><strong>Amount Due:</strong> $${order.total.toFixed(2)}</li>
            <li><strong>Due Date:</strong> ${new Date(order.invoicedAt).toLocaleDateString()}</li>
          </ul>
        </div>
        <p>Please upload your payment receipt or contact us if you have any questions.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/orders" style="background-color: #dc3545; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">View Order</a>
        </div>
        <p>If you have any questions, please contact our support team.</p>
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center;">
          <p style="margin: 0; color: #666;">Best regards,<br><strong>Off Access Team</strong></p>
          <p style="margin: 5px 0 0 0; color: #666; font-size: 12px;">
            ${process.env.ADMIN_EMAIL || 'support@offaccess.com'}
          </p>
        </div>
      </div>
    `
  }),

  orderShipped: (order) => ({
    subject: `Order Shipped - ${order.orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        ${logoHtml}
        <h2 style="color: #28a745; border-bottom: 2px solid #28a745; padding-bottom: 10px;">🚚 Order Shipped!</h2>
        <p>Dear ${order.buyer.name},</p>
        <p>Your order has been shipped and is on its way to you.</p>
        <div style="background-color: #d4edda; border: 1px solid #c3e6cb; border-radius: 5px; padding: 15px; margin: 20px 0;">
          <h3 style="color: #155724; margin-top: 0;">Shipping Details:</h3>
          <ul style="margin: 0; padding-left: 20px;">
            <li><strong>Order Number:</strong> ${order.orderNumber}</li>
            <li><strong>Tracking Number:</strong> ${order.trackingNumber || 'To be provided'}</li>
            <li><strong>Shipping Method:</strong> ${order.shippingMethod}</li>
          </ul>
        </div>
        <p>You can track your order status in your portal dashboard.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/orders" style="background-color: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Track Order</a>
        </div>
        <p>If you have any questions, please contact our support team.</p>
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center;">
          <p style="margin: 0; color: #666;">Best regards,<br><strong>Off Access Team</strong></p>
          <p style="margin: 5px 0 0 0; color: #666; font-size: 12px;">
            ${process.env.ADMIN_EMAIL || 'support@offaccess.com'}
          </p>
        </div>
      </div>
    `
  }),

  finalInvoiceGenerated: (order) => ({
    subject: `Final Invoice Generated - ${order.orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        ${logoHtml}
        <h2 style="color: #007bff; border-bottom: 2px solid #007bff; padding-bottom: 10px;">📄 Final Invoice</h2>
        <p>Dear ${order.buyer.name},</p>
        <p>A final invoice has been generated for your order.</p>
        <div style="background-color: #f8f9fa; border: 1px solid #e9ecef; border-radius: 5px; padding: 15px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">Invoice Details:</h3>
          <ul style="margin: 0; padding-left: 20px;">
            <li><strong>Order Number:</strong> ${order.orderNumber}</li>
            <li><strong>Total Amount:</strong> $${order.total.toFixed(2)}</li>
            <li><strong>Due Date:</strong> ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</li>
          </ul>
        </div>
        <p>Please log into your portal to view and download the invoice.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/orders" style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">View Order</a>
        </div>
        <p>If you have any questions, please contact our support team.</p>
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center;">
          <p style="margin: 0; color: #666;">Best regards,<br><strong>Off Access Team</strong></p>
          <p style="margin: 5px 0 0 0; color: #666; font-size: 12px;">
            ${process.env.ADMIN_EMAIL || 'support@offaccess.com'}
          </p>
        </div>
      </div>
    `
  }),

  // Password Reset Email
  passwordReset: (userName, resetUrl) => ({
    subject: 'Password Reset Request - Off Access',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        ${logoHtml}
        <h2 style="color: #dc3545; border-bottom: 2px solid #dc3545; padding-bottom: 10px;">🔐 Password Reset Request</h2>
        <p>Dear ${userName},</p>
        <p>We received a request to reset your password for your Off Access account.</p>
        <div style="background-color: #f8f9fa; border: 1px solid #e9ecef; border-radius: 5px; padding: 15px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">Important Information:</h3>
          <ul style="margin: 0; padding-left: 20px;">
            <li>This link will expire in <strong>15 minutes</strong></li>
            <li>If you didn't request this reset, please ignore this email</li>
            <li>For security, this link can only be used once</li>
          </ul>
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #dc3545; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
        </div>
        <p>If the button above doesn't work, you can copy and paste this link into your browser:</p>
        <p style="word-break: break-all; background-color: #f8f9fa; padding: 10px; border-radius: 5px; font-family: monospace; font-size: 12px;">${resetUrl}</p>
        <p>If you have any questions or need assistance, please contact our support team.</p>
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center;">
          <p style="margin: 0; color: #666;">Best regards,<br><strong>Off Access Team</strong></p>
          <p style="margin: 5px 0 0 0; color: #666; font-size: 12px;">
            ${process.env.ADMIN_EMAIL || 'support@offaccess.com'}
          </p>
        </div>
      </div>
    `
  }),

  // Password Change Confirmation Email
  passwordChangeConfirmation: (userName) => ({
    subject: 'Password Change Confirmation - Off Access',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        ${logoHtml}
        <h2 style="color: #28a745; border-bottom: 2px solid #28a745; padding-bottom: 10px;">✅ Password Change Confirmation</h2>
        <p>Hi ${userName},</p>
        <p>This is a confirmation that your account password has been successfully changed.</p>
        <p>If you made this change, no further action is needed. However, if you did not request this change, please contact our support team immediately.</p>
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center;">
          <p style="margin: 0; color: #666;">Thank you,<br><strong>Off Access Team</strong></p>
          <p style="margin: 5px 0 0 0; color: #666; font-size: 12px;">
            ${process.env.ADMIN_EMAIL || 'support@offaccess.com'}
          </p>
        </div>
      </div>
    `
  })
};

// Send email function
const sendEmail = async (to, template, data) => {
  try {
    if (!to) {
      throw new Error('No recipient email address provided');
    }
    console.log('📧 Sending email:', { to, template, data: { name: data.name, email: data.email, status: data.status } });
    
    const emailContent = emailTemplates[template](data);
    
    const mailOptions = {
      from: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
      to: to,
      subject: emailContent.subject,
      html: emailContent.html
    };

    console.log('📧 Mail options:', { from: mailOptions.from, to: mailOptions.to, subject: mailOptions.subject });

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', result.messageId);
    return result;
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    throw error;
  }
};

// 1. Registration Completion Notification
const sendRegistrationConfirmation = async (buyer) => {
  try {
    await sendEmail(buyer.email, 'registrationConfirmation', buyer);
    console.log(`Registration confirmation sent to ${buyer.email}`);
  } catch (error) {
    console.error('Registration confirmation failed:', error);
    throw error;
  }
};

// 2. Registration Status Decision Notification
const sendStatusUpdateEmail = async (buyer, status, reason = null) => {
  try {
    const buyerObj = typeof buyer.toObject === 'function' ? buyer.toObject() : buyer;
    console.log('📧 sendStatusUpdateEmail called:', { 
      buyerEmail: buyerObj.email, 
      buyerName: buyerObj.name, 
      status, 
      reason 
    });
    
    await sendEmail(buyerObj.email, 'statusUpdate', { ...buyerObj, status, reason });
    console.log(`✅ Status update email sent to ${buyerObj.email} - Status: ${status}`);
  } catch (error) {
    console.error('❌ Status update email failed:', error);
    throw error;
  }
};

// 3. New StockFile Available Notification
const sendNewStockFileNotification = async (buyers, stockFile) => {
  try {
    const emailPromises = buyers.map(buyer => 
      sendEmail(buyer.email, 'newStockFileAvailable', { user: buyer, stockFile })
    );
    
    const results = await Promise.allSettled(emailPromises);
    const successful = results.filter(result => result.status === 'fulfilled').length;
    const failed = results.filter(result => result.status === 'rejected').length;
    
    console.log(`New stockFile notification sent to ${successful} buyers, ${failed} failed`);
    return { successful, failed };
  } catch (error) {
    console.error('New stockFile notification failed:', error);
    throw error;
  }
};

// 4. Order Status Change Notification
const sendOrderStatusUpdate = async (buyer, order) => {
  try {
    await sendEmail(buyer.email, 'orderStatusUpdate', { user: buyer, order });
    console.log(`Order status update sent to ${buyer.email} for order ${order.orderNumber || 'Unknown'}`);
  } catch (error) {
    console.error('Order status update failed:', error);
    throw error;
  }
};

// Legacy functions (keeping for backward compatibility)
const sendRegistrationNotification = async (buyer) => {
  try {
    // Send to admin (you can configure admin email in env)
    const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
    await sendEmail(adminEmail, 'registrationConfirmation', buyer);
  } catch (error) {
    console.error('Registration notification failed:', error);
  }
};

const sendOrderNotification = async (order, type) => {
  try {
    await sendEmail(order.buyer.email, type, order);
  } catch (error) {
    console.error('Order notification failed:', error);
  }
};

const sendPaymentReminder = async (order) => {
  try {
    await sendEmail(order.buyer.email, 'paymentOverdue', order);
  } catch (error) {
    console.error('Payment reminder failed:', error);
  }
};

// Password Reset Email Function
const sendPasswordResetEmail = async (email, userName, resetUrl) => {
  try {
    // Call the template directly with the correct parameters
    const emailContent = emailTemplates.passwordReset(userName, resetUrl);
    
    const mailOptions = {
      from: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
      to: email,
      subject: emailContent.subject,
      html: emailContent.html
    };

    console.log('📧 Password reset mail options:', { 
      from: mailOptions.from, 
      to: mailOptions.to, 
      subject: mailOptions.subject,
      userName,
      resetUrl
    });

    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Password reset email sent to ${email}`);
    return result;
  } catch (error) {
    console.error('Password reset email failed:', error);
    throw error;
  }
};

// Password Change Confirmation Email Function
const sendPasswordChangeConfirmationEmail = async (email, userName) => {
  try {
    const emailContent = emailTemplates.passwordChangeConfirmation(userName);
    const mailOptions = {
      from: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
      to: email,
      subject: emailContent.subject,
      html: emailContent.html
    };
    console.log('📧 Password change confirmation mail options:', {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject,
      userName
    });
    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Password change confirmation email sent to ${email}`);
    return result;
  } catch (error) {
    console.error('Password change confirmation email failed:', error);
    throw error;
  }
};

module.exports = {
  sendEmail,
  sendRegistrationConfirmation,
  sendStatusUpdateEmail,
  sendNewStockFileNotification,
  sendOrderStatusUpdate,
  sendRegistrationNotification,
  sendOrderNotification,
  sendPaymentReminder,
  sendPasswordResetEmail,
  sendPasswordChangeConfirmationEmail,
  emailTemplates
}; 