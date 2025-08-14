const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('./server/models/User');
const Catalogue = require('./server/models/Catalogue');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/digital-wholesale-catalogue', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB for setup'))
.catch(err => console.error('MongoDB connection error:', err));

// Create admin user
const createAdminUser = async () => {
  try {
    const existingAdmin = await User.findOne({ email: 'info@offaccess.com' });
    
    if (!existingAdmin) {
      const adminUser = new User({
        name: 'Admin User',
        email: 'info@offaccess.com',
        password: 'password123',
        role: 'admin',
        status: 'approved',
        isActive: true
      });
      
      await adminUser.save();
      console.log('✅ Admin user created successfully');
    } else {
      console.log('ℹ️  Admin user already exists');
    }
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  }
};

// Create sample buyer
const createSampleBuyer = async () => {
  try {
    const existingBuyer = await User.findOne({ email: 'mmoussallem@mba2025.hbs.edu' });
    
    if (!existingBuyer) {
      const buyerUser = new User({
        name: 'Sample Buyer',
        email: 'mmoussallem@mba2025.hbs.edu',
        password: 'password123',
        role: 'buyer',
        status: 'approved',
        phone: '+1234567890',
        companyName: 'Sample Boutique',
        companyWebsite: 'https://sampleboutique.com',
        companyAddress: {
          street: '123 Fashion Street',
          city: 'New York',
          country: 'USA'
        },
        buyerType: 'Boutique Store',
        isActive: true
      });
      
      await buyerUser.save();
      console.log('✅ Sample buyer created successfully');
    } else {
      console.log('ℹ️  Sample buyer already exists');
    }
  } catch (error) {
    console.error('❌ Error creating sample buyer:', error);
  }
};

// Create additional sample buyers for testing
const createAdditionalBuyers = async () => {
  try {
    const additionalBuyers = [
      {
        name: 'John Smith',
        email: 'john@fashionoutlet.com',
        password: 'password123',
        role: 'buyer',
        status: 'pending',
        phone: '+1987654321',
        companyName: 'Fashion Outlet Chain',
        companyWebsite: 'https://fashionoutlet.com',
        companyAddress: {
          street: '456 Retail Avenue',
          city: 'Los Angeles',
          country: 'USA'
        },
        buyerType: 'Outlet Chain',
        adminNotes: 'Large chain store, good potential customer',
        isActive: true
      },
      {
        name: 'Sarah Johnson',
        email: 'sarah@ecommerce.com',
        password: 'password123',
        role: 'buyer',
        status: 'approved',
        phone: '+1555123456',
        companyName: 'Online Fashion Store',
        companyWebsite: 'https://onlinefashion.com',
        companyAddress: {
          street: '789 Digital Drive',
          city: 'San Francisco',
          country: 'USA'
        },
        buyerType: 'E-Commerce',
        adminNotes: 'Fast-growing e-commerce platform',
        brandAccess: ['nike', 'adidas', 'puma'],
        isActive: true
      },
      {
        name: 'Mike Wilson',
        email: 'mike@boutique.com',
        password: 'password123',
        role: 'buyer',
        status: 'rejected',
        phone: '+1444567890',
        companyName: 'Downtown Boutique',
        companyWebsite: 'https://downtownboutique.com',
        companyAddress: {
          street: '321 Main Street',
          city: 'Chicago',
          country: 'USA'
        },
        buyerType: 'Boutique Store',
        adminNotes: 'Small boutique, limited order volume',
        isActive: false
      },
      {
        name: 'Lisa Chen',
        email: 'lisa@luxuryboutique.com',
        password: 'password123',
        role: 'buyer',
        status: 'pending',
        phone: '+1333456789',
        companyName: 'Luxury Boutique',
        companyWebsite: 'https://luxuryboutique.com',
        companyAddress: {
          street: '654 Luxury Lane',
          city: 'Miami',
          country: 'USA'
        },
        buyerType: 'Boutique Store',
        adminNotes: 'High-end boutique, premium customer',
        isActive: true
      }
    ];

    for (const buyerData of additionalBuyers) {
      const existingBuyer = await User.findOne({ email: buyerData.email });
      if (!existingBuyer) {
        const buyer = new User(buyerData);
        await buyer.save();
        console.log(`✅ Created buyer: ${buyerData.name} (${buyerData.status})`);
      } else {
        console.log(`ℹ️  Buyer already exists: ${buyerData.name}`);
      }
    }
  } catch (error) {
    console.error('❌ Error creating additional buyers:', error);
  }
};

