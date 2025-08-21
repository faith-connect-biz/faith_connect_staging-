import { apiService } from '@/services/api';

export interface ImportedImage {
  originalUrl: string;
  s3Url: string;
  fileName: string;
  contentType: string;
}

export class ImageImporter {
  /**
   * Import images from external URLs (like Eclat Flash Media)
   * This will download the image and upload it to your S3 bucket
   */
  static async importImageFromUrl(
    imageUrl: string, 
    businessId: string, 
    imageType: 'image' | 'logo' = 'image'
  ): Promise<ImportedImage> {
    try {
      // Step 1: Get pre-signed URL for upload
      const uploadData = await apiService.getImageUploadUrl(
        businessId,
        imageType,
        this.extractFileNameFromUrl(imageUrl),
        'image/jpeg' // Default content type
      );

      // Step 2: Download the image from external URL
      const imageBlob = await this.downloadImageAsBlob(imageUrl);
      
      // Step 3: Upload to S3 using pre-signed URL
      const uploadSuccess = await apiService.uploadFileToS3(
        uploadData.presigned_url,
        imageBlob
      );

      if (!uploadSuccess) {
        throw new Error('Failed to upload image to S3');
      }

      // Step 4: Update business with the uploaded image
      const result = await apiService.updateBusinessImage(
        businessId,
        imageType,
        uploadData.file_key
      );

      return {
        originalUrl: imageUrl,
        s3Url: result.s3_url,
        fileName: uploadData.file_key,
        contentType: 'image/jpeg'
      };

    } catch (error) {
      console.error('Error importing image:', error);
      throw error;
    }
  }

  /**
   * Import multiple images from external URLs
   */
  static async importMultipleImages(
    imageUrls: string[],
    businessId: string,
    imageType: 'image' | 'logo' = 'image'
  ): Promise<ImportedImage[]> {
    const results: ImportedImage[] = [];
    
    for (const imageUrl of imageUrls) {
      try {
        const result = await this.importImageFromUrl(imageUrl, businessId, imageType);
        results.push(result);
      } catch (error) {
        console.error(`Failed to import image ${imageUrl}:`, error);
        // Continue with other images
      }
    }
    
    return results;
  }

  /**
   * Download image from URL and convert to Blob
   */
  private static async downloadImageAsBlob(imageUrl: string): Promise<File> {
    try {
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`Failed to download image: ${response.statusText}`);
      }
      
      const blob = await response.blob();
      const fileName = this.extractFileNameFromUrl(imageUrl);
      
      return new File([blob], fileName, { type: blob.type || 'image/jpeg' });
    } catch (error) {
      console.error('Error downloading image:', error);
      throw error;
    }
  }

  /**
   * Extract filename from URL
   */
  private static extractFileNameFromUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const fileName = pathname.split('/').pop() || 'image.jpg';
      
      // Ensure it has an extension
      if (!fileName.includes('.')) {
        return `${fileName}.jpg`;
      }
      
      return fileName;
    } catch {
      return `imported_image_${Date.now()}.jpg`;
    }
  }

  /**
   * Get image dimensions from URL
   */
  static async getImageDimensions(imageUrl: string): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      img.src = imageUrl;
    });
  }

  /**
   * Validate image URL
   */
  static isValidImageUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      const validProtocols = ['http:', 'https:'];
      const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
      
      if (!validProtocols.includes(urlObj.protocol)) {
        return false;
      }
      
      const hasValidExtension = validExtensions.some(ext => 
        urlObj.pathname.toLowerCase().includes(ext)
      );
      
      return hasValidExtension;
    } catch {
      return false;
    }
  }
}
