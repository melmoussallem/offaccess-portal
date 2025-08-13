const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');

// Helper function to get the correct file path for uploads
const getUploadFilePath = (filename) => {
  const paths = [
    path.join(process.cwd(), 'uploads', 'orders', filename),
    path.join(__dirname, '..', '..', 'uploads', 'orders', filename),
    path.join('/app', 'uploads', 'orders', filename),
    path.join(process.cwd(), 'uploads', filename),
    path.join(__dirname, '..', '..', 'uploads', filename),
    path.join('/app', 'uploads', filename),
    path.join(process.cwd(), 'uploads', 'catalogue', filename),
    path.join(__dirname, '..', '..', 'uploads', 'catalogue', filename),
    path.join('/app', 'uploads', 'catalogue', filename)
  ];
  
  for (const filePath of paths) {
    if (fs.existsSync(filePath)) {
      console.log(`✅ File found at: ${filePath}`);
      return filePath;
    }
  }
  
  console.error(`❌ File not found in any of the expected paths: ${filename}`);
  console.error(`🔍 Searched paths:`);
  paths.forEach(p => console.error(`   - ${p}`));
  return null;
};

class GoogleSheetsService {
  constructor() {
    this.auth = null;
    this.sheets = null;
    this.drive = null;
    this.initializeAuth();
  }