// Create sample catalogue
const createSampleCatalogue = async () => {
  try {
    const existingCatalogue = await Catalogue.findOne({ brandName: 'Sample Brand' });
    
    if (!existingCatalogue) {
      const adminUser = await User.findOne({ role: 'admin' });
      
      const sampleCatalogue = new Catalogue({
        brandName: 'Sample Brand',
        description: 'A sample brand for demonstration purposes',
        createdBy: adminUser._id,
        files: [
          {
            fileName: 'sample-product-list.xlsx',
            originalName: 'Product List.xlsx',
            filePath: '/uploads/catalogue/sample-file.xlsx',
            fileSize: 1024,
            mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            fileType: 'product_list',
            visibility: 'all_approved',
            uploadedBy: adminUser._id,
            sheetData: {
              headers: ['SKU', 'Product Name', 'Description', 'Unit Price', 'Available Quantity', 'Desired Quantity'],
              data: [
                ['SKU001', 'Sample Product 1', 'A sample product description', 25.99, 100, 0],
                ['SKU002', 'Sample Product 2', 'Another sample product', 45.50, 50, 0],
                ['SKU003', 'Sample Product 3', 'Third sample product', 32.75, 75, 0]
              ]
            },
            columns: [
              { name: 'SKU', type: 'string', editable: false },
              { name: 'Product Name', type: 'string', editable: false },
              { name: 'Description', type: 'string', editable: false },
              { name: 'Unit Price', type: 'number', editable: false },
              { name: 'Available Quantity', type: 'number', editable: false },
              { name: 'Desired Quantity', type: 'number', editable: true }
            ]
          }
        ]
      });
      
      await sampleCatalogue.save();
      console.log('✅ Sample catalogue created successfully');
    } else {
      console.log('ℹ️  Sample catalogue already exists');
    }
  } catch (error) {
    console.error('❌ Error creating sample catalogue:', error);
  }
};

// Update existing buyers with brand access
const updateBuyersWithBrandAccess = async () => {
  try {
    const buyers = await User.find({ role: 'buyer' });
    
    for (const buyer of buyers) {
      if (!buyer.brandAccess || buyer.brandAccess.length === 0) {
        // Assign random brand access based on buyer type
        let brandAccess = [];
        if (buyer.buyerType === 'E-Commerce') {
          brandAccess = ['nike', 'adidas', 'puma', 'reebok'];
        } else if (buyer.buyerType === 'Outlet Chain') {
          brandAccess = ['nike', 'adidas', 'under-armour', 'new-balance'];
        } else {
          brandAccess = ['converse', 'vans', 'puma'];
        }
        
        buyer.brandAccess = brandAccess;
        await buyer.save();
        console.log(`✅ Updated brand access for ${buyer.name}`);
      }
    }
  } catch (error) {
    console.error('❌ Error updating buyers with brand access:', error);
  }
};

