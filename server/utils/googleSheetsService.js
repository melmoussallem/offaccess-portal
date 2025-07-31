const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');

class GoogleSheetsService {
  constructor() {
    this.auth = null;
    this.sheets = null;
    this.drive = null;
    this.initializeAuth();
  }

  // Initialize authentication using service account
  initializeAuth() {
    try {
      console.log('🔧 Initializing Google Sheets service...');
      console.log('🔧 Current working directory:', process.cwd());
      console.log('🔧 NODE_ENV:', process.env.NODE_ENV);
      console.log('🔧 GOOGLE_DRIVE_KEY_FILE:', process.env.GOOGLE_DRIVE_KEY_FILE);
      
      let credentials;
      
      // Check if GOOGLE_DRIVE_KEY_FILE environment variable is set
      if (process.env.GOOGLE_DRIVE_KEY_FILE) {
        const serviceAccountPath = process.env.GOOGLE_DRIVE_KEY_FILE;
        console.log('🔧 Using Google Drive key file from environment variable:', serviceAccountPath);
        
        if (fs.existsSync(serviceAccountPath)) {
          console.log('✅ Service account file exists at environment path');
          credentials = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
        } else {
          console.warn('❌ Google Drive key file not found at environment path:', serviceAccountPath);
        }
      }
      
      // If no credentials from environment, try default path
      if (!credentials) {
        const defaultPath = path.join(__dirname, '..', '..', 'google-sheets-key.json');
        console.log('🔧 Using default Google Drive key file path:', defaultPath);
        
        if (fs.existsSync(defaultPath)) {
          console.log('✅ Service account file exists at default path');
          credentials = JSON.parse(fs.readFileSync(defaultPath, 'utf8'));
        } else {
          console.warn('❌ Google Sheets service account file not found:', defaultPath);
        }
      }
      
      // Check if GOOGLE_SERVICE_ACCOUNT_CREDENTIALS environment variable is set (JSON string)
      if (!credentials && process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS) {
        try {
          console.log('🔧 Using Google service account credentials from environment variable');
          credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS);
        } catch (error) {
          console.error('❌ Failed to parse GOOGLE_SERVICE_ACCOUNT_CREDENTIALS:', error.message);
        }
      }
      
      if (!credentials) {
        console.warn('❌ Google Sheets service account credentials not found. Google Sheets functionality will be disabled.');
        console.warn('🔧 Set GOOGLE_DRIVE_KEY_FILE environment variable, GOOGLE_SERVICE_ACCOUNT_CREDENTIALS environment variable, or ensure google-sheets-key.json exists.');
        return;
      }

      console.log('🔧 Creating Google Auth with credentials...');
      this.auth = new google.auth.GoogleAuth({
        credentials: credentials,
        scopes: [
          'https://www.googleapis.com/auth/spreadsheets',
          'https://www.googleapis.com/auth/drive'
        ]
      });

      console.log('🔧 Creating Google Sheets API client...');
      this.sheets = google.sheets({ version: 'v4', auth: this.auth });
      
      console.log('🔧 Creating Google Drive API client...');
      this.drive = google.drive({ version: 'v3', auth: this.auth });
      
      console.log('✅ Google Sheets service initialized with service account');
      console.log('✅ Auth initialized:', !!this.auth);
      console.log('✅ Sheets initialized:', !!this.sheets);
      console.log('✅ Drive initialized:', !!this.drive);
    } catch (error) {
      console.error('❌ Failed to initialize Google Sheets service:', error.message);
      console.error('❌ Google Sheets functionality will be disabled. Please check your service account configuration.');
    }
  }

  // Search for Google Sheet file by name in Google Drive
  async findGoogleSheetByName(fileName) {
    if (!this.drive) {
      throw new Error('Google Drive service not initialized');
    }

    try {
      // Always strip file extensions when searching for Google Sheet files
      const nameWithoutExtension = fileName.replace(/\.(xlsx?|xlsm?|csv)$/i, '');
      console.log(`🔍 Searching for Google Sheet file: "${fileName}" → "${nameWithoutExtension}"`);
      
      // Search for Google Sheets files without extension
      const response = await this.drive.files.list({
        q: `name = '${nameWithoutExtension}' and mimeType = 'application/vnd.google-apps.spreadsheet' and trashed = false`,
        fields: 'files(id, name, webViewLink)',
        orderBy: 'modifiedTime desc'
      });

      const files = response.data.files;
      
      if (files.length === 0) {
        throw new Error(`No Google Sheet file found with name: "${nameWithoutExtension}"`);
      }

      if (files.length > 1) {
        console.log(`⚠️ Multiple files found with name "${files[0].name}", using the most recently modified`);
      }

      const file = files[0];
      console.log(`✅ Found Google Sheet: "${file.name}" (ID: ${file.id})`);
      
      return {
        id: file.id,
        name: file.name,
        webViewLink: file.webViewLink
      };
    } catch (error) {
      throw new Error(`Failed to find Google Sheet file: ${error.message}`);
    }
  }

  // Parse buyer Excel file to extract Reference IDs and quantities
  async parseBuyerExcelFile(filePath) {
    try {
      const workbook = xlsx.readFile(filePath, {
        cellFormula: true,
        cellDates: true,
        cellNF: false,
        cellStyles: false
      });

      // Try to find the 'Buyer Order Form' sheet first, then fall back to first sheet
      let sheetName = workbook.SheetNames.find(name => name.trim().toLowerCase() === 'buyer order form');
      if (!sheetName) {
        sheetName = workbook.SheetNames[0];
        console.log(`Using first sheet: ${sheetName}`);
      } else {
        console.log(`Using 'Buyer Order Form' sheet: ${sheetName}`);
      }

      const worksheet = workbook.Sheets[sheetName];
      const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
      
      const orderItems = [];
      
      // Parse rows starting from row 2 (skip header)
      for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (!row || row.length < 20) continue; // Skip empty or short rows
        
        const referenceId = row[1] || ''; // Column B (index 1)
        const quantityRequested = parseFloat(row[19]) || 0; // Column T (index 19)
        
        if (referenceId && quantityRequested > 0) {
          orderItems.push({
            referenceId: referenceId.toString().trim(),
            quantityRequested: quantityRequested
          });
        }
      }

      console.log(`Parsed ${orderItems.length} items from buyer Excel file`);
      return orderItems;
    } catch (error) {
      throw new Error(`Failed to parse Excel file: ${error.message}`);
    }
  }

  // Read inventory data from Google Sheet
  async readInventorySheet(spreadsheetId, sheetName = 'Buyer Order Form') {
    if (!this.sheets) {
      throw new Error('Google Sheets service not initialized');
    }

    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: spreadsheetId,
        range: `${sheetName}!A:Z`
      });

      const rows = response.data.values || [];
      if (rows.length < 2) {
        throw new Error('Inventory sheet must have at least 2 rows (header + data)');
      }

      console.log(`Read ${rows.length} rows from inventory sheet`);
      return rows;
    } catch (error) {
      throw new Error(`Failed to read inventory sheet: ${error.message}`);
    }
  }

  // Check inventory availability and find row numbers for updates
  checkInventoryAvailability(inventoryData, orderItems) {
    const insufficientItems = [];
    const itemsToUpdate = [];

    for (const orderItem of orderItems) {
      let found = false;
      let availableQuantity = 0;
      let rowNumber = -1;

      // Search through inventory data (skip header row)
      for (let i = 1; i < inventoryData.length; i++) {
        const row = inventoryData[i];
        const referenceId = row[1] || ''; // Column B (index 1)

        if (referenceId.toString().trim() === orderItem.referenceId) {
          found = true;
          availableQuantity = parseFloat(row[15]) || 0; // Column P (index 15)
          rowNumber = i + 1; // Convert to 1-based row number
          break;
        }
      }

      if (!found) {
        insufficientItems.push({
          referenceId: orderItem.referenceId,
          quantityRequested: orderItem.quantityRequested,
          availableQuantity: 0,
          error: 'Reference ID not found in inventory'
        });
      } else if (availableQuantity < orderItem.quantityRequested) {
        insufficientItems.push({
          referenceId: orderItem.referenceId,
          quantityRequested: orderItem.quantityRequested,
          availableQuantity: availableQuantity,
          error: 'Insufficient inventory'
        });
      } else {
        // Item has sufficient inventory, add to update list
        itemsToUpdate.push({
          referenceId: orderItem.referenceId,
          quantityRequested: orderItem.quantityRequested,
          currentQuantity: availableQuantity,
          newQuantity: availableQuantity - orderItem.quantityRequested,
          rowNumber: rowNumber
        });
      }
    }

    return {
      success: insufficientItems.length === 0,
      insufficientItems: insufficientItems,
      itemsToUpdate: itemsToUpdate
    };
  }

  // Update inventory by deducting quantities
  async updateInventorySheet(spreadsheetId, itemsToUpdate, sheetName = 'Buyer Order Form') {
    if (!this.sheets) {
      throw new Error('Google Sheets service not initialized');
    }

    if (itemsToUpdate.length === 0) {
      console.log('No items to update in inventory');
      return { success: true, message: 'No items to update' };
    }

    try {
      const updates = [];
      
      for (const item of itemsToUpdate) {
        // Update Column P (Available Inventory) - index 15
        const range = `${sheetName}!P${item.rowNumber}`;
        const newValue = item.newQuantity;
        
        updates.push({
          range: range,
          values: [[newValue]]
        });
      }

      // Batch update all changes
      const response = await this.sheets.spreadsheets.values.batchUpdate({
        spreadsheetId: spreadsheetId,
        requestBody: {
          valueInputOption: 'RAW',
          data: updates
        }
      });

      console.log(`Successfully updated ${updates.length} items in inventory`);
      return {
        success: true,
        message: `Updated ${updates.length} items in inventory`,
        updatedItems: itemsToUpdate
      };
    } catch (error) {
      throw new Error(`Failed to update inventory sheet: ${error.message}`);
    }
  }

  // Process inventory deduction for an approved order
  async processInventoryDeduction(order, stockFile) {
    try {
      console.log(`Processing inventory deduction for order ${order.orderNumber}`);
      console.log(`StockFile/File: ${stockFile.name}`);
      
      // Find the Google Sheet file by collection name
      const googleSheetFile = await this.findGoogleSheetByName(stockFile.name);
      const spreadsheetId = googleSheetFile.id;
      
      console.log(`Found Google Sheet: ${googleSheetFile.name} (ID: ${spreadsheetId})`);
      
      // Parse the buyer's Excel file
      const orderFilePath = path.join(__dirname, '..', '..', 'uploads', 'orders', order.excelFile);
      const orderItems = await this.parseBuyerExcelFile(orderFilePath);
      
      if (orderItems.length === 0) {
        return {
          success: false,
          message: 'No valid items found in buyer Excel file'
        };
      }

      // Read current inventory data from the found Google Sheet
      const inventoryData = await this.readInventorySheet(spreadsheetId);
      
      // Check availability and prepare updates
      const availabilityCheck = this.checkInventoryAvailability(inventoryData, orderItems);
      
      if (!availabilityCheck.success) {
        const errorMessage = availabilityCheck.insufficientItems
          .map(item => `${item.referenceId}: ${item.error} (Requested: ${item.quantityRequested}, Available: ${item.availableQuantity})`)
          .join('; ');
        
        return {
          success: false,
          message: `Insufficient inventory: ${errorMessage}`,
          insufficientItems: availabilityCheck.insufficientItems
        };
      }

      // Update inventory by deducting quantities
      const updateResult = await this.updateInventorySheet(spreadsheetId, availabilityCheck.itemsToUpdate);
      
      return {
        success: true,
        message: `Inventory deduction successful. Updated ${availabilityCheck.itemsToUpdate.length} items.`,
        orderItems: orderItems,
        deductedItems: availabilityCheck.itemsToUpdate,
        updateResult: updateResult,
        googleSheetFile: googleSheetFile
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to process inventory deduction: ${error.message}`
      };
    }
  }

  // Process inventory restoration for rejected/cancelled orders
  async processInventoryRestoration(order, stockFile) {
    try {
      console.log(`Processing inventory restoration for order ${order.orderNumber}`);
      console.log(`StockFile/File: ${stockFile.name}`);
      
      // Find the Google Sheet file by collection name
      const googleSheetFile = await this.findGoogleSheetByName(stockFile.name);
      const spreadsheetId = googleSheetFile.id;
      
      console.log(`Found Google Sheet: ${googleSheetFile.name} (ID: ${spreadsheetId})`);
      
      // Parse the buyer's Excel file
      const orderFilePath = path.join(__dirname, '..', '..', 'uploads', 'orders', order.excelFile);
      const orderItems = await this.parseBuyerExcelFile(orderFilePath);
      
      if (orderItems.length === 0) {
        return {
          success: false,
          message: 'No valid items found in buyer Excel file for restoration'
        };
      }

      // Read current inventory data from the found Google Sheet
      const inventoryData = await this.readInventorySheet(spreadsheetId);
      
      // Prepare restoration updates (add back the quantities)
      const itemsToRestore = [];
      
      for (const orderItem of orderItems) {
        let found = false;
        let currentQuantity = 0;
        let rowNumber = -1;

        // Find the item in inventory
        for (let i = 1; i < inventoryData.length; i++) {
          const row = inventoryData[i];
          const referenceId = row[1] || '';

          if (referenceId.toString().trim() === orderItem.referenceId) {
            found = true;
            currentQuantity = parseFloat(row[15]) || 0; // Column P
            rowNumber = i + 1;
            break;
          }
        }

        if (found) {
          itemsToRestore.push({
            referenceId: orderItem.referenceId,
            quantityToRestore: orderItem.quantityRequested,
            currentQuantity: currentQuantity,
            newQuantity: currentQuantity + orderItem.quantityRequested,
            rowNumber: rowNumber
          });
        }
      }

      if (itemsToRestore.length === 0) {
        return {
          success: false,
          message: 'No items found in inventory to restore'
        };
      }

      // Update inventory by adding back quantities
      const updateResult = await this.updateInventorySheet(spreadsheetId, itemsToRestore);
      
      return {
        success: true,
        message: `Inventory restoration successful. Restored ${itemsToRestore.length} items.`,
        restoredItems: itemsToRestore,
        updateResult: updateResult,
        googleSheetFile: googleSheetFile
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to process inventory restoration: ${error.message}`
      };
    }
  }
}

module.exports = new GoogleSheetsService(); 