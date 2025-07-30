# 📧 Step 3: Email Configuration Guide

## 🎯 **Objective: Set up Gmail App Password for Email Notifications**

### 📋 **What We'll Do:**
1. Enable 2-Factor Authentication on Gmail
2. Generate Gmail App Password
3. Update environment variables
4. Test email functionality

## 🚀 **Step-by-Step Instructions:**

### **Step 1: Enable 2-Factor Authentication**

1. **Go to Google Account Settings**: https://myaccount.google.com/
2. **Click "Security"** in the left sidebar
3. **Find "2-Step Verification"** and click on it
4. **Enable 2-Step Verification** if not already enabled
5. **Follow the setup process** (usually involves your phone)

### **Step 2: Generate Gmail App Password**

1. **Go to Google Account Settings**: https://myaccount.google.com/
2. **Click "Security"** in the left sidebar
3. **Find "App passwords"** (under "2-Step Verification")
4. **Click "App passwords"**
5. **Select "Mail"** from the dropdown
6. **Select "Other (Custom name)"** and enter: `Digital Wholesale Catalogue`
7. **Click "Generate"**
8. **Copy the 16-character password** (it looks like: `abcd efgh ijkl mnop`)

### **Step 3: Update Your Environment Variables**

Update your `.env` file with your Gmail credentials:

```bash
# Email Configuration
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-16-character-app-password
ADMIN_EMAIL=your-gmail@gmail.com
```

### **Step 4: Test Email Configuration**

Once you've updated the `.env` file, we'll test it with:
```bash
node test-email-configuration.js
```

## 🔧 **Gmail App Password Features:**

### **Security Benefits:**
- ✅ **Separate from your main password**
- ✅ **Can be revoked without affecting main account**
- ✅ **Specific to your application**
- ✅ **More secure than regular password**

### **What It's Used For:**
- 📧 **Buyer registration notifications**
- 📧 **Order status updates**
- 📧 **Admin notifications**
- 📧 **Password reset emails**
- 📧 **System alerts**

## 🚨 **Security Best Practices:**

### **App Password Security:**
- ✅ **Never share** your app password
- ✅ **Store securely** in environment variables
- ✅ **Revoke if compromised**
- ✅ **Use different passwords** for different apps

### **Environment Variables:**
- ✅ **Never commit** `.env` to git
- ✅ **Use strong passwords**
- ✅ **Rotate regularly**
- ✅ **Keep backups**

## 📞 **Next Steps After Email Setup:**

1. **Test email functionality**
2. **Verify all notification types**
3. **Move to Step 4** (Domain Configuration)
4. **Deploy to production**

## 🆘 **Troubleshooting:**

### **Common Issues:**
- **"Invalid credentials"**: Check app password format
- **"Less secure apps"**: Use app password instead
- **"Authentication failed"**: Verify 2FA is enabled
- **"Connection timeout"**: Check internet connection

### **Get Help:**
- Google Account Help Center
- Gmail Support
- Application logs

## ✅ **Success Criteria:**

- [ ] 2-Factor Authentication enabled
- [ ] Gmail App Password generated
- [ ] Environment variables updated
- [ ] Email functionality tested
- [ ] All notification types working

**Ready to set up your email configuration!** 📧 