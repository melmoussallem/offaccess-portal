# Railway Environment Variables for Google Cloud Storage

## Required Variables

Add these to your Railway project environment variables:

### Google Cloud Storage
```
GOOGLE_CLOUD_STORAGE_BUCKET=offaccess-portal-files
```

### Existing Variables (from Google Drive setup)
```
GOOGLE_APPLICATION_CREDENTIALS_JSON={"your":"service_account_json_here"}
GOOGLE_OAUTH2_CLIENT_ID=your_client_id
GOOGLE_OAUTH2_CLIENT_SECRET=your_client_secret
GOOGLE_OAUTH2_REFRESH_TOKEN=your_refresh_token
```

## How to Add in Railway

1. Go to your Railway project dashboard
2. Click on your service
3. Go to **Variables** tab
4. Click **"New Variable"**
5. Add each variable above
6. Click **"Deploy"** to restart your service

## Verification

After adding the variables, your service will automatically restart and the new Google Cloud Storage integration will be active.
