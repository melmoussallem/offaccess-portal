# Checking Your Current Railway Environment Variables

## Step 1: Go to Railway Dashboard
1. Go to https://railway.app/
2. Sign in to your account
3. Click on your project: `offaccess-portal-production`

## Step 2: Check Your Service
1. Click on your service (the one that's running your backend)
2. Go to the **"Variables"** tab

## Step 3: Look for These Variables
Check if you have any of these variables:

### Google Drive Variables (you should have these):
- `GOOGLE_OAUTH2_CLIENT_ID`
- `GOOGLE_OAUTH2_CLIENT_SECRET` 
- `GOOGLE_OAUTH2_REFRESH_TOKEN`

### Google Cloud Storage Variables (you need these):
- `GOOGLE_CLOUD_STORAGE_BUCKET` ✅ (you have this)
- `GOOGLE_APPLICATION_CREDENTIALS_JSON` ❌ (you need this)

## Step 4: What to Look For
If you see any variable that contains a long JSON string with:
- `"type": "service_account"`
- `"project_id"`
- `"private_key"`
- `"client_email"`

That's your service account credentials!

## Step 5: If You Don't Have It
If you don't see `GOOGLE_APPLICATION_CREDENTIALS_JSON`, you need to:
1. Go to Google Cloud Console
2. Create a service account key
3. Download the JSON file
4. Copy the entire JSON content
5. Add it as a Railway environment variable
