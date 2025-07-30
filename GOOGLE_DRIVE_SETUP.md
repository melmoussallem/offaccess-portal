# Google Drive Integration Setup Guide

This guide will help you set up Google Drive integration for inventory management in your Digital Wholesale Catalogue.

## Prerequisites

1. A Google Cloud Project
2. Google Drive API enabled
3. A service account with appropriate permissions

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Drive API for your project

## Step 2: Create a Service Account

1. In your Google Cloud Console, go to "IAM & Admin" > "Service Accounts"
2. Click "Create Service Account"
3. Give it a name (e.g., "digital-wholesale-catalogue-inventory-manager")
4. Add a description (e.g., "Service account for Digital Wholesale Catalogue inventory management")
5. Click "Create and Continue"
6. Grant the following roles:
   - Drive File Stream
   - Drive API
7. Click "Done"

## Step 3: Generate Service Account Key

1. Click on your newly created service account
2. Go to the "Keys" tab
3. Click "Add Key" > "Create new key"
4. Choose "JSON" format
5. Download the JSON file
6. Rename it to `google-drive-key.json` and place it in your project root directory

## Step 4: Share Your Google Drive Files

1. Upload your inventory Excel files to Google Drive
2. Right-click on each file and select "Share"
3. Add your service account email (found in the JSON key file) with "Editor" permissions
4. Copy the file ID from the URL (the long string between /d/ and /edit)

## Step 5: Configure Inventory Mappings

1. Open `server/config/inventoryConfig.js`
2. Replace the example mappings with your actual brand/collection mappings:

```javascript
const inventoryConfig = {
  brands: {
    'Your Brand Name': {
      'Your Collection Name': {
        inventoryFileId: 'your-actual-google-drive-file-id',
        description: 'Description of this inventory file'
      }
    }
  },
  // ... rest of the config
};
```

## Step 6: Install Dependencies

Run the following command to install the required packages:

```bash
npm install googleapis google-auth-library
```

## Step 7: Environment Variables

Add the following to your `.env` file:

```
GOOGLE_DRIVE_KEY_FILE=google-drive-key.json
```

## Step 8: Test the Integration

1. Start your server
2. Create a test order
3. Approve the order as an admin
4. Check the server logs for inventory deduction messages

## File Structure Requirements

Your inventory Excel files should have the following structure:
- Column A: SKU/Product Code
- Column B: Available Quantity
- Column C: Unit Price (optional)

Your order Excel files should have:
- Column A: SKU/Product Code
- Column B: Quantity Ordered
- Column C: Unit Price

## Troubleshooting

### Common Issues

1. **"Google Drive service not initialized"**
   - Check that `google-drive-key.json` exists in the project root
   - Verify the JSON file is valid and contains the correct credentials

2. **"Access denied" errors**
   - Ensure the service account has been shared with the Google Drive files
   - Check that the file IDs in the config are correct

3. **"File not found" errors**
   - Verify the file IDs in your inventory configuration
   - Check that the files are still accessible in Google Drive

### Debug Mode

To enable debug logging, add this to your server startup:

```javascript
process.env.DEBUG = 'googleapis:*';
```

## Security Considerations

1. Never commit `google-drive-key.json` to version control
2. Add it to your `.gitignore` file
3. Use environment variables for sensitive configuration
4. Regularly rotate your service account keys

## API Endpoints

The following new endpoints are available:

- `GET /api/orders/inventory-mappings` - Get all configured inventory mappings
- `GET /api/orders/:id/inventory-status` - Get inventory status for an order
- `PUT /api/orders/:id/reverse-inventory` - Reverse inventory deduction (admin only)

## Inventory Workflow

1. **Order Creation**: Buyer submits order with Excel file
2. **Order Approval**: Admin approves order, inventory is automatically deducted
3. **Inventory Reversal**: Admin can reverse inventory deduction if needed
4. **Payment Confirmation**: Order marked as paid (no inventory impact)

The system will automatically:
- Extract SKU and quantity data from order Excel files
- Update corresponding quantities in Google Drive inventory files
- Track all inventory changes with timestamps
- Allow admins to reverse inventory deductions 