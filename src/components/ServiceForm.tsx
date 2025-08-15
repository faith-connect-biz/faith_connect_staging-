import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { apiService } from '@/services/api';
import { Upload, X, Image as ImageIcon, Plus } from 'lucide-react';

interface Service {
  id?: number;
  name: string;
  description?: string;
  price_range?: string;
  duration?: string;
  is_active: boolean;
  service_image_url?: string;
  images?: string[];
}

interface ServiceFormProps {
  isOpen: boolean;
  onClose: () => void;
  businessId: string;
  service?: Service | null;
  onSuccess: () => void;
}

export const ServiceForm: React.FC<ServiceFormProps> = ({
  isOpen,
  onClose,
  businessId,
  service,
  onSuccess
}) => {
  const [formData, setFormData] = useState<Service>({
    name: '',
    description: '',
    price_range: '',
    duration: '',
    is_active: true,
    service_image_url: '',
    images: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  useEffect(() => {
    if (service) {
      setFormData({
        id: service.id,
        name: service.name || '',
        description: service.description || '',
        price_range: service.price_range || '',
        duration: service.duration || '',
        is_active: service.is_active,
        service_image_url: service.service_image_url || '',
        images: service.images || []
      });
      // Set image previews from existing images
      const previews = [];
      if (service.service_image_url) previews.push(service.service_image_url);
      if (service.images) previews.push(...service.images);
      setImagePreviews(previews);
    } else {
      setFormData({
        name: '',
        description: '',
        price_range: '',
        duration: '',
        is_active: true,
        service_image_url: '',
        images: []
      });
      setImagePreviews([]);
    }
  }, [service]);

  const handleImageUpload = async (file: File) => {
    if (!file) return;

    // Check if we already have 5 images
    if (imagePreviews.length >= 5) {
      toast({
        title: "Maximum Images Reached",
        description: "You can only upload up to 5 images per service.",
        variant: "destructive"
      });
      return;
    }

    setUploadingImages(true);
    try {
      // Get pre-signed URL for upload
      const uploadData = await apiService.getProfilePhotoUploadUrl(file.name, file.type);
      
      // Upload file to S3
      const uploadSuccess = await apiService.uploadFileToS3(uploadData.presigned_url, file);
      
      if (uploadSuccess) {
        // Generate S3 URL
        const s3Url = `https://${import.meta.env.VITE_AWS_STORAGE_BUCKET_NAME || 'faithconnectapp'}.s3.${import.meta.env.VITE_AWS_S3_REGION_NAME || 'af-south-1'}.amazonaws.com/${uploadData.file_key}`;
        
        setFormData(prev => ({ ...prev, images: [...prev.images || [], s3Url] }));
        setImagePreviews(prev => [...prev, s3Url]);
        
        toast({
          title: "Success",
          description: "Image uploaded successfully!",
        });
      } else {
        throw new Error('Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Error",
        description: "Failed to upload image. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploadingImages(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      // Check if adding these files would exceed the 5 image limit
      if (imagePreviews.length + files.length > 5) {
        toast({
          title: "Too Many Images",
          description: "You can only have up to 5 images total. Please remove some existing images first.",
          variant: "destructive"
        });
        return;
      }

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        // Validate file type
        if (!file.type.startsWith('image/')) {
          toast({
            title: "Invalid File",
            description: "Please select an image file",
            variant: "destructive"
          });
          continue;
        }

        // Validate file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
          toast({
            title: "File Too Large",
            description: "Image must be less than 5MB",
            variant: "destructive"
          });
          continue;
        }

        handleImageUpload(file);
      }
    }
  };

  const removeImage = (indexToRemove: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images?.filter((_, index) => index !== indexToRemove) || []
    }));
    setImagePreviews(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Service name is required",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // Prepare the data to send, including images
      const serviceData = {
        ...formData,
        images: imagePreviews // Send all image previews as the images array
      };

      if (service?.id) {
        // Update existing service
        await apiService.updateService(service.id.toString(), serviceData);
        toast({
          title: "Success",
          description: "Service updated successfully!",
        });
      } else {
        // Create new service
        await apiService.createService(businessId, serviceData);
        toast({
          title: "Success",
          description: "Service created successfully!",
        });
      }
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving service:', error);
      toast({
        title: "Error",
        description: "Failed to save service. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof Service, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="sm:max-w-[500px]"
        aria-describedby="service-form-description"
      >
        <DialogHeader>
          <DialogTitle>
            {service ? 'Edit Service' : 'Add New Service'}
          </DialogTitle>
        </DialogHeader>
        <div id="service-form-description" className="sr-only">
          {service ? 'Edit existing service details' : 'Add a new service to your business'}
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Service Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter service name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe your service"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price_range">Price Range</Label>
              <Select
                value={formData.price_range}
                onValueChange={(value) => handleInputChange('price_range', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select price range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Under KSh 1,000">Under KSh 1,000</SelectItem>
                  <SelectItem value="KSh 1,000 - KSh 2,500">KSh 1,000 - KSh 2,500</SelectItem>
                  <SelectItem value="KSh 2,500 - KSh 5,000">KSh 2,500 - KSh 5,000</SelectItem>
                  <SelectItem value="KSh 5,000 - KSh 10,000">KSh 5,000 - KSh 10,000</SelectItem>
                  <SelectItem value="KSh 10,000 - KSh 25,000">KSh 10,000 - KSh 25,000</SelectItem>
                  <SelectItem value="Over KSh 25,000">Over KSh 25,000</SelectItem>
                  <SelectItem value="Contact for quote">Contact for quote</SelectItem>
                  <SelectItem value="Free">Free</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration</Label>
              <Input
                id="duration"
                value={formData.duration}
                onChange={(e) => handleInputChange('duration', e.target.value)}
                placeholder="e.g., 1 hour, 2 days"
              />
            </div>
          </div>

          {/* Image Upload Section */}
          <div className="space-y-2">
            <Label>Service Images (Optional) - Up to 5 images</Label>
            <div className="space-y-3">
              {imagePreviews.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative">
                      <img 
                        src={preview} 
                        alt={`Service preview ${index + 1}`} 
                        className="w-full h-32 object-cover rounded-lg border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => removeImage(index)}
                        disabled={uploadingImages}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : null}
              
              {imagePreviews.length < 5 && (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <Label htmlFor="service-image" className="cursor-pointer text-sm text-gray-600">
                    {uploadingImages ? 'Uploading...' : `Click to upload images or drag and drop (${imagePreviews.length}/5)`}
                  </Label>
                  <Input
                    id="service-image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    disabled={uploadingImages}
                    multiple
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => handleInputChange('is_active', checked)}
            />
            <Label htmlFor="is_active">Active</Label>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading || uploadingImages}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || uploadingImages}
              className="bg-fem-terracotta hover:bg-fem-terracotta/90"
            >
              {isLoading ? 'Saving...' : (service ? 'Update Service' : 'Add Service')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
