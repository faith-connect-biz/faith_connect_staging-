import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Switch } from './ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';
import { Building2, MapPin, Globe, Church } from 'lucide-react';
import type { BusinessData } from '../App';

interface BusinessRegistrationFormProps {
  initialData: BusinessData;
  onComplete: (data: Partial<BusinessData>) => void;
}

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

export function BusinessRegistrationForm({ initialData, onComplete }: BusinessRegistrationFormProps) {
  const [formData, setFormData] = useState({
    businessName: initialData.businessName,
    category: initialData.category,
    subcategory: initialData.subcategory,
    businessDescription: initialData.businessDescription,
    isPhysicalAddress: initialData.isPhysicalAddress,
    onlineAddress: initialData.onlineAddress,
    physicalAddress: initialData.physicalAddress,
    churchAffiliation: initialData.churchAffiliation,
    businessType: initialData.businessType,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.businessName.trim()) {
      newErrors.businessName = 'Business name is required';
    }

    if (!formData.category) {
      newErrors.category = 'Please select a business category';
    }

    if (formData.category && !formData.subcategory) {
      newErrors.subcategory = 'Please select a subcategory';
    }

    if (!formData.businessDescription.trim()) {
      newErrors.businessDescription = 'Business description is required';
    }

    if (formData.isPhysicalAddress) {
      if (!formData.physicalAddress.street.trim()) {
        newErrors.street = 'Street address is required';
      }
      if (!formData.physicalAddress.city.trim()) {
        newErrors.city = 'City is required';
      }
      if (!formData.physicalAddress.state.trim()) {
        newErrors.state = 'State is required';
      }
      if (!formData.physicalAddress.zipCode.trim()) {
        newErrors.zipCode = 'ZIP code is required';
      }
      if (!formData.physicalAddress.country.trim()) {
        newErrors.country = 'Country is required';
      }
    } else {
      if (!formData.onlineAddress.trim()) {
        newErrors.onlineAddress = 'Online presence information is required';
      }
    }

    if (!formData.businessType) {
      newErrors.businessType = 'Please select a business type';
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

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => {
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
    setFormData(prev => ({
      ...prev,
      physicalAddress: { ...prev.physicalAddress, [field]: value }
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Business Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Basic Business Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name *</Label>
              <Input
                id="businessName"
                value={formData.businessName}
                onChange={(e) => updateFormData('businessName', e.target.value)}
                placeholder="Enter your business name"
                className={errors.businessName ? 'border-red-500' : ''}
              />
              {errors.businessName && (
                <p className="text-red-500 text-sm">{errors.businessName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Business Category *</Label>
              <Select value={formData.category} onValueChange={(value) => updateFormData('category', value)}>
                <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {businessCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-red-500 text-sm">{errors.category}</p>
              )}
            </div>
          </div>

          {/* Subcategory Field - Only show when category is selected */}
          {formData.category && subcategoriesMap[formData.category] && (
            <div className="space-y-2">
              <Label htmlFor="subcategory">Business Subcategory *</Label>
              <Select value={formData.subcategory} onValueChange={(value) => updateFormData('subcategory', value)}>
                <SelectTrigger className={errors.subcategory ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select a subcategory" />
                </SelectTrigger>
                <SelectContent>
                  {subcategoriesMap[formData.category].map((subcategory) => (
                    <SelectItem key={subcategory} value={subcategory}>
                      {subcategory}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.subcategory && (
                <p className="text-red-500 text-sm">{errors.subcategory}</p>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div></div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="businessDescription">Business Description *</Label>
            <Textarea
              id="businessDescription"
              value={formData.businessDescription}
              onChange={(e) => updateFormData('businessDescription', e.target.value)}
              placeholder="Describe your business, what you do, and what makes you unique..."
              rows={4}
              className={errors.businessDescription ? 'border-red-500' : ''}
            />
            {errors.businessDescription && (
              <p className="text-red-500 text-sm">{errors.businessDescription}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Business Address */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Business Address
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="addressType">Online Business</Label>
            </div>
            <Switch
              id="addressType"
              checked={formData.isPhysicalAddress}
              onCheckedChange={(checked) => updateFormData('isPhysicalAddress', checked)}
            />
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="addressType">Physical Location</Label>
            </div>
          </div>

          {!formData.isPhysicalAddress ? (
            <div className="space-y-2">
              <Label htmlFor="onlineAddress">Online Presence Details *</Label>
              <Textarea
                id="onlineAddress"
                value={formData.onlineAddress}
                onChange={(e) => updateFormData('onlineAddress', e.target.value)}
                placeholder="Describe how customers can reach you online (website, social media, etc.)"
                rows={3}
                className={errors.onlineAddress ? 'border-red-500' : ''}
              />
              {errors.onlineAddress && (
                <p className="text-red-500 text-sm">{errors.onlineAddress}</p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="street">Street Address *</Label>
                <Input
                  id="street"
                  value={formData.physicalAddress.street}
                  onChange={(e) => updatePhysicalAddress('street', e.target.value)}
                  placeholder="123 Main Street"
                  className={errors.street ? 'border-red-500' : ''}
                />
                {errors.street && (
                  <p className="text-red-500 text-sm">{errors.street}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={formData.physicalAddress.city}
                  onChange={(e) => updatePhysicalAddress('city', e.target.value)}
                  placeholder="City"
                  className={errors.city ? 'border-red-500' : ''}
                />
                {errors.city && (
                  <p className="text-red-500 text-sm">{errors.city}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State/Province *</Label>
                <Input
                  id="state"
                  value={formData.physicalAddress.state}
                  onChange={(e) => updatePhysicalAddress('state', e.target.value)}
                  placeholder="State"
                  className={errors.state ? 'border-red-500' : ''}
                />
                {errors.state && (
                  <p className="text-red-500 text-sm">{errors.state}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="zipCode">ZIP/Postal Code *</Label>
                <Input
                  id="zipCode"
                  value={formData.physicalAddress.zipCode}
                  onChange={(e) => updatePhysicalAddress('zipCode', e.target.value)}
                  placeholder="12345"
                  className={errors.zipCode ? 'border-red-500' : ''}
                />
                {errors.zipCode && (
                  <p className="text-red-500 text-sm">{errors.zipCode}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Country *</Label>
                <Input
                  id="country"
                  value={formData.physicalAddress.country}
                  onChange={(e) => updatePhysicalAddress('country', e.target.value)}
                  placeholder="United States"
                  className={errors.country ? 'border-red-500' : ''}
                />
                {errors.country && (
                  <p className="text-red-500 text-sm">{errors.country}</p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Additional Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Church className="h-5 w-5" />
            Additional Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="churchAffiliation">Church Affiliation (Optional)</Label>
            <Input
              id="churchAffiliation"
              value={formData.churchAffiliation}
              onChange={(e) => updateFormData('churchAffiliation', e.target.value)}
              placeholder="Enter church name or affiliation"
            />
          </div>

          <div className="space-y-4">
            <Label>Business Type *</Label>
            <RadioGroup
              value={formData.businessType}
              onValueChange={(value) => updateFormData('businessType', value)}
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              <div className={`relative flex items-center p-6 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:border-[#c74a33]/50 hover:bg-[#c74a33]/5 ${
                formData.businessType === 'products' 
                  ? 'border-[#c74a33] bg-[#c74a33]/10 shadow-md' 
                  : 'border-gray-200 bg-white'
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
                        formData.businessType === 'products'
                          ? 'border-[#c74a33] bg-[#c74a33]'
                          : 'border-gray-300'
                      }`}>
                        {formData.businessType === 'products' && (
                          <div className="w-2 h-2 rounded-full bg-white"></div>
                        )}
                      </div>
                      <h4 className={`transition-colors ${
                        formData.businessType === 'products' ? 'text-[#c74a33]' : 'text-gray-900'
                      }`}>
                        Products
                      </h4>
                    </div>
                    <p className="text-sm text-gray-600 ml-8">
                      Physical or digital goods
                    </p>
                  </div>
                </Label>
              </div>

              <div className={`relative flex items-center p-6 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:border-[#c74a33]/50 hover:bg-[#c74a33]/5 ${
                formData.businessType === 'services' 
                  ? 'border-[#c74a33] bg-[#c74a33]/10 shadow-md' 
                  : 'border-gray-200 bg-white'
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
                        formData.businessType === 'services'
                          ? 'border-[#c74a33] bg-[#c74a33]'
                          : 'border-gray-300'
                      }`}>
                        {formData.businessType === 'services' && (
                          <div className="w-2 h-2 rounded-full bg-white"></div>
                        )}
                      </div>
                      <h4 className={`transition-colors ${
                        formData.businessType === 'services' ? 'text-[#c74a33]' : 'text-gray-900'
                      }`}>
                        Services
                      </h4>
                    </div>
                    <p className="text-sm text-gray-600 ml-8">
                      Professional services
                    </p>
                  </div>
                </Label>
              </div>

              <div className={`relative flex items-center p-6 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:border-[#c74a33]/50 hover:bg-[#c74a33]/5 ${
                formData.businessType === 'both' 
                  ? 'border-[#c74a33] bg-[#c74a33]/10 shadow-md' 
                  : 'border-gray-200 bg-white'
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
                        formData.businessType === 'both'
                          ? 'border-[#c74a33] bg-[#c74a33]'
                          : 'border-gray-300'
                      }`}>
                        {formData.businessType === 'both' && (
                          <div className="w-2 h-2 rounded-full bg-white"></div>
                        )}
                      </div>
                      <h4 className={`transition-colors ${
                        formData.businessType === 'both' ? 'text-[#c74a33]' : 'text-gray-900'
                      }`}>
                        Both
                      </h4>
                    </div>
                    <p className="text-sm text-gray-600 ml-8">
                      Products and services
                    </p>
                  </div>
                </Label>
              </div>
            </RadioGroup>
            {errors.businessType && (
              <p className="text-red-500 text-sm">{errors.businessType}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Separator />

      <div className="flex justify-end">
        <Button 
          type="submit" 
          size="lg" 
          className="px-8 bg-gradient-to-r from-fem-terracotta to-fem-gold hover:from-fem-terracotta/90 hover:to-fem-gold/90 text-white backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-500 border border-white/20"
        >
          Register the Business
        </Button>
      </div>
    </form>
  );
}


          {/* Subcategory Field - Only show when category is selected */}

          {formData.category && subcategoriesMap[formData.category] && (

            <div className="space-y-2">

              <Label htmlFor="subcategory">Business Subcategory *</Label>

              <Select value={formData.subcategory} onValueChange={(value) => updateFormData('subcategory', value)}>

                <SelectTrigger className={errors.subcategory ? 'border-red-500' : ''}>

                  <SelectValue placeholder="Select a subcategory" />

                </SelectTrigger>

                <SelectContent>

                  {subcategoriesMap[formData.category].map((subcategory) => (

                    <SelectItem key={subcategory} value={subcategory}>

                      {subcategory}

                    </SelectItem>

                  ))}

                </SelectContent>

              </Select>

              {errors.subcategory && (

                <p className="text-red-500 text-sm">{errors.subcategory}</p>

              )}

            </div>

          )}



          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div></div>

          </div>



          <div className="space-y-2">

            <Label htmlFor="businessDescription">Business Description *</Label>

            <Textarea

              id="businessDescription"

              value={formData.businessDescription}

              onChange={(e) => updateFormData('businessDescription', e.target.value)}

              placeholder="Describe your business, what you do, and what makes you unique..."

              rows={4}

              className={errors.businessDescription ? 'border-red-500' : ''}

            />

            {errors.businessDescription && (

              <p className="text-red-500 text-sm">{errors.businessDescription}</p>

            )}

          </div>

        </CardContent>

      </Card>



      {/* Business Address */}

      <Card>

        <CardHeader>

          <CardTitle className="flex items-center gap-2">

            <MapPin className="h-5 w-5" />

            Business Address

          </CardTitle>

        </CardHeader>

        <CardContent className="space-y-6">

          <div className="flex items-center space-x-4">

            <div className="flex items-center space-x-2">

              <Globe className="h-4 w-4 text-muted-foreground" />

              <Label htmlFor="addressType">Online Business</Label>

            </div>

            <Switch

              id="addressType"

              checked={formData.isPhysicalAddress}

              onCheckedChange={(checked) => updateFormData('isPhysicalAddress', checked)}

            />

            <div className="flex items-center space-x-2">

              <MapPin className="h-4 w-4 text-muted-foreground" />

              <Label htmlFor="addressType">Physical Location</Label>

            </div>

          </div>



          {!formData.isPhysicalAddress ? (

            <div className="space-y-2">

              <Label htmlFor="onlineAddress">Online Presence Details *</Label>

              <Textarea

                id="onlineAddress"

                value={formData.onlineAddress}

                onChange={(e) => updateFormData('onlineAddress', e.target.value)}

                placeholder="Describe how customers can reach you online (website, social media, etc.)"

                rows={3}

                className={errors.onlineAddress ? 'border-red-500' : ''}

              />

              {errors.onlineAddress && (

                <p className="text-red-500 text-sm">{errors.onlineAddress}</p>

              )}

            </div>

          ) : (

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div className="md:col-span-2 space-y-2">

                <Label htmlFor="street">Street Address *</Label>

                <Input

                  id="street"

                  value={formData.physicalAddress.street}

                  onChange={(e) => updatePhysicalAddress('street', e.target.value)}

                  placeholder="123 Main Street"

                  className={errors.street ? 'border-red-500' : ''}

                />

                {errors.street && (

                  <p className="text-red-500 text-sm">{errors.street}</p>

                )}

              </div>



              <div className="space-y-2">

                <Label htmlFor="city">City *</Label>

                <Input

                  id="city"

                  value={formData.physicalAddress.city}

                  onChange={(e) => updatePhysicalAddress('city', e.target.value)}

                  placeholder="City"

                  className={errors.city ? 'border-red-500' : ''}

                />

                {errors.city && (

                  <p className="text-red-500 text-sm">{errors.city}</p>

                )}

              </div>



              <div className="space-y-2">

                <Label htmlFor="state">State/Province *</Label>

                <Input

                  id="state"

                  value={formData.physicalAddress.state}

                  onChange={(e) => updatePhysicalAddress('state', e.target.value)}

                  placeholder="State"

                  className={errors.state ? 'border-red-500' : ''}

                />

                {errors.state && (

                  <p className="text-red-500 text-sm">{errors.state}</p>

                )}

              </div>



              <div className="space-y-2">

                <Label htmlFor="zipCode">ZIP/Postal Code *</Label>

                <Input

                  id="zipCode"

                  value={formData.physicalAddress.zipCode}

                  onChange={(e) => updatePhysicalAddress('zipCode', e.target.value)}

                  placeholder="12345"

                  className={errors.zipCode ? 'border-red-500' : ''}

                />

                {errors.zipCode && (

                  <p className="text-red-500 text-sm">{errors.zipCode}</p>

                )}

              </div>



              <div className="space-y-2">

                <Label htmlFor="country">Country *</Label>

                <Input

                  id="country"

                  value={formData.physicalAddress.country}

                  onChange={(e) => updatePhysicalAddress('country', e.target.value)}

                  placeholder="United States"

                  className={errors.country ? 'border-red-500' : ''}

                />

                {errors.country && (

                  <p className="text-red-500 text-sm">{errors.country}</p>

                )}

              </div>

            </div>

          )}

        </CardContent>

      </Card>



      {/* Additional Information */}

      <Card>

        <CardHeader>

          <CardTitle className="flex items-center gap-2">

            <Church className="h-5 w-5" />

            Additional Information

          </CardTitle>

        </CardHeader>

        <CardContent className="space-y-6">

          <div className="space-y-2">

            <Label htmlFor="churchAffiliation">Church Affiliation (Optional)</Label>

            <Input

              id="churchAffiliation"

              value={formData.churchAffiliation}

              onChange={(e) => updateFormData('churchAffiliation', e.target.value)}

              placeholder="Enter church name or affiliation"

            />

          </div>



          <div className="space-y-4">

            <Label>Business Type *</Label>

            <RadioGroup

              value={formData.businessType}

              onValueChange={(value) => updateFormData('businessType', value)}

              className="grid grid-cols-1 md:grid-cols-3 gap-4"

            >

              <div className={`relative flex items-center p-6 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:border-[#c74a33]/50 hover:bg-[#c74a33]/5 ${

                formData.businessType === 'products' 

                  ? 'border-[#c74a33] bg-[#c74a33]/10 shadow-md' 

                  : 'border-gray-200 bg-white'

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

                        formData.businessType === 'products'

                          ? 'border-[#c74a33] bg-[#c74a33]'

                          : 'border-gray-300'

                      }`}>

                        {formData.businessType === 'products' && (

                          <div className="w-2 h-2 rounded-full bg-white"></div>

                        )}

                      </div>

                      <h4 className={`transition-colors ${

                        formData.businessType === 'products' ? 'text-[#c74a33]' : 'text-gray-900'

                      }`}>

                        Products

                      </h4>

                    </div>

                    <p className="text-sm text-gray-600 ml-8">

                      Physical or digital goods

                    </p>

                  </div>

                </Label>

              </div>



              <div className={`relative flex items-center p-6 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:border-[#c74a33]/50 hover:bg-[#c74a33]/5 ${

                formData.businessType === 'services' 

                  ? 'border-[#c74a33] bg-[#c74a33]/10 shadow-md' 

                  : 'border-gray-200 bg-white'

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

                        formData.businessType === 'services'

                          ? 'border-[#c74a33] bg-[#c74a33]'

                          : 'border-gray-300'

                      }`}>

                        {formData.businessType === 'services' && (

                          <div className="w-2 h-2 rounded-full bg-white"></div>

                        )}

                      </div>

                      <h4 className={`transition-colors ${

                        formData.businessType === 'services' ? 'text-[#c74a33]' : 'text-gray-900'

                      }`}>

                        Services

                      </h4>

                    </div>

                    <p className="text-sm text-gray-600 ml-8">

                      Professional services

                    </p>

                  </div>

                </Label>

              </div>



              <div className={`relative flex items-center p-6 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:border-[#c74a33]/50 hover:bg-[#c74a33]/5 ${

                formData.businessType === 'both' 

                  ? 'border-[#c74a33] bg-[#c74a33]/10 shadow-md' 

                  : 'border-gray-200 bg-white'

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

                        formData.businessType === 'both'

                          ? 'border-[#c74a33] bg-[#c74a33]'

                          : 'border-gray-300'

                      }`}>

                        {formData.businessType === 'both' && (

                          <div className="w-2 h-2 rounded-full bg-white"></div>

                        )}

                      </div>

                      <h4 className={`transition-colors ${

                        formData.businessType === 'both' ? 'text-[#c74a33]' : 'text-gray-900'

                      }`}>

                        Both

                      </h4>

                    </div>

                    <p className="text-sm text-gray-600 ml-8">

                      Products and services

                    </p>

                  </div>

                </Label>

              </div>

            </RadioGroup>

            {errors.businessType && (

              <p className="text-red-500 text-sm">{errors.businessType}</p>

            )}

          </div>

        </CardContent>

      </Card>



      <Separator />



      <div className="flex justify-end">

        <Button 

          type="submit" 

          size="lg" 

          className="px-8 bg-[#c74a33] hover:bg-[#b8422e] text-white transition-colors duration-200"

        >

          Register the Business

        </Button>

      </div>

    </form>

  );

}




          {/* Subcategory Field - Only show when category is selected */}

          {formData.category && subcategoriesMap[formData.category] && (

            <div className="space-y-2">

              <Label htmlFor="subcategory">Business Subcategory *</Label>

              <Select value={formData.subcategory} onValueChange={(value) => updateFormData('subcategory', value)}>

                <SelectTrigger className={errors.subcategory ? 'border-red-500' : ''}>

                  <SelectValue placeholder="Select a subcategory" />

                </SelectTrigger>

                <SelectContent>

                  {subcategoriesMap[formData.category].map((subcategory) => (

                    <SelectItem key={subcategory} value={subcategory}>

                      {subcategory}

                    </SelectItem>

                  ))}

                </SelectContent>

              </Select>

              {errors.subcategory && (

                <p className="text-red-500 text-sm">{errors.subcategory}</p>

              )}

            </div>

          )}



          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div></div>

          </div>



          <div className="space-y-2">

            <Label htmlFor="businessDescription">Business Description *</Label>

            <Textarea

              id="businessDescription"

              value={formData.businessDescription}

              onChange={(e) => updateFormData('businessDescription', e.target.value)}

              placeholder="Describe your business, what you do, and what makes you unique..."

              rows={4}

              className={errors.businessDescription ? 'border-red-500' : ''}

            />

            {errors.businessDescription && (

              <p className="text-red-500 text-sm">{errors.businessDescription}</p>

            )}

          </div>

        </CardContent>

      </Card>



      {/* Business Address */}

      <Card>

        <CardHeader>

          <CardTitle className="flex items-center gap-2">

            <MapPin className="h-5 w-5" />

            Business Address

          </CardTitle>

        </CardHeader>

        <CardContent className="space-y-6">

          <div className="flex items-center space-x-4">

            <div className="flex items-center space-x-2">

              <Globe className="h-4 w-4 text-muted-foreground" />

              <Label htmlFor="addressType">Online Business</Label>

            </div>

            <Switch

              id="addressType"

              checked={formData.isPhysicalAddress}

              onCheckedChange={(checked) => updateFormData('isPhysicalAddress', checked)}

            />

            <div className="flex items-center space-x-2">

              <MapPin className="h-4 w-4 text-muted-foreground" />

              <Label htmlFor="addressType">Physical Location</Label>

            </div>

          </div>



          {!formData.isPhysicalAddress ? (

            <div className="space-y-2">

              <Label htmlFor="onlineAddress">Online Presence Details *</Label>

              <Textarea

                id="onlineAddress"

                value={formData.onlineAddress}

                onChange={(e) => updateFormData('onlineAddress', e.target.value)}

                placeholder="Describe how customers can reach you online (website, social media, etc.)"

                rows={3}

                className={errors.onlineAddress ? 'border-red-500' : ''}

              />

              {errors.onlineAddress && (

                <p className="text-red-500 text-sm">{errors.onlineAddress}</p>

              )}

            </div>

          ) : (

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div className="md:col-span-2 space-y-2">

                <Label htmlFor="street">Street Address *</Label>

                <Input

                  id="street"

                  value={formData.physicalAddress.street}

                  onChange={(e) => updatePhysicalAddress('street', e.target.value)}

                  placeholder="123 Main Street"

                  className={errors.street ? 'border-red-500' : ''}

                />

                {errors.street && (

                  <p className="text-red-500 text-sm">{errors.street}</p>

                )}

              </div>



              <div className="space-y-2">

                <Label htmlFor="city">City *</Label>

                <Input

                  id="city"

                  value={formData.physicalAddress.city}

                  onChange={(e) => updatePhysicalAddress('city', e.target.value)}

                  placeholder="City"

                  className={errors.city ? 'border-red-500' : ''}

                />

                {errors.city && (

                  <p className="text-red-500 text-sm">{errors.city}</p>

                )}

              </div>



              <div className="space-y-2">

                <Label htmlFor="state">State/Province *</Label>

                <Input

                  id="state"

                  value={formData.physicalAddress.state}

                  onChange={(e) => updatePhysicalAddress('state', e.target.value)}

                  placeholder="State"

                  className={errors.state ? 'border-red-500' : ''}

                />

                {errors.state && (

                  <p className="text-red-500 text-sm">{errors.state}</p>

                )}

              </div>



              <div className="space-y-2">

                <Label htmlFor="zipCode">ZIP/Postal Code *</Label>

                <Input

                  id="zipCode"

                  value={formData.physicalAddress.zipCode}

                  onChange={(e) => updatePhysicalAddress('zipCode', e.target.value)}

                  placeholder="12345"

                  className={errors.zipCode ? 'border-red-500' : ''}

                />

                {errors.zipCode && (

                  <p className="text-red-500 text-sm">{errors.zipCode}</p>

                )}

              </div>



              <div className="space-y-2">

                <Label htmlFor="country">Country *</Label>

                <Input

                  id="country"

                  value={formData.physicalAddress.country}

                  onChange={(e) => updatePhysicalAddress('country', e.target.value)}

                  placeholder="United States"

                  className={errors.country ? 'border-red-500' : ''}

                />

                {errors.country && (

                  <p className="text-red-500 text-sm">{errors.country}</p>

                )}

              </div>

            </div>

          )}

        </CardContent>

      </Card>



      {/* Additional Information */}

      <Card>

        <CardHeader>

          <CardTitle className="flex items-center gap-2">

            <Church className="h-5 w-5" />

            Additional Information

          </CardTitle>

        </CardHeader>

        <CardContent className="space-y-6">

          <div className="space-y-2">

            <Label htmlFor="churchAffiliation">Church Affiliation (Optional)</Label>

            <Input

              id="churchAffiliation"

              value={formData.churchAffiliation}

              onChange={(e) => updateFormData('churchAffiliation', e.target.value)}

              placeholder="Enter church name or affiliation"

            />

          </div>



          <div className="space-y-4">

            <Label>Business Type *</Label>

            <RadioGroup

              value={formData.businessType}

              onValueChange={(value) => updateFormData('businessType', value)}

              className="grid grid-cols-1 md:grid-cols-3 gap-4"

            >

              <div className={`relative flex items-center p-6 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:border-[#c74a33]/50 hover:bg-[#c74a33]/5 ${

                formData.businessType === 'products' 

                  ? 'border-[#c74a33] bg-[#c74a33]/10 shadow-md' 

                  : 'border-gray-200 bg-white'

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

                        formData.businessType === 'products'

                          ? 'border-[#c74a33] bg-[#c74a33]'

                          : 'border-gray-300'

                      }`}>

                        {formData.businessType === 'products' && (

                          <div className="w-2 h-2 rounded-full bg-white"></div>

                        )}

                      </div>

                      <h4 className={`transition-colors ${

                        formData.businessType === 'products' ? 'text-[#c74a33]' : 'text-gray-900'

                      }`}>

                        Products

                      </h4>

                    </div>

                    <p className="text-sm text-gray-600 ml-8">

                      Physical or digital goods

                    </p>

                  </div>

                </Label>

              </div>



              <div className={`relative flex items-center p-6 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:border-[#c74a33]/50 hover:bg-[#c74a33]/5 ${

                formData.businessType === 'services' 

                  ? 'border-[#c74a33] bg-[#c74a33]/10 shadow-md' 

                  : 'border-gray-200 bg-white'

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

                        formData.businessType === 'services'

                          ? 'border-[#c74a33] bg-[#c74a33]'

                          : 'border-gray-300'

                      }`}>

                        {formData.businessType === 'services' && (

                          <div className="w-2 h-2 rounded-full bg-white"></div>

                        )}

                      </div>

                      <h4 className={`transition-colors ${

                        formData.businessType === 'services' ? 'text-[#c74a33]' : 'text-gray-900'

                      }`}>

                        Services

                      </h4>

                    </div>

                    <p className="text-sm text-gray-600 ml-8">

                      Professional services

                    </p>

                  </div>

                </Label>

              </div>



              <div className={`relative flex items-center p-6 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:border-[#c74a33]/50 hover:bg-[#c74a33]/5 ${

                formData.businessType === 'both' 

                  ? 'border-[#c74a33] bg-[#c74a33]/10 shadow-md' 

                  : 'border-gray-200 bg-white'

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

                        formData.businessType === 'both'

                          ? 'border-[#c74a33] bg-[#c74a33]'

                          : 'border-gray-300'

                      }`}>

                        {formData.businessType === 'both' && (

                          <div className="w-2 h-2 rounded-full bg-white"></div>

                        )}

                      </div>

                      <h4 className={`transition-colors ${

                        formData.businessType === 'both' ? 'text-[#c74a33]' : 'text-gray-900'

                      }`}>

                        Both

                      </h4>

                    </div>

                    <p className="text-sm text-gray-600 ml-8">

                      Products and services

                    </p>

                  </div>

                </Label>

              </div>

            </RadioGroup>

            {errors.businessType && (

              <p className="text-red-500 text-sm">{errors.businessType}</p>

            )}

          </div>

        </CardContent>

      </Card>



      <Separator />



      <div className="flex justify-end">

        <Button 

          type="submit" 

          size="lg" 

          className="px-8 bg-[#c74a33] hover:bg-[#b8422e] text-white transition-colors duration-200"

        >

          Register the Business

        </Button>

      </div>

    </form>

  );

}



          {/* Subcategory Field - Only show when category is selected */}

          {formData.category && subcategoriesMap[formData.category] && (

            <div className="space-y-2">

              <Label htmlFor="subcategory">Business Subcategory *</Label>

              <Select value={formData.subcategory} onValueChange={(value) => updateFormData('subcategory', value)}>

                <SelectTrigger className={errors.subcategory ? 'border-red-500' : ''}>

                  <SelectValue placeholder="Select a subcategory" />

                </SelectTrigger>

                <SelectContent>

                  {subcategoriesMap[formData.category].map((subcategory) => (

                    <SelectItem key={subcategory} value={subcategory}>

                      {subcategory}

                    </SelectItem>

                  ))}

                </SelectContent>

              </Select>

              {errors.subcategory && (

                <p className="text-red-500 text-sm">{errors.subcategory}</p>

              )}

            </div>

          )}



          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div></div>

          </div>



          <div className="space-y-2">

            <Label htmlFor="businessDescription">Business Description *</Label>

            <Textarea

              id="businessDescription"

              value={formData.businessDescription}

              onChange={(e) => updateFormData('businessDescription', e.target.value)}

              placeholder="Describe your business, what you do, and what makes you unique..."

              rows={4}

              className={errors.businessDescription ? 'border-red-500' : ''}

            />

            {errors.businessDescription && (

              <p className="text-red-500 text-sm">{errors.businessDescription}</p>

            )}

          </div>

        </CardContent>

      </Card>



      {/* Business Address */}

      <Card>

        <CardHeader>

          <CardTitle className="flex items-center gap-2">

            <MapPin className="h-5 w-5" />

            Business Address

          </CardTitle>

        </CardHeader>

        <CardContent className="space-y-6">

          <div className="flex items-center space-x-4">

            <div className="flex items-center space-x-2">

              <Globe className="h-4 w-4 text-muted-foreground" />

              <Label htmlFor="addressType">Online Business</Label>

            </div>

            <Switch

              id="addressType"

              checked={formData.isPhysicalAddress}

              onCheckedChange={(checked) => updateFormData('isPhysicalAddress', checked)}

            />

            <div className="flex items-center space-x-2">

              <MapPin className="h-4 w-4 text-muted-foreground" />

              <Label htmlFor="addressType">Physical Location</Label>

            </div>

          </div>



          {!formData.isPhysicalAddress ? (

            <div className="space-y-2">

              <Label htmlFor="onlineAddress">Online Presence Details *</Label>

              <Textarea

                id="onlineAddress"

                value={formData.onlineAddress}

                onChange={(e) => updateFormData('onlineAddress', e.target.value)}

                placeholder="Describe how customers can reach you online (website, social media, etc.)"

                rows={3}

                className={errors.onlineAddress ? 'border-red-500' : ''}

              />

              {errors.onlineAddress && (

                <p className="text-red-500 text-sm">{errors.onlineAddress}</p>

              )}

            </div>

          ) : (

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div className="md:col-span-2 space-y-2">

                <Label htmlFor="street">Street Address *</Label>

                <Input

                  id="street"

                  value={formData.physicalAddress.street}

                  onChange={(e) => updatePhysicalAddress('street', e.target.value)}

                  placeholder="123 Main Street"

                  className={errors.street ? 'border-red-500' : ''}

                />

                {errors.street && (

                  <p className="text-red-500 text-sm">{errors.street}</p>

                )}

              </div>



              <div className="space-y-2">

                <Label htmlFor="city">City *</Label>

                <Input

                  id="city"

                  value={formData.physicalAddress.city}

                  onChange={(e) => updatePhysicalAddress('city', e.target.value)}

                  placeholder="City"

                  className={errors.city ? 'border-red-500' : ''}

                />

                {errors.city && (

                  <p className="text-red-500 text-sm">{errors.city}</p>

                )}

              </div>



              <div className="space-y-2">

                <Label htmlFor="state">State/Province *</Label>

                <Input

                  id="state"

                  value={formData.physicalAddress.state}

                  onChange={(e) => updatePhysicalAddress('state', e.target.value)}

                  placeholder="State"

                  className={errors.state ? 'border-red-500' : ''}

                />

                {errors.state && (

                  <p className="text-red-500 text-sm">{errors.state}</p>

                )}

              </div>



              <div className="space-y-2">

                <Label htmlFor="zipCode">ZIP/Postal Code *</Label>

                <Input

                  id="zipCode"

                  value={formData.physicalAddress.zipCode}

                  onChange={(e) => updatePhysicalAddress('zipCode', e.target.value)}

                  placeholder="12345"

                  className={errors.zipCode ? 'border-red-500' : ''}

                />

                {errors.zipCode && (

                  <p className="text-red-500 text-sm">{errors.zipCode}</p>

                )}

              </div>



              <div className="space-y-2">

                <Label htmlFor="country">Country *</Label>

                <Input

                  id="country"

                  value={formData.physicalAddress.country}

                  onChange={(e) => updatePhysicalAddress('country', e.target.value)}

                  placeholder="United States"

                  className={errors.country ? 'border-red-500' : ''}

                />

                {errors.country && (

                  <p className="text-red-500 text-sm">{errors.country}</p>

                )}

              </div>

            </div>

          )}

        </CardContent>

      </Card>



      {/* Additional Information */}

      <Card>

        <CardHeader>

          <CardTitle className="flex items-center gap-2">

            <Church className="h-5 w-5" />

            Additional Information

          </CardTitle>

        </CardHeader>

        <CardContent className="space-y-6">

          <div className="space-y-2">

            <Label htmlFor="churchAffiliation">Church Affiliation (Optional)</Label>

            <Input

              id="churchAffiliation"

              value={formData.churchAffiliation}

              onChange={(e) => updateFormData('churchAffiliation', e.target.value)}

              placeholder="Enter church name or affiliation"

            />

          </div>



          <div className="space-y-4">

            <Label>Business Type *</Label>

            <RadioGroup

              value={formData.businessType}

              onValueChange={(value) => updateFormData('businessType', value)}

              className="grid grid-cols-1 md:grid-cols-3 gap-4"

            >

              <div className={`relative flex items-center p-6 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:border-[#c74a33]/50 hover:bg-[#c74a33]/5 ${

                formData.businessType === 'products' 

                  ? 'border-[#c74a33] bg-[#c74a33]/10 shadow-md' 

                  : 'border-gray-200 bg-white'

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

                        formData.businessType === 'products'

                          ? 'border-[#c74a33] bg-[#c74a33]'

                          : 'border-gray-300'

                      }`}>

                        {formData.businessType === 'products' && (

                          <div className="w-2 h-2 rounded-full bg-white"></div>

                        )}

                      </div>

                      <h4 className={`transition-colors ${

                        formData.businessType === 'products' ? 'text-[#c74a33]' : 'text-gray-900'

                      }`}>

                        Products

                      </h4>

                    </div>

                    <p className="text-sm text-gray-600 ml-8">

                      Physical or digital goods

                    </p>

                  </div>

                </Label>

              </div>



              <div className={`relative flex items-center p-6 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:border-[#c74a33]/50 hover:bg-[#c74a33]/5 ${

                formData.businessType === 'services' 

                  ? 'border-[#c74a33] bg-[#c74a33]/10 shadow-md' 

                  : 'border-gray-200 bg-white'

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

                        formData.businessType === 'services'

                          ? 'border-[#c74a33] bg-[#c74a33]'

                          : 'border-gray-300'

                      }`}>

                        {formData.businessType === 'services' && (

                          <div className="w-2 h-2 rounded-full bg-white"></div>

                        )}

                      </div>

                      <h4 className={`transition-colors ${

                        formData.businessType === 'services' ? 'text-[#c74a33]' : 'text-gray-900'

                      }`}>

                        Services

                      </h4>

                    </div>

                    <p className="text-sm text-gray-600 ml-8">

                      Professional services

                    </p>

                  </div>

                </Label>

              </div>



              <div className={`relative flex items-center p-6 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:border-[#c74a33]/50 hover:bg-[#c74a33]/5 ${

                formData.businessType === 'both' 

                  ? 'border-[#c74a33] bg-[#c74a33]/10 shadow-md' 

                  : 'border-gray-200 bg-white'

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

                        formData.businessType === 'both'

                          ? 'border-[#c74a33] bg-[#c74a33]'

                          : 'border-gray-300'

                      }`}>

                        {formData.businessType === 'both' && (

                          <div className="w-2 h-2 rounded-full bg-white"></div>

                        )}

                      </div>

                      <h4 className={`transition-colors ${

                        formData.businessType === 'both' ? 'text-[#c74a33]' : 'text-gray-900'

                      }`}>

                        Both

                      </h4>

                    </div>

                    <p className="text-sm text-gray-600 ml-8">

                      Products and services

                    </p>

                  </div>

                </Label>

              </div>

            </RadioGroup>

            {errors.businessType && (

              <p className="text-red-500 text-sm">{errors.businessType}</p>

            )}

          </div>

        </CardContent>

      </Card>



      <Separator />



      <div className="flex justify-end">

        <Button 

          type="submit" 

          size="lg" 

          className="px-8 bg-[#c74a33] hover:bg-[#b8422e] text-white transition-colors duration-200"

        >

          Register the Business

        </Button>

      </div>

    </form>

  );

}



          {/* Subcategory Field - Only show when category is selected */}

          {formData.category && subcategoriesMap[formData.category] && (

            <div className="space-y-2">

              <Label htmlFor="subcategory">Business Subcategory *</Label>

              <Select value={formData.subcategory} onValueChange={(value) => updateFormData('subcategory', value)}>

                <SelectTrigger className={errors.subcategory ? 'border-red-500' : ''}>

                  <SelectValue placeholder="Select a subcategory" />

                </SelectTrigger>

                <SelectContent>

                  {subcategoriesMap[formData.category].map((subcategory) => (

                    <SelectItem key={subcategory} value={subcategory}>

                      {subcategory}

                    </SelectItem>

                  ))}

                </SelectContent>

              </Select>

              {errors.subcategory && (

                <p className="text-red-500 text-sm">{errors.subcategory}</p>

              )}

            </div>

          )}



          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div></div>

          </div>



          <div className="space-y-2">

            <Label htmlFor="businessDescription">Business Description *</Label>

            <Textarea

              id="businessDescription"

              value={formData.businessDescription}

              onChange={(e) => updateFormData('businessDescription', e.target.value)}

              placeholder="Describe your business, what you do, and what makes you unique..."

              rows={4}

              className={errors.businessDescription ? 'border-red-500' : ''}

            />

            {errors.businessDescription && (

              <p className="text-red-500 text-sm">{errors.businessDescription}</p>

            )}

          </div>

        </CardContent>

      </Card>



      {/* Business Address */}

      <Card>

        <CardHeader>

          <CardTitle className="flex items-center gap-2">

            <MapPin className="h-5 w-5" />

            Business Address

          </CardTitle>

        </CardHeader>

        <CardContent className="space-y-6">

          <div className="flex items-center space-x-4">

            <div className="flex items-center space-x-2">

              <Globe className="h-4 w-4 text-muted-foreground" />

              <Label htmlFor="addressType">Online Business</Label>

            </div>

            <Switch

              id="addressType"

              checked={formData.isPhysicalAddress}

              onCheckedChange={(checked) => updateFormData('isPhysicalAddress', checked)}

            />

            <div className="flex items-center space-x-2">

              <MapPin className="h-4 w-4 text-muted-foreground" />

              <Label htmlFor="addressType">Physical Location</Label>

            </div>

          </div>



          {!formData.isPhysicalAddress ? (

            <div className="space-y-2">

              <Label htmlFor="onlineAddress">Online Presence Details *</Label>

              <Textarea

                id="onlineAddress"

                value={formData.onlineAddress}

                onChange={(e) => updateFormData('onlineAddress', e.target.value)}

                placeholder="Describe how customers can reach you online (website, social media, etc.)"

                rows={3}

                className={errors.onlineAddress ? 'border-red-500' : ''}

              />

              {errors.onlineAddress && (

                <p className="text-red-500 text-sm">{errors.onlineAddress}</p>

              )}

            </div>

          ) : (

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div className="md:col-span-2 space-y-2">

                <Label htmlFor="street">Street Address *</Label>

                <Input

                  id="street"

                  value={formData.physicalAddress.street}

                  onChange={(e) => updatePhysicalAddress('street', e.target.value)}

                  placeholder="123 Main Street"

                  className={errors.street ? 'border-red-500' : ''}

                />

                {errors.street && (

                  <p className="text-red-500 text-sm">{errors.street}</p>

                )}

              </div>



              <div className="space-y-2">

                <Label htmlFor="city">City *</Label>

                <Input

                  id="city"

                  value={formData.physicalAddress.city}

                  onChange={(e) => updatePhysicalAddress('city', e.target.value)}

                  placeholder="City"

                  className={errors.city ? 'border-red-500' : ''}

                />

                {errors.city && (

                  <p className="text-red-500 text-sm">{errors.city}</p>

                )}

              </div>



              <div className="space-y-2">

                <Label htmlFor="state">State/Province *</Label>

                <Input

                  id="state"

                  value={formData.physicalAddress.state}

                  onChange={(e) => updatePhysicalAddress('state', e.target.value)}

                  placeholder="State"

                  className={errors.state ? 'border-red-500' : ''}

                />

                {errors.state && (

                  <p className="text-red-500 text-sm">{errors.state}</p>

                )}

              </div>



              <div className="space-y-2">

                <Label htmlFor="zipCode">ZIP/Postal Code *</Label>

                <Input

                  id="zipCode"

                  value={formData.physicalAddress.zipCode}

                  onChange={(e) => updatePhysicalAddress('zipCode', e.target.value)}

                  placeholder="12345"

                  className={errors.zipCode ? 'border-red-500' : ''}

                />

                {errors.zipCode && (

                  <p className="text-red-500 text-sm">{errors.zipCode}</p>

                )}

              </div>



              <div className="space-y-2">

                <Label htmlFor="country">Country *</Label>

                <Input

                  id="country"

                  value={formData.physicalAddress.country}

                  onChange={(e) => updatePhysicalAddress('country', e.target.value)}

                  placeholder="United States"

                  className={errors.country ? 'border-red-500' : ''}

                />

                {errors.country && (

                  <p className="text-red-500 text-sm">{errors.country}</p>

                )}

              </div>

            </div>

          )}

        </CardContent>

      </Card>



      {/* Additional Information */}

      <Card>

        <CardHeader>

          <CardTitle className="flex items-center gap-2">

            <Church className="h-5 w-5" />

            Additional Information

          </CardTitle>

        </CardHeader>

        <CardContent className="space-y-6">

          <div className="space-y-2">

            <Label htmlFor="churchAffiliation">Church Affiliation (Optional)</Label>

            <Input

              id="churchAffiliation"

              value={formData.churchAffiliation}

              onChange={(e) => updateFormData('churchAffiliation', e.target.value)}

              placeholder="Enter church name or affiliation"

            />

          </div>



          <div className="space-y-4">

            <Label>Business Type *</Label>

            <RadioGroup

              value={formData.businessType}

              onValueChange={(value) => updateFormData('businessType', value)}

              className="grid grid-cols-1 md:grid-cols-3 gap-4"

            >

              <div className={`relative flex items-center p-6 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:border-[#c74a33]/50 hover:bg-[#c74a33]/5 ${

                formData.businessType === 'products' 

                  ? 'border-[#c74a33] bg-[#c74a33]/10 shadow-md' 

                  : 'border-gray-200 bg-white'

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

                        formData.businessType === 'products'

                          ? 'border-[#c74a33] bg-[#c74a33]'

                          : 'border-gray-300'

                      }`}>

                        {formData.businessType === 'products' && (

                          <div className="w-2 h-2 rounded-full bg-white"></div>

                        )}

                      </div>

                      <h4 className={`transition-colors ${

                        formData.businessType === 'products' ? 'text-[#c74a33]' : 'text-gray-900'

                      }`}>

                        Products

                      </h4>

                    </div>

                    <p className="text-sm text-gray-600 ml-8">

                      Physical or digital goods

                    </p>

                  </div>

                </Label>

              </div>



              <div className={`relative flex items-center p-6 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:border-[#c74a33]/50 hover:bg-[#c74a33]/5 ${

                formData.businessType === 'services' 

                  ? 'border-[#c74a33] bg-[#c74a33]/10 shadow-md' 

                  : 'border-gray-200 bg-white'

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

                        formData.businessType === 'services'

                          ? 'border-[#c74a33] bg-[#c74a33]'

                          : 'border-gray-300'

                      }`}>

                        {formData.businessType === 'services' && (

                          <div className="w-2 h-2 rounded-full bg-white"></div>

                        )}

                      </div>

                      <h4 className={`transition-colors ${

                        formData.businessType === 'services' ? 'text-[#c74a33]' : 'text-gray-900'

                      }`}>

                        Services

                      </h4>

                    </div>

                    <p className="text-sm text-gray-600 ml-8">

                      Professional services

                    </p>

                  </div>

                </Label>

              </div>



              <div className={`relative flex items-center p-6 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:border-[#c74a33]/50 hover:bg-[#c74a33]/5 ${

                formData.businessType === 'both' 

                  ? 'border-[#c74a33] bg-[#c74a33]/10 shadow-md' 

                  : 'border-gray-200 bg-white'

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

                        formData.businessType === 'both'

                          ? 'border-[#c74a33] bg-[#c74a33]'

                          : 'border-gray-300'

                      }`}>

                        {formData.businessType === 'both' && (

                          <div className="w-2 h-2 rounded-full bg-white"></div>

                        )}

                      </div>

                      <h4 className={`transition-colors ${

                        formData.businessType === 'both' ? 'text-[#c74a33]' : 'text-gray-900'

                      }`}>

                        Both

                      </h4>

                    </div>

                    <p className="text-sm text-gray-600 ml-8">

                      Products and services

                    </p>

                  </div>

                </Label>

              </div>

            </RadioGroup>

            {errors.businessType && (

              <p className="text-red-500 text-sm">{errors.businessType}</p>

            )}

          </div>

        </CardContent>

      </Card>



      <Separator />



      <div className="flex justify-end">

        <Button 

          type="submit" 

          size="lg" 

          className="px-8 bg-[#c74a33] hover:bg-[#b8422e] text-white transition-colors duration-200"

        >

          Register the Business

        </Button>

      </div>

    </form>

  );

}