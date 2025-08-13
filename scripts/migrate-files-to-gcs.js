const mongoose = require('mongoose');
const fileStorageService = require('../server/utils/fileStorageService');
const Order = require('../server/models/Order');
const StockFile = require('../server/models/StockFile');
const User = require('../server/models/User');
require('dotenv').config();

async function migrateFilesToGCS() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    console.log('🚀 Starting file migration to Google Cloud Storage...');

    // 1. Migrate Order Files
    console.log('\n📋 Migrating Order Files...');
    const orders = await Order.find({
      $or: [
        { excelFileBase64: { $exists: true, $ne: null } },
        { invoiceFileBase64: { $exists: true, $ne: null } }
      ]
    });

    console.log(`Found ${orders.length} orders with base64 files`);

    for (const order of orders) {
      console.log(`\nProcessing order: ${order.orderNumber}`);

      // Migrate Excel file
      if (order.excelFileBase64) {
        const originalName = order.excelFileOriginalName || `order-${order.orderNumber}.xlsx`;
        const fileName = fileStorageService.generateUniqueFileName(originalName, 'order-');
        
        console.log(`  📄 Migrating Excel file: ${originalName}`);
        const excelResult = await fileStorageService.migrateBase64File(
          order.excelFileBase64,
          fileName,
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'orders'
        );

        if (excelResult.success) {
          order.excelFile = fileName;
          order.excelFileGCS = excelResult.filePath;
          order.excelFileBase64 = null; // Remove base64 data
          console.log(`  ✅ Excel file migrated: ${excelResult.filePath}`);
        } else {
          console.log(`  ❌ Excel file migration failed: ${excelResult.error}`);
        }
      }

      // Migrate Invoice file
      if (order.invoiceFileBase64) {
        const originalName = order.invoiceFileOriginalName || `invoice-${order.orderNumber}.pdf`;
        const fileName = fileStorageService.generateUniqueFileName(originalName, 'invoice-');
        
        console.log(`  📄 Migrating Invoice file: ${originalName}`);
        const invoiceResult = await fileStorageService.migrateBase64File(
          order.invoiceFileBase64,
          fileName,
          'application/pdf',
          'orders'
        );

        if (invoiceResult.success) {
          order.invoiceFile = fileName;
          order.invoiceFileGCS = invoiceResult.filePath;
          order.invoiceFileBase64 = null; // Remove base64 data
          console.log(`  ✅ Invoice file migrated: ${invoiceResult.filePath}`);
        } else {
          console.log(`  ❌ Invoice file migration failed: ${invoiceResult.error}`);
        }
      }

      // Save updated order
      await order.save();
      console.log(`  💾 Order ${order.orderNumber} updated in database`);
    }

    // 2. Migrate Stock Files
    console.log('\n📁 Migrating Stock Files...');
    const stockFiles = await StockFile.find({
      fileBase64: { $exists: true, $ne: null }
    });

    console.log(`Found ${stockFiles.length} stock files with base64 data`);

    for (const stockFile of stockFiles) {
      console.log(`\nProcessing stock file: ${stockFile.originalName || stockFile.fileName}`);

      if (stockFile.fileBase64) {
        const originalName = stockFile.originalName || stockFile.fileName || 'stock-file.xlsx';
        const fileName = fileStorageService.generateUniqueFileName(originalName, 'stock-');
        
        console.log(`  📄 Migrating Stock file: ${originalName}`);
        const stockResult = await fileStorageService.migrateBase64File(
          stockFile.fileBase64,
          fileName,
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'catalogue'
        );

        if (stockResult.success) {
          stockFile.fileName = fileName;
          stockFile.fileGCS = stockResult.filePath;
          stockFile.fileBase64 = null; // Remove base64 data
          console.log(`  ✅ Stock file migrated: ${stockResult.filePath}`);
        } else {
          console.log(`  ❌ Stock file migration failed: ${stockResult.error}`);
        }
      }

      // Save updated stock file
      await stockFile.save();
      console.log(`  💾 Stock file updated in database`);
    }

    // 3. Migrate User Files (if any)
    console.log('\n👤 Migrating User Files...');
    const users = await User.find({
      profilePictureBase64: { $exists: true, $ne: null }
    });

    console.log(`Found ${users.length} users with profile pictures`);

    for (const user of users) {
      console.log(`\nProcessing user: ${user.name}`);

      if (user.profilePictureBase64) {
        const originalName = user.profilePictureOriginalName || 'profile-picture.jpg';
        const fileName = fileStorageService.generateUniqueFileName(originalName, 'profile-');
        
        console.log(`  📄 Migrating Profile picture: ${originalName}`);
        const profileResult = await fileStorageService.migrateBase64File(
          user.profilePictureBase64,
          fileName,
          'image/jpeg',
          'users'
        );

        if (profileResult.success) {
          user.profilePicture = fileName;
          user.profilePictureGCS = profileResult.filePath;
          user.profilePictureBase64 = null; // Remove base64 data
          console.log(`  ✅ Profile picture migrated: ${profileResult.filePath}`);
        } else {
          console.log(`  ❌ Profile picture migration failed: ${profileResult.error}`);
        }
      }

      // Save updated user
      await user.save();
      console.log(`  💾 User ${user.name} updated in database`);
    }

    console.log('\n🎉 File migration completed successfully!');
    console.log('\n📊 Migration Summary:');
    console.log(`  - Orders processed: ${orders.length}`);
    console.log(`  - Stock files processed: ${stockFiles.length}`);
    console.log(`  - Users processed: ${users.length}`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run migration if called directly
if (require.main === module) {
  migrateFilesToGCS();
}

module.exports = migrateFilesToGCS;
