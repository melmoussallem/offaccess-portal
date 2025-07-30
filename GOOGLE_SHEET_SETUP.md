# Google Sheet Preview Setup Guide

This guide explains how to set up Google Sheet previews for files in the catalogue system.

## Overview

The Google Sheet preview feature allows users to view a read-only preview of Excel files as Google Sheets within the web application. This provides a secure way to preview file contents without allowing direct downloads of the Google Sheet.

## Security Features

### Iframe Security Measures
- **Sandbox restrictions**: The iframe uses `sandbox="allow-same-origin allow-scripts"` to limit functionality
- **Pointer events disabled**: `pointerEvents: 'none'` prevents user interactions
- **Context menu prevention**: JavaScript prevents right-click actions
- **Download prevention**: Users cannot save the iframe content or access the Google Sheet directly

### Access Control
- Only the Excel file download is available through the web app
- Google Sheet URLs are stored securely in the database
- Preview is read-only and embedded within the portal

## Setting Up Google Sheet Previews

### Step 1: Prepare Your Google Sheet

1. **Create or open your Google Sheet** in Google Drive
2. **Ensure the sheet contains the data** you want to preview
3. **Format the sheet appropriately** for viewing (adjust column widths, formatting, etc.)

### Step 2: Publish to Web

1. **Open your Google Sheet**
2. **Click File → Share → Publish to web**
3. **Configure the publishing settings:**
   - **Link**: Choose "Entire document"
   - **Web page**: Select "Web page"
   - **Automatically republish**: Check this if you want updates to be reflected automatically
4. **Click "Publish"**
5. **Copy the published URL** (it will look like: `https://docs.google.com/spreadsheets/d/e/[SHEET_ID]/pubhtml`)

### Step 3: Add URL to the System

#### For Administrators:
1. **Navigate to the Catalogue section**
2. **Select a brand** and find the file you want to add a preview for
3. **Click the link icon** (🔗) next to the file or use the "More actions" menu
4. **Enter the Google Sheet URL** in the dialog
5. **Click "Save"**

#### URL Format Requirements:
- Must start with `https://docs.google.com/spreadsheets/d/`
- Should be a published web URL (not a sharing URL)
- The sheet must be publicly accessible via the web

### Step 4: Test the Preview

1. **Expand the file** by clicking the arrow next to it
2. **Verify the preview loads** correctly
3. **Test the download functionality** to ensure the Excel file still downloads properly

## User Experience

### For Buyers:
- **View previews** by expanding files in the catalogue
- **Download Excel templates** using the download button
- **No direct access** to Google Sheets or iframe content

### For Administrators:
- **Set up previews** for files using the link icon
- **Update URLs** as needed when sheets change
- **Manage access** through the existing brand visibility system

## Troubleshooting

### Common Issues:

#### Preview Not Loading
- **Check URL format**: Ensure it's a published web URL, not a sharing URL
- **Verify sheet is published**: The sheet must be published to the web
- **Check permissions**: The sheet should be publicly accessible

#### Security Warnings
- **Browser security**: Some browsers may block iframe content
- **Mixed content**: Ensure the Google Sheet URL uses HTTPS
- **CORS issues**: Google Sheets should handle CORS automatically

#### Performance Issues
- **Large sheets**: Very large sheets may load slowly
- **Network issues**: Check internet connectivity
- **Browser cache**: Try refreshing the page

### Error Messages:

#### "Invalid Google Sheet URL format"
- Ensure the URL starts with `https://docs.google.com/spreadsheets/d/`
- Use the published web URL, not the sharing URL

#### "Failed to load preview"
- Check if the Google Sheet is still published
- Verify the URL is correct and accessible
- Try refreshing the page

## Best Practices

### For Google Sheets:
1. **Keep sheets organized** with clear headers and formatting
2. **Use appropriate column widths** for better viewing
3. **Consider sheet size** - very large sheets may load slowly
4. **Update published sheets** when data changes

### For Administrators:
1. **Test previews** after setting up URLs
2. **Keep URLs updated** when sheets change
3. **Monitor performance** of large previews
4. **Provide clear instructions** to users about the preview feature

### For Security:
1. **Only publish necessary data** to the web
2. **Regularly review** which sheets are published
3. **Use appropriate sharing settings** in Google Drive
4. **Monitor access** through Google Drive audit logs

## Technical Details

### Iframe Configuration:
```javascript
<iframe
  src={embedUrl}
  sandbox="allow-same-origin allow-scripts"
  allow="none"
  loading="lazy"
  style={{ pointerEvents: 'none' }}
/>
```

### URL Conversion:
The system automatically converts Google Sheet URLs to embed URLs:
- Input: `https://docs.google.com/spreadsheets/d/[SHEET_ID]/edit`
- Output: `https://docs.google.com/spreadsheets/d/e/[SHEET_ID]/pubhtml?widget=true&headers=false&chrome=false`

### Database Storage:
- Google Sheet URLs are stored in the `googleSheetUrl` field of the Collection model
- URLs are validated before storage
- Empty/null values are allowed for files without previews

## Support

If you encounter issues with Google Sheet previews:

1. **Check the setup guide** above
2. **Verify Google Sheet permissions** and publishing settings
3. **Test with a simple sheet** to isolate issues
4. **Contact system administrator** for technical support

## Updates and Maintenance

### Regular Tasks:
- **Review published sheets** for relevance and accuracy
- **Update URLs** when sheets are moved or renamed
- **Monitor performance** of preview loading
- **Clean up unused** published sheets

### System Updates:
- **Backup URLs** before system updates
- **Test previews** after updates
- **Update documentation** as needed 