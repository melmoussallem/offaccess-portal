// Inventory Configuration for Google Sheets Integration
// This file maps brands and collections to their respective Google Sheet IDs

const inventoryConfig = {
  // Spreadsheet mappings - replace with actual Google Sheet IDs
  spreadsheets: {
    'Lacoste': {
      'all': '1A7RtFoYFxEKv0MIO-8YLSqThLrvPrktHecY4-Ztcxxg'
    },
    'Ralph Lauren': {
      'all': 'your-ralph-lauren-spreadsheet-id-here'
    }
  },

  // Get spreadsheet ID for a specific brand and collection
  getSpreadsheetId: function(brand, stockFile) {
    if (!brand || !stockFile) {
      console.warn('Missing brand or stockFile for spreadsheet lookup');
      return null;
    }

    const brandConfig = this.spreadsheets[brand];
    if (!brandConfig) {
      console.warn(`No spreadsheet configuration found for brand: ${brand}`);
      return null;
    }

    // Try to get specific stockFile, fall back to 'all'
    const spreadsheetId = brandConfig[stockFile] || brandConfig['all'];
    
    if (!spreadsheetId) {
      console.warn(`No spreadsheet ID found for brand: ${brand}, stockFile: ${stockFile}`);
      return null;
    }

    return spreadsheetId;
  },

  // Get all available brands
  getAllBrands: function() {
    return Object.keys(this.spreadsheets);
  },

  // Get stockFiles for a specific brand
  getStockFilesForBrand: function(brand) {
    const brandConfig = this.spreadsheets[brand];
    if (!brandConfig) {
      return [];
    }
    return Object.keys(brandConfig);
  },

  // Check if brand-stockFile combination is valid
  isValidBrandStockFile: function(brand, stockFile) {
    const brandConfig = this.spreadsheets[brand];
    if (!brandConfig) {
      return false;
    }
    return brandConfig.hasOwnProperty(stockFile) || brandConfig.hasOwnProperty('all');
  },

  // Get all mappings for debugging
  getAllMappings: function() {
    return this.spreadsheets;
  },

  // Check if inventory deduction is enabled
  isInventoryDeductionEnabled: function() {
    // Return false if no valid spreadsheet IDs are configured
    const allBrands = this.getAllBrands();
    return allBrands.some(brand => {
      const stockFiles = this.getStockFilesForBrand(brand);
      return stockFiles.some(stockFile => {
        const spreadsheetId = this.getSpreadsheetId(brand, stockFile);
        return spreadsheetId && spreadsheetId !== 'your-spreadsheet-id-here';
      });
    });
  }
};

module.exports = inventoryConfig; 