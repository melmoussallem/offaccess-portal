# Fix Password Reset URL - Update FRONTEND_URL

## 🚨 **Issue**
Password reset emails are sending links to `https://offaccess-portal.vercel.app` which returns 404 errors.

## ✅ **Solution**
Update the `FRONTEND_URL` environment variable in Railway to point to the correct domain.

## 🔧 **Steps to Fix**

### **Option 1: Railway Dashboard (Recommended)**

1. **Go to Railway Dashboard**
   - Visit: https://railway.app/dashboard
   - Select your project

2. **Navigate to Variables**
   - Click on your service
   - Go to the **"Variables"** tab

3. **Update FRONTEND_URL**
   - Find `FRONTEND_URL` in the list
   - Click the edit button (pencil icon)
   - Change the value from: `https://offaccess.com`
   - To: `https://portal.offaccess.com`
   - Click **"Save"**

4. **Redeploy**
   - Click **"Deploy"** to restart your service

### **Option 2: Railway CLI (if installed)**

```bash
# Install Railway CLI if not installed
npm install -g @railway/cli

# Login to Railway
railway login

# Set the environment variable
railway variables set FRONTEND_URL=https://portal.offaccess.com

# Deploy the changes
railway up
```

## 🧪 **Test the Fix**

1. **Request a password reset** from the login page
2. **Check the email** - the reset link should now be:
   ```
   https://portal.offaccess.com/reset-password/[token]
   ```
3. **Click the link** - it should work without 404 errors

## 📝 **What Changed**

- **Before**: `FRONTEND_URL=https://offaccess.com`
- **After**: `FRONTEND_URL=https://portal.offaccess.com`

This matches the CORS configuration and the working logo URL in emails.

## 🔍 **Verification**

After updating, all email links will point to the correct domain:
- ✅ Password reset links
- ✅ Order notification links  
- ✅ Catalogue notification links
- ✅ All other email links
