import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { apiService } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  CheckCircle,
  AlertCircle,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface FEMChurch {
  id: number;
  name: string;
  location: string;
  city: string;
  country: string;
}

interface FormData {
  business_name: string;
  category_id: string;
  description: string;
  address: string;
  city: string;
  country: string;
  fem_church_id: string;
  business_type: 'products' | 'services' | 'both';
}

interface FormErrors {
  [key: string]: string;
}

const BusinessRegistrationPage1: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<FormData>({
    business_name: '',
    category_id: '',
    description: '',
    address: '',
    city: '',
    country: 'Kenya',
    fem_church_id: '',
    business_type: 'both'
  });
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [femChurches, setFemChurches] = useState<FEMChurch[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to register your business",
        variant: "destructive"
      });
      navigate('/auth/login');
      return;
    }

    loadInitialData();
  }, [user, navigate, toast]);

  const loadInitialData = async () => {
    try {
      const [categoriesData, churchesData] = await Promise.all([
        apiService.getCategories(),
        apiService.getFEMChurches()
      ]);
      
      setCategories(categoriesData);
      setFemChurches(churchesData);
    } catch (error) {
      console.error('Error loading initial data:', error);
      toast({
        title: "Error",
        description: "Failed to load registration data. Please try again.",
        variant: "destructive"
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.business_name.trim()) {
      newErrors.business_name = 'Business name is required';
    } else if (formData.business_name.trim().length < 2) {
      newErrors.business_name = 'Business name must be at least 2 characters';
    }

    if (!formData.category_id) {
      newErrors.category_id = 'Business category is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Business description is required';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Business address is required';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!formData.business_type) {
      newErrors.business_type = 'Business type is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors below before proceeding",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiService.createBusinessStep1({
        business_name: formData.business_name.trim(),
        category_id: parseInt(formData.category_id),
        description: formData.description.trim(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        country: formData.country,
        fem_church_id: formData.fem_church_id ? parseInt(formData.fem_church_id) : null,
        business_type: formData.business_type
      });

      toast({
        title: "Success!",
        description: "Business basic information saved. Now let's complete your profile.",
      });

      // Navigate to Page 2 with business data
      navigate('/register-business/step2', {
        state: {
          businessId: response.data.id,
          businessData: response.data
        }
      });

    } catch (error: any) {
      console.error('Error creating business:', error);
      
      let errorMessage = "Failed to create business. Please try again.";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <Navbar />
      
      <main className="flex-grow py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-fem-terracotta to-fem-gold rounded-full flex items-center justify-center">
                <Building2 className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-fem-terracotta to-gray-900 bg-clip-text text-transparent mb-4">
              Business Registration
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Join our faith-based business directory and connect with the community. 
              Let's start with your basic business information.
            </p>
            
            {/* Progress Indicator */}
            <div className="flex items-center justify-center mt-8 space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-fem-terracotta text-white rounded-full flex items-center justify-center text-sm font-semibold">
                  1
                </div>
                <span className="text-sm font-medium text-fem-terracotta">Basic Information</span>
              </div>
              <div className="w-16 h-1 bg-gray-200 rounded-full">
                <div className="w-8 h-1 bg-gray-300 rounded-full"></div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center text-sm font-semibold">
                  2
                </div>
                <span className="text-sm font-medium text-gray-500">Profile Completion</span>
              </div>
            </div>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-6">
                <CardTitle className="text-2xl font-bold text-gray-900">Business Information</CardTitle>
                <CardDescription className="text-gray-600">
                  Provide your basic business details. All fields marked with * are required.
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Business Name */}
                  <div className="space-y-2">
                    <Label htmlFor="business_name" className="text-sm font-semibold text-gray-700">
                      Business Name *
                    </Label>
                    <Input
                      id="business_name"
                      type="text"
                      value={formData.business_name}
                      onChange={(e) => handleInputChange('business_name', e.target.value)}
                      placeholder="Enter your business name"
                      className={`h-12 ${errors.business_name ? 'border-red-500 focus:border-red-500' : ''}`}
                    />
                    {errors.business_name && (
                      <p className="text-sm text-red-600 flex items-center space-x-1">
                        <AlertCircle className="h-4 w-4" />
                        <span>{errors.business_name}</span>
                      </p>
                    )}
                  </div>

                  {/* Business Category */}
                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-sm font-semibold text-gray-700">
                      Business Category *
                    </Label>
                    <Select value={formData.category_id} onValueChange={(value) => handleInputChange('category_id', value)}>
                      <SelectTrigger className={`h-12 ${errors.category_id ? 'border-red-500 focus:border-red-500' : ''}`}>
                        <SelectValue placeholder="Select your business category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.category_id && (
                      <p className="text-sm text-red-600 flex items-center space-x-1">
                        <AlertCircle className="h-4 w-4" />
                        <span>{errors.category_id}</span>
                      </p>
                    )}
                  </div>

                  {/* Business Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm font-semibold text-gray-700">
                      Business Description *
                    </Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Describe your business, what you offer, and what makes you unique..."
                      className={`min-h-[100px] ${errors.description ? 'border-red-500 focus:border-red-500' : ''}`}
                    />
                    <p className="text-xs text-gray-500">
                      {formData.description.length}/500 characters (minimum 10 required)
                    </p>
                    {errors.description && (
                      <p className="text-sm text-red-600 flex items-center space-x-1">
                        <AlertCircle className="h-4 w-4" />
                        <span>{errors.description}</span>
                      </p>
                    )}
                  </div>

                  {/* Address */}
                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-sm font-semibold text-gray-700">
                      Business Address *
                    </Label>
                    <Textarea
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      placeholder="Enter your business address (street, building, etc.)"
                      className={`min-h-[80px] ${errors.address ? 'border-red-500 focus:border-red-500' : ''}`}
                    />
                    {errors.address && (
                      <p className="text-sm text-red-600 flex items-center space-x-1">
                        <AlertCircle className="h-4 w-4" />
                        <span>{errors.address}</span>
                      </p>
                    )}
                  </div>

                  {/* City */}
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-sm font-semibold text-gray-700">
                      City *
                    </Label>
                    <Input
                      id="city"
                      type="text"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      placeholder="Enter your city"
                      className={`h-12 ${errors.city ? 'border-red-500 focus:border-red-500' : ''}`}
                    />
                    {errors.city && (
                      <p className="text-sm text-red-600 flex items-center space-x-1">
                        <AlertCircle className="h-4 w-4" />
                        <span>{errors.city}</span>
                      </p>
                    )}
                  </div>

                  {/* Country */}
                  <div className="space-y-2">
                    <Label htmlFor="country" className="text-sm font-semibold text-gray-700">
                      Country
                    </Label>
                    <Input
                      id="country"
                      type="text"
                      value={formData.country}
                      onChange={(e) => handleInputChange('country', e.target.value)}
                      placeholder="Enter your country"
                      className="h-12"
                    />
                  </div>

                  {/* FEM Church Affiliation */}
                  <div className="space-y-2">
                    <Label htmlFor="fem_church" className="text-sm font-semibold text-gray-700">
                      FEM Church Affiliation
                    </Label>
                    <Select value={formData.fem_church_id} onValueChange={(value) => handleInputChange('fem_church_id', value)}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Select your FEM church (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">No church affiliation</SelectItem>
                        {femChurches.map((church) => (
                          <SelectItem key={church.id} value={church.id.toString()}>
                            {church.name} - {church.city || church.location}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500">
                      Select your church affiliation if applicable. This helps connect you with fellow church members.
                    </p>
                  </div>

                  {/* Business Type */}
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold text-gray-700">
                      Business Type *
                    </Label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[
                        { value: 'products', label: 'Products', description: 'I sell physical goods' },
                        { value: 'services', label: 'Services', description: 'I provide services' },
                        { value: 'both', label: 'Both', description: 'I offer both products and services' }
                      ].map((type) => (
                        <div
                          key={type.value}
                          className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                            formData.business_type === type.value
                              ? 'border-fem-terracotta bg-fem-terracotta/5'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => handleInputChange('business_type', type.value)}
                        >
                          <div className="flex items-center space-x-2 mb-2">
                            <div className={`w-4 h-4 rounded-full border-2 ${
                              formData.business_type === type.value
                                ? 'border-fem-terracotta bg-fem-terracotta'
                                : 'border-gray-300'
                            }`}>
                              {formData.business_type === type.value && (
                                <div className="w-full h-full rounded-full bg-white scale-50"></div>
                              )}
                            </div>
                            <span className="font-semibold text-gray-900">{type.label}</span>
                          </div>
                          <p className="text-sm text-gray-600">{type.description}</p>
                        </div>
                      ))}
                    </div>
                    {errors.business_type && (
                      <p className="text-sm text-red-600 flex items-center space-x-1">
                        <AlertCircle className="h-4 w-4" />
                        <span>{errors.business_type}</span>
                      </p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end pt-6">
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="bg-gradient-to-r from-fem-terracotta to-fem-gold hover:from-fem-terracotta/90 hover:to-fem-gold/90 text-white px-8 py-3 h-12 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      {isLoading ? (
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          <span>Saving...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <span>Continue to Profile Setup</span>
                          <ArrowRight className="h-5 w-5" />
                        </div>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Help Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-8"
          >
            <Alert className="border-fem-gold/20 bg-fem-gold/5">
              <CheckCircle className="h-4 w-4 text-fem-gold" />
              <AlertTitle className="text-fem-navy">Need Help?</AlertTitle>
              <AlertDescription className="text-gray-700">
                If you have any questions about registering your business, please contact our support team. 
                We're here to help you get started!
              </AlertDescription>
            </Alert>
          </motion.div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default BusinessRegistrationPage1;






