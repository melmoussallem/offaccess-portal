# 🗄️ Step 2: Database Setup Guide

## 🎯 **Objective: Set up MongoDB Atlas for Production**

### 📋 **What We'll Do:**
1. Create MongoDB Atlas account
2. Set up a cluster
3. Configure database access
4. Get connection string
5. Update environment variables
6. Test connection

## 🚀 **Step-by-Step Instructions:**

### **Step 1: Create MongoDB Atlas Account**

1. **Go to MongoDB Atlas**: https://cloud.mongodb.com
2. **Sign up** for a free account
3. **Create a new project** (e.g., "Digital Wholesale Catalogue")

### **Step 2: Create a Cluster**

1. **Click "Build a Database"**
2. **Choose "FREE" tier** (M0 Sandbox)
3. **Select your preferred cloud provider** (AWS, Google Cloud, or Azure)
4. **Choose a region** close to your users
5. **Click "Create"**

### **Step 3: Configure Database Access**

1. **Go to "Database Access"** in the left sidebar
2. **Click "Add New Database User"**
3. **Choose "Password" authentication**
4. **Create a username** (e.g., "digital-wholesale-admin")
5. **Generate a secure password** (save this!)
6. **Set privileges to "Read and write to any database"**
7. **Click "Add User"**

### **Step 4: Configure Network Access**

1. **Go to "Network Access"** in the left sidebar
2. **Click "Add IP Address"**
3. **For development**: Click "Allow Access from Anywhere" (0.0.0.0/0)
4. **For production**: Add your hosting provider's IP ranges
5. **Click "Confirm"**

### **Step 5: Get Connection String**

1. **Go to "Database"** in the left sidebar
2. **Click "Connect"** on your cluster
3. **Choose "Connect your application"**
4. **Copy the connection string**

### **Step 6: Update Your Environment**

Replace the connection string in your `.env` file:

```bash
# Replace this line:
MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/digital-wholesale-catalogue

# With your actual connection string from Atlas
MONGODB_URI=mongodb+srv://digital-wholesale-admin:your-actual-password@cluster0.xxxxx.mongodb.net/digital-wholesale-catalogue
```

## 🔧 **Quick Setup Commands:**

### **Test Database Connection:**
```bash
# Test if your connection string works
npm run setup
```

### **Initialize Database:**
```bash
# This will create the initial admin user and setup
npm run setup
```

## 📊 **MongoDB Atlas Features:**

### **Free Tier Includes:**
- ✅ 512MB storage
- ✅ Shared RAM
- ✅ Automatic backups
- ✅ Built-in security
- ✅ Global distribution

### **Production Features:**
- 🔒 **Security**: Network access controls
- 🔒 **Authentication**: Database users and roles
- 🔒 **Backups**: Automatic daily backups
- 📊 **Monitoring**: Real-time performance metrics
- 🔄 **Scaling**: Easy to upgrade as needed

## 🚨 **Security Best Practices:**

### **Database Security:**
- ✅ Use strong passwords
- ✅ Enable network access controls
- ✅ Use database users (not admin)
- ✅ Regular backups
- ✅ Monitor access logs

### **Connection String Security:**
- ✅ Never commit `.env` to git
- ✅ Use environment variables
- ✅ Rotate passwords regularly
- ✅ Use IP whitelisting

## 📞 **Next Steps After Database Setup:**

1. **Test the connection** with `npm run setup`
2. **Verify admin user creation**
3. **Test login functionality**
4. **Move to Step 3** (Email Configuration)

## 🆘 **Troubleshooting:**

### **Common Issues:**
- **Connection timeout**: Check network access settings
- **Authentication failed**: Verify username/password
- **Database not found**: Connection string format
- **IP not allowed**: Add your IP to network access

### **Get Help:**
- MongoDB Atlas Documentation
- Community Forums
- Support Chat (for paid plans)

## ✅ **Success Criteria:**

- [ ] MongoDB Atlas account created
- [ ] Cluster running
- [ ] Database user configured
- [ ] Network access configured
- [ ] Connection string updated in `.env`
- [ ] Database connection tested
- [ ] Initial setup completed

**Ready to proceed with database setup!** 🗄️ 