import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Building2, MapPin, Globe, Church, Loader2, CheckCircle } from 'lucide-react';
import { apiService } from '@/services/api';
import { toast } from 'sonner';
import { Navbar } from '@/components/layout/Navbar';

export interface ProductService {
  id: string;
  name: string;
  description: string;
  price: string;
  type: 'product' | 'service';
  images: Array<{
    id: string;
    type: 'file' | 'url';
    file?: File;
    url?: string;
    preview: string;
    name: string;
  }>;
}

export interface BusinessData {
  // Page 1 - Business Registration
  businessName: string;
  category: string;
  subcategory: string;
  businessDescription: string;
  isPhysicalAddress: boolean;
  onlineAddress: string;
  physicalAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  churchAffiliation: string;
  businessType: 'products' | 'services' | 'both' | '';
  
  // Page 2 - Profile Completion
  services: string;
  productsServices: ProductService[];
  workingHours: {
    monday: { open: string; close: string; closed: boolean };
    tuesday: { open: string; close: string; closed: boolean };
    wednesday: { open: string; close: string; closed: boolean };
    thursday: { open: string; close: string; closed: boolean };
    friday: { open: string; close: string; closed: boolean };
    saturday: { open: string; close: string; closed: boolean };
    sunday: { open: string; close: string; closed: boolean };
  };
  contactDetails: {
    phone: string;
    email: string;
    website: string;
  };
  socialMedia: {
    facebook: string;
    instagram: string;
    twitter: string;
    linkedin: string;
  };
  photos: Array<{
    id: string;
    type: 'file' | 'url';
    file?: File;
    url?: string;
    preview: string;
    name: string;
  }>;
}

const initialBusinessData: BusinessData = {
  businessName: '',
  category: '',
  subcategory: '',
  businessDescription: '',
  isPhysicalAddress: false,
  onlineAddress: '',
  physicalAddress: {
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
  },
  churchAffiliation: '',
  businessType: '',
  services: '',
  productsServices: [],
  workingHours: {
    monday: { open: '09:00', close: '17:00', closed: false },
    tuesday: { open: '09:00', close: '17:00', closed: false },
    wednesday: { open: '09:00', close: '17:00', closed: false },
    thursday: { open: '09:00', close: '17:00', closed: false },
    friday: { open: '09:00', close: '17:00', closed: false },
    saturday: { open: '09:00', close: '17:00', closed: true },
    sunday: { open: '09:00', close: '17:00', closed: true },
  },
  contactDetails: {
    phone: '',
    email: '',
    website: '',
  },
  socialMedia: {
    facebook: '',
    instagram: '',
    twitter: '',
    linkedin: '',
  },
  photos: [],
};

  const businessCategories = [
  'Technology',
  'Healthcare',
  'Education',
  'Food & Beverage',
  'Retail',
  'Professional Services',
  'Construction',
  'Transportation',
  'Entertainment',
  'Non-profit',
  'Other'
];

