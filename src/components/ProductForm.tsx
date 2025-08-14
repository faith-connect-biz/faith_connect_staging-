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
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface Product {
  id?: string;
  name: string;
  description?: string;
  price: number;
  price_currency: string;
  product_image_url?: string;
  in_stock: boolean;
  is_active: boolean;
}

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
  const [formData, setFormData] = useState<Product>({
    name: '',
    description: '',
    price: 0,
    price_currency: 'KES',
    product_image_url: '',
    in_stock: true,
    is_active: true
  });
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (product) {
      setFormData({
        id: product.id,
        name: product.name || '',
        description: product.description || '',
        price: product.price || 0,
        price_currency: product.price_currency || 'KES',
        product_image_url: product.product_image_url || '',
        in_stock: product.in_stock,
        is_active: product.is_active
      });
      setImagePreview(product.product_image_url || null);
    } else {
      setFormData({
        name: '',
        description: '',
        price: 0,
        price_currency: 'KES',
        product_image_url: '',
        in_stock: true,
        is_active: true
      });
      setImagePreview(null);
    }
  }, [product]);

  const handleImageUpload = async (file: File) => {
    if (!file) return;

    setUploadingImage(true);
    try {
      // Get pre-signed URL for upload
      const uploadData = await apiService.getProfilePhotoUploadUrl(file.name, file.type);
      
      // Upload file to S3
      const uploadSuccess = await apiService.uploadFileToS3(uploadData.presigned_url, file);
      
      if (uploadSuccess) {
        // Generate S3 URL
                 const s3Url = `https://${import.meta.env.VITE_AWS_STORAGE_BUCKET_NAME || 'faithconnectapp'}.s3.${import.meta.env.VITE_AWS_S3_REGION_NAME || 'af-south-1'}.amazonaws.com/${uploadData.file_key}`;
        
        setFormData(prev => ({ ...prev, product_image_url: s3Url }));
        setImagePreview(s3Url);
        
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
      setUploadingImage(false);
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

  const removeImage = () => {
    setFormData(prev => ({ ...prev, product_image_url: '' }));
    setImagePreview(null);
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
        // Update existing product
        await apiService.updateProduct(product.id, formData);
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

  const handleInputChange = (field: keyof Product, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="sm:max-w-[500px]"
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
        
        <form onSubmit={handleSubmit} className="space-y-4">
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

          <div className="grid grid-cols-2 gap-4">
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

          {/* Image Upload Section */}
          <div className="space-y-2">
            <Label>Product Image (Optional)</Label>
            <div className="space-y-3">
              {imagePreview ? (
                <div className="relative">
                  <img 
                    src={imagePreview} 
                    alt="Product preview" 
                    className="w-full h-32 object-cover rounded-lg border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={removeImage}
                    disabled={uploadingImage}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <Label htmlFor="product-image" className="cursor-pointer text-sm text-gray-600">
                    {uploadingImage ? 'Uploading...' : 'Click to upload image or drag and drop'}
                  </Label>
                  <Input
                    id="product-image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    disabled={uploadingImage}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
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

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading || uploadingImage}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || uploadingImage}
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
