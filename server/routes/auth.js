const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');
const { notifyRegistrationCompletion, notifyRegistrationStatus } = require('../utils/notificationService');

const router = express.Router();

// Test route to verify auth routes are working
router.get('/test', (req, res) => {
  console.log('✅ Auth routes test endpoint reached');
  res.json({ message: 'Auth routes are working' });
});

// Generate JWT token
const generateToken = (userId) => {
  const jwtSecret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';
  return jwt.sign({ userId }, jwtSecret, { expiresIn: '7d' });
};

// Register new buyer
router.post('/register', async (req, res) => {
  try {
    console.log('=== REGISTRATION REQUEST START ===');
    console.log('Request body:', req.body);
    console.log('Content-Type:', req.headers['content-type']);

    const {
      name,
      email,
      password,
      phone,
      companyName,
      companyWebsite,
      companyAddress,
      buyerType
    } = req.body;

    // Validate required fields
    if (!name || !email || !password || !companyName) {
      console.log('Missing required fields:', { name: !!name, email: !!email, password: !!password, companyName: !!companyName });
      return res.status(400).json({ message: 'All required fields must be provided' });
    }

    // Validate companyAddress structure
    if (!companyAddress || !companyAddress.street || !companyAddress.city || !companyAddress.country) {
      console.log('Invalid company address:', companyAddress);
      return res.status(400).json({ message: 'Complete company address is required (street, city, country)' });
    }

    // Validate email format
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    if (!emailRegex.test(email)) {
      console.log('Invalid email format:', email);
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      console.log('Email already registered:', email);
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Validate buyerType
    const validBuyerTypes = ['Wholesale', 'Retail', 'Online'];
    const finalBuyerType = validBuyerTypes.includes(buyerType) ? buyerType : 'Retail';

    console.log('Creating new buyer with data:', {
      name,
      email,
      phone,
      companyName,
      companyAddress,
      buyerType: finalBuyerType
    });

    // Create new buyer
    const buyer = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      phone: phone || '',
      companyName: companyName.trim(),
      companyWebsite: companyWebsite || '',
      companyAddress: {
        street: companyAddress.street.trim(),
        city: companyAddress.city.trim(),
        country: companyAddress.country.trim()
      },
      buyerType: finalBuyerType,
      role: 'buyer',
      status: 'pending'
    });

    console.log('Buyer object created, saving to database...');
    await buyer.save();
    console.log('Buyer saved successfully with ID:', buyer._id);
    console.log('DEBUG: New buyer status after registration:', buyer.status);

    // Send registration completion notification to buyer
    try {
      await notifyRegistrationCompletion(buyer);
      console.log('Registration notification sent successfully');
    } catch (notificationError) {
      console.error('Failed to send registration notification:', notificationError);
      // Don't fail registration if notification fails
    }

    // Send notification to admins about new buyer registration
    console.log('🔔 Creating admin notification for new buyer registration...');
    
    try {
      const { notifyAdmins } = require('../utils/notificationService');
      console.log('✅ notifyAdmins function imported successfully');
      
      const adminNotificationResult = await notifyAdmins(
        'new_buyer_registration',
        '👤 New Buyer Registration',
        `A new buyer "${buyer.name}" (${buyer.companyName}) has registered and is awaiting approval.`,
        { buyer: buyer.toPublicJSON() }
      );
      
      console.log(`✅ Admin notification sent successfully. Created ${adminNotificationResult.length} notifications.`);
    } catch (adminNotificationError) {
      console.error('❌ Failed to send admin notification:', adminNotificationError);
      console.error('Error details:', adminNotificationError.message);
      console.error('Error stack:', adminNotificationError.stack);
      // Don't fail registration if admin notification fails
    }

    console.log('=== REGISTRATION REQUEST END ===');
    res.status(201).json({
      message: 'Registration successful. Your application is under review.',
      user: buyer.toPublicJSON()
    });

  } catch (error) {
    console.error('=== REGISTRATION ERROR ===');
    console.error('Error details:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    // Check for specific MongoDB errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      console.error('Validation errors:', validationErrors);
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: validationErrors 
      });
    }
    
    if (error.code === 11000) {
      console.error('Duplicate key error:', error.keyValue);
      return res.status(400).json({ message: 'Email already registered' });
    }
    
    res.status(500).json({ message: 'Registration failed. Please try again.' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findByEmail(email);
    if (!user) {
      console.error(`[LOGIN ERROR] User not found for email: ${email}`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    console.log('DEBUG: User status at login:', user.status, 'role:', user.role, 'isActive:', user.isActive);

    // Check if user is active
    if (!user.isActive) {
      console.error(`[LOGIN ERROR] Account deactivated for email: ${email}`);
      return res.status(401).json({ message: 'Account is deactivated' });
    }

    // Verify password
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      console.error(`[LOGIN ERROR] Invalid password for email: ${email}`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // For buyers, only allow login if status is approved
    if (user.role === 'buyer') {
      if (user.status !== 'approved') {
        return res.status(403).json({
          message: user.status === 'pending'
            ? 'Your account is pending approval. Please wait for admin approval.'
            : 'Access denied - account not approved',
          user: user.toPublicJSON()
        });
      }
    }

    // Update last login
    user.lastLogin = new Date();
    user.lastLoginAt = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.json({
      message: 'Login successful',
      user: user.toPublicJSON(),
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
});

// Get current user profile
router.get('/me', authenticateToken, async (req, res) => {
  console.log('--- /api/auth/me endpoint hit ---');
  try {
    const user = await User.findById(req.user._id).select('-password');
    console.log('User found for /me:', user);
    res.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Failed to get profile' });
  }
});

// Update user profile
router.put('/me', authenticateToken, async (req, res) => {
  try {
    console.log('Profile update request received');
    console.log('User ID:', req.user._id);
    console.log('Request body:', req.body);
    
    const { name, phone, companyName, companyWebsite, companyAddress, buyerType } = req.body;
    
    const user = await User.findById(req.user._id);
    if (!user) {
      console.log('User not found');
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('Current user data:', {
      name: user.name,
      phone: user.phone,
      companyName: user.companyName,
      companyWebsite: user.companyWebsite,
      companyAddress: user.companyAddress,
      buyerType: user.buyerType
    });

    // Update allowed fields
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (companyName) user.companyName = companyName;
    if (companyWebsite) user.companyWebsite = companyWebsite;
    if (companyAddress) user.companyAddress = companyAddress;
    
    // Validate buyerType if provided
    if (buyerType) {
      const validBuyerTypes = ['Wholesale', 'Retail', 'Online'];
      if (validBuyerTypes.includes(buyerType)) {
        user.buyerType = buyerType;
      } else {
        return res.status(400).json({ 
          message: 'Invalid buyer type. Must be one of: Wholesale, Retail, Online' 
        });
      }
    }

    console.log('Updated user data:', {
      name: user.name,
      phone: user.phone,
      companyName: user.companyName,
      companyWebsite: user.companyWebsite,
      companyAddress: user.companyAddress,
      buyerType: user.buyerType
    });

    await user.save();
    console.log('User saved successfully');

    res.json({
      message: 'Profile updated successfully',
      user: user.toPublicJSON()
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
});

// Check if email exists
router.post('/check-email', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const existingUser = await User.findByEmail(email);
    res.json({ available: !existingUser });
    
  } catch (error) {
    console.error('Email check error:', error);
    res.status(500).json({ message: 'Failed to check email' });
  }
});

// Change password
router.put('/change-password', authenticateToken, async (req, res) => {
  console.log('🔐 CHANGE PASSWORD ROUTE REACHED - BEFORE ANYTHING ELSE');
  try {
    console.log('🔐 Change password request received');
    console.log('User ID:', req.user._id);
    console.log('Request body:', req.body);
    
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      console.log('❌ User not found');
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('✅ User found:', user.email);

    // Verify current password
    const isValidPassword = await user.comparePassword(currentPassword);
    if (!isValidPassword) {
      console.log('❌ Current password is incorrect');
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    console.log('✅ Current password verified');

    // Update password
    user.password = newPassword;
    await user.save();
    console.log('✅ Password updated successfully');

    // Send password change confirmation email (non-blocking)
    console.log('📧 About to send password change confirmation email to:', user.email);
    try {
      const { sendPasswordChangeConfirmationEmail } = require('../utils/emailService');
      await sendPasswordChangeConfirmationEmail(user.email, user.name);
      console.log('✅ Password change confirmation email sent successfully');
    } catch (emailError) {
      console.error('❌ Failed to send password change confirmation email:', emailError);
    }

    console.log('🔐 Change password request completed successfully');
    res.json({ message: 'Password changed successfully' });

  } catch (error) {
    console.error('❌ Change password error:', error);
    res.status(500).json({ message: 'Failed to change password' });
  }
});

// Refresh token
router.post('/refresh', authenticateToken, async (req, res) => {
  try {
    const token = generateToken(req.user._id);
    res.json({ token });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({ message: 'Failed to refresh token' });
  }
});

// Logout user
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    // In a more sophisticated setup, you might want to:
    // 1. Add the token to a blacklist
    // 2. Update user's last logout time
    // 3. Clear any server-side sessions
    
    // For now, we'll just return success since the frontend handles token removal
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Logout failed' });
  }
});

// Forgot password - send reset email
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Find user by email
    const user = await User.findByEmail(email);
    
    // Always return success to prevent email enumeration
    if (!user) {
      return res.json({ 
        message: 'If an account with that email exists, a password reset link has been sent.' 
      });
    }

    // Generate reset token
    const resetToken = user.generatePasswordResetToken();
    await user.save();

    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;

    // Send email
    try {
      const { sendPasswordResetEmail } = require('../utils/emailService');
      await sendPasswordResetEmail(user.email, user.name, resetUrl);
      console.log(`Password reset email sent to ${user.email}`);
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
      // Clear the token if email fails
      user.clearPasswordResetToken();
      await user.save();
      
      // Check if it's an email configuration error
      if (emailError.message && emailError.message.includes('Invalid login')) {
        return res.status(500).json({ 
          message: 'Email service is not configured. Please contact the administrator.' 
        });
      }
      
      return res.status(500).json({ message: 'Failed to send reset email. Please try again.' });
    }

    res.json({ 
      message: 'If an account with that email exists, a password reset link has been sent.' 
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Failed to process request' });
  }
});

// Reset password with token
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Token and new password are required' });
    }

    // Find user by reset token
    const user = await User.findByResetToken(token);
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Update password
    user.password = newPassword;
    user.clearPasswordResetToken();
    await user.save();

    // Send password change confirmation email (non-blocking)
    try {
      const { sendPasswordChangeConfirmationEmail } = require('../utils/emailService');
      await sendPasswordChangeConfirmationEmail(user.email, user.name);
    } catch (emailError) {
      console.error('Failed to send password change confirmation email:', emailError);
    }

    res.json({ message: 'Password has been reset successfully' });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Failed to reset password' });
  }
});

// Verify reset token
router.get('/verify-reset-token/:token', async (req, res) => {
  try {
    const { token } = req.params;
    
    const user = await User.findByResetToken(token);
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    res.json({ message: 'Token is valid' });

  } catch (error) {
    console.error('Verify reset token error:', error);
    res.status(500).json({ message: 'Failed to verify token' });
  }
});

module.exports = router; 