import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Upload, X, Image as ImageIcon, Loader2, Plus } from 'lucide-react';

interface MultiImageUploadProps {
  value?: string[];
  onChange: (imageUrls: string[]) => void;
  label?: string;
  placeholder?: string;
  className?: string;
  maxImages?: number;
}

export const MultiImageUpload: React.FC<MultiImageUploadProps> = ({
  value = [],
  onChange,
  label = "Images",
  placeholder = "Upload images",
  className = "",
  maxImages = 5
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (file: File) => {
    if (!file) return;

    // Check if we already have max images
    if (value.length >= maxImages) {
      toast({
        title: "Maximum Images Reached",
        description: `You can only upload up to ${maxImages} images.`,
        variant: "destructive"
      });
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File Type",
        description: "Please select an image file (JPG, PNG, GIF, etc.)",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    try {
      // Convert image to base64 for now, and upload to S3 later during form submission
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64String = e.target?.result as string;
        onChange([...value, base64String]);
        
        toast({
          title: "Success",
          description: "Image added successfully! It will be uploaded when you submit the form.",
        });
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error processing image:', error);
      toast({
        title: "Error",
        description: "Failed to process image. Please try again.",
        variant: "destructive"
      });
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleImageUpload(files[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = (index: number) => {
    const newImages = value.filter((_, i) => i !== index);
    onChange(newImages);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <Label className="text-sm font-medium">{label}</Label>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Image Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {value.map((imageUrl, index) => (
          <div key={index} className="relative group">
            <img
              src={imageUrl}
              alt={`Image ${index + 1}`}
              className="w-full h-24 object-cover rounded-lg border border-gray-200"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  onClick={() => handleRemove(index)}
                  disabled={isUploading}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
        
        {/* Add Image Button */}
        {value.length < maxImages && (
          <div
            onClick={handleClick}
            className="w-full h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 transition-colors duration-200"
          >
            {isUploading ? (
              <div className="flex flex-col items-center space-y-1">
                <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                <span className="text-xs text-gray-500">Uploading...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-1">
                <Plus className="h-5 w-5 text-gray-400" />
                <span className="text-xs text-gray-500">Add Image</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Image Count */}
      <div className="text-xs text-gray-500">
        {value.length} of {maxImages} images uploaded
      </div>
    </div>
  );
};
