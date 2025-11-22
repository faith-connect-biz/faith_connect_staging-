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
import { useAuth } from '@/contexts/AuthContext';
import { Upload, X, Image as ImageIcon, Plus, Trash2 } from 'lucide-react';

import { Service } from '@/services/api';

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
  const { isAuthenticated } = useAuth();
  const [formData, setFormData] = useState<Service>({
    business: businessId,
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
  const [isDragOver, setIsDragOver] = useState(false);

  // Reset form when modal opens for new service
  useEffect(() => {
    if (isOpen && !service) {
      // Reset all form state when opening for new service
      setFormData({
        business: businessId,
        name: '',
        description: '',
        price_range: '',
        duration: '',
        is_active: true,
        service_image_url: '',
        images: []
      });
      setImagePreviews([]);
      setIsDragOver(false);
      setUploadingImages(false);
    }
  }, [isOpen, service, businessId]);

  // Clean up form state when modal closes
  useEffect(() => {
    if (!isOpen) {
      // Reset drag state when modal closes
      setIsDragOver(false);
    }
  }, [isOpen]);

  // Show delete button if user is authenticated and service exists
  // The backend will handle the actual security check
  const canDeleteService = service?.id && isAuthenticated;

  useEffect(() => {
    if (service) {
      setFormData({
        ...service,
        business: businessId
      });
      // Set image previews from existing images
      const previews = [];
      if (service.service_image_url) previews.push(service.service_image_url);
      if (service.images) previews.push(...service.images);
      setImagePreviews(previews);
    } else {
      // Reset form data for new service
      setFormData({
        business: businessId,
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
  }, [service, isOpen, businessId]);

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
      // Convert image to base64 for temporary storage
      // This approach is more reliable and matches the pattern used in other components
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const base64String = e.target?.result as string;
        if (base64String) {
          // Add to form data as base64
          setFormData(prev => ({ 
            ...prev, 
            images: [...prev.images || [], base64String] 
          }));
          setImagePreviews(prev => [...prev, base64String]);
          
          toast({
            title: "Success",
            description: "Image added successfully! It will be uploaded when you save the service.",
          });
        }
        setUploadingImages(false);
      };
      
      reader.onerror = () => {
        toast({
          title: "Error",
          description: "Failed to process image. Please try again.",
          variant: "destructive"
        });
        setUploadingImages(false);
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error processing image:', error);
      toast({
        title: "Error",
        description: "Failed to process image. Please try again.",
        variant: "destructive"
      });
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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      // Check if adding these files would exceed the 5 image limit
      if (imagePreviews.length + files.length > 5) {
        toast({
          title: "Too Many Images",
          description: "You can only have up to 5 images total. Please remove some existing images first.",
          variant: "destructive"
        });
        return;
      }

      files.forEach(file => {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          toast({
            title: "Invalid File",
            description: `"${file.name}" is not an image file`,
            variant: "destructive"
          });
          return;
        }

        // Validate file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
          toast({
            title: "File Too Large",
            description: `"${file.name}" is larger than 5MB`,
            variant: "destructive"
          });
          return;
        }

        handleImageUpload(file);
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (service?.id) {
        // Update existing service - only send changed fields, exclude business field
        const updateData = {
          name: formData.name,
          description: formData.description,
          price_range: formData.price_range,
          duration: formData.duration,
          is_active: formData.is_active,
          service_image_url: formData.service_image_url,
          images: formData.images
        };
        console.log('Updating service:', { serviceId: service.id, updateData });
        
        if (!service.id) {
          throw new Error('Service ID is required for updates');
        }
        
        const result = await apiService.updateService(service.id.toString(), updateData);
        console.log('Service update result:', result);
        toast({
          title: "Service Updated",
          description: "Service has been updated successfully.",
        });
      } else {
        // Create new service
        await apiService.createService(businessId, formData);
        toast({
          title: "Service Created",
          description: "Service has been created successfully.",
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

  const handleDelete = async () => {
    if (!service?.id) return;
    
    if (!confirm('Are you sure you want to delete this service? This action cannot be undone.')) {
      return;
    }

    try {
      await apiService.deleteServiceVSet(service.id?.toString() || '');
      toast({
        title: "Service Deleted",
        description: "Service has been deleted successfully.",
      });
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error deleting service:', error);
      toast({
        title: "Error",
        description: "Failed to delete service. Please try again.",
        variant: "destructive"
      });
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
        className="w-[95vw] sm:max-w-[500px] max-h-[90vh] overflow-y-auto mx-auto"
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
        
        <form onSubmit={handleSubmit} className="space-y-4 px-1">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative">
                      <img 
                        src={preview} 
                        alt={`Service preview ${index + 1}`} 
                        className="w-full h-24 sm:h-32 object-cover rounded-lg border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2 w-6 h-6 p-0"
                        onClick={() => removeImage(index)}
                        disabled={uploadingImages}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : null}
              
              {imagePreviews.length < 5 && (
                <div 
                  className={`border-2 border-dashed rounded-lg p-4 sm:p-6 text-center transition-all duration-300 ${
                    isDragOver 
                      ? 'border-fem-terracotta bg-fem-terracotta/5 scale-105' 
                      : 'border-gray-300 hover:border-fem-terracotta/50 hover:bg-gray-50'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('service-image')?.click()}
                >
                  <Upload className={`w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 transition-colors duration-300 ${
                    isDragOver ? 'text-fem-terracotta' : 'text-gray-400'
                  }`} />
                  <Label htmlFor="service-image" className={`cursor-pointer text-xs sm:text-sm transition-colors duration-300 ${
                    isDragOver ? 'text-fem-terracotta font-semibold' : 'text-gray-600'
                  }`}>
                    {uploadingImages 
                      ? 'Uploading...' 
                      : isDragOver 
                        ? 'Drop images here!' 
                        : `Click to upload images or drag and drop (${imagePreviews.length}/5)`
                    }
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

          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading || uploadingImages}
            >
              Cancel
            </Button>
            
            {service?.id && canDeleteService && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={isLoading || uploadingImages}
                className="flex items-center space-x-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </Button>
            )}
            
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