const subcategoriesMap: Record<string, string[]> = {
  'Technology': [
    'Software Development',
    'Web Development',
    'Mobile App Development',
    'IT Consulting',
    'Data Analytics',
    'Cybersecurity',
    'Cloud Services',
    'AI/Machine Learning',
    'Hardware',
    'Tech Support'
  ],
  'Healthcare': [
    'Medical Practice',
    'Dental Care',
    'Mental Health',
    'Physical Therapy',
    'Nursing Services',
    'Medical Equipment',
    'Pharmacy',
    'Alternative Medicine',
    'Healthcare Consulting',
    'Telemedicine'
  ],
  'Education': [
    'Tutoring',
    'Online Courses',
    'Language Training',
    'Professional Development',
    'Academic Coaching',
    'Test Preparation',
    'Educational Consulting',
    'Vocational Training',
    'Early Childhood Education',
    'Adult Education'
  ],
  'Food & Beverage': [
    'Restaurant',
    'Catering',
    'Food Truck',
    'Bakery',
    'Coffee Shop',
    'Bar/Pub',
    'Personal Chef',
    'Meal Prep',
    'Food Delivery',
    'Specialty Foods'
  ],
  'Retail': [
    'Clothing & Fashion',
    'Electronics',
    'Home & Garden',
    'Books & Media',
    'Sporting Goods',
    'Beauty & Cosmetics',
    'Jewelry',
    'Toys & Games',
    'Automotive',
    'General Merchandise'
  ],
  'Professional Services': [
    'Legal Services',
    'Accounting',
    'Marketing & Advertising',
    'Business Consulting',
    'Financial Planning',
    'Real Estate',
    'Insurance',
    'Human Resources',
    'Project Management',
    'Translation Services'
  ],
  'Construction': [
    'General Contracting',
    'Plumbing',
    'Electrical',
    'HVAC',
    'Roofing',
    'Flooring',
    'Painting',
    'Landscaping',
    'Interior Design',
    'Architecture'
  ],
  'Transportation': [
    'Rideshare/Taxi',
    'Delivery Services',
    'Moving Services',
    'Logistics',
    'Auto Repair',
    'Car Rental',
    'Transportation Consulting',
    'Freight Services',
    'Airport Services',
    'Public Transit'
  ],
  'Entertainment': [
    'Event Planning',
    'Photography',
    'Videography',
    'Music/DJ Services',
    'Entertainment Venues',
    'Sports & Recreation',
    'Arts & Crafts',
    'Gaming',
    'Fitness & Wellness',
    'Travel & Tourism'
  ],
  'Non-profit': [
    'Social Services',
    'Education & Research',
    'Healthcare',
    'Environmental',
    'Religious',
    'Arts & Culture',
    'Community Development',
    'Animal Welfare',
    'Human Rights',
    'Disaster Relief'
  ],
  'Other': [
    'Agriculture',
    'Manufacturing',
    'Mining',
    'Energy',
    'Government',
    'Military',
    'Personal Services',
    'Cleaning Services',
    'Security Services',
    'Custom/Specialty'
  ]
};

const BusinessRegistrationPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [businessData, setBusinessData] = useState<BusinessData>(initialBusinessData);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleStepComplete = (stepData: Partial<BusinessData>) => {
    setBusinessData(prev => ({ ...prev, ...stepData }));
    if (currentStep === 1) {
      setCurrentStep(2);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinalSubmit = async (finalData: Partial<BusinessData>) => {
    const completeData = { ...businessData, ...finalData };
    setIsLoading(true);

    try {
      const response = await apiService.createBusinessFromRegistration({
        name: completeData.businessName,
        category: completeData.category,
        subcategory: completeData.subcategory,
        description: completeData.businessDescription,
        businessType: completeData.isPhysicalAddress ? 'physical' : 'online',
        address: completeData.physicalAddress.street,
        city: completeData.physicalAddress.city,
        state: completeData.physicalAddress.state,
        zipCode: completeData.physicalAddress.zipCode,
        country: completeData.physicalAddress.country,
        onlinePresence: completeData.onlineAddress,
        churchAffiliation: completeData.churchAffiliation,
        businessTypeRadio: completeData.businessType,
        phone: completeData.contactDetails.phone,
        email: completeData.contactDetails.email,
        website: completeData.contactDetails.website
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

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!businessData.businessName.trim()) {
      newErrors.businessName = 'Business name is required';
    }

    if (!businessData.category) {
      newErrors.category = 'Please select a business category';
    }

    if (businessData.category && !businessData.subcategory) {
      newErrors.subcategory = 'Please select a subcategory';
    }

    if (!businessData.businessDescription.trim()) {
      newErrors.businessDescription = 'Business description is required';
    }

    if (businessData.isPhysicalAddress) {
      if (!businessData.physicalAddress.street.trim()) {
        newErrors.street = 'Street address is required';
      }
      if (!businessData.physicalAddress.city.trim()) {
        newErrors.city = 'City is required';
      }
      if (!businessData.physicalAddress.state.trim()) {
        newErrors.state = 'State is required';
      }
      if (!businessData.physicalAddress.zipCode.trim()) {
        newErrors.zipCode = 'ZIP code is required';
      }
      if (!businessData.physicalAddress.country.trim()) {
        newErrors.country = 'Country is required';
        }
      } else {
      if (!businessData.onlineAddress.trim()) {
        newErrors.onlineAddress = 'Online presence information is required';
      }
    }

    if (!businessData.businessType) {
      newErrors.businessType = 'Please select a business type';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      handleStepComplete(businessData);
    }
  };

  const updateFormData = (field: string, value: any) => {
    setBusinessData(prev => {
      const newData = { ...prev, [field]: value };
      // Reset subcategory when category changes
      if (field === 'category') {
        newData.subcategory = '';
      }
      return newData;
    });
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    // Clear subcategory error when category changes
    if (field === 'category' && errors.subcategory) {
      setErrors(prev => ({ ...prev, subcategory: '' }));
    }
  };

  const updatePhysicalAddress = (field: string, value: string) => {
    setBusinessData(prev => ({
      ...prev,
      physicalAddress: { ...prev.physicalAddress, [field]: value }
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
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

  const progressValue = (currentStep / 2) * 100;

    return (
      <div className="min-h-screen bg-white relative">
        {/* Orange background effects */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-0 w-96 h-96 bg-gradient-radial from-fem-terracotta/20 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-gradient-radial from-fem-terracotta/20 to-transparent rounded-full blur-3xl" />
        </div>
        <Navbar />
        <div className="pt-20 px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-fem-navy mb-3">Business Registration</h1>
            <p className="text-fem-darkgray text-sm sm:text-base lg:text-lg">Complete your business profile in 2 simple steps</p>
          </div>

          {/* Progress Bar */}
          <Card className="mb-8 shadow-lg border-0 bg-white/15 backdrop-blur-xl border border-white/20">
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row items-center justify-between mb-4 space-y-4 sm:space-y-0">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white transition-all duration-300 shadow-lg ${
                    currentStep >= 1 ? 'bg-gradient-to-r from-fem-terracotta to-fem-gold shadow-xl' : 'bg-gray-300'
                  }`}>
                    <span className="font-bold text-lg">1</span>
                  </div>
                  <span className={`font-semibold transition-colors text-lg ${
                    currentStep >= 1 ? 'text-fem-terracotta' : 'text-fem-darkgray'
                  }`}>
                    Business Registration
                  </span>
                </div>
                
                <div className="flex-1 mx-4 sm:mx-8 w-full sm:w-auto">
                  <div className="relative">
                    <div className="h-3 bg-white/20 rounded-full overflow-hidden shadow-inner">
                      <div 
                        className="h-full bg-gradient-to-r from-fem-terracotta to-fem-gold transition-all duration-700 ease-out rounded-full shadow-lg"
                        style={{ width: `${progressValue}%` }}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white transition-all duration-300 shadow-lg ${
                    currentStep >= 2 ? 'bg-gradient-to-r from-fem-terracotta to-fem-gold shadow-xl' : 'bg-gray-300'
                  }`}>
                    <span className="font-bold text-lg">2</span>
                  </div>
                  <span className={`font-semibold transition-colors text-lg ${
                    currentStep >= 2 ? 'text-fem-terracotta' : 'text-fem-darkgray'
                  }`}>
                    Profile Completion
                  </span>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Form Content */}
          <Card className="shadow-2xl border-0 bg-white/15 backdrop-blur-xl border border-white/20">
            <CardContent className="p-6 sm:p-8">
              {currentStep === 1 && (
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Basic Business Information */}
                  <Card className="shadow-lg border-0 bg-white/10 backdrop-blur-sm border border-white/20">
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-3 text-fem-navy text-xl">
                        <div className="p-2 bg-gradient-to-r from-fem-terracotta to-fem-gold rounded-lg">
                          <Building2 className="h-6 w-6 text-white" />
                        </div>
                        Basic Business Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="businessName" className="text-fem-navy font-semibold">Business Name *</Label>
        <Input
                            id="businessName"
                            value={businessData.businessName}
                            onChange={(e) => updateFormData('businessName', e.target.value)}
          placeholder="Enter your business name"
                            className={`h-12 border-white/20 focus:border-fem-terracotta focus:ring-fem-terracotta rounded-xl bg-white/10 backdrop-blur-sm transition-all duration-300 ${
                              errors.businessName ? 'border-red-500' : ''
                            }`}
                          />
                          {errors.businessName && (
                            <p className="text-red-500 text-sm font-medium">{errors.businessName}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="category" className="text-fem-navy font-semibold">Business Category *</Label>
                          <Select value={businessData.category} onValueChange={(value) => updateFormData('category', value)}>
                            <SelectTrigger className={`h-12 border-white/20 focus:border-fem-terracotta focus:ring-fem-terracotta rounded-xl bg-white/10 backdrop-blur-sm transition-all duration-300 ${
                              errors.category ? 'border-red-500' : ''
                            }`}>
                              <SelectValue placeholder="Select a category" />
          </SelectTrigger>
                            <SelectContent className="bg-white/95 backdrop-blur-xl border border-white/20">
            {businessCategories.map((category) => (
                                <SelectItem key={category} value={category} className="hover:bg-fem-lightgold/20">
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
                          {errors.category && (
                            <p className="text-red-500 text-sm font-medium">{errors.category}</p>
                          )}
                        </div>
                      </div>

                      {/* Subcategory Field - Only show when category is selected */}
                      {businessData.category && subcategoriesMap[businessData.category] && (
                        <div className="space-y-2">
                          <Label htmlFor="subcategory" className="text-fem-navy font-semibold">Business Subcategory *</Label>
                          <Select value={businessData.subcategory} onValueChange={(value) => updateFormData('subcategory', value)}>
                            <SelectTrigger className={`h-12 border-white/20 focus:border-fem-terracotta focus:ring-fem-terracotta rounded-xl bg-white/10 backdrop-blur-sm transition-all duration-300 ${
                              errors.subcategory ? 'border-red-500' : ''
                            }`}>
                              <SelectValue placeholder="Select a subcategory" />
            </SelectTrigger>
                            <SelectContent className="bg-white/95 backdrop-blur-xl border border-white/20">
                              {subcategoriesMap[businessData.category].map((subcategory) => (
                                <SelectItem key={subcategory} value={subcategory} className="hover:bg-fem-lightgold/20">
                                  {subcategory}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
                          {errors.subcategory && (
                            <p className="text-red-500 text-sm font-medium">{errors.subcategory}</p>
                          )}
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label htmlFor="businessDescription" className="text-fem-navy font-semibold">Business Description *</Label>
        <Textarea
                          id="businessDescription"
                          value={businessData.businessDescription}
                          onChange={(e) => updateFormData('businessDescription', e.target.value)}
                          placeholder="Describe your business, what you do, and what makes you unique..."
                          rows={4}
                          className={`border-white/20 focus:border-fem-terracotta focus:ring-fem-terracotta rounded-xl bg-white/10 backdrop-blur-sm transition-all duration-300 resize-none ${
                            errors.businessDescription ? 'border-red-500' : ''
                          }`}
                        />
                        {errors.businessDescription && (
                          <p className="text-red-500 text-sm font-medium">{errors.businessDescription}</p>
          )}
        </div>
                    </CardContent>
                  </Card>

                  {/* Business Address */}
                  <Card className="shadow-lg border-0 bg-white/10 backdrop-blur-sm border border-white/20">
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-3 text-fem-navy text-xl">
                        <div className="p-2 bg-gradient-to-r from-fem-terracotta to-fem-gold rounded-lg">
                          <MapPin className="h-6 w-6 text-white" />
          </div>
                        Business Address
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 p-6 bg-white/5 rounded-xl border border-white/10">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-fem-lightgold/20 rounded-lg">
                            <Globe className="h-5 w-5 text-fem-terracotta" />
          </div>
                          <Label htmlFor="addressType" className="text-fem-navy font-semibold">Online Business</Label>
          </div>
                        <Switch
                          id="addressType"
                          checked={businessData.isPhysicalAddress}
                          onCheckedChange={(checked) => updateFormData('isPhysicalAddress', checked)}
                          className="data-[state=checked]:bg-fem-terracotta"
                        />
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-fem-lightgold/20 rounded-lg">
                            <MapPin className="h-5 w-5 text-fem-terracotta" />
          </div>
                          <Label htmlFor="addressType" className="text-fem-navy font-semibold">Physical Location</Label>
        </div>
        </div>

                      {!businessData.isPhysicalAddress ? (
                        <div className="space-y-2">
                          <Label htmlFor="onlineAddress" className="text-fem-navy font-semibold">Online Presence Details *</Label>
                          <Textarea
                            id="onlineAddress"
                            value={businessData.onlineAddress}
                            onChange={(e) => updateFormData('onlineAddress', e.target.value)}
                            placeholder="Describe how customers can reach you online (website, social media, etc.)"
                            rows={3}
                            className={`border-white/20 focus:border-fem-terracotta focus:ring-fem-terracotta rounded-xl bg-white/10 backdrop-blur-sm transition-all duration-300 resize-none ${
                              errors.onlineAddress ? 'border-red-500' : ''
                            }`}
                          />
                          {errors.onlineAddress && (
                            <p className="text-red-500 text-sm font-medium">{errors.onlineAddress}</p>
                          )}
          </div>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="md:col-span-2 space-y-2">
                            <Label htmlFor="street" className="text-fem-navy font-semibold">Street Address *</Label>
            <Input
                              id="street"
                              value={businessData.physicalAddress.street}
                              onChange={(e) => updatePhysicalAddress('street', e.target.value)}
                              placeholder="123 Main Street"
                              className={`h-12 border-white/20 focus:border-fem-terracotta focus:ring-fem-terracotta rounded-xl bg-white/10 backdrop-blur-sm transition-all duration-300 ${
                                errors.street ? 'border-red-500' : ''
                              }`}
                            />
                            {errors.street && (
                              <p className="text-red-500 text-sm font-medium">{errors.street}</p>
                            )}
          </div>

                          <div className="space-y-2">
                            <Label htmlFor="city" className="text-fem-navy font-semibold">City *</Label>
            <Input
                              id="city"
                              value={businessData.physicalAddress.city}
                              onChange={(e) => updatePhysicalAddress('city', e.target.value)}
                              placeholder="City"
                              className={`h-12 border-white/20 focus:border-fem-terracotta focus:ring-fem-terracotta rounded-xl bg-white/10 backdrop-blur-sm transition-all duration-300 ${
                                errors.city ? 'border-red-500' : ''
                              }`}
                            />
                            {errors.city && (
                              <p className="text-red-500 text-sm font-medium">{errors.city}</p>
                            )}
          </div>

                          <div className="space-y-2">
                            <Label htmlFor="state" className="text-fem-navy font-semibold">State/Province *</Label>
                            <Input
                              id="state"
                              value={businessData.physicalAddress.state}
                              onChange={(e) => updatePhysicalAddress('state', e.target.value)}
                              placeholder="State"
                              className={`h-12 border-white/20 focus:border-fem-terracotta focus:ring-fem-terracotta rounded-xl bg-white/10 backdrop-blur-sm transition-all duration-300 ${
                                errors.state ? 'border-red-500' : ''
                              }`}
                            />
                            {errors.state && (
                              <p className="text-red-500 text-sm font-medium">{errors.state}</p>
              )}
        </div>

                          <div className="space-y-2">
                            <Label htmlFor="zipCode" className="text-fem-navy font-semibold">ZIP/Postal Code *</Label>
          <Input
                              id="zipCode"
                              value={businessData.physicalAddress.zipCode}
                              onChange={(e) => updatePhysicalAddress('zipCode', e.target.value)}
                              placeholder="12345"
                              className={`h-12 border-white/20 focus:border-fem-terracotta focus:ring-fem-terracotta rounded-xl bg-white/10 backdrop-blur-sm transition-all duration-300 ${
                                errors.zipCode ? 'border-red-500' : ''
                              }`}
                            />
                            {errors.zipCode && (
                              <p className="text-red-500 text-sm font-medium">{errors.zipCode}</p>
                            )}
        </div>

                          <div className="space-y-2">
                            <Label htmlFor="country" className="text-fem-navy font-semibold">Country *</Label>
                <Input
                              id="country"
                              value={businessData.physicalAddress.country}
                              onChange={(e) => updatePhysicalAddress('country', e.target.value)}
                              placeholder="United States"
                              className={`h-12 border-white/20 focus:border-fem-terracotta focus:ring-fem-terracotta rounded-xl bg-white/10 backdrop-blur-sm transition-all duration-300 ${
                                errors.country ? 'border-red-500' : ''
                              }`}
                            />
                            {errors.country && (
                              <p className="text-red-500 text-sm font-medium">{errors.country}</p>
                            )}
          </div>
          </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Additional Information */}
                  <Card className="shadow-lg border-0 bg-white/10 backdrop-blur-sm border border-white/20">
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-3 text-fem-navy text-xl">
                        <div className="p-2 bg-gradient-to-r from-fem-terracotta to-fem-gold rounded-lg">
                          <Church className="h-6 w-6 text-white" />
          </div>
                        Additional Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="churchAffiliation" className="text-fem-navy font-semibold">Church Affiliation (Optional)</Label>
                <Input
                          id="churchAffiliation"
                          value={businessData.churchAffiliation}
                          onChange={(e) => updateFormData('churchAffiliation', e.target.value)}
                          placeholder="Enter church name or affiliation"
                          className="h-12 border-white/20 focus:border-fem-terracotta focus:ring-fem-terracotta rounded-xl bg-white/10 backdrop-blur-sm transition-all duration-300"
                        />
        </div>

                      <div className="space-y-4">
                        <Label className="text-fem-navy font-semibold text-lg">Business Type *</Label>
                        <RadioGroup
                          value={businessData.businessType}
                          onValueChange={(value) => updateFormData('businessType', value)}
                          className="grid grid-cols-1 md:grid-cols-3 gap-4"
                        >
                          <div className={`relative flex items-center p-6 border-2 rounded-xl cursor-pointer transition-all duration-300 hover:border-fem-terracotta/50 hover:bg-fem-terracotta/5 backdrop-blur-sm ${
                            businessData.businessType === 'products' 
                              ? 'border-fem-terracotta bg-fem-terracotta/10 shadow-lg' 
                              : 'border-white/20 bg-white/10'
                          }`}>
                            <RadioGroupItem 
                              value="products" 
                              id="products" 
                              className="sr-only" 
                            />
                            <Label htmlFor="products" className="flex-1 cursor-pointer">
                              <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                                    businessData.businessType === 'products'
                                      ? 'border-fem-terracotta bg-fem-terracotta'
                                      : 'border-fem-darkgray'
                                  }`}>
                                    {businessData.businessType === 'products' && (
                                      <div className="w-2 h-2 rounded-full bg-white"></div>
                                    )}
          </div>
                                  <h4 className={`transition-colors font-semibold ${
                                    businessData.businessType === 'products' ? 'text-fem-terracotta' : 'text-fem-navy'
                                  }`}>
                                    Products
                                  </h4>
            </div>
                                <p className="text-sm text-fem-darkgray ml-8">
                                  Physical or digital goods
                                </p>
              </div>
                            </Label>
              </div>

                          <div className={`relative flex items-center p-6 border-2 rounded-xl cursor-pointer transition-all duration-300 hover:border-fem-terracotta/50 hover:bg-fem-terracotta/5 backdrop-blur-sm ${
                            businessData.businessType === 'services' 
                              ? 'border-fem-terracotta bg-fem-terracotta/10 shadow-lg' 
                              : 'border-white/20 bg-white/10'
                          }`}>
                            <RadioGroupItem 
                              value="services" 
                              id="services" 
                              className="sr-only" 
                            />
                            <Label htmlFor="services" className="flex-1 cursor-pointer">
                              <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                                    businessData.businessType === 'services'
                                      ? 'border-fem-terracotta bg-fem-terracotta'
                                      : 'border-fem-darkgray'
                                  }`}>
                                    {businessData.businessType === 'services' && (
                                      <div className="w-2 h-2 rounded-full bg-white"></div>
                                    )}
        </div>
                                  <h4 className={`transition-colors font-semibold ${
                                    businessData.businessType === 'services' ? 'text-fem-terracotta' : 'text-fem-navy'
                                  }`}>
                                    Services
                                  </h4>
                  </div>
                                <p className="text-sm text-fem-darkgray ml-8">
                                  Professional services
                                </p>
                </div>
                            </Label>
              </div>
            
                          <div className={`relative flex items-center p-6 border-2 rounded-xl cursor-pointer transition-all duration-300 hover:border-fem-terracotta/50 hover:bg-fem-terracotta/5 backdrop-blur-sm ${
                            businessData.businessType === 'both' 
                              ? 'border-fem-terracotta bg-fem-terracotta/10 shadow-lg' 
                              : 'border-white/20 bg-white/10'
                          }`}>
                            <RadioGroupItem 
                              value="both" 
                              id="both" 
                              className="sr-only" 
                            />
                            <Label htmlFor="both" className="flex-1 cursor-pointer">
                              <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                                    businessData.businessType === 'both'
                                      ? 'border-fem-terracotta bg-fem-terracotta'
                                      : 'border-fem-darkgray'
                                  }`}>
                                    {businessData.businessType === 'both' && (
                                      <div className="w-2 h-2 rounded-full bg-white"></div>
                                    )}
                  </div>
                                  <h4 className={`transition-colors font-semibold ${
                                    businessData.businessType === 'both' ? 'text-fem-terracotta' : 'text-fem-navy'
                                  }`}>
                                    Both
                                  </h4>
                  </div>
                                <p className="text-sm text-fem-darkgray ml-8">
                                  Products and services
                                </p>
                </div>
                            </Label>
                          </div>
                        </RadioGroup>
                        {errors.businessType && (
                          <p className="text-red-500 text-sm font-medium">{errors.businessType}</p>
              )}
            </div>
                    </CardContent>
                  </Card>

                  <Separator className="bg-white/20" />

                  <div className="flex justify-center sm:justify-end">
                  <Button
                      type="submit" 
                      size="lg" 
                      className="w-full sm:w-auto"
                    >
                      Register the Business
                  </Button>
                </div>
                </form>
              )}
              
              {currentStep === 2 && (
                <div className="space-y-8">
                  {/* Profile Completion Header */}
                  <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-gradient-to-r from-fem-terracotta to-fem-gold rounded-full flex items-center justify-center mx-auto mb-6">
                      <Building2 className="w-10 h-10 text-white" />
              </div>
                    <h2 className="text-3xl font-bold text-fem-navy mb-4">Profile Completion</h2>
                    <p className="text-fem-darkgray text-lg">Complete your business profile with additional details</p>
          </div>

                  {/* Services Description */}
                  <Card className="shadow-lg border-0 bg-white/10 backdrop-blur-sm border border-white/20">
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-3 text-fem-navy text-xl">
                        <div className="p-2 bg-gradient-to-r from-fem-terracotta to-fem-gold rounded-lg">
                          <Building2 className="h-6 w-6 text-white" />
                        </div>
                        Services & Contact Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="services" className="text-fem-navy font-semibold">Services Description *</Label>
                        <Textarea
                          id="services"
                          value={businessData.services}
                          onChange={(e) => updateFormData('services', e.target.value)}
                          placeholder="Describe your main services, products, or what you offer to customers..."
                          rows={4}
                          className="border-white/20 focus:border-fem-terracotta focus:ring-fem-terracotta rounded-xl bg-white/10 backdrop-blur-sm transition-all duration-300 resize-none"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-fem-navy font-semibold">Email Address *</Label>
                  <Input
                            id="email"
                            type="email"
                            value={businessData.contactDetails.email}
                            onChange={(e) => updateFormData('contactDetails', { ...businessData.contactDetails, email: e.target.value })}
                            placeholder="your@email.com"
                            className="h-12 border-white/20 focus:border-fem-terracotta focus:ring-fem-terracotta rounded-xl bg-white/10 backdrop-blur-sm transition-all duration-300"
                  />
                </div>

                        <div className="space-y-2">
                          <Label htmlFor="phone" className="text-fem-navy font-semibold">Phone Number *</Label>
                <Input
                            id="phone"
                            type="tel"
                            value={businessData.contactDetails.phone}
                            onChange={(e) => updateFormData('contactDetails', { ...businessData.contactDetails, phone: e.target.value })}
                            placeholder="+1 (555) 123-4567"
                            className="h-12 border-white/20 focus:border-fem-terracotta focus:ring-fem-terracotta rounded-xl bg-white/10 backdrop-blur-sm transition-all duration-300"
                          />
              </div>
          </div>

                      <div className="space-y-2">
                        <Label htmlFor="website" className="text-fem-navy font-semibold">Website (Optional)</Label>
                        <Input
                          id="website"
                          type="url"
                          value={businessData.contactDetails.website}
                          onChange={(e) => updateFormData('contactDetails', { ...businessData.contactDetails, website: e.target.value })}
                          placeholder="https://your-website.com"
                          className="h-12 border-white/20 focus:border-fem-terracotta focus:ring-fem-terracotta rounded-xl bg-white/10 backdrop-blur-sm transition-all duration-300"
              />
            </div>
                    </CardContent>
                  </Card>

                  <Separator className="bg-white/20" />

                  <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <Button 
                      onClick={handleBack} 
                      variant="outline"
                      size="lg"
                      className="w-full sm:w-auto"
                    >
                      Back
                    </Button>
                    <Button 
                      onClick={() => handleFinalSubmit(businessData)}
                      disabled={isLoading}
                      size="lg"
                      className="w-full sm:w-auto"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Completing Registration...
                        </>
                      ) : (
                        'Complete Registration'
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
            </div>
      </div>
    </div>
    );
};

export default BusinessRegistrationPage;