  // Initialize authentication using multiple methods
  initializeAuth() {
    try {
      console.log('🔧 Initializing Google Sheets service...');
      console.log('🔧 Current working directory:', process.cwd());
      console.log('🔧 NODE_ENV:', process.env.NODE_ENV);
      console.log('🔧 GOOGLE_DRIVE_KEY_FILE:', process.env.GOOGLE_DRIVE_KEY_FILE);
      
      let authConfig = {};
      
      // Method 1: Try Workload Identity Federation first
      if (process.env.GOOGLE_WORKLOAD_IDENTITY_PROJECT_ID) {
        console.log('🔧 Using Workload Identity Federation...');
        this.auth = new google.auth.GoogleAuth({
          scopes: [
            'https://www.googleapis.com/auth/spreadsheets',
            'https://www.googleapis.com/auth/drive'
          ]
        });
      }
      // Method 2: Try Application Default Credentials (ADC)
      else if (process.env.GOOGLE_USE_ADC === 'true') {
        console.log('🔧 Using Application Default Credentials (ADC)...');
        this.auth = new google.auth.GoogleAuth({
          scopes: [
            'https://www.googleapis.com/auth/spreadsheets',
            'https://www.googleapis.com/auth/drive'
          ]
        });
      }
      // Method 2: Try OAuth2 Client (for personal accounts)
      else if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
        console.log('🔧 Using OAuth2 Client authentication...');
        this.auth = new google.auth.OAuth2(
          process.env.GOOGLE_CLIENT_ID,
          process.env.GOOGLE_CLIENT_SECRET,
          process.env.GOOGLE_REDIRECT_URI
        );
        
        // If refresh token is available, use it
        if (process.env.GOOGLE_REFRESH_TOKEN) {
          this.auth.setCredentials({
            refresh_token: process.env.GOOGLE_REFRESH_TOKEN
          });
        }
      }
      // Method 3: Try Service Account (fallback)
      else {
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
        
        if (credentials) {
          console.log('🔧 Creating Google Auth with service account credentials...');
          this.auth = new google.auth.GoogleAuth({
            credentials: credentials,
            scopes: [
              'https://www.googleapis.com/auth/spreadsheets',
              'https://www.googleapis.com/auth/drive'
            ]
          });
        }
      }
      
      if (!this.auth) {
        console.warn('❌ No authentication method configured. Google Sheets functionality will be disabled.');
        console.warn('🔧 Configure one of the following:');
        console.warn('   - GOOGLE_USE_ADC=true (for Application Default Credentials)');
        console.warn('   - GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET (for OAuth2)');
        console.warn('   - GOOGLE_DRIVE_KEY_FILE (for service account)');
        return;
      }

      console.log('🔧 Creating Google Sheets API client...');
      this.sheets = google.sheets({ version: 'v4', auth: this.auth });
      
      console.log('🔧 Creating Google Drive API client...');
      this.drive = google.drive({ version: 'v3', auth: this.auth });
      
      console.log('✅ Google Sheets service initialized successfully');
      console.log('✅ Auth initialized:', !!this.auth);
      console.log('✅ Sheets initialized:', !!this.sheets);
      console.log('✅ Drive initialized:', !!this.drive);
    } catch (error) {
      console.error('❌ Failed to initialize Google Sheets service:', error.message);
      console.error('❌ Google Sheets functionality will be disabled. Please check your authentication configuration.');
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
      console.log(`🔍 Attempting to read Excel file from: ${filePath}`);
      
      // Use helper function to find the correct file path
      let correctFilePath = getUploadFilePath(path.basename(filePath));
      
      // If not found, try searching by original name or common patterns
      if (!correctFilePath) {
        console.log(`🔍 File not found by exact name, trying alternative searches...`);
        
        // Try to find any Excel file in the uploads directories
        const uploadDirs = [
          path.join(process.cwd(), 'uploads', 'orders'),
          path.join(__dirname, '..', '..', 'uploads', 'orders'),
          path.join('/app', 'uploads', 'orders'),
          path.join(process.cwd(), 'uploads'),
          path.join(__dirname, '..', '..', 'uploads'),
          path.join('/app', 'uploads'),
          path.join(process.cwd(), 'uploads', 'catalogue'),
          path.join(__dirname, '..', '..', 'uploads', 'catalogue'),
          path.join('/app', 'uploads', 'catalogue')
        ];
        
        for (const dir of uploadDirs) {
          console.log(`🔍 Checking directory: ${dir}`);
          if (fs.existsSync(dir)) {
            console.log(`✅ Directory exists: ${dir}`);
            try {
              const files = fs.readdirSync(dir);
              console.log(`📁 Files in ${dir}:`, files);
              const excelFiles = files.filter(file => 
                file.toLowerCase().endsWith('.xlsx') || 
                file.toLowerCase().endsWith('.xls') || 
                file.toLowerCase().endsWith('.xlsm')
              );
              
              console.log(`📊 Excel files found in ${dir}:`, excelFiles);
              
              if (excelFiles.length > 0) {
                console.log(`🔍 Found Excel files in ${dir}:`, excelFiles);
                // Use the most recent Excel file
                const mostRecentFile = excelFiles[excelFiles.length - 1];
                correctFilePath = path.join(dir, mostRecentFile);
                console.log(`✅ Using most recent Excel file: ${mostRecentFile}`);
                break;
              }
            } catch (error) {
              console.error(`❌ Error reading directory ${dir}:`, error.message);
            }
          } else {
            console.log(`❌ Directory does not exist: ${dir}`);
          }
        }
      }
      
      if (!correctFilePath) {
        console.error(`❌ No Excel files found in any upload directories`);
        console.error(`🔍 This suggests the file upload process may not be working correctly on Railway`);
        console.error(`🔍 The order was created with filename: ${path.basename(filePath)}`);
        console.error(`🔍 But no matching file was found in the filesystem`);
        
        // For debugging, let's check if we can create a test file
        const testDir = path.join(process.cwd(), 'uploads', 'orders');
        if (!fs.existsSync(testDir)) {
          console.log(`🔧 Creating test directory: ${testDir}`);
          fs.mkdirSync(testDir, { recursive: true });
        }
        
        throw new Error(`Excel file not found: ${path.basename(filePath)}. No Excel files found in any upload directories.`);
      }
      
      filePath = correctFilePath;
      
      return this.parseExcelFromFile(filePath);
    } catch (error) {
      throw new Error(`Failed to parse Excel file: ${error.message}`);
    }
  }

  // Parse buyer Excel file from base64 data (for Railway)
  async parseBuyerExcelFromBase64(base64Data, originalName) {
    try {
      console.log(`🔍 Attempting to read Excel file from base64: ${originalName}`);
      
      if (!base64Data) {
        throw new Error('No base64 data provided');
      }
      
      // Convert base64 to buffer
      const buffer = Buffer.from(base64Data, 'base64');
      
      return this.parseExcelFromBuffer(buffer, originalName);
    } catch (error) {
      throw new Error(`Failed to parse Excel file from base64: ${error.message}`);
    }
  }

  // Parse Excel from file
  parseExcelFromFile(filePath) {
      
      const workbook = xlsx.readFile(filePath, {
        cellFormula: true,
        cellDates: true,
        cellNF: false,
        cellStyles: false
      });

      return this.parseExcelFromWorkbook(workbook);
    } catch (error) {
      throw new Error(`Failed to parse Excel file: ${error.message}`);
    }
  }

  // Parse Excel from buffer
  parseExcelFromBuffer(buffer, originalName) {
    try {
      const workbook = xlsx.read(buffer, {
        cellFormula: true,
        cellDates: true,
        cellNF: false,
        cellStyles: false
      });

      return this.parseExcelFromWorkbook(workbook);
    } catch (error) {
      throw new Error(`Failed to parse Excel file from buffer: ${error.message}`);
    }
  }

  // Parse Excel from workbook
  parseExcelFromWorkbook(workbook) {
    try {
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
      throw new Error(`Failed to parse Excel workbook: ${error.message}`);
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
      
      // Parse the buyer's Excel file from base64 data
      const orderItems = await this.parseBuyerExcelFromBase64(order.excelFileBase64, order.excelFileOriginalName);
      
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
      
      // Parse the buyer's Excel file from base64 data
      const orderItems = await this.parseBuyerExcelFromBase64(order.excelFileBase64, order.excelFileOriginalName);
      
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