// STL Preview Service for generating and managing 3D model previews

export interface STLPreviewData {
  id: string;
  fileName: string;
  fileSize: number;
  previewUrl?: string;
  thumbnailUrl?: string;
  dimensions?: {
    width: number;
    height: number;
    depth: number;
  };
  volume?: number;
  surfaceArea?: number;
  createdAt: Date;
}

export class STLPreviewService {
  private static readonly STORAGE_KEY = 'stl_previews';
  private static readonly MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
  private static readonly MAX_STORAGE_SIZE = 5 * 1024 * 1024; // 5MB total storage limit

  /**
   * Generate a preview for an STL file
   */
  static async generatePreview(file: File): Promise<STLPreviewData> {
    try {
      // Validate file
      if (!this.isValidSTLFile(file)) {
        throw new Error('Invalid STL file');
      }

      if (file.size > this.MAX_FILE_SIZE) {
        throw new Error('File too large (max 50MB)');
      }

      // Create unique ID for this file
      const id = this.generateFileId(file);
      
      // Check if we already have a preview for this file
      const existingPreview = this.getPreviewById(id);
      if (existingPreview) {
        return existingPreview;
      }

      // Generate preview data
      const previewData: STLPreviewData = {
        id,
        fileName: file.name,
        fileSize: file.size,
        createdAt: new Date(),
      };

      // Check if file is too large for storage before attempting to store
      if (this.isFileTooLargeForStorage(file)) {
        console.warn('File too large for localStorage, skipping storage but continuing with preview');
        return previewData;
      }

      try {
        // Store the file for preview generation
        await this.storeFileForPreview(file, id);

        // Save preview data
        this.savePreviewData(previewData);
      } catch (storageError) {
        console.warn('Storage error during preview generation, continuing without storage:', storageError);
        
        // Return preview data without storage - the file can still be processed
        // The preview won't be cached, but the file upload will work
      }

      return previewData;
    } catch (error) {
      console.error('Error generating STL preview:', error);
      
      // For storage quota errors, don't throw - just return a basic preview
      if (error instanceof Error && error.message.includes('quota')) {
        console.warn('Storage quota exceeded, returning basic preview data');
        return {
          id: this.generateFileId(file),
          fileName: file.name,
          fileSize: file.size,
          createdAt: new Date(),
        };
      }
      
      throw error;
    }
  }

  /**
   * Get preview data by file ID
   */
  static getPreviewById(id: string): STLPreviewData | null {
    try {
      const previews = this.getAllPreviews();
      return previews.find(preview => preview.id === id) || null;
    } catch (error) {
      console.error('Error getting preview by ID:', error);
      return null;
    }
  }

