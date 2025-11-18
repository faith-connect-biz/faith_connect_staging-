import React, { useState, useRef, useCallback } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { 
  Upload, 
  X, 
  Plus, 
  Image as ImageIcon,
  Link as LinkIcon,
  FileImage,
  Loader2
} from 'lucide-react';
import { apiService } from '@/services/api';
import { toast } from 'sonner';

interface PhotoItem {
  id: string;
  type: 'file' | 'url';
  file?: File;
  url?: string;
  preview: string;
  name: string;
  uploading?: boolean;
  uploadedUrl?: string;
}

interface FileUploadProps {
  photos: PhotoItem[];
  onPhotosChange: (photos: PhotoItem[]) => void;
  maxFiles?: number;
  acceptedTypes?: string[];
}

export function FileUpload({ 
  photos, 
  onPhotosChange, 
  maxFiles = 10,
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [uploadingPhotos, setUploadingPhotos] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const photosRef = useRef<PhotoItem[]>(photos);
  
  // Keep ref in sync with photos prop
  React.useEffect(() => {
    photosRef.current = photos;
  }, [photos]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, [photos]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  }, [photos]);

  const uploadPhoto = async (photo: PhotoItem): Promise<string> => {
    if (!photo.file) {
      throw new Error('No file to upload');
    }

    // Step 1: Get presigned URL from backend
    const presignedUrlData = await apiService.getProfilePhotoUploadUrl(
      photo.file.name,
      photo.file.type
    );

    const { presigned_url, file_key, s3_url } = presignedUrlData;

    // Step 2: Upload file to S3 using presigned URL
    const uploadSuccess = await apiService.uploadFileToS3(presigned_url, photo.file);

    if (!uploadSuccess) {
      throw new Error('Failed to upload file to S3');
    }

    // Step 3: Return the S3 URL
    // Construct S3 URL if not provided
    if (s3_url) {
      return s3_url;
    } else {
      // Fallback: construct S3 URL from file_key
      const bucketName = import.meta.env.VITE_AWS_STORAGE_BUCKET_NAME || 'faithconnectapp';
      const region = import.meta.env.VITE_AWS_S3_REGION_NAME || 'af-south-1';
      return `https://${bucketName}.s3.${region}.amazonaws.com/${file_key}`;
    }
  };

  const handleFiles = async (files: File[]) => {
    const validFiles = files.filter(file => 
      acceptedTypes.includes(file.type) && file.size <= 5 * 1024 * 1024 // 5MB limit
    );

    if (photos.length + validFiles.length > maxFiles) {
      toast.error(`You can only upload up to ${maxFiles} photos.`);
      return;
    }

    // Create photo items with uploading state
    const newPhotos: PhotoItem[] = validFiles.map((file, index) => ({
      id: `file-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'file' as const,
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
      uploading: true,
      uploadedUrl: undefined
    }));

    // Add photos immediately with uploading state
    const initialPhotos = [...photos, ...newPhotos];
    photosRef.current = initialPhotos;
    onPhotosChange(initialPhotos);

    // Upload each photo
    const uploadPromises = newPhotos.map(async (photo) => {
      try {
        setUploadingPhotos(prev => new Set(prev).add(photo.id));
        
        const uploadedUrl = await uploadPhoto(photo);
        
        // Update the photo with uploaded URL
        const currentPhotos = photosRef.current;
        const photoIndex = currentPhotos.findIndex(p => p.id === photo.id);
        if (photoIndex !== -1) {
          const updatedPhotos = [...currentPhotos];
          updatedPhotos[photoIndex] = {
            ...updatedPhotos[photoIndex],
            uploading: false,
            uploadedUrl: uploadedUrl,
            url: uploadedUrl,
            preview: uploadedUrl, // Update preview to show uploaded image
            type: 'url' // Change type to url since it's now uploaded
          };
          
          // Clean up blob URL
          if (photo.preview.startsWith('blob:')) {
            URL.revokeObjectURL(photo.preview);
          }
          
          photosRef.current = updatedPhotos;
          onPhotosChange(updatedPhotos);
        }
        
        toast.success(`Photo "${photo.name}" uploaded successfully`);
      } catch (error: any) {
        console.error('Error uploading photo:', error);
        toast.error(`Failed to upload "${photo.name}": ${error.message || 'Unknown error'}`);
        
        // Remove failed photo from list
        const currentPhotos = photosRef.current;
        // Clean up blob URL
        if (photo.preview.startsWith('blob:')) {
          URL.revokeObjectURL(photo.preview);
        }
        
        const filteredPhotos = currentPhotos.filter(p => p.id !== photo.id);
        photosRef.current = filteredPhotos;
        onPhotosChange(filteredPhotos);
      } finally {
        setUploadingPhotos(prev => {
          const newSet = new Set(prev);
          newSet.delete(photo.id);
          return newSet;
        });
      }
    });

    // Wait for all uploads to complete
    await Promise.all(uploadPromises);
  };

  const handleUrlAdd = () => {
    if (!urlInput.trim()) return;

    const newPhoto: PhotoItem = {
      id: `url-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'url',
      url: urlInput.trim(),
      preview: urlInput.trim(),
      name: urlInput.trim().split('/').pop() || 'Image URL'
    };

    onPhotosChange([...photos, newPhoto]);
    setUrlInput('');
    setShowUrlInput(false);
  };

  const handleRemovePhoto = (id: string) => {
    const photoToRemove = photos.find(p => p.id === id);
    if (photoToRemove?.type === 'file' && photoToRemove.preview) {
      URL.revokeObjectURL(photoToRemove.preview);
    }
    onPhotosChange(photos.filter(photo => photo.id !== id));
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <Card className={`border-2 border-dashed transition-colors ${
        isDragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
      }`}>
        <CardContent 
          className="p-8 text-center cursor-pointer"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleUploadClick}
        >
          <div className="flex flex-col items-center space-y-4">
            <div className={`p-4 rounded-full ${
              isDragOver ? 'bg-primary/10' : 'bg-muted'
            }`}>
              <Upload className={`h-8 w-8 ${
                isDragOver ? 'text-primary' : 'text-muted-foreground'
              }`} />
            </div>
            
            <div className="space-y-2">
              <p className="text-lg">
                {isDragOver ? 'Drop your images here' : 'Drag & drop images here'}
              </p>
              <p className="text-sm text-muted-foreground">
                or click to browse files
              </p>
              <p className="text-xs text-muted-foreground">
                Supports JPEG, PNG, WEBP, GIF up to 5MB each
              </p>
            </div>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={acceptedTypes.join(',')}
            onChange={handleFileSelect}
            className="hidden"
          />
        </CardContent>
      </Card>

      {/* Alternative Options */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleUploadClick}
          className="flex items-center gap-2"
        >
          <FileImage className="h-4 w-4" />
          Upload Files
        </Button>
        
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="flex items-center gap-2"
        >
          <LinkIcon className="h-4 w-4" />
          Add URL
        </Button>
      </div>

      {/* URL Input */}
      {showUrlInput && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-2">
              <Label>Add Photo URL</Label>
              <div className="flex gap-2">
                <Input
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="flex-1"
                />
                <Button 
                  type="button" 
                  onClick={handleUrlAdd}
                  size="sm"
                  disabled={!urlInput.trim()}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Photo Grid */}
      {photos.length > 0 && (
        <div className="space-y-4">
          <Label>Uploaded Photos ({photos.length}/{maxFiles})</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map((photo) => (
              <Card key={photo.id} className="relative group overflow-hidden">
                <CardContent className="p-2">
                  <div className="aspect-square relative overflow-hidden rounded-md bg-muted">
                    <img
                      src={photo.preview}
                      alt={photo.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIGZpbGw9IiNmMGYwZjEiLz4KICA8cGF0aCBkPSJNMTIgMTZMMTcgMTFIMTVWN0g5VjExSDdMMTIgMTZaIiBmaWxsPSIjOWNhM2FmIi8+Cjwvc3ZnPgo=';
                      }}
                    />
                    
                    {/* Remove Button */}
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(photo.id)}
                      className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>

                    {/* Uploading Overlay */}
                    {photo.uploading && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-md">
                        <Loader2 className="h-6 w-6 text-white animate-spin" />
                      </div>
                    )}

                    {/* Type Badge */}
                    <Badge 
                      variant="secondary" 
                      className="absolute bottom-1 left-1 text-xs py-0 px-1"
                    >
                      {photo.uploading ? (
                        <>
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          uploading
                        </>
                      ) : photo.type === 'file' ? (
                        <>
                          <FileImage className="h-3 w-3 mr-1" />
                          file
                        </>
                      ) : (
                        <>
                          <LinkIcon className="h-3 w-3 mr-1" />
                          url
                        </>
                      )}
                    </Badge>
                  </div>
                  
                  <p className="text-xs text-muted-foreground mt-2 truncate">
                    {photo.name}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {photos.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>No photos added yet</p>
          <p className="text-sm">Upload files or add URLs to showcase your business</p>
        </div>
      )}
    </div>
  );
}