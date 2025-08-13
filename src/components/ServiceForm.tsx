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

interface Service {
  id?: number;
  name: string;
  description?: string;
  price_range?: string;
  duration?: string;
  is_active: boolean;
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
    is_active: true
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (service) {
      setFormData({
        id: service.id,
        name: service.name || '',
        description: service.description || '',
        price_range: service.price_range || '',
        duration: service.duration || '',
        is_active: service.is_active
      });
    } else {
      setFormData({
        name: '',
        description: '',
        price_range: '',
        duration: '',
        is_active: true
      });
    }
  }, [service]);

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
      if (service?.id) {
        // Update existing service
        await apiService.updateService(service.id.toString(), formData);
        toast({
          title: "Success",
          description: "Service updated successfully!",
        });
      } else {
        // Create new service
        await apiService.createService(businessId, formData);
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
                  <SelectItem value="Under $50">Under $50</SelectItem>
                  <SelectItem value="$50 - $100">$50 - $100</SelectItem>
                  <SelectItem value="$100 - $200">$100 - $200</SelectItem>
                  <SelectItem value="$200 - $500">$200 - $500</SelectItem>
                  <SelectItem value="$500 - $1000">$500 - $1000</SelectItem>
                  <SelectItem value="Over $1000">Over $1000</SelectItem>
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
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
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
