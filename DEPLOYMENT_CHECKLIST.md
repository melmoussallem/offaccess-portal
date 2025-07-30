# 🚀 Deployment Checklist

## ✅ Pre-Deployment Checklist

### 1. Environment Configuration
- [ ] Copy `env.production.example` to `.env`
- [ ] Update `MONGODB_URI` with your production MongoDB connection string
- [ ] Set a strong `JWT_SECRET` (use a secure random string)
- [ ] Configure `FRONTEND_URL` with your actual domain
- [ ] Set up email configuration (`EMAIL_USER`, `EMAIL_PASS`)
- [ ] Set `NODE_ENV=production`

### 2. Database Setup
- [ ] Set up MongoDB Atlas or your preferred MongoDB hosting
- [ ] Create production database
- [ ] Test database connection
- [ ] Run initial setup: `npm run setup`

### 3. Security Configuration
- [ ] Change default admin password
- [ ] Update JWT secret
- [ ] Configure CORS with your actual domain
- [ ] Set up SSL/HTTPS
- [ ] Configure rate limiting for production

### 4. File Storage
- [ ] Set up Google Drive API credentials
- [ ] Configure upload folder
- [ ] Test file upload functionality

### 5. Email Configuration
- [ ] Set up Gmail App Password or alternative email service
- [ ] Test email notifications
- [ ] Configure admin email address

### 6. Frontend Configuration
- [ ] Set `REACT_APP_API_URL` environment variable
- [ ] Build frontend: `npm run build`
- [ ] Test production build locally

## 🚨 Critical Issues Fixed

### ✅ Fixed Issues:
- [x] Hardcoded localhost URLs in NotificationContext
- [x] Hardcoded MongoDB connection in server
- [x] CORS configuration for production
- [x] Environment variable usage

### ⚠️ Still Need Attention:
- [ ] Update domain URLs in production
- [ ] Configure SSL certificates
- [ ] Set up proper logging
- [ ] Configure backup strategy

## 📋 Deployment Steps

### 1. Prepare Environment
```bash
# Copy production environment template
cp env.production.example .env

# Edit .env with your actual values
# Update MONGODB_URI, JWT_SECRET, FRONTEND_URL, etc.
```

### 2. Build Application
```bash
# Install dependencies
npm run install-all

# Build frontend
npm run build
```

### 3. Deploy Backend
- Choose your hosting platform (Heroku, Railway, DigitalOcean, etc.)
- Set environment variables
- Deploy server code
- Test API endpoints

### 4. Deploy Frontend
- Deploy to Vercel, Netlify, or your preferred hosting
- Set `REACT_APP_API_URL` environment variable
- Configure custom domain

### 5. Post-Deployment
- [ ] Test all functionality
- [ ] Monitor error logs
- [ ] Set up monitoring/analytics
- [ ] Configure backups
- [ ] Set up CI/CD pipeline

## 🔧 Environment Variables Required

### Backend (.env):
```
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secure-secret
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
FRONTEND_URL=https://yourdomain.com
NODE_ENV=production
```

### Frontend (Environment Variables):
```
REACT_APP_API_URL=https://your-api-domain.com
```

## 🛡️ Security Checklist

- [ ] Strong JWT secret
- [ ] HTTPS enabled
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Input validation
- [ ] SQL injection protection
- [ ] XSS protection
- [ ] CSRF protection

## 📊 Monitoring Setup

- [ ] Error logging
- [ ] Performance monitoring
- [ ] Uptime monitoring
- [ ] Database monitoring
- [ ] Email delivery monitoring

## 🚨 Emergency Contacts

- Database admin
- Hosting provider support
- Domain registrar
- Email service provider 