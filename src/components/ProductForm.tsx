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
import { useBusiness } from '@/contexts/BusinessContext';
import { useAuth } from '@/contexts/AuthContext';
import { Upload, X, Image as ImageIcon, Plus, Trash2 } from 'lucide-react';

import { Product } from '@/services/api';

interface ProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  businessId: string;
  product?: Product | null;
  onSuccess: () => void;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  isOpen,
  onClose,
  businessId,
  product,
  onSuccess
}) => {
  const { deleteProduct } = useBusiness();
  const { isAuthenticated } = useAuth();
  const [formData, setFormData] = useState<Product>({
    business: businessId,
    name: '',
    description: '',
    price: 0,
    price_currency: 'KES',
    product_image_url: '',
    images: [],
    in_stock: true,
    is_active: true
  });
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  // Show delete button if user is authenticated and product exists
  // The backend will handle the actual security check
  const canDeleteProduct = product?.id && isAuthenticated;

  useEffect(() => {
    if (product) {
      setFormData({
        ...product,
        business: businessId
      });
      // Set image previews from existing images
      const previews = [];
      if (product.product_image_url) previews.push(product.product_image_url);
      if (product.images) previews.push(...product.images);
      setImagePreviews(previews);
    } else {
      setFormData({
        business: businessId,
        name: '',
        description: '',
        price: 0,
        price_currency: 'KES',
        product_image_url: '',
        images: [],
        in_stock: true,
        is_active: true
      });
      setImagePreviews([]);
    }
  }, [product]);

  const handleImageUpload = async (file: File) => {
    if (!file) return;

    // Check if we already have 5 images
    if (imagePreviews.length >= 5) {
      toast({
        title: "Maximum Images Reached",
        description: "You can only upload up to 5 images per product.",
        variant: "destructive"
      });
      return;
    }

    setUploadingImages(true);
    try {
      // For simplicity, we'll use the profile photo upload endpoint as a general image upload
      // This is a temporary solution until we implement proper product image handling
      const uploadData = await apiService.getProfilePhotoUploadUrl(file.name, file.type);
      
      // Upload file to S3
      const uploadSuccess = await apiService.uploadFileToS3(uploadData.presigned_url, file);
      
      if (uploadSuccess) {
        // Generate S3 URL
        const s3Url = `https://${import.meta.env.VITE_AWS_STORAGE_BUCKET_NAME || 'faithconnectapp'}.s3.${import.meta.env.VITE_AWS_S3_REGION_NAME || 'af-south-1'}.amazonaws.com/${uploadData.file_key}`;
        
        // Add to images array
        const newImages = [...formData.images || [], s3Url];
        setFormData(prev => ({ ...prev, images: newImages }));
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
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid File",
          description: "Please select an image file",
          variant: "destructive"
        });
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Image must be less than 5MB",
          variant: "destructive"
        });
        return;
      }

      handleImageUpload(file);
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...(formData.images || [])];
    const newPreviews = [...imagePreviews];
    
    // Remove from both arrays
    newImages.splice(index, 1);
    newPreviews.splice(index, 1);
    
    setFormData(prev => ({ ...prev, images: newImages }));
    setImagePreviews(newPreviews);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Product name is required",
        variant: "destructive"
      });
      return;
    }

    if (formData.price <= 0) {
      toast({
        title: "Validation Error",
        description: "Price must be greater than 0",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      if (product?.id) {
        // Update existing product - only send changed fields, exclude business field
        const updateData = {
          name: formData.name,
          description: formData.description,
          price: formData.price,
          price_currency: formData.price_currency,
          product_image_url: formData.product_image_url,
          images: formData.images,
          in_stock: formData.in_stock,
          is_active: formData.is_active
        };
        console.log('Updating product:', { productId: product.id, updateData });
        
        if (!product.id) {
          throw new Error('Product ID is required for updates');
        }
        
        const result = await apiService.updateProduct(product.id.toString(), updateData);
        console.log('Product update result:', result);
        toast({
          title: "Success",
          description: "Product updated successfully!",
        });
      } else {
        // Create new product
        await apiService.createProduct(businessId, formData);
        toast({
          title: "Success",
          description: "Product created successfully!",
        });
      }
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving product:', error);
      toast({
        title: "Error",
        description: "Failed to save product. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!product?.id) return;
    
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteProduct(product.id);
      toast({
        title: "Product Deleted",
        description: "Product has been deleted successfully.",
      });
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "Error",
        description: "Failed to delete product. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleInputChange = (field: keyof Product, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="w-[95vw] sm:max-w-[600px] max-h-[90vh] overflow-y-auto mx-auto"
        aria-describedby="product-form-description"
      >
        <DialogHeader>
          <DialogTitle>
            {product ? 'Edit Product' : 'Add New Product'}
          </DialogTitle>
        </DialogHeader>
        <div id="product-form-description" className="sr-only">
          {product ? 'Edit existing product details' : 'Add a new product to your business'}
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4 px-1">
          <div className="space-y-2">
            <Label htmlFor="name">Product Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter product name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe your product"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price_currency">Currency</Label>
              <Select
                value={formData.price_currency}
                onValueChange={(value) => handleInputChange('price_currency', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="KES">KES (KSh)</SelectItem>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                  <SelectItem value="NGN">NGN (₦)</SelectItem>
                  <SelectItem value="GHS">GHS (₵)</SelectItem>
                  <SelectItem value="ZAR">ZAR (R)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Multiple Images Upload Section */}
          <div className="space-y-2">
            <Label>Product Images (Up to 5)</Label>
            <div className="space-y-3">
              {/* Image Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {imagePreviews.map((image, index) => (
                  <div key={index} className="relative">
                    <img 
                      src={image} 
                      alt={`Product image ${index + 1}`} 
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
                
                {/* Upload Button - Only show if less than 5 images */}
                {imagePreviews.length < 5 && (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-6 text-center">
                    <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 mx-auto mb-2" />
                    <Label htmlFor="product-images" className="cursor-pointer text-xs sm:text-sm text-gray-600">
                      {uploadingImages ? 'Uploading...' : 'Click to upload image'}
                    </Label>
                    <Input
                      id="product-images"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      disabled={uploadingImages}
                    />
                  </div>
                )}
              </div>
              
              {/* Image Count */}
              <div className="text-xs sm:text-sm text-gray-500 text-center">
                {imagePreviews.length}/5 images uploaded
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="in_stock"
                checked={formData.in_stock}
                onCheckedChange={(checked) => handleInputChange('in_stock', checked)}
              />
              <Label htmlFor="in_stock">In Stock</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => handleInputChange('is_active', checked)}
              />
              <Label htmlFor="is_active">Active</Label>
            </div>
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
            
            {product?.id && canDeleteProduct && (
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
              {isLoading ? 'Saving...' : (product ? 'Update Product' : 'Add Product')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
