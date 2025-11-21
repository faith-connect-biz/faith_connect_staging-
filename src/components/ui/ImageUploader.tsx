import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { apiService } from '@/services/api';
import { toast } from 'sonner';

export interface ImageUploaderProps {
  onImageUploaded?: (imageUrl: string) => void;
  currentImageUrl?: string;
  maxSizeMB?: number;
  accept?: string;
  className?: string;
  disabled?: boolean;
  variant?: 'profile' | 'business' | 'logo';
  businessId?: string;
  // For unauthenticated uploads (profile completion)
  identifier?: string;
  authMethod?: 'email' | 'phone';
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImageUploaded,
  currentImageUrl,
  maxSizeMB = 5,
  accept = 'image/*',
  className,
  disabled = false,
  variant = 'profile',
  businessId,
  identifier,
  authMethod,
}) => {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(currentImageUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      toast.error(`Image size should be less than ${maxSizeMB}MB`);
      return;
    }

    // Create preview
    const preview = URL.createObjectURL(file);
    setPreviewUrl(preview);

    // Start upload
    await uploadImage(file);
  };

  const uploadImage = async (file: File) => {
    setUploading(true);

    try {
      // Normalize content type - ensure it matches common image MIME types
      let contentType = file.type || 'image/jpeg';
      
      // Handle cases where file.type might be empty or incorrect
      if (!contentType || contentType === 'application/octet-stream') {
        const extension = file.name.split('.').pop()?.toLowerCase();
        const mimeTypes: { [key: string]: string } = {
          'jpg': 'image/jpeg',
          'jpeg': 'image/jpeg',
          'png': 'image/png',
          'gif': 'image/gif',
          'webp': 'image/webp',
          'svg': 'image/svg+xml',
        };
        contentType = mimeTypes[extension || ''] || 'image/jpeg';
      }
      
      // Normalize to lowercase
      contentType = contentType.toLowerCase();
      
      // Step 1: Get presigned URL
      let presignedUrlData;
      
      if (variant === 'profile') {
        if (identifier && authMethod) {
          // Unauthenticated upload for profile completion
          presignedUrlData = await apiService.getProfilePhotoUploadUrlUnauthenticated(
            identifier,
            authMethod,
            file.name,
            contentType
          );
        } else {
          // Authenticated upload
          presignedUrlData = await apiService.getProfilePhotoUploadUrl(file.name, contentType);
        }
      } else if (variant === 'business' && businessId) {
        presignedUrlData = await apiService.getBusinessProfileImageUploadUrl(
          businessId,
          file.name,
          contentType
        );
      } else if (variant === 'logo' && businessId) {
        presignedUrlData = await apiService.getBusinessLogoUploadUrl(
          businessId,
          file.name,
          contentType
        );
      } else {
        throw new Error('Invalid upload configuration');
      }

      const { presigned_url, file_key, s3_url } = presignedUrlData;

      // Step 2: Upload file to S3 using presigned URL
      try {
        const uploadSuccess = await apiService.uploadFileToS3(presigned_url, file);
        
        if (!uploadSuccess) {
          throw new Error('Failed to upload image to S3');
        }
      } catch (uploadError: any) {
        console.error('S3 upload error:', uploadError);
        // Provide more helpful error message
        if (uploadError.message?.includes('CORS') || uploadError.message?.includes('OPTIONS')) {
          throw new Error('Upload failed due to CORS configuration. Please contact support.');
        }
        throw new Error(uploadError.message || 'Failed to upload image to S3. Please try again.');
      }

      // Step 3: Use the s3_url from the response
      // For unauthenticated uploads (profile completion), the s3_url will be sent when completing profile
      // For authenticated uploads, we can optionally update the profile with the file_key
      let finalImageUrl: string;
      
      if (variant === 'profile') {
        if (identifier && authMethod) {
          // For unauthenticated uploads, use the s3_url from the response
          // The complete-profile endpoint will save it when the profile is completed
          if (!s3_url) {
            throw new Error('Image URL (s3_url) not provided in response');
          }
          finalImageUrl = s3_url;
        } else {
          // Authenticated upload - update profile with the s3_url
          const result = await apiService.updateProfilePhoto(s3_url);
          finalImageUrl = result.profile_image_url || s3_url || '';
        }
      } else if (variant === 'business' && businessId) {
        const result = await apiService.updateBusinessProfileImage(businessId, file_key);
        finalImageUrl = result.business_image_url || s3_url || '';
      } else if (variant === 'logo' && businessId) {
        const result = await apiService.updateBusinessLogo(businessId, file_key);
        finalImageUrl = result.business_logo_url || s3_url || '';
      } else {
        throw new Error('Invalid upload configuration');
      }

      setUploadedImageUrl(finalImageUrl);
      
      // Clean up preview URL
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(finalImageUrl);

      // Notify parent component
      if (onImageUploaded) {
        onImageUploaded(finalImageUrl);
      }

      toast.success('Image uploaded successfully');
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast.error(error.response?.data?.error || error.message || 'Failed to upload image');
      
      // Clean up preview on error
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(null);
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = () => {
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setUploadedImageUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onImageUploaded) {
      onImageUploaded('');
    }
  };

  const displayUrl = previewUrl || currentImageUrl;

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center gap-4">
        <div className="relative">
          {displayUrl ? (
            <div className="relative group">
              <img
                src={displayUrl}
                alt="Preview"
                className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
              />
              {!disabled && (
                <button
                  onClick={handleRemove}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                  type="button"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ) : (
            <div className="w-20 h-20 rounded-full bg-gray-100 border-4 border-white shadow-lg flex items-center justify-center">
              <ImageIcon className="w-8 h-8 text-gray-400" />
            </div>
          )}
        </div>

        <div className="flex-1">
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileSelect}
            className="hidden"
            disabled={disabled || uploading}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || uploading}
            className="h-10 border-white/20 hover:border-white/30 hover:bg-white/10 rounded-xl transition-all duration-500 backdrop-blur-sm"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                {displayUrl ? 'Change Photo' : 'Upload Photo'}
              </>
            )}
          </Button>
          <p className="text-xs text-gray-500 mt-1">
            JPG, PNG up to {maxSizeMB}MB
          </p>
        </div>
      </div>
    </div>
  );
};

