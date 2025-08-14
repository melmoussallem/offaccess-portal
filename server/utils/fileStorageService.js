const { Storage } = require('@google-cloud/storage');
const path = require('path');
const fs = require('fs');
const os = require('os');

class FileStorageService {
  constructor() {
    console.log('🔧 Initializing FileStorageService...');
    console.log('📦 Bucket name:', process.env.GOOGLE_CLOUD_STORAGE_BUCKET || 'offaccess-portal-files');
    
    try {
      // Initialize Storage with service account credentials
      let storageConfig = {};
      
      console.log('🔍 Checking for service account credentials...');
      console.log('🔍 GOOGLE_APPLICATION_CREDENTIALS_JSON exists:', !!process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
      console.log('🔍 GOOGLE_APPLICATION_CREDENTIALS_JSON length:', process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON ? process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON.length : 0);
      
      // Since service account key creation is disabled, we'll use OAuth2 credentials
      console.log('🔑 Service account keys disabled, using OAuth2 credentials...');
      
      if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_REFRESH_TOKEN) {
        console.log('🔑 Using OAuth2 credentials for Google Cloud Storage');
        
        // Create OAuth2 credentials file that Google Cloud Storage can read
        const credentials = {
          type: 'authorized_user',
          client_id: process.env.GOOGLE_CLIENT_ID,
          client_secret: process.env.GOOGLE_CLIENT_SECRET,
          refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
          scopes: [
            'https://www.googleapis.com/auth/cloud-platform',
            'https://www.googleapis.com/auth/devstorage.full_control',
            'https://www.googleapis.com/auth/devstorage.read_write'
          ]
        };
        
        // Create a temporary credentials file
        const tempCredentialsPath = path.join(os.tmpdir(), `gcs-oauth2-credentials-${Date.now()}.json`);
        fs.writeFileSync(tempCredentialsPath, JSON.stringify(credentials, null, 2));
        
        console.log('🔑 Created temporary OAuth2 credentials file:', tempCredentialsPath);
        console.log('🔑 Credentials content preview:', JSON.stringify(credentials, null, 2).substring(0, 200) + '...');
        
        // Set the environment variable to point to the temporary file
        process.env.GOOGLE_APPLICATION_CREDENTIALS = tempCredentialsPath;
        
        // Use default configuration which will now read from the file
        storageConfig = {};
        
        console.log('🔑 OAuth2 authentication configured successfully');
      } else {
        console.error('❌ OAuth2 credentials not found. Please check your Railway environment variables.');
        console.log('🔍 Required variables:');
        console.log('  - GOOGLE_CLIENT_ID:', !!process.env.GOOGLE_CLIENT_ID);
        console.log('  - GOOGLE_CLIENT_SECRET:', !!process.env.GOOGLE_CLIENT_SECRET);
        console.log('  - GOOGLE_REFRESH_TOKEN:', !!process.env.GOOGLE_REFRESH_TOKEN);
        console.log('⚠️ Using default authentication');
      }
      
      console.log('🔧 Creating Storage instance with config:', Object.keys(storageConfig));
      this.storage = new Storage(storageConfig);
      this.bucketName = process.env.GOOGLE_CLOUD_STORAGE_BUCKET || 'offaccess-portal-files';
      this.bucket = this.storage.bucket(this.bucketName);
      this.baseUrl = `https://storage.googleapis.com/${this.bucketName}`;
      
      console.log('✅ FileStorageService initialized successfully');
      console.log('🌐 Base URL:', this.baseUrl);
      console.log('📦 Bucket:', this.bucketName);
    } catch (error) {
      console.error('❌ Error initializing FileStorageService:', error);
      throw error;
    }
  }

