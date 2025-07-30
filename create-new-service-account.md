# Creating a New Service Account with Proper Permissions

## Step 1: Create New Service Account
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Make sure you're in the `digital-wholesale-inventory` project
3. Go to **IAM & Admin > Service Accounts**
4. Click **Create Service Account**
5. Name: `sheets-inventory-service`
6. Description: `Service account for Google Sheets inventory management`
7. Click **Create and Continue**

## Step 2: Grant Permissions
1. In the **Grant this service account access to project** section:
   - Add role: **Editor**
   - Add role: **Service Account User**
2. Click **Continue**
3. Click **Done**

## Step 3: Create Key
1. Click on the new service account email
2. Go to **Keys** tab
3. Click **Add Key > Create New Key**
4. Choose **JSON** format
5. Download the file
6. Rename it to `google-sheets-key-new.json`
7. Replace the old `google-sheets-key.json` with this new one

## Step 4: Enable Google Sheets API for Service Account
1. Go to **APIs & Services > Enabled APIs & services**
2. Make sure **Google Sheets API** is enabled
3. If not, click **Enable APIs and Services** and add **Google Sheets API**

## Step 5: Share Google Sheet
1. Open your Google Sheet
2. Click **Share**
3. Add the new service account email as **Editor**
4. Make sure it's set to **Anyone with the link can edit**

## Step 6: Test
Run the debug script again to test the new service account. 