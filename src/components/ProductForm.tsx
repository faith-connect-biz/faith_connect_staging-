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
    price_currency: 'USD',
    product_image_url: '',
    in_stock: true,
    is_active: true
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        id: product.id,
        name: product.name || '',
        description: product.description || '',
        price: product.price || 0,
        price_currency: product.price_currency || 'USD',
        product_image_url: product.product_image_url || '',
        in_stock: product.in_stock,
        is_active: product.is_active
      });
    } else {
      setFormData({
        name: '',
        description: '',
        price: 0,
        price_currency: 'USD',
        product_image_url: '',
        in_stock: true,
        is_active: true
      });
    }
  }, [product]);

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
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                  <SelectItem value="KES">KES (KSh)</SelectItem>
                  <SelectItem value="NGN">NGN (₦)</SelectItem>
                  <SelectItem value="GHS">GHS (₵)</SelectItem>
                  <SelectItem value="ZAR">ZAR (R)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="product_image_url">Product Image URL</Label>
            <Input
              id="product_image_url"
              type="url"
              value={formData.product_image_url}
              onChange={(e) => handleInputChange('product_image_url', e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
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
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
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
