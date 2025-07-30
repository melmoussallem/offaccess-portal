# Digital Wholesale Catalogue

A comprehensive digital wholesale catalogue platform for fashion businesses with role-based access control, Excel-based ordering, and integrated payment tracking.

## Features

### 👤 Authentication & Roles
- Custom email/password login system
- Role-based access: Admin and Buyer
- Buyer status management (Pending, Approved, Rejected)

### 📋 Buyer Registration
- Complete registration form with company details
- Automatic status assignment and admin notification

### 🧑‍💼 Admin Panel
- Buyer management with status control
- Catalogue visibility management
- Order review and approval system

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

## Tech Stack

- **Frontend**: React, Material-UI, Handsontable
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **File Processing**: SheetJS, Multer
- **PDF Generation**: PDFKit
- **Real-time**: Socket.io

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm run install-all
   ```

2. **Environment Setup**
   Create a `.env` file in the root directory:
   ```
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_email_app_password
   PORT=5000
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## Default Admin Account

After first run, create an admin account through the registration form or directly in the database.

## File Structure

```
├── client/                 # React frontend
├── server/                 # Node.js backend
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── middleware/        # Custom middleware
│   └── utils/             # Utility functions
├── uploads/               # File uploads
└── docs/                  # Documentation
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Buyer registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Buyers
- `GET /api/buyers` - Get all buyers (Admin)
- `PUT /api/buyers/:id/status` - Update buyer status (Admin)

### Catalogue
- `GET /api/catalogue` - Get catalogue files
- `POST /api/catalogue/upload` - Upload Excel files (Admin)
- `GET /api/catalogue/:fileId` - Get specific file

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders` - Get orders
- `PUT /api/orders/:id/status` - Update order status

### Invoices
- `POST /api/invoices/generate` - Generate invoice
- `POST /api/invoices/:id/payment` - Upload payment receipt

## License

MIT 