  /**
   * Get all stored previews
   */
  static getAllPreviews(): STLPreviewData[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error getting all previews:', error);
      return [];
    }
  }

  /**
   * Get preview URL for a file
   */
  static getPreviewUrl(file: File | string): string | null {
    try {
      const id = typeof file === 'string' ? file : this.generateFileId(file);
      const preview = this.getPreviewById(id);
      return preview?.previewUrl || null;
    } catch (error) {
      console.error('Error getting preview URL:', error);
      return null;
    }
  }

  /**
   * Store file data for preview generation
   */
  private static async storeFileForPreview(file: File, id: string): Promise<void> {
    try {
      // Check if we're approaching storage limits
      this.cleanupOldFiles();
      
      // Convert file to base64 for storage
      const base64 = await this.fileToBase64(file);
      
      const fileData = {
        id,
        name: file.name,
        size: file.size,
        data: base64,
        type: file.type,
        timestamp: Date.now(),
      };

      const files = this.getStoredFiles();
      
      // Check if adding this file would exceed storage limits
      const newFiles = [...files, fileData];
      const totalSize = this.calculateStorageSize(newFiles);
      
      if (totalSize > this.MAX_STORAGE_SIZE) {
        console.warn('Storage limit approaching, removing oldest files');
        this.removeOldestFiles(newFiles, this.MAX_STORAGE_SIZE);
      }
      
      // Try to store with error handling
      try {
        localStorage.setItem('stl_files', JSON.stringify(newFiles));
      } catch (storageError) {
        if (storageError instanceof Error && storageError.name === 'QuotaExceededError') {
          console.warn('Storage quota exceeded, performing aggressive cleanup');
          
          // Clear all stored files and try to store just the new one
          this.clearAllStoredFiles();
          
          // Check if even a single file is too large
          const singleFileSize = this.calculateStorageSize([fileData]);
          if (singleFileSize > this.MAX_STORAGE_SIZE) {
            console.warn('Single file too large for storage, skipping storage');
            return; // Don't store anything, but don't throw error
          }
          
          // Try to store just the new file
          try {
            localStorage.setItem('stl_files', JSON.stringify([fileData]));
          } catch (secondError) {
            console.warn('Even single file storage failed, continuing without storage');
            // Don't throw, just continue without storage
          }
        } else {
          throw storageError;
        }
      }
    } catch (error) {
      console.error('Error storing file for preview:', error);
      // Don't throw error, just log it and continue without storage
      console.warn('Continuing without file storage due to error:', error);
    }
  }

  /**
   * Get stored file data
   */
  static getStoredFile(id: string): any | null {
    try {
      // First check stored files
      const files = this.getStoredFiles();
      const storedFile = files.find(file => file.id === id);
      if (storedFile) {
        return storedFile;
      }

      // Then check sample files
      const sampleFilesData = localStorage.getItem('stl_files');
      if (sampleFilesData) {
        const sampleFiles = JSON.parse(sampleFilesData);
        const sampleFile = sampleFiles.find((file: any) => file.id === id);
        if (sampleFile) {
          return sampleFile;
        }
      }

      return null;
    } catch (error) {
      console.error('Error getting stored file:', error);
      return null;
    }
  }

  /**
   * Get all stored files
   */
  static getStoredFiles(): any[] {
    try {
      const stored = localStorage.getItem('stl_files');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error getting stored files:', error);
      return [];
    }
  }

  /**
   * Convert file to base64
   */
  private static fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }

  /**
   * Convert base64 back to file
   */
  static base64ToFile(base64: string, fileName: string, mimeType: string): File {
    const byteCharacters = atob(base64.split(',')[1]);
    const byteNumbers = new Array(byteCharacters.length);
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: mimeType });
    
    return new File([blob], fileName, { type: mimeType });
  }

  /**
   * Generate a unique ID for a file
   */
  static generateFileId(file: File): string {
    // Use file name, size, and last modified as a simple hash
    const hash = `${file.name}_${file.size}_${file.lastModified}`;
    return btoa(hash).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
  }

  /**
   * Validate if file is a valid STL file
   */
  private static isValidSTLFile(file: File): boolean {
    const validTypes = [
      'model/stl',
      'application/vnd.ms-pki.stl',
      'application/sla',
      'application/octet-stream'
    ];
    
    const validExtensions = ['.stl'];
    
    // Check MIME type
    if (validTypes.includes(file.type)) {
      return true;
    }
    
    // Check file extension
    const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    if (validExtensions.includes(extension)) {
      return true;
    }
    
    return false;
  }

  /**
   * Check if a file is too large for localStorage storage
   */
  private static isFileTooLargeForStorage(file: File): boolean {
    // Estimate the size when converted to base64 and stored as JSON
    // Base64 is approximately 4/3 the size of the original data
    const estimatedBase64Size = Math.ceil(file.size * 4 / 3);
    
    // Add JSON overhead (keys, brackets, etc.) - estimate 200 bytes
    const estimatedJsonOverhead = 200;
    
    const estimatedTotalSize = estimatedBase64Size + estimatedJsonOverhead;
    
    // If the estimated size is more than 80% of our storage limit, consider it too large
    return estimatedTotalSize > (this.MAX_STORAGE_SIZE * 0.8);
  }

  /**
   * Save preview data to storage
   */
  private static savePreviewData(previewData: STLPreviewData): void {
    try {
      const previews = this.getAllPreviews();
      const existingIndex = previews.findIndex(p => p.id === previewData.id);
      
      if (existingIndex >= 0) {
        previews[existingIndex] = previewData;
      } else {
        previews.push(previewData);
      }
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(previews));
    } catch (error) {
      console.error('Error saving preview data:', error);
      
      // If it's a quota error, try to clean up and retry
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        console.warn('Storage quota exceeded for preview data, cleaning up');
        this.cleanupOldPreviews();
        
        try {
          // Try again with cleaned storage
          localStorage.setItem(this.STORAGE_KEY, JSON.stringify([previewData]));
        } catch (secondError) {
          console.warn('Even after cleanup, preview data storage failed, continuing without storage');
          // Don't throw, just continue without storage
        }
      } else {
        // For other errors, don't throw - just log and continue
        console.warn('Continuing without preview data storage due to error:', error);
      }
    }
  }

  /**
   * Clean up old previews (older than 7 days)
   */
  static cleanupOldPreviews(): void {
    try {
      const previews = this.getAllPreviews();
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const validPreviews = previews.filter(preview => 
        new Date(preview.createdAt) > sevenDaysAgo
      );
      
      if (validPreviews.length !== previews.length) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(validPreviews));
      }
    } catch (error) {
      console.error('Error cleaning up old previews:', error);
    }
  }

  /**
   * Clean up old files to prevent storage quota issues
   */
  private static cleanupOldFiles(): void {
    try {
      const files = this.getStoredFiles();
      const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000); // 24 hours ago
      
      const recentFiles = files.filter(file => 
        file.timestamp && file.timestamp > oneDayAgo
      );
      
      if (recentFiles.length !== files.length) {
        localStorage.setItem('stl_files', JSON.stringify(recentFiles));
        console.log(`Cleaned up ${files.length - recentFiles.length} old files`);
      }
    } catch (error) {
      console.error('Error cleaning up old files:', error);
    }
  }

  /**
   * Calculate total storage size of files
   */
  private static calculateStorageSize(files: any[]): number {
    return files.reduce((total, file) => {
      // Base64 data is approximately 4/3 the size of the original data
      // Plus JSON overhead (keys, brackets, etc.)
      const dataSize = file.data ? file.data.length : 0;
      const jsonOverhead = JSON.stringify(file).length - dataSize;
      return total + dataSize + jsonOverhead;
    }, 0);
  }

  /**
   * Remove oldest files to stay under storage limit
   */
  private static removeOldestFiles(files: any[], maxSize: number): void {
    // Sort files by timestamp (oldest first)
    const sortedFiles = files.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
    
    let currentSize = 0;
    const filesToKeep = [];
    
    for (const file of sortedFiles) {
      const fileSize = file.data ? file.data.length : 0;
      if (currentSize + fileSize <= maxSize) {
        filesToKeep.push(file);
        currentSize += fileSize;
      } else {
        break;
      }
    }
    
    localStorage.setItem('stl_files', JSON.stringify(filesToKeep));
    console.log(`Removed ${files.length - filesToKeep.length} files to stay under storage limit`);
  }

  /**
   * Clear all stored files (emergency cleanup)
   */
  static clearAllStoredFiles(): void {
    try {
      localStorage.removeItem('stl_files');
      console.log('Cleared all stored STL files');
    } catch (error) {
      console.error('Error clearing stored files:', error);
    }
  }

  /**
   * Clear all storage (emergency cleanup for quota issues)
   */
  static clearAllStorage(): void {
    try {
      localStorage.removeItem('stl_files');
      localStorage.removeItem(this.STORAGE_KEY);
      console.log('Cleared all STL preview storage');
    } catch (error) {
      console.error('Error clearing all storage:', error);
    }
  }

  /**
   * Get storage usage information
   */
  static getStorageInfo(): { used: number; limit: number; percentage: number } {
    try {
      const files = this.getStoredFiles();
      const used = this.calculateStorageSize(files);
      const limit = this.MAX_STORAGE_SIZE;
      const percentage = (used / limit) * 100;
      
      return { used, limit, percentage };
    } catch (error) {
      console.error('Error getting storage info:', error);
      return { used: 0, limit: this.MAX_STORAGE_SIZE, percentage: 0 };
    }
  }

  /**
   * Initialize sample STL files for testing
   */
  static initializeSampleFiles(): void {
    try {
      // Create a simple cube STL file
      const cubeSTL = `solid cube
  facet normal 0.0 0.0 1.0
    outer loop
      vertex 0.0 0.0 1.0
      vertex 1.0 0.0 1.0
      vertex 1.0 1.0 1.0
    endloop
  endfacet
  facet normal 0.0 0.0 1.0
    outer loop
      vertex 0.0 0.0 1.0
      vertex 1.0 1.0 1.0
      vertex 0.0 1.0 1.0
    endloop
  endfacet
  facet normal 0.0 0.0 -1.0
    outer loop
      vertex 0.0 0.0 0.0
      vertex 0.0 1.0 0.0
      vertex 1.0 1.0 0.0
    endloop
  endfacet
  facet normal 0.0 0.0 -1.0
    outer loop
      vertex 0.0 0.0 0.0
      vertex 1.0 1.0 0.0
      vertex 1.0 0.0 0.0
    endloop
  endfacet
  facet normal 0.0 1.0 0.0
    outer loop
      vertex 0.0 1.0 0.0
      vertex 0.0 1.0 1.0
      vertex 1.0 1.0 1.0
    endloop
  endfacet
  facet normal 0.0 1.0 0.0
    outer loop
      vertex 0.0 1.0 0.0
      vertex 1.0 1.0 1.0
      vertex 1.0 1.0 0.0
    endloop
  endfacet
  facet normal 0.0 -1.0 0.0
    outer loop
      vertex 0.0 0.0 0.0
      vertex 1.0 0.0 0.0
      vertex 1.0 0.0 1.0
    endloop
  endfacet
  facet normal 0.0 -1.0 0.0
    outer loop
      vertex 0.0 0.0 0.0
      vertex 1.0 0.0 1.0
      vertex 0.0 0.0 1.0
    endloop
  endfacet
  facet normal 1.0 0.0 0.0
    outer loop
      vertex 1.0 0.0 0.0
      vertex 1.0 1.0 0.0
      vertex 1.0 1.0 1.0
    endloop
  endfacet
  facet normal 1.0 0.0 0.0
    outer loop
      vertex 1.0 0.0 0.0
      vertex 1.0 1.0 1.0
      vertex 1.0 0.0 1.0
    endloop
  endfacet
  facet normal -1.0 0.0 0.0
    outer loop
      vertex 0.0 0.0 0.0
      vertex 0.0 0.0 1.0
      vertex 0.0 1.0 1.0
    endloop
  endfacet
  facet normal -1.0 0.0 0.0
    outer loop
      vertex 0.0 0.0 0.0
      vertex 0.0 1.0 1.0
      vertex 0.0 1.0 0.0
    endloop
  endfacet
endsolid cube`;

      // Create sample files for mock orders
      const sampleFiles = [
        {
          id: 'robot_arm_stl_2048576_1734278400000',
          name: 'robot_arm.stl',
          size: 2048576,
          data: btoa(cubeSTL),
          type: 'application/sla'
        },
        {
          id: 'miniature_figures_stl_1048576_1734192000000',
          name: 'miniature_figures.stl',
          size: 1048576,
          data: btoa(cubeSTL),
          type: 'application/sla'
        },
        {
          id: 'phone_stand_stl_512000_1733827200000',
          name: 'phone_stand.stl',
          size: 512000,
          data: btoa(cubeSTL),
          type: 'application/sla'
        },
        {
          id: 'keychain_stl_256000_1734350400000',
          name: 'keychain.stl',
          size: 256000,
          data: btoa(cubeSTL),
          type: 'application/sla'
        }
      ];

      // Store sample files
      localStorage.setItem('stl_files', JSON.stringify(sampleFiles));
      
      console.log('Sample STL files initialized');
    } catch (error) {
      console.error('Error initializing sample files:', error);
    }
  }

  /**
   * Delete a specific preview
   */
  static deletePreview(id: string): boolean {
    try {
      const previews = this.getAllPreviews();
      const filteredPreviews = previews.filter(p => p.id !== id);
      
      if (filteredPreviews.length !== previews.length) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredPreviews));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error deleting preview:', error);
      return false;
    }
  }
}
