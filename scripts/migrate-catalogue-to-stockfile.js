const mongoose = require('mongoose');
const path = require('path');

// Update this to your actual MongoDB connection string
const MONGO_URI = 'mongodb://localhost:27017/yourdbname';

const Catalogue = require('../server/models/Catalogue');
const StockFile = require('../server/models/StockFile');

async function migrateCatalogueToStockFile() {
  await mongoose.connect(MONGO_URI);
  const catalogueFiles = await Catalogue.find();
  let migrated = 0, skipped = 0;

  for (const cat of catalogueFiles) {
    // Check if a StockFile already exists for this brandId and originalName
    const exists = await StockFile.findOne({ brandId: cat.brandId, originalName: cat.originalName });
    if (exists) {
      skipped++;
      continue;
    }
    const stockFile = new StockFile({
      brandId: cat.brandId,
      fileName: cat.fileName,
      originalName: cat.originalName,
      filePath: cat.filePath,
      uploadedAt: cat.uploadedAt || cat.createdAt || new Date(),
    });
    await stockFile.save();
    migrated++;
  }
  console.log(`Migration complete. Migrated: ${migrated}, Skipped (already exists): ${skipped}`);
  await mongoose.disconnect();
}

migrateCatalogueToStockFile().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
}); 