  /**
   * Upload a file to Google Cloud Storage
   * @param {Buffer} fileBuffer - File buffer
   * @param {string} fileName - Name to save the file as
   * @param {string} contentType - MIME type
   * @param {string} folder - Folder path (e.g., 'orders', 'catalogue', 'users')
   * @returns {Promise<Object>} Upload result with URL and metadata
   */
  async uploadFile(fileBuffer, fileName, contentType, folder = '') {
    try {
      const filePath = folder ? `${folder}/${fileName}` : fileName;
      const file = this.bucket.file(filePath);

      // Upload the file with public read access
      await file.save(fileBuffer, {
        metadata: {
          contentType: contentType,
          cacheControl: 'public, max-age=31536000', // 1 year cache
        },
        public: true, // Make files publicly readable
      });

      // For OAuth2 credentials, we can't generate signed URLs directly
      // Instead, we'll use a public URL or implement a different approach
      let downloadUrl = `${this.baseUrl}/${filePath}`;
      
      // Try to generate signed URL, but fallback gracefully if it fails
      let signedUrl = null;
      try {
        const [signedUrlResult] = await file.getSignedUrl({
          action: 'read',
          expires: Date.now() + 60 * 60 * 1000, // 1 hour
        });
        signedUrl = signedUrlResult;
      } catch (signError) {
        console.log('⚠️ Could not generate signed URL, using public URL:', signError.message);
        signedUrl = downloadUrl;
      }

      return {
        success: true,
        fileName: fileName,
        filePath: filePath,
        publicUrl: `${this.baseUrl}/${filePath}`,
        signedUrl: signedUrl,
        size: fileBuffer.length,
        contentType: contentType,
        uploadedAt: new Date()
      };
    } catch (error) {
      console.error('Error uploading file to Google Cloud Storage:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Download a file from Google Cloud Storage
   * @param {string} filePath - Full path to the file
   * @returns {Promise<Object>} Download result with buffer and metadata
   */
  async downloadFile(filePath) {
    try {
      const file = this.bucket.file(filePath);
      const [exists] = await file.exists();

      if (!exists) {
        return {
          success: false,
          error: 'File not found'
        };
      }

      const [buffer] = await file.download();
      const [metadata] = await file.getMetadata();

      return {
        success: true,
        buffer: buffer,
        contentType: metadata.contentType,
        size: metadata.size,
        fileName: path.basename(filePath),
        originalName: metadata.metadata?.originalName || path.basename(filePath)
      };
    } catch (error) {
      console.error('Error downloading file from Google Cloud Storage:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Generate a unique filename with timestamp and random ID
   * @param {string} originalName - Original filename
   * @param {string} prefix - Prefix for the filename (e.g., 'order-', 'invoice-')
   * @returns {string} Unique filename
   */
  generateUniqueFileName(originalName, prefix = '') {
    const timestamp = Date.now();
    const randomId = Math.floor(Math.random() * 1000000000);
    const fileExtension = path.extname(originalName);
    const baseName = path.basename(originalName, fileExtension);
    
    // Clean the base name (remove special characters)
    const cleanBaseName = baseName.replace(/[^a-zA-Z0-9]/g, '_');
    
    return `${prefix}${cleanBaseName}_${timestamp}_${randomId}${fileExtension}`;
  }

  /**
   * Generate a signed URL for file download
   * @param {string} filePath - Full path to the file
   * @param {number} expiresIn - Expiration time in milliseconds (default: 1 hour)
   * @returns {Promise<Object>} Signed URL result
   */
  async getSignedUrl(filePath, expiresIn = 60 * 60 * 1000) {
    try {
      const file = this.bucket.file(filePath);
      const [exists] = await file.exists();

      if (!exists) {
        return {
          success: false,
          error: 'File not found'
        };
      }

      const [signedUrl] = await file.getSignedUrl({
        action: 'read',
        expires: Date.now() + expiresIn,
      });

      return {
        success: true,
        signedUrl: signedUrl,
        expiresAt: new Date(Date.now() + expiresIn)
      };
    } catch (error) {
      console.error('Error generating signed URL:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Delete a file from Google Cloud Storage
   * @param {string} filePath - Full path to the file
   * @returns {Promise<Object>} Delete result
   */
  async deleteFile(filePath) {
    try {
      const file = this.bucket.file(filePath);
      const [exists] = await file.exists();

      if (!exists) {
        return {
          success: false,
          error: 'File not found'
        };
      }

      await file.delete();

      return {
        success: true,
        message: 'File deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting file from Google Cloud Storage:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * List files in a folder
   * @param {string} folder - Folder path
   * @returns {Promise<Object>} List result
   */
  async listFiles(folder = '') {
    try {
      const [files] = await this.bucket.getFiles({
        prefix: folder,
        delimiter: '/'
      });

      const fileList = files.map(file => ({
        name: file.name,
        size: file.metadata.size,
        contentType: file.metadata.contentType,
        createdAt: file.metadata.timeCreated,
        updatedAt: file.metadata.updated
      }));

      return {
        success: true,
        files: fileList
      };
    } catch (error) {
      console.error('Error listing files from Google Cloud Storage:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Migrate base64 file to Google Cloud Storage
   * @param {string} base64Data - Base64 encoded file data
   * @param {string} fileName - Name to save the file as
   * @param {string} contentType - MIME type
   * @param {string} folder - Folder path
   * @returns {Promise<Object>} Migration result
   */
  async migrateBase64File(base64Data, fileName, contentType, folder = '') {
    try {
      // Remove data URL prefix if present
      const base64String = base64Data.startsWith('data:') 
        ? base64Data.split(',')[1] 
        : base64Data;

      // Convert base64 to buffer
      const buffer = Buffer.from(base64String, 'base64');

      // Upload to Google Cloud Storage
      const uploadResult = await this.uploadFile(buffer, fileName, contentType, folder);

      if (uploadResult.success) {
        return {
          success: true,
          filePath: uploadResult.filePath,
          publicUrl: uploadResult.publicUrl,
          size: uploadResult.size,
          migratedAt: new Date()
        };
      } else {
        return uploadResult;
      }
    } catch (error) {
      console.error('Error migrating base64 file:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Generate a unique filename with timestamp
   * @param {string} originalName - Original filename
   * @param {string} prefix - Optional prefix
   * @returns {string} Unique filename
   */
  generateUniqueFileName(originalName, prefix = '') {
    const timestamp = Date.now();
    const randomId = Math.floor(Math.random() * 1000000);
    const extension = path.extname(originalName);
    const baseName = path.basename(originalName, extension);
    
    const uniqueName = `${prefix}${baseName}-${timestamp}-${randomId}${extension}`;
    return uniqueName;
  }

  /**
   * Get file info without downloading
   * @param {string} filePath - Full path to the file
   * @returns {Promise<Object>} File info
   */
  async getFileInfo(filePath) {
    try {
      const file = this.bucket.file(filePath);
      const [exists] = await file.exists();

      if (!exists) {
        return {
          success: false,
          error: 'File not found'
        };
      }

      const [metadata] = await file.getMetadata();

      return {
        success: true,
        fileName: path.basename(filePath),
        originalName: metadata.metadata?.originalName || path.basename(filePath),
        size: metadata.size,
        contentType: metadata.contentType,
        createdAt: metadata.timeCreated,
        updatedAt: metadata.updated
      };
    } catch (error) {
      console.error('Error getting file info:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Create singleton instance
const fileStorageService = new FileStorageService();

module.exports = fileStorageService;
