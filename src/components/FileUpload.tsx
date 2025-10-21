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
  FileImage
} from 'lucide-react';

interface PhotoItem {
  id: string;
  type: 'file' | 'url';
  file?: File;
  url?: string;
  preview: string;
  name: string;
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
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFiles = (files: File[]) => {
    const validFiles = files.filter(file => 
      acceptedTypes.includes(file.type) && file.size <= 5 * 1024 * 1024 // 5MB limit
    );

    if (photos.length + validFiles.length > maxFiles) {
      alert(`You can only upload up to ${maxFiles} photos.`);
      return;
    }

    const newPhotos = validFiles.map(file => ({
      id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'file' as const,
      file,
      preview: URL.createObjectURL(file),
      name: file.name
    }));

    onPhotosChange([...photos, ...newPhotos]);
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

                    {/* Type Badge */}
                    <Badge 
                      variant="secondary" 
                      className="absolute bottom-1 left-1 text-xs py-0 px-1"
                    >
                      {photo.type === 'file' ? (
                        <FileImage className="h-3 w-3 mr-1" />
                      ) : (
                        <LinkIcon className="h-3 w-3 mr-1" />
                      )}
                      {photo.type}
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