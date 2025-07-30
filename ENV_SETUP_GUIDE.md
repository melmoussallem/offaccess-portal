# 🔧 Environment Setup Guide

## ✅ Step 1 Complete: `.env` file created!

Your `.env` file has been created successfully. Now you need to update the following critical values:

## 🔑 **CRITICAL UPDATES NEEDED:**

### 1. **JWT_SECRET** (SECURITY - UPDATE IMMEDIATELY)
```bash
# Replace this line in your .env file:
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# With this secure secret:
JWT_SECRET=c4e636a44a346e72420e576d21bcd4ff6690e2d131d1e0b998fcb71a7e46ff8c
```

### 2. **NODE_ENV** (For Development)
```bash
# Change this line:
NODE_ENV=production

# To this for development:
NODE_ENV=development
```

### 3. **FRONTEND_URL** (For Development)
```bash
# Change this line:
FRONTEND_URL=https://yourdomain.com

# To this for development:
FRONTEND_URL=http://localhost:3000
```

## 📋 **OPTIONAL UPDATES (For Production):**

### 4. **MONGODB_URI** (When you have a database)
```bash
# Replace with your MongoDB Atlas connection string:
MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/digital-wholesale-catalogue
```

### 5. **Email Configuration** (When you have email setup)
```bash
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
ADMIN_EMAIL=admin@yourdomain.com
```

## 🚀 **Quick Setup for Development:**

Open your `.env` file and make these changes:

```bash
# Database Configuration
MONGODB_URI=mongodb://127.0.0.1:27017/digital-wholesale-catalogue

# JWT Configuration
JWT_SECRET=c4e636a44a346e72420e576d21bcd4ff6690e2d131d1e0b998fcb71a7e46ff8c

# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
ADMIN_EMAIL=admin@yourdomain.com

# Server Configuration
PORT=5000
NODE_ENV=development

# Frontend URL (for email links and CORS)
FRONTEND_URL=http://localhost:3000
```

## ✅ **What's Ready:**

- ✅ `.env` file created
- ✅ Secure JWT secret generated
- ✅ Development configuration ready

## 📞 **Next Steps:**

1. **Update your `.env` file** with the values above
2. **Test locally** with `npm run dev`
3. **Set up MongoDB** (local or Atlas)
4. **Configure email** (when ready for production)

## 🔒 **Security Note:**

The JWT secret I generated is cryptographically secure. Keep it safe and don't share it publicly! 