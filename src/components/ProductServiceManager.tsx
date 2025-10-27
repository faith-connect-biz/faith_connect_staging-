import React, { useState, useRef, useCallback } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Plus, X, Package, Briefcase, Upload, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';
import type { ProductService } from '../App';

interface ProductServiceManagerProps {
  items: ProductService[];
  onItemsChange: (items: ProductService[]) => void;
  maxItems?: number;
  businessType: 'products' | 'services' | 'both' | '';
}

export function ProductServiceManager({ 
  items, 
  onItemsChange, 
  maxItems = 5,
  businessType
}: ProductServiceManagerProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<ProductService, 'id'>>({
    name: '',
    description: '',
    price: '',
    currency: 'KES',
    negotiable: false,
    type: businessType === 'both' ? 'product' : businessType === 'products' ? 'product' : 'service',
    images: []
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDragOver, setIsDragOver] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      currency: 'KES',
      negotiable: false,
      type: businessType === 'both' ? 'product' : businessType === 'products' ? 'product' : 'service',
      images: []
    });
    setErrors({});
    setShowAddForm(false);
    setEditingId(null);
    setShowUrlInput(false);
    setUrlInput('');
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length > 500) {
      newErrors.description = 'Description must be no more than 500 characters';
    }

    if (formData.price && formData.price.trim()) {
      const priceNum = parseFloat(formData.price);
      if (isNaN(priceNum) || priceNum <= 0) {
        newErrors.price = 'Price must be a positive number';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAdd = () => {
    if (!validateForm()) return;

    const newItem: ProductService = {
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...formData
    };

    onItemsChange([...items, newItem]);
    resetForm();
  };

  const handleUpdate = () => {
    if (!validateForm() || !editingId) return;

    const updatedItems = items.map(item =>
      item.id === editingId ? { ...item, ...formData } : item
    );

    onItemsChange(updatedItems);
    resetForm();
  };

  const handleEdit = (item: ProductService) => {
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price,
      currency: item.currency || 'KES',
      negotiable: item.negotiable || false,
      type: item.type,
      images: item.images
    });
    setEditingId(item.id);
    setShowAddForm(true);
  };

  const handleRemove = (id: string) => {
    onItemsChange(items.filter(item => item.id !== id));
  };

  const handleStartAdd = () => {
    resetForm();
    setShowAddForm(true);
  };

  // Image upload handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, [formData.images]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  }, [formData.images]);

  const handleFiles = (files: File[]) => {
    const acceptedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    const validFiles = files.filter(file => 
      acceptedTypes.includes(file.type) && file.size <= 5 * 1024 * 1024 // 5MB limit
    );

    if (formData.images.length + validFiles.length > 5) {
      alert('You can only upload up to 5 images per item.');
      return;
    }

    const newImages = validFiles.map(file => ({
      id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'file' as const,
      file,
      preview: URL.createObjectURL(file),
      name: file.name
    }));

    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...newImages]
    }));
  };

  const handleUrlAdd = () => {
    if (!urlInput.trim()) return;
    if (formData.images.length >= 5) {
      alert('You can only add up to 5 images per item.');
      return;
    }

    const newImage = {
      id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'url' as const,
      url: urlInput.trim(),
      preview: urlInput.trim(),
      name: urlInput.trim().split('/').pop() || 'Image URL'
    };

    setFormData(prev => ({
      ...prev,
      images: [...prev.images, newImage]
    }));
    setUrlInput('');
    setShowUrlInput(false);
  };

  const handleRemoveImage = (imageId: string) => {
    const imageToRemove = formData.images.find(img => img.id === imageId);
    if (imageToRemove?.type === 'file' && imageToRemove.preview) {
      URL.revokeObjectURL(imageToRemove.preview);
    }
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter(img => img.id !== imageId)
    }));
  };

  const canAddMore = items.length < maxItems;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-lg">
            {businessType === 'products' ? 'Products' : businessType === 'services' ? 'Services' : 'Products & Services'}
          </Label>
          <p className="text-sm text-muted-foreground mt-1">
            Add up to {maxItems} items ({items.length}/{maxItems} added)
          </p>
        </div>
        {canAddMore && !showAddForm && (
          <Button
            type="button"
            onClick={handleStartAdd}
            className="bg-gradient-to-r from-fem-terracotta to-fem-gold hover:from-fem-terracotta/90 hover:to-fem-gold/90 text-white shadow-lg hover:shadow-xl transition-all duration-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add {businessType === 'products' ? 'Product' : businessType === 'services' ? 'Service' : 'Item'}
          </Button>
        )}
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <Card className="border-[#c74a33]/20 bg-[#c74a33]/5">
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              <span>{editingId ? 'Edit' : 'Add'} {formData.type === 'product' ? 'Product' : 'Service'}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={resetForm}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Type selector - only show if business type is 'both' */}
            {businessType === 'both' && (
              <div className="space-y-2">
                <Label>Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: 'product' | 'service') =>
                    setFormData(prev => ({ ...prev, type: value }))
                  }
                >
                  <SelectTrigger className="bg-white text-gray-900 border-gray-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="product">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        Product
                      </div>
                    </SelectItem>
                    <SelectItem value="service">
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4" />
                        Service
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="item-name">Name *</Label>
              <Input
                id="item-name"
                value={formData.name}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, name: e.target.value }));
                  if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
                }}
                placeholder={`Enter ${formData.type} name`}
                className={`bg-white text-gray-900 border-gray-300 ${errors.name ? 'border-red-500' : ''}`}
              />
              {errors.name && (
                <p className="text-red-500 text-sm">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="item-description">Description * (Max 500 characters)</Label>
              <Textarea
                id="item-description"
                value={formData.description}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, description: e.target.value }));
                  if (errors.description) setErrors(prev => ({ ...prev, description: '' }));
                }}
                placeholder={`Describe your ${formData.type}...`}
                rows={4}
                maxLength={500}
                className={`bg-white text-gray-900 border-gray-300 ${errors.description ? 'border-red-500' : ''}`}
              />
              <div className="flex justify-between items-center text-xs">
                <p className={formData.description.length > 500 ? 'text-red-500' : 'text-gray-500'}>
                  {formData.description.length}/500 characters
                </p>
                {errors.description && (
                  <p className="text-red-500">{errors.description}</p>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="item-price">Price (Optional)</Label>
              <div className="flex gap-2">
                <Select
                  value={formData.currency}
                  onValueChange={(value: 'KES' | 'USD') =>
                    setFormData(prev => ({ ...prev, currency: value }))
                  }
                >
                  <SelectTrigger className="w-24 bg-white text-gray-900 border-gray-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="KES">KES</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  id="item-price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, price: e.target.value }));
                    if (errors.price) setErrors(prev => ({ ...prev, price: '' }));
                  }}
                  placeholder="Amount"
                  className={`flex-1 bg-white text-gray-900 border-gray-300 ${errors.price ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.price && (
                <p className="text-red-500 text-sm">{errors.price}</p>
              )}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="negotiable"
                  checked={formData.negotiable}
                  onChange={(e) => setFormData(prev => ({ ...prev, negotiable: e.target.checked }))}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <label htmlFor="negotiable" className="text-sm text-gray-700 cursor-pointer">
                  Price is negotiable
                </label>
              </div>
            </div>

            {/* Image Upload Section */}
            <div className="space-y-3">
              <Label>Images (Optional, up to 5)</Label>
              
              {/* Drag and Drop Area */}
              <div 
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
                  isDragOver ? 'border-[#c74a33] bg-[#c74a33]/10' : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="flex flex-col items-center space-y-2">
                  <div className={`p-3 rounded-full ${
                    isDragOver ? 'bg-[#c74a33]/20' : 'bg-gray-100'
                  }`}>
                    <Upload className={`h-6 w-6 ${
                      isDragOver ? 'text-[#c74a33]' : 'text-gray-400'
                    }`} />
                  </div>
                  <p className="text-sm">
                    {isDragOver ? 'Drop images here' : 'Drag & drop images or click to browse'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    JPEG, PNG, WEBP, GIF up to 5MB
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              {/* Upload Options */}
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={formData.images.length >= 5}
                >
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Upload
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowUrlInput(!showUrlInput)}
                  disabled={formData.images.length >= 5}
                >
                  <LinkIcon className="h-4 w-4 mr-2" />
                  Add URL
                </Button>
              </div>

              {/* URL Input */}
              {showUrlInput && (
                <div className="flex gap-2">
                  <Input
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="flex-1 bg-white text-gray-900 border-gray-300"
                  />
                  <Button 
                    type="button" 
                    onClick={handleUrlAdd}
                    size="sm"
                    disabled={!urlInput.trim()}
                    className="bg-gradient-to-r from-fem-terracotta to-fem-gold hover:from-fem-terracotta/90 hover:to-fem-gold/90 text-white"
                  >
                    Add
                  </Button>
                </div>
              )}

              {/* Image Preview Grid */}
              {formData.images.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {formData.images.map((image) => (
                    <div key={image.id} className="relative group aspect-square">
                      <img
                        src={image.preview}
                        alt={image.name}
                        className="w-full h-full object-cover rounded-lg border-2 border-gray-200"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIGZpbGw9IiNmMGYwZjEiLz4KICA8cGF0aCBkPSJNMTIgMTZMMTcgMTFIMTVWN0g5VjExSDdMMTIgMTZaIiBmaWxsPSIjOWNhM2FmIi8+Cjwvc3ZnPgo=';
                        }}
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveImage(image.id);
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                      >
                        <X className="h-3 w-3" />
                      </button>
                      <Badge 
                        variant="secondary" 
                        className="absolute bottom-1 left-1 text-xs py-0 px-1"
                      >
                        {image.type}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={resetForm}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={editingId ? handleUpdate : handleAdd}
                className="bg-[#c74a33] hover:bg-[#b8422e] text-white"
              >
                {editingId ? 'Update' : 'Add'} {formData.type === 'product' ? 'Product' : 'Service'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Items List */}
      {items.length > 0 ? (
        <div className="space-y-3">
          {items.map((item, index) => (
            <Card key={item.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {/* Item Icon or First Image */}
                  {item.images.length > 0 ? (
                    <div className="w-20 h-20 flex-shrink-0">
                      <img
                        src={item.images[0].preview}
                        alt={item.name}
                        className="w-full h-full object-cover rounded-lg border-2 border-gray-200"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIGZpbGw9IiNmMGYwZjEiLz4KICA8cGF0aCBkPSJNMTIgMTZMMTcgMTFIMTVWN0g5VjExSDdMMTIgMTZaIiBmaWxsPSIjOWNhM2FmIi8+Cjwvc3ZnPgo=';
                        }}
                      />
                    </div>
                  ) : (
                    <div className={`p-3 rounded-lg flex-shrink-0 ${
                      item.type === 'product' ? 'bg-blue-50' : 'bg-green-50'
                    }`}>
                      {item.type === 'product' ? (
                        <Package className={`h-5 w-5 ${
                          item.type === 'product' ? 'text-blue-600' : 'text-green-600'
                        }`} />
                      ) : (
                        <Briefcase className="h-5 w-5 text-green-600" />
                      )}
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="truncate">{item.name}</h4>
                        <Badge variant="secondary" className="text-xs">
                          {item.type}
                        </Badge>
                        {item.images.length > 0 && (
                          <Badge variant="outline" className="text-xs">
                            <ImageIcon className="h-3 w-3 mr-1" />
                            {item.images.length}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(item)}
                          className="h-8 w-8 p-0"
                        >
                          <span className="sr-only">Edit</span>
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemove(item.id)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        >
                          <span className="sr-only">Remove</span>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                      {item.description}
                    </p>

                    {/* Additional Images Thumbnails */}
                    {item.images.length > 1 && (
                      <div className="flex gap-1 mb-2">
                        {item.images.slice(1).map((image) => (
                          <img
                            key={image.id}
                            src={image.preview}
                            alt=""
                            className="w-10 h-10 object-cover rounded border border-gray-200"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIGZpbGw9IiNmMGYwZjEiLz4KICA8cGF0aCBkPSJNMTIgMTZMMTcgMTFIMTVWN0g5VjExSDdMMTIgMTZaIiBmaWxsPSIjOWNhM2FmIi8+Cjwvc3ZnPgo=';
                            }}
                          />
                        ))}
                      </div>
                    )}

                    {item.price && (
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-[#c74a33]">
                          {item.currency || 'KES'} {item.price}
                        </p>
                        {item.negotiable && (
                          <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                            Negotiable
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="p-8 text-center">
            <div className="flex flex-col items-center space-y-2 text-muted-foreground">
              {businessType === 'products' ? (
                <Package className="h-12 w-12 opacity-50" />
              ) : businessType === 'services' ? (
                <Briefcase className="h-12 w-12 opacity-50" />
              ) : (
                <div className="flex gap-2">
                  <Package className="h-12 w-12 opacity-50" />
                  <Briefcase className="h-12 w-12 opacity-50" />
                </div>
              )}
              <p>No items added yet</p>
              <p className="text-sm">
                Click "Add {businessType === 'products' ? 'Product' : businessType === 'services' ? 'Service' : 'Item'}" to get started
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