// Create dummy orders
async function createDummyOrders() {
  try {
    console.log('Creating dummy orders...');
    
    // Get a buyer user
    const buyer = await User.findOne({ role: 'buyer' });
    if (!buyer) {
      console.log('No buyer found, skipping dummy orders creation');
      return;
    }

    // Get a catalogue file
    const catalogue = await Catalogue.findOne({ 'files.0': { $exists: true } });
    if (!catalogue || !catalogue.files || catalogue.files.length === 0) {
      console.log('No catalogue file found, skipping dummy orders creation');
      return;
    }
    const catalogueFileId = catalogue.files[0]._id;

    const dummyOrders = [
      {
        orderNumber: 'ORD-2025-001',
        buyer: buyer._id,
        catalogueFile: catalogueFileId,
        brandName: 'Nike',
        fileName: 'Nike Spring Collection 2025.xlsx',
        items: [
          { sku: 'NK-SPR-001', productName: 'Nike Air Max 90', originalQuantity: 100, desiredQuantity: 25, unitPrice: 120, totalPrice: 3000 },
          { sku: 'NK-SPR-002', productName: 'Nike Zoom Fly', originalQuantity: 80, desiredQuantity: 15, unitPrice: 150, totalPrice: 2250 }
        ],
        subtotal: 5250,
        tax: 525,
        shipping: 50,
        total: 5825,
        status: 'submitted',
        timeline: [
          { status: 'submitted', message: 'Order submitted by buyer', timestamp: new Date('2025-01-15T10:30:00Z') }
        ]
      },
      {
        orderNumber: 'ORD-2025-002',
        buyer: buyer._id,
        catalogueFile: catalogueFileId,
        brandName: 'Adidas',
        fileName: 'Adidas Summer Line.xlsx',
        items: [
          { sku: 'AD-SUM-001', productName: 'Adidas Ultraboost', originalQuantity: 120, desiredQuantity: 30, unitPrice: 180, totalPrice: 5400 },
          { sku: 'AD-SUM-002', productName: 'Adidas Stan Smith', originalQuantity: 90, desiredQuantity: 20, unitPrice: 85, totalPrice: 1700 }
        ],
        subtotal: 7100,
        tax: 710,
        shipping: 50,
        total: 7860,
        status: 'under_review',
        timeline: [
          { status: 'submitted', message: 'Order submitted by buyer', timestamp: new Date('2025-01-14T14:20:00Z') },
          { status: 'under_review', message: 'Order under admin review', timestamp: new Date('2025-01-15T09:15:00Z') }
        ]
      },
      {
        orderNumber: 'ORD-2025-003',
        buyer: buyer._id,
        catalogueFile: catalogueFileId,
        brandName: 'Puma',
        fileName: 'Puma Fall Collection.xlsx',
        items: [
          { sku: 'PM-FAL-001', productName: 'Puma RS-X', originalQuantity: 75, desiredQuantity: 18, unitPrice: 110, totalPrice: 1980 },
          { sku: 'PM-FAL-002', productName: 'Puma Suede Classic', originalQuantity: 60, desiredQuantity: 12, unitPrice: 70, totalPrice: 840 }
        ],
        subtotal: 2820,
        tax: 282,
        shipping: 50,
        total: 3152,
        status: 'approved',
        timeline: [
          { status: 'submitted', message: 'Order submitted by buyer', timestamp: new Date('2025-01-13T11:45:00Z') },
          { status: 'under_review', message: 'Order under admin review', timestamp: new Date('2025-01-14T08:30:00Z') },
          { status: 'approved', message: 'Order approved by admin', timestamp: new Date('2025-01-15T16:20:00Z') }
        ]
      },
      {
        orderNumber: 'ORD-2025-004',
        buyer: buyer._id,
        catalogueFile: catalogueFileId,
        brandName: 'Nike',
        fileName: 'Nike Winter Collection.xlsx',
        items: [
          { sku: 'NK-WIN-001', productName: 'Nike Air Force 1', originalQuantity: 95, desiredQuantity: 22, unitPrice: 100, totalPrice: 2200 },
          { sku: 'NK-WIN-002', productName: 'Nike Dunk Low', originalQuantity: 85, desiredQuantity: 19, unitPrice: 95, totalPrice: 1805 }
        ],
        subtotal: 4005,
        tax: 400.5,
        shipping: 50,
        total: 4455.5,
        status: 'pro_forma_sent',
        timeline: [
          { status: 'submitted', message: 'Order submitted by buyer', timestamp: new Date('2025-01-12T13:15:00Z') },
          { status: 'under_review', message: 'Order under admin review', timestamp: new Date('2025-01-13T10:45:00Z') },
          { status: 'approved', message: 'Order approved by admin', timestamp: new Date('2025-01-14T15:30:00Z') },
          { status: 'pro_forma_sent', message: 'Pro forma invoice sent', timestamp: new Date('2025-01-15T11:20:00Z') }
        ]
      },
      {
        orderNumber: 'ORD-2025-005',
        buyer: buyer._id,
        catalogueFile: catalogueFileId,
        brandName: 'Adidas',
        fileName: 'Adidas Spring Line.xlsx',
        items: [
          { sku: 'AD-SPR-001', productName: 'Adidas Gazelle', originalQuantity: 110, desiredQuantity: 28, unitPrice: 90, totalPrice: 2520 },
          { sku: 'AD-SPR-002', productName: 'Adidas Samba', originalQuantity: 95, desiredQuantity: 25, unitPrice: 80, totalPrice: 2000 }
        ],
        subtotal: 4520,
        tax: 452,
        shipping: 50,
        total: 5022,
        status: 'payment_received',
        timeline: [
          { status: 'submitted', message: 'Order submitted by buyer', timestamp: new Date('2025-01-11T09:30:00Z') },
          { status: 'under_review', message: 'Order under admin review', timestamp: new Date('2025-01-12T14:20:00Z') },
          { status: 'approved', message: 'Order approved by admin', timestamp: new Date('2025-01-13T11:15:00Z') },
          { status: 'pro_forma_sent', message: 'Pro forma invoice sent', timestamp: new Date('2025-01-14T16:45:00Z') },
          { status: 'payment_received', message: 'Payment received from buyer', timestamp: new Date('2025-01-15T13:30:00Z') }
        ]
      },
      {
        orderNumber: 'ORD-2025-006',
        buyer: buyer._id,
        catalogueFile: catalogueFileId,
        brandName: 'Puma',
        fileName: 'Puma Summer Collection.xlsx',
        items: [
          { sku: 'PM-SUM-001', productName: 'Puma Future Rider', originalQuantity: 70, desiredQuantity: 16, unitPrice: 85, totalPrice: 1360 },
          { sku: 'PM-SUM-002', productName: 'Puma Cali Sport', originalQuantity: 65, desiredQuantity: 14, unitPrice: 75, totalPrice: 1050 }
        ],
        subtotal: 2410,
        tax: 241,
        shipping: 50,
        total: 2701,
        status: 'final_invoice_sent',
        timeline: [
          { status: 'submitted', message: 'Order submitted by buyer', timestamp: new Date('2025-01-10T12:45:00Z') },
          { status: 'under_review', message: 'Order under admin review', timestamp: new Date('2025-01-11T10:30:00Z') },
          { status: 'approved', message: 'Order approved by admin', timestamp: new Date('2025-01-12T15:20:00Z') },
          { status: 'pro_forma_sent', message: 'Pro forma invoice sent', timestamp: new Date('2025-01-13T11:45:00Z') },
          { status: 'payment_received', message: 'Payment received from buyer', timestamp: new Date('2025-01-14T14:15:00Z') },
          { status: 'final_invoice_sent', message: 'Final invoice sent', timestamp: new Date('2025-01-15T09:30:00Z') }
        ]
      },
      {
        orderNumber: 'ORD-2025-007',
        buyer: buyer._id,
        catalogueFile: catalogueFileId,
        brandName: 'Nike',
        fileName: 'Nike Fall Collection.xlsx',
        items: [
          { sku: 'NK-FAL-001', productName: 'Nike Blazer Mid', originalQuantity: 88, desiredQuantity: 20, unitPrice: 105, totalPrice: 2100 },
          { sku: 'NK-FAL-002', productName: 'Nike Cortez', originalQuantity: 92, desiredQuantity: 23, unitPrice: 88, totalPrice: 2024 }
        ],
        subtotal: 4124,
        tax: 412.4,
        shipping: 50,
        total: 4586.4,
        status: 'completed',
        timeline: [
          { status: 'submitted', message: 'Order submitted by buyer', timestamp: new Date('2025-01-09T10:15:00Z') },
          { status: 'under_review', message: 'Order under admin review', timestamp: new Date('2025-01-10T13:30:00Z') },
          { status: 'approved', message: 'Order approved by admin', timestamp: new Date('2025-01-11T16:45:00Z') },
          { status: 'pro_forma_sent', message: 'Pro forma invoice sent', timestamp: new Date('2025-01-12T11:20:00Z') },
          { status: 'payment_received', message: 'Payment received from buyer', timestamp: new Date('2025-01-13T14:10:00Z') },
          { status: 'final_invoice_sent', message: 'Final invoice sent', timestamp: new Date('2025-01-14T09:25:00Z') },
          { status: 'completed', message: 'Order completed and shipped', timestamp: new Date('2025-01-15T12:40:00Z') }
        ]
      }
    ];

    const Order = require('./server/models/Order');
    
    for (const dummyOrder of dummyOrders) {
      const order = new Order({
        ...dummyOrder,
        submittedAt: dummyOrder.timeline[0].timestamp,
        createdAt: dummyOrder.timeline[0].timestamp
      });
      await order.save();
    }

    console.log(`Created ${dummyOrders.length} dummy orders`);
  } catch (error) {
    console.error('Error creating dummy orders:', error);
  }
}

// Main setup function
const setup = async () => {
  console.log('🚀 Starting Digital Wholesale Catalogue setup...\n');
  
  try {
    await createAdminUser();
    await createSampleBuyer();
    await createAdditionalBuyers();
    await createSampleCatalogue();
    await updateBuyersWithBrandAccess();
    await createDummyOrders();
    
    console.log('\n✅ Setup completed successfully!');
    console.log('\n📋 Default credentials:');
          console.log('Admin: info@offaccess.com / password123');
    console.log('Buyer: mmoussallem@mba2025.hbs.edu / password123');
    console.log('\n🌐 Start the application with: npm run dev');
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run setup
setup(); 