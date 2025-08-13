const { Storage } = require('@google-cloud/storage');
const path = require('path');

class FileStorageService {
  constructor() {
    console.log('🔧 Initializing FileStorageService...');
    console.log('📦 Bucket name:', process.env.GOOGLE_CLOUD_STORAGE_BUCKET || 'offaccess-portal-files');
    
    try {
      // Initialize Storage with service account credentials
      let storageConfig = {};
      
      if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
        console.log('🔑 Using service account credentials from environment variable');
        const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
        storageConfig = {
          credentials: credentials,
          projectId: credentials.project_id
        };
      } else {
        console.log('⚠️ No service account credentials found, using default authentication');
      }
      
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

      const [result] = await file.save(fileBuffer, {
        metadata: {
          contentType: contentType,
          cacheControl: 'public, max-age=31536000', // 1 year cache
        },
        public: false, // Keep files private
      });

      // Generate signed URL for download (valid for 1 hour)
      const [signedUrl] = await file.getSignedUrl({
        action: 'read',
        expires: Date.now() + 60 * 60 * 1000, // 1 hour
      });

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
