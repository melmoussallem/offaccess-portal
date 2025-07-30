# 🚀 Deployment Guide: Vercel + Railway + Custom Domain

## 📋 **Prerequisites**
- ✅ Domain name (you already have one)
- ✅ GitHub account
- ✅ Vercel account (free)
- ✅ Railway account (free tier)

## 🎯 **Step 1: Prepare Your Application**

### **1.1 Update Environment Variables**
Create a `.env.production` file with your domain:

```bash
# Production Environment Configuration
MONGODB_URI=mongodb+srv://melmoussallem:aQI5qbL23FKti3cV@cluster0.gjbkrwp.mongodb.net/digital-wholesale-catalogue?retryWrites=true&w=majority
JWT_SECRET=c4e636a44a346e72420e576d21bcd4ff6690e2d131d1e0b998fcb71a7e46ff8c
EMAIL_USER=melmoussallem@gmail.com
EMAIL_PASS=wmyj okmb jeon vvbw
ADMIN_EMAIL=melmoussallem@gmail.com
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://YOUR-DOMAIN.com
```

**Replace `YOUR-DOMAIN.com` with your actual domain!**

### **1.2 Update Frontend API URL**
In `client/src/contexts/NotificationContext.js` and any other files, make sure they use:
```javascript
process.env.REACT_APP_API_URL || 'https://your-backend-url.railway.app'
```

## 🎯 **Step 2: Deploy Backend to Railway**

### **2.1 Create Railway Account**
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Get $5 free credit

### **2.2 Deploy Backend**
1. **Connect GitHub repository**
2. **Select your repository**
3. **Set environment variables:**
   ```
   MONGODB_URI=mongodb+srv://melmoussallem:aQI5qbL23FKti3cV@cluster0.gjbkrwp.mongodb.net/digital-wholesale-catalogue?retryWrites=true&w=majority
   JWT_SECRET=c4e636a44a346e72420e576d21bcd4ff6690e2d131d1e0b998fcb71a7e46ff8c
   EMAIL_USER=melmoussallem@gmail.com
   EMAIL_PASS=wmyj okmb jeon vvbw
   ADMIN_EMAIL=melmoussallem@gmail.com
   NODE_ENV=production
   FRONTEND_URL=https://YOUR-DOMAIN.com
   ```
4. **Deploy** - Railway will automatically detect it's a Node.js app
5. **Get your backend URL** (e.g., `https://your-app.railway.app`)

## 🎯 **Step 3: Deploy Frontend to Vercel**

### **3.1 Create Vercel Account**
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub

### **3.2 Deploy Frontend**
1. **Import your GitHub repository**
2. **Configure build settings:**
   - **Framework Preset:** Create React App
   - **Root Directory:** `./client`
   - **Build Command:** `npm run build`
   - **Output Directory:** `build`
3. **Set environment variable:**
   ```
   REACT_APP_API_URL=https://your-backend-url.railway.app
   ```
4. **Deploy** - Vercel will build and deploy your React app

## 🎯 **Step 4: Connect Your Domain**

### **4.1 Connect Domain to Vercel (Frontend)**
1. In Vercel dashboard, go to your project
2. Click **Settings** → **Domains**
3. Add your domain (e.g., `yourdomain.com`)
4. Follow DNS configuration instructions
5. Wait for DNS propagation (5-10 minutes)

### **4.2 Connect Domain to Railway (Backend)**
1. In Railway dashboard, go to your service
2. Click **Settings** → **Domains**
3. Add your domain with subdomain (e.g., `api.yourdomain.com`)
4. Follow DNS configuration instructions

## 🎯 **Step 5: Update Environment Variables**

### **5.1 Update Frontend Environment**
In Vercel, update the environment variable:
```
REACT_APP_API_URL=https://api.yourdomain.com
```

### **5.2 Update Backend Environment**
In Railway, update:
```
FRONTEND_URL=https://yourdomain.com
```

## 🎯 **Step 6: Test Your Deployment**

### **6.1 Test Frontend**
- Visit `https://yourdomain.com`
- Should load your React app

### **6.2 Test Backend**
- Visit `https://api.yourdomain.com`
- Should show API information

### **6.3 Test Login**
- Use admin credentials: `admin@example.com` / `password123`
- Should work with your domain

## 🔧 **Troubleshooting**

### **Common Issues:**
1. **CORS Errors:** Make sure `FRONTEND_URL` is set correctly in Railway
2. **API Not Found:** Check that `REACT_APP_API_URL` is set in Vercel
3. **Domain Not Working:** Wait for DNS propagation (up to 24 hours)

### **DNS Configuration:**
- **A Record:** Point to Vercel's IP
- **CNAME Record:** Point subdomain to Railway URL

## 💰 **Cost Breakdown:**
- **Vercel:** Free tier
- **Railway:** Free tier ($5 credit)
- **Domain:** $10-15/year (you already have)
- **MongoDB Atlas:** Free tier
- **Total:** $0-5/month

## 🎉 **Success!**
Your application is now live at `https://yourdomain.com` with:
- ✅ Professional domain
- ✅ SSL certificate
- ✅ Fast CDN
- ✅ Automatic deployments
- ✅ Email notifications working

**Need help with any step? Let me know!** 🚀 