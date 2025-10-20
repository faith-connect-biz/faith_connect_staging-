import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, MapPin, Phone, Mail, FileText, ArrowRight, Loader2, CheckCircle } from 'lucide-react';
import { apiService } from '@/services/api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Navbar } from '@/components/layout/Navbar';

const BusinessRegistrationPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    businessName: '',
    category: '',
    description: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    email: '',
    website: '',
    hours: '',
    services: ''
  });

  const businessCategories = [
    'Restaurant & Food',
    'Health & Wellness',
    'Education & Training',
    'Professional Services',
    'Retail & Shopping',
    'Home & Garden',
    'Automotive',
    'Beauty & Personal Care',
    'Technology & IT',
    'Real Estate',
    'Financial Services',
    'Entertainment & Events',
    'Travel & Tourism',
    'Non-Profit & Community',
    'Other'
  ];

  const handleInputChange = (field: string, value: string) => {
      setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.businessName.trim()) {
      toast.error('Business name is required');
      return false;
    }
    if (!formData.category) {
      toast.error('Please select a business category');
      return false;
        }
        if (!formData.description.trim()) {
      toast.error('Business description is required');
      return false;
        }
        if (!formData.address.trim()) {
      toast.error('Business address is required');
      return false;
    }
    if (!formData.city.trim()) {
      toast.error('City is required');
      return false;
    }
            if (!formData.phone.trim()) {
      toast.error('Phone number is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const response = await apiService.createBusinessFromRegistration({
        name: formData.businessName,
        category: formData.category,
        description: formData.description,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        phone: formData.phone,
        email: formData.email,
        website: formData.website,
        hours: formData.hours,
        services: formData.services
      });

      if (response.success) {
        setIsSuccess(true);
        toast.success('Business registered successfully!');
        
        setTimeout(() => {
          navigate('/business-management');
        }, 2000);
    } else {
        toast.error(response.message || 'Failed to register business');
      }
    } catch (error) {
      console.error('Error registering business:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Business Registered Successfully! 🎉
            </h2>
            <p className="text-gray-600 mb-6">
              Your business has been registered and is now live in our directory. 
              You can manage your business profile from your dashboard.
            </p>
            <div className="flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="ml-2 text-gray-600">Redirecting to dashboard...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-fem-gray via-white to-fem-lightgold">
      <Navbar />
      <div className="flex items-center justify-center p-4 pt-20">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-fem-terracotta/20 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-fem-gold/20 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
      </div>

      <Card className="w-full max-w-2xl relative z-10 shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center pb-8 pt-8">
          <div className="flex justify-center mb-6">
            <img
              src="/android-chrome-192x192-removebg-preview.png"
              alt="Faith Connect Logo"
              className="h-24 w-auto drop-shadow-lg"
              style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }}
            />
          </div>
          <h1 className="text-3xl font-bold text-fem-navy mb-2">
            Register Your Business
          </h1>
          <p className="text-fem-darkgray text-sm">
            Join our faith-based business directory and connect with your community
          </p>
        </CardHeader>

        <CardContent className="px-8 pb-8">
          <div className="space-y-6">
            {/* Business Name */}
            <div className="space-y-2">
              <Label htmlFor="businessName" className="text-sm font-medium text-gray-700">
                Business Name *
        </Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-fem-darkgray w-5 h-5" />
        <Input
                  id="businessName"
                  type="text"
          placeholder="Enter your business name"
                  value={formData.businessName}
                  onChange={(e) => handleInputChange('businessName', e.target.value)}
                  className="pl-10 h-12 border-gray-200 focus:border-fem-terracotta focus:ring-fem-terracotta rounded-xl"
                />
              </div>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-fem-navy">
                Business Category *
        </Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                <SelectTrigger className="h-12 border-gray-200 focus:border-fem-terracotta focus:ring-fem-terracotta rounded-xl">
                  <SelectValue placeholder="Select your business category" />
          </SelectTrigger>
                <SelectContent>
            {businessCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                Business Description *
          </Label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
        <Textarea
          id="description"
                  placeholder="Describe your business, services, and what makes you unique..."
          value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="pl-10 pt-3 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 rounded-xl min-h-[120px]"
                  maxLength={1000}
                />
              </div>
          <p className="text-xs text-gray-500">
                {formData.description.length}/1000 characters
          </p>
        </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address" className="text-sm font-medium text-gray-700">
                Business Address *
        </Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  id="address"
                  type="text"
                  placeholder="Enter your business address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="pl-10 h-12 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 rounded-xl"
                />
              </div>
            </div>

            {/* City, State, Zip */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city" className="text-sm font-medium text-gray-700">
                  City *
                </Label>
                <Input
                  id="city"
                  type="text"
                  placeholder="City"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className="h-12 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state" className="text-sm font-medium text-gray-700">
                  State
        </Label>
                <Input
                  id="state"
                  type="text"
                  placeholder="State"
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  className="h-12 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 rounded-xl"
                />
          </div>

              <div className="space-y-2">
                <Label htmlFor="zipCode" className="text-sm font-medium text-gray-700">
                  ZIP Code
            </Label>
                <Input
                  id="zipCode"
                  type="text"
                  placeholder="ZIP"
                  value={formData.zipCode}
                  onChange={(e) => handleInputChange('zipCode', e.target.value)}
                  className="h-12 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 rounded-xl"
                />
          </div>
        </div>

      {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                  Phone Number *
            </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              id="phone"
                    type="tel"
                    placeholder="Enter your phone number"
              value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="pl-10 h-12 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 rounded-xl"
            />
          </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email Address
            </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              id="email"
                    type="email"
                    placeholder="Enter your email"
              value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="pl-10 h-12 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 rounded-xl"
            />
          </div>
        </div>
            </div>

            {/* Website */}
            <div className="space-y-2">
              <Label htmlFor="website" className="text-sm font-medium text-gray-700">
                Website (Optional)
              </Label>
          <Input
            id="website"
                type="url"
                placeholder="https://your-website.com"
            value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                className="h-12 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 rounded-xl"
          />
        </div>

      {/* Business Hours */}
            <div className="space-y-2">
              <Label htmlFor="hours" className="text-sm font-medium text-gray-700">
                Business Hours (Optional)
              </Label>
                  <Input
                id="hours"
                type="text"
                placeholder="e.g., Mon-Fri 9AM-5PM, Sat 10AM-2PM"
                value={formData.hours}
                onChange={(e) => handleInputChange('hours', e.target.value)}
                className="h-12 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 rounded-xl"
              />
                </div>

            {/* Services */}
            <div className="space-y-2">
              <Label htmlFor="services" className="text-sm font-medium text-gray-700">
                Services Offered (Optional)
              </Label>
              <Textarea
                id="services"
                placeholder="List the main services you offer..."
                value={formData.services}
                onChange={(e) => handleInputChange('services', e.target.value)}
                className="border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 rounded-xl min-h-[80px]"
                maxLength={500}
              />
              <p className="text-xs text-gray-500">
                {formData.services.length}/500 characters
              </p>
                </div>
              </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <Button
              onClick={() => navigate('/profile-update')}
                  variant="outline"
              className="h-12 px-8 border-gray-200 hover:border-gray-300 hover:bg-gray-50 rounded-xl transition-all duration-200"
                >
              Back to Profile
                </Button>
              
                <Button
              onClick={handleSubmit}
              disabled={isLoading}
              className="flex-1 h-12 bg-gradient-to-r from-fem-terracotta to-fem-gold hover:from-fem-terracotta/90 hover:to-fem-gold/90 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Registering Business...
                    </>
                  ) : (
                    <>
                  Submit & Continue
                  <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Your business will be reviewed and approved before going live in our directory.
            </p>
                  </div>
        </CardContent>
      </Card>
                </div>
            </div>
    );
};

export default BusinessRegistrationPage;