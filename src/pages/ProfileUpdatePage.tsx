import React, { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { User, Mail, Phone, FileText, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Navbar } from '@/components/layout/Navbar';
import { ImageUploader } from '@/components/ui/ImageUploader';

const ProfileUpdatePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { getOTPData, clearOTPData, login } = useAuth();
  
  const userType = location.state?.userType as 'community' | 'business';
  const userId = location.state?.userId as number | undefined;
  const otpData = getOTPData();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: otpData?.method === 'email' ? otpData.contact : '',
    phone: otpData?.method === 'phone' ? otpData.contact : '',
    partnershipNumber: '',
    bio: '',
    profileImageUrl: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUploaded = (imageUrl: string) => {
    setFormData(prev => ({ ...prev, profileImageUrl: imageUrl }));
  };

  // Get identifier and authMethod for image upload
  const getIdentifier = () => {
    return otpData?.contact || (formData.email.trim() ? formData.email.trim() : formData.phone.trim());
  };

  const getAuthMethod = (): 'email' | 'phone' | undefined => {
    return otpData?.method || (formData.email.trim() ? 'email' : formData.phone.trim() ? 'phone' : undefined);
  };

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      toast.error('First name is required');
      return false;
    }
    if (!formData.lastName.trim()) {
      toast.error('Last name is required');
      return false;
    }
    if (!formData.partnershipNumber.trim()) {
      toast.error('Partnership number is required');
      return false;
    }
    if (!formData.email.trim() && !formData.phone.trim()) {
      toast.error('Either email or phone number is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    if (!userType) {
      toast.error('Please select your account type to continue.');
      navigate('/user-type-selection');
      return;
    }

    setIsLoading(true);

    try {
      const identifier =
        otpData?.contact ||
        (formData.email.trim() ? formData.email.trim() : formData.phone.trim());
      const authMethod =
        otpData?.method ||
        (formData.email.trim() ? 'email' : formData.phone.trim() ? 'phone' : undefined);

      if (!identifier || !authMethod) {
        toast.error('Missing contact information. Please restart the sign up process.');
        navigate('/login');
        return;
      }

      const response = await apiService.registerWithOTP({
        identifier,
        authMethod,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        partnershipNumber: formData.partnershipNumber.trim(),
        userType,
        bio: formData.bio.trim() || undefined,
        profileImageUrl: formData.profileImageUrl || undefined,
        userId: userId || otpData?.userId,
      });

      if (response.success) {
        // Login the user first
        login(response.user, response.tokens);
        clearOTPData();
        toast.success(response.message || 'Profile created successfully!');
        
        // Redirect based on user type
        if (userType === 'business') {
          // Check if user already has businesses
          try {
            const existingBusinesses = await apiService.getUserBusinesses();
            if (existingBusinesses && existingBusinesses.length > 0) {
              // User has existing businesses, go to business management
              navigate('/manage-business');
            } else {
              // New business user, go to registration
              navigate('/business-registration');
            }
          } catch (error) {
            // If we can't check, default to registration
            console.warn('Could not check existing businesses, defaulting to registration:', error);
            navigate('/business-registration');
          }
        } else {
          // Community member - go to community dashboard
          navigate('/');
        }
      } else {
        toast.error(response.message || 'Failed to create profile');
      }
    } catch (error) {
      console.error('Error creating profile:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    if (userType === 'business') {
      navigate('/business-registration');
    } else {
      navigate('/');
    }
  };

  if (!userType) {
    navigate('/user-type-selection');
    return null;
  }

  return (
    <div className="min-h-screen bg-white relative">
      {/* Orange background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-gradient-radial from-fem-terracotta/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-gradient-radial from-fem-terracotta/20 to-transparent rounded-full blur-3xl" />
      </div>
      <Navbar />
      <div className="flex items-center justify-center p-4 sm:p-6 lg:p-8 pt-20 relative z-10 min-h-screen">

      <Card className="w-full max-w-2xl sm:max-w-3xl relative z-10 shadow-2xl border-0 bg-white/15 backdrop-blur-xl border border-white/20 mx-4 sm:mx-0">
        <CardHeader className="text-center pb-8 pt-8 px-6 sm:px-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-fem-navy mb-2">
            Complete Your Profile
          </h1>
          <p className="text-fem-darkgray text-sm sm:text-base">
            Add some details to personalize your {userType === 'business' ? 'business' : 'community'} experience
          </p>
        </CardHeader>

        <CardContent className="px-8 pb-8">
          <div className="space-y-6">
            {/* Profile Picture Upload */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-fem-navy">Profile Picture</Label>
              <ImageUploader
                onImageUploaded={handleImageUploaded}
                currentImageUrl={formData.profileImageUrl}
                identifier={getIdentifier() || undefined}
                authMethod={getAuthMethod() || undefined}
                variant="profile"
                maxSizeMB={5}
                className="w-full"
              />
            </div>

            {/* Name Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-sm font-medium text-fem-navy">
                  First Name *
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-fem-darkgray w-5 h-5" />
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="Enter your first name"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className="pl-10 h-12 border-white/20 focus:border-fem-terracotta focus:ring-fem-terracotta rounded-xl bg-white/10 backdrop-blur-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-sm font-medium text-fem-navy">
                  Last Name *
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-fem-darkgray w-5 h-5" />
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Enter your last name"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className="pl-10 h-12 border-white/20 focus:border-fem-terracotta focus:ring-fem-terracotta rounded-xl bg-white/10 backdrop-blur-sm"
                  />
                </div>
              </div>
            </div>

            {/* Partnership Number */}
            <div className="space-y-2">
              <Label htmlFor="partnershipNumber" className="text-sm font-medium text-fem-navy">
                Partnership Number *
              </Label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-fem-darkgray w-5 h-5" />
                <Input
                  id="partnershipNumber"
                  type="text"
                  placeholder="Enter your partnership number"
                  value={formData.partnershipNumber}
                  onChange={(e) => handleInputChange('partnershipNumber', e.target.value)}
                  className="pl-10 h-12 border-white/20 focus:border-fem-terracotta focus:ring-fem-terracotta rounded-xl bg-white/10 backdrop-blur-sm"
                />
              </div>
            </div>

            {/* Contact Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-fem-navy">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-fem-darkgray w-5 h-5" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="pl-10 h-12 border-white/20 focus:border-fem-terracotta focus:ring-fem-terracotta rounded-xl bg-white/10 backdrop-blur-sm"
                    disabled={otpData?.method === 'email'}
                  />
                </div>
                {otpData?.method === 'email' && (
                  <p className="text-xs text-fem-darkgray">This email was used for verification</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium text-fem-navy">
                  Phone Number
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-fem-darkgray w-5 h-5" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter your phone number"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="pl-10 h-12 border-white/20 focus:border-fem-terracotta focus:ring-fem-terracotta rounded-xl bg-white/10 backdrop-blur-sm"
                    disabled={otpData?.method === 'phone'}
                  />
                </div>
                {otpData?.method === 'phone' && (
                  <p className="text-xs text-fem-darkgray">This phone number was used for verification</p>
                )}
              </div>
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <Label htmlFor="bio" className="text-sm font-medium text-fem-navy">
                Bio (Optional)
              </Label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 text-fem-darkgray w-5 h-5" />
                <Textarea
                  id="bio"
                  placeholder="Tell us a bit about yourself..."
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  className="pl-10 pt-3 border-white/20 focus:border-fem-terracotta focus:ring-fem-terracotta rounded-xl min-h-[100px] bg-white/10 backdrop-blur-sm"
                  maxLength={500}
                />
              </div>
              <p className="text-xs text-fem-darkgray">
                {formData.bio.length}/500 characters
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <Button
              onClick={handleSkip}
              variant="outline"
              size="lg"
              className="w-full sm:w-auto"
            >
              Skip for Now
            </Button>
            
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              size="lg"
              className="flex-1 w-full sm:w-auto"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Creating Profile...
                </>
              ) : (
                <>
                  Save & Continue
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-fem-darkgray">
              You can always update your profile information later in your account settings.
            </p>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
};

export default ProfileUpdatePage;
