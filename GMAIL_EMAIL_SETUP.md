# Gmail Email Setup Guide

## Step 1: Create .env File

Create a `.env` file in the root directory of your project with the following content:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/digital-wholesale-catalogue

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Server Configuration
PORT=5000
NODE_ENV=development

# Frontend URL (for email links)
FRONTEND_URL=http://localhost:3000

# Email Configuration - Gmail Setup
EMAIL_USER=info@offaccess.com
EMAIL_PASS=your-gmail-app-password
ADMIN_EMAIL=info@offaccess.com

# Google Drive Configuration (for inventory management)
GOOGLE_DRIVE_KEY_FILE=path/to/your/google-drive-key.json
GOOGLE_DRIVE_FOLDER_ID=your-google-drive-folder-id
```

## Step 2: Set Up Gmail App Password

To use your Gmail account for sending emails, you need to create an App Password:

### 1. Enable 2-Factor Authentication
- Go to your Google Account settings
- Navigate to Security
- Enable 2-Step Verification if not already enabled

### 2. Generate App Password
- Go to your Google Account settings
- Navigate to Security
- Under "Signing in to Google", select "App passwords"
- Select "Mail" as the app and "Other" as the device
- Click "Generate"
- Copy the 16-character password

### 3. Update .env File
Replace `your-gmail-app-password` in the `.env` file with the generated app password:

```env
EMAIL_PASS=your-16-character-app-password
```

## Step 3: Test Email Configuration

Run the email test script to verify your configuration:

```bash
node test-email-notifications.js
```

## Email Configuration Details

### What Each Setting Does:

- **EMAIL_USER**: Your Gmail address for authentication
- **EMAIL_PASS**: Your Gmail app password (not your regular password)
- **ADMIN_EMAIL**: The "from" address that buyers will see in emails

### Email Flow:
1. System authenticates with Gmail using `EMAIL_USER` and `EMAIL_PASS`
2. Emails are sent from `ADMIN_EMAIL` (info@offaccess.com)
3. Buyers will see emails coming from info@offaccess.com

## Troubleshooting

### Common Issues:

1. **"Invalid login" Error**
   - Make sure you're using an App Password, not your regular Gmail password
   - Ensure 2-Factor Authentication is enabled

2. **"Less secure app access" Error**
   - Use App Passwords instead of enabling less secure app access
   - App Passwords are more secure and recommended by Google

3. **"Authentication failed" Error**
   - Double-check your Gmail address and app password
   - Make sure there are no extra spaces in the .env file

### Testing Steps:

1. Create the `.env` file with your Gmail credentials
2. Restart your server
3. Run the test script
4. Check the console output for success/error messages

## Security Notes

- Never commit your `.env` file to version control
- Keep your app password secure
- The app password is different from your regular Gmail password
- You can revoke app passwords at any time in your Google Account settings

## Example .env File

Here's what your complete `.env` file should look like:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/digital-wholesale-catalogue

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Server Configuration
PORT=5000
NODE_ENV=development

# Frontend URL (for email links)
FRONTEND_URL=http://localhost:3000

# Email Configuration - Gmail Setup
EMAIL_USER=info@offaccess.com
EMAIL_PASS=abcd efgh ijkl mnop
ADMIN_EMAIL=info@offaccess.com

# Google Drive Configuration (for inventory management)
GOOGLE_DRIVE_KEY_FILE=path/to/your/google-drive-key.json
GOOGLE_DRIVE_FOLDER_ID=your-google-drive-folder-id
```

Replace `abcd efgh ijkl mnop` with your actual 16-character app password. 