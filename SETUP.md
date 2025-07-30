# Digital Wholesale Catalogue - Setup Guide

This guide will help you set up and run the Digital Wholesale Catalogue on your local machine.

## Prerequisites

Before you begin, make sure you have the following installed:

- **Node.js** (v16 or higher)
- **npm** (comes with Node.js)
- **MongoDB** (v4.4 or higher)
- **Git** (for cloning the repository)

## Installation Steps

### 1. Clone and Install Dependencies

```bash
# Install all dependencies (both backend and frontend)
npm run install-all
```

### 2. Environment Configuration

1. Copy the example environment file:
   ```bash
   cp env.example .env
   ```

2. Edit the `.env` file with your configuration:
   ```env
   # Database Configuration
   MONGODB_URI=mongodb://localhost:27017/digital-wholesale-catalogue
   
   # JWT Configuration (change this in production!)
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   
   # Email Configuration (Gmail)
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   ADMIN_EMAIL=admin@yourcompany.com
   
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   
   # Frontend URL
   FRONTEND_URL=http://localhost:3000
   ```

### 3. Database Setup

1. Start MongoDB:
   ```bash
   # On Windows
   mongod
   
   # On macOS/Linux
   sudo systemctl start mongod
   ```

2. Initialize the database with sample data:
   ```bash
   npm run setup
   ```

This will create:
- Admin user: `admin@example.com` / `password123`
- Sample buyer: `buyer@example.com` / `password123`
- Sample catalogue with Excel file

### 4. Install Frontend Dependencies

```powershell
cd client
& "C:\Program Files\nodejs\npm.cmd" install
```

### 5. Start the Application

```bash
# Start both backend and frontend in development mode
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

## Features Overview

### 👤 Authentication & Roles
- **Admin**: Full access to all features
- **Buyer**: Limited access based on approval status
- **Status Management**: Pending → Approved/Rejected

### 📋 Buyer Registration
- Multi-step registration form
- Company information collection
- Automatic status assignment

### 🧑‍💼 Admin Panel
- Buyer management with status control
- Catalogue visibility management
- Order review and approval

### 📁 Catalogue Management
- Brand-based folder structure
- Excel file upload and management
- Granular visibility controls

### 📄 Excel Integration
- Inline Excel viewer and editor
- Role-based editing permissions
- Order submission workflow

### 🛍️ Order Management
- Complete order lifecycle tracking
- Pro forma and final invoice generation
- Payment receipt upload and verification

### 💬 Live Chat
- WhatsApp integration for customer support

### 🔔 Notifications
- Automated email notifications
- Real-time status updates

## Testing the Application

### 1. Admin Login
- Email: `admin@example.com`
- Password: `password123`

**Admin Features:**
- View and manage buyers
- Upload Excel catalogues
- Review and approve orders
- Generate invoices
- View analytics

### 2. Buyer Login
- Email: `buyer@example.com`
- Password: `password123`

**Buyer Features:**
- Browse catalogues
- Edit Excel files (quantity columns only)
- Submit orders
- View order status
- Upload payment receipts

### 3. Excel File Testing
1. Login as admin
2. Go to Catalogue section
3. Upload an Excel file
4. Login as buyer
5. Open the Excel file
6. Edit quantities and submit order

## File Structure

```
├── client/                 # React frontend
│   ├── public/            # Static files
│   └── src/               # React components
│       ├── components/    # Reusable components
│       ├── contexts/      # React contexts
│       ├── pages/         # Page components
│       └── utils/         # Utility functions
├── server/                # Node.js backend
│   ├── models/           # MongoDB models
│   ├── routes/           # API routes
│   ├── middleware/       # Custom middleware
│   └── utils/            # Utility functions
├── uploads/              # File uploads
├── setup.js              # Database initialization
└── package.json          # Project configuration
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Buyer registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Buyers (Admin)
- `GET /api/buyers` - Get all buyers
- `PUT /api/buyers/:id/status` - Update buyer status

### Catalogue
- `GET /api/catalogue` - Get catalogue files
- `POST /api/catalogue/upload` - Upload Excel files
- `GET /api/catalogue/file/:fileId` - Get specific file

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders` - Get orders
- `PUT /api/orders/:id/status` - Update order status

### Invoices
- `POST /api/invoices/generate-proforma/:orderId` - Generate pro forma invoice
- `POST /api/invoices/generate-final/:orderId` - Generate final invoice

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check the connection string in `.env`

2. **Email Not Working**
   - Verify Gmail credentials
   - Enable 2-factor authentication
   - Generate app password

3. **Port Already in Use**
   - Change PORT in `.env`
   - Kill existing processes

4. **Module Not Found Errors**
   - Run `npm run install-all`
   - Clear node_modules and reinstall

### Development Tips

1. **Hot Reload**: Both frontend and backend support hot reloading
2. **Database Reset**: Run `npm run setup` to reset with sample data
3. **Logs**: Check console for detailed error messages
4. **Network Tab**: Use browser dev tools to debug API calls

## Production Deployment

For production deployment:

1. Set `NODE_ENV=production`
2. Use a production MongoDB instance
3. Configure proper JWT secrets
4. Set up email service
5. Build the frontend: `npm run build`
6. Use a process manager like PM2
7. Set up reverse proxy (nginx)
8. Configure SSL certificates

## Support

For issues and questions:
- Check the troubleshooting section
- Review the API documentation
- Check browser console for errors
- Verify all environment variables are set

## License

MIT License - see LICENSE file for details. 