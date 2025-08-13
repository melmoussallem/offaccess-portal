# Google Cloud Storage Setup Guide

This guide will help you set up Google Cloud Storage for the OffAccess Portal to replace the current base64 file storage system.

## 🎯 Benefits of Google Cloud Storage

- **Scalable**: Handle unlimited files without database bloat
- **Cost-effective**: Pay only for what you use
- **Reliable**: 99.9% availability SLA
- **Secure**: Private files with signed URLs
- **Fast**: Global CDN for file delivery
- **Organized**: Proper folder structure for different file types

## 📋 Prerequisites

1. **Google Cloud Project**: You should already have one from the Google Drive setup
2. **Google Cloud Storage API**: Enable the Cloud Storage API
3. **Service Account**: Use the same service account from Google Drive setup

## 🚀 Setup Steps

### 1. Enable Google Cloud Storage API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (`digital-wholesale-inventory`)
3. Go to **APIs & Services** > **Library**
4. Search for "Cloud Storage"
5. Click on **Cloud Storage API** and enable it

### 2. Create Storage Bucket

1. Go to **Cloud Storage** > **Buckets**
2. Click **Create Bucket**
3. Configure the bucket:
   - **Name**: `offaccess-portal-files` (or your preferred name)
   - **Location**: Choose a region close to your users
   - **Storage class**: Standard
   - **Access control**: Fine-grained
   - **Protection tools**: None (for now)

### 3. Configure Bucket Permissions

1. Click on your bucket name
2. Go to **Permissions** tab
3. Click **Add** to add the service account
4. Add your service account email (from Google Drive setup)
5. Grant these roles:
   - **Storage Object Admin** (for full file management)
   - **Storage Object Viewer** (for reading files)

### 4. Update Environment Variables

Add these to your Railway environment variables:

```bash
# Google Cloud Storage
GOOGLE_CLOUD_STORAGE_BUCKET=offaccess-portal-files
GOOGLE_APPLICATION_CREDENTIALS_JSON={"your":"service_account_json_here"}
```

**Note**: Use the same service account JSON from your Google Drive setup.

### 5. Test the Setup

After deployment, test file uploads and downloads to ensure everything works.

## 📁 File Organization Structure

Files will be organized in the bucket as follows:

```
offaccess-portal-files/
├── orders/
│   ├── order-{timestamp}-{id}.xlsx
│   └── invoice-{timestamp}-{id}.pdf
├── catalogue/
│   └── stock-{timestamp}-{id}.xlsx
├── users/
│   └── profile-{timestamp}-{id}.jpg
└── other/
    └── {file-type}-{timestamp}-{id}.{ext}
```

## 🔄 Migration Process

### Phase 1: Deploy New Code
1. Deploy the updated code with Google Cloud Storage integration
2. New files will be uploaded to GCS
3. Existing files remain in base64 format

### Phase 2: Migrate Existing Files
1. Run the migration script:
   ```bash
   node scripts/migrate-files-to-gcs.js
   ```
2. This will move all base64 files to GCS
3. Update database records with GCS paths

### Phase 3: Clean Up
1. Remove base64 fields from database
2. Update code to remove base64 fallbacks
3. Monitor for any issues

## 🛠️ Migration Script

The migration script (`scripts/migrate-files-to-gcs.js`) will:

1. **Scan Database**: Find all records with base64 files
2. **Upload to GCS**: Convert base64 to files and upload
3. **Update Records**: Store GCS paths in database
4. **Remove Base64**: Clean up base64 data (optional)

## 🔍 Monitoring

### Check Migration Progress
```bash
# Check GCS bucket contents
gsutil ls gs://offaccess-portal-files/

# Check specific folders
gsutil ls gs://offaccess-portal-files/orders/
gsutil ls gs://offaccess-portal-files/catalogue/
```

### Monitor File Access
- Check Railway logs for download/upload operations
- Monitor GCS bucket usage and costs
- Verify file accessibility through the portal

## 💰 Cost Estimation

### Free Tier
- 5GB storage
- 1GB/day download
- 5GB/day upload

### Paid Tier (if needed)
- Storage: ~$0.02/GB/month
- Download: ~$0.12/GB
- Upload: Free

**Estimated monthly cost for 1000 files (avg 1MB each)**: ~$2-5/month

## 🔒 Security Features

1. **Private Files**: All files are private by default
2. **Signed URLs**: Temporary access URLs (1 hour expiry)
3. **Access Control**: IAM-based permissions
4. **Audit Logs**: Track all file operations

## 🚨 Troubleshooting

### Common Issues

1. **Authentication Error**
   - Verify service account JSON is correct
   - Check bucket permissions

2. **Upload Failures**
   - Check file size limits
   - Verify bucket exists and is accessible

3. **Download Failures**
   - Check file paths in database
   - Verify signed URL generation

### Debug Commands

```bash
# Test GCS connection
node -e "
const {Storage} = require('@google-cloud/storage');
const storage = new Storage();
storage.getBuckets().then(console.log).catch(console.error);
"

# List bucket contents
gsutil ls gs://offaccess-portal-files/
```

## 📞 Support

If you encounter issues:

1. Check Railway logs for error messages
2. Verify Google Cloud Console for bucket status
3. Test with a small file first
4. Contact support with specific error messages

## ✅ Success Criteria

Migration is complete when:

- [ ] All new files upload to GCS successfully
- [ ] All existing files are migrated to GCS
- [ ] File downloads work from GCS
- [ ] No base64 data remains in database
- [ ] Portal performance is improved
- [ ] File management is more reliable
