import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Switch } from './ui/switch';
import { Separator } from './ui/separator';
import { FileUpload } from './FileUpload';
import { ProductServiceManager } from './ProductServiceManager';
import { 
  Clock, 
  Phone, 
  Mail, 
  Globe, 
  Facebook, 
  Instagram, 
  Twitter, 
  Linkedin, 
  Camera,
  ShoppingBag
} from 'lucide-react';
import type { BusinessData, ProductService } from '../App';

interface ProfileCompletionFormProps {
  initialData: BusinessData;
  onComplete: (data: Partial<BusinessData>) => void;
  onBack: () => void;
}

const daysOfWeek = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' },
] as const;

export function ProfileCompletionForm({ initialData, onComplete, onBack }: ProfileCompletionFormProps) {
  const [formData, setFormData] = useState({
    services: initialData.services,
    productsServices: initialData.productsServices,
    workingHours: initialData.workingHours,
    contactDetails: initialData.contactDetails,
    socialMedia: initialData.socialMedia,
    photos: initialData.photos,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.services.trim()) {
      newErrors.services = 'Please describe your services or projects';
    }

    if (!formData.contactDetails.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.contactDetails.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.contactDetails.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onComplete(formData);
    }
  };

  const updateContactDetails = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      contactDetails: { ...prev.contactDetails, [field]: value }
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const updateSocialMedia = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      socialMedia: { ...prev.socialMedia, [field]: value }
    }));
  };

  const updateWorkingHours = (day: string, field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      workingHours: {
        ...prev.workingHours,
        [day]: { ...prev.workingHours[day as keyof typeof prev.workingHours], [field]: value }
      }
    }));
  };

  const handlePhotosChange = (photos: BusinessData['photos']) => {
    setFormData(prev => ({ ...prev, photos }));
  };

  const handleProductsServicesChange = (productsServices: ProductService[]) => {
    setFormData(prev => ({ ...prev, productsServices }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Services/Projects Setup */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Services & Projects
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="services">Describe Your Services or Projects *</Label>
            <Textarea
              id="services"
              value={formData.services}
              onChange={(e) => setFormData(prev => ({ ...prev, services: e.target.value }))}
              placeholder="Describe what services you offer, types of projects you work on, your specialties, etc."
              rows={4}
              className={errors.services ? 'border-red-500' : ''}
            />
            {errors.services && (
              <p className="text-red-500 text-sm">{errors.services}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Products & Services Manager */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            {initialData.businessType === 'products' ? 'Your Products' : 
             initialData.businessType === 'services' ? 'Your Services' : 
             'Your Products & Services'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ProductServiceManager
            items={formData.productsServices}
            onItemsChange={handleProductsServicesChange}
            maxItems={5}
            businessType={initialData.businessType}
          />
        </CardContent>
      </Card>

      {/* Working Hours */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Working Hours
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {daysOfWeek.map(({ key, label }) => {
            const dayData = formData.workingHours[key as keyof typeof formData.workingHours];
            return (
              <div key={key} className="flex items-center gap-4 p-4 border rounded-lg">
                <div className="w-24">
                  <Label>{label}</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={!dayData.closed}
                    onCheckedChange={(checked) => updateWorkingHours(key, 'closed', !checked)}
                  />
                  <span className="text-sm text-muted-foreground">
                    {dayData.closed ? 'Closed' : 'Open'}
                  </span>
                </div>
                {!dayData.closed && (
                  <div className="flex items-center gap-2">
                    <Input
                      type="time"
                      value={dayData.open}
                      onChange={(e) => updateWorkingHours(key, 'open', e.target.value)}
                      className="w-32"
                    />
                    <span className="text-muted-foreground">to</span>
                    <Input
                      type="time"
                      value={dayData.close}
                      onChange={(e) => updateWorkingHours(key, 'close', e.target.value)}
                      className="w-32"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Contact Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.contactDetails.phone}
                onChange={(e) => updateContactDetails('phone', e.target.value)}
                placeholder="+1 (555) 123-4567"
                className={errors.phone ? 'border-red-500' : ''}
              />
              {errors.phone && (
                <p className="text-red-500 text-sm">{errors.phone}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.contactDetails.email}
                onChange={(e) => updateContactDetails('email', e.target.value)}
                placeholder="business@example.com"
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website (Optional)</Label>
            <Input
              id="website"
              type="url"
              value={formData.contactDetails.website}
              onChange={(e) => updateContactDetails('website', e.target.value)}
              placeholder="https://www.yourbusiness.com"
            />
          </div>
        </CardContent>
      </Card>

      {/* Social Media Links */}
      <Card>
        <CardHeader>
          <CardTitle>Social Media Presence</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="facebook" className="flex items-center gap-2">
                <Facebook className="h-4 w-4" />
                Facebook
              </Label>
              <Input
                id="facebook"
                value={formData.socialMedia.facebook}
                onChange={(e) => updateSocialMedia('facebook', e.target.value)}
                placeholder="https://facebook.com/yourbusiness"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="instagram" className="flex items-center gap-2">
                <Instagram className="h-4 w-4" />
                Instagram
              </Label>
              <Input
                id="instagram"
                value={formData.socialMedia.instagram}
                onChange={(e) => updateSocialMedia('instagram', e.target.value)}
                placeholder="https://instagram.com/yourbusiness"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="twitter" className="flex items-center gap-2">
                <Twitter className="h-4 w-4" />
                Twitter/X
              </Label>
              <Input
                id="twitter"
                value={formData.socialMedia.twitter}
                onChange={(e) => updateSocialMedia('twitter', e.target.value)}
                placeholder="https://twitter.com/yourbusiness"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="linkedin" className="flex items-center gap-2">
                <Linkedin className="h-4 w-4" />
                LinkedIn
              </Label>
              <Input
                id="linkedin"
                value={formData.socialMedia.linkedin}
                onChange={(e) => updateSocialMedia('linkedin', e.target.value)}
                placeholder="https://linkedin.com/company/yourbusiness"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Photos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Business Photos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FileUpload
            photos={formData.photos}
            onPhotosChange={handlePhotosChange}
            maxFiles={10}
          />
          <p className="text-sm text-muted-foreground mt-4">
            Upload photos or add URLs of your products, services, workspace, or team to help customers learn more about your business.
          </p>
        </CardContent>
      </Card>

      <Separator />

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack} size="lg" className="px-8">
          Back
        </Button>
        <Button type="submit" size="lg" className="px-8 bg-[#c74a33] hover:bg-[#b8422e] text-white">
          Complete Registration
        </Button>
      </div>
    </form>
  );
}