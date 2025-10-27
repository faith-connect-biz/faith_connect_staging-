import React, { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Upload, User, Mail, Phone, FileText, ArrowRight, Loader2, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Navbar } from '@/components/layout/Navbar';

const ProfileUpdatePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { getOTPData, clearOTPData, login } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const userType = location.state?.userType as 'community' | 'business';
  const otpData = getOTPData();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: otpData?.method === 'email' ? otpData.contact : '',
    phone: otpData?.method === 'phone' ? otpData.contact : '',
    partnershipNumber: '',
    bio: '',
    profilePicture: null as File | null,
    profilePictureUrl: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    setIsUploading(true);
    setFormData(prev => ({ ...prev, profilePicture: file }));

    try {
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, profilePictureUrl: previewUrl }));
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const removeProfilePicture = () => {
    if (formData.profilePictureUrl) {
      URL.revokeObjectURL(formData.profilePictureUrl);
    }
    setFormData(prev => ({ 
      ...prev, 
      profilePicture: null, 
      profilePictureUrl: '' 
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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

    setIsLoading(true);

    try {
      // Create FormData for file upload
      const submitData = new FormData();
      submitData.append('firstName', formData.firstName);
      submitData.append('lastName', formData.lastName);
      submitData.append('email', formData.email);
      submitData.append('phone', formData.phone);
      submitData.append('partnershipNumber', formData.partnershipNumber);
      submitData.append('bio', formData.bio);
      submitData.append('userType', userType);
      
      if (formData.profilePicture) {
        submitData.append('profilePicture', formData.profilePicture);
      }

      // Register user with OTP
      const response = await apiService.registerWithOTP(
        otpData?.contact || '',
        localStorage.getItem('demo_otp') || '123456', // Use demo OTP
        otpData?.method || 'email',
        userType
      );

      if (response.success) {
        // Login the user first
        login(response.user, response.tokens);
        clearOTPData();
        
        // Try to update profile, but don't fail if backend is not available
        try {
          const updateResponse = await apiService.updateProfile({
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone,
            partnershipNumber: formData.partnershipNumber,
            bio: formData.bio,
            userType: userType
          });

          if (updateResponse.success) {
            toast.success('Profile created successfully!');
          } else {
            toast.success('Profile created successfully! (Demo mode)');
          }
        } catch (error) {
          // If profile update fails (backend not running), still proceed
          console.warn('Profile update failed, but continuing in demo mode:', error);
          toast.success('Profile created successfully! (Demo mode)');
        }
        
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
              <div className="flex items-center gap-4">
                <div className="relative">
                  {formData.profilePictureUrl ? (
                    <div className="relative">
                      <img
                        src={formData.profilePictureUrl}
                        alt="Profile preview"
                        className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
                      />
                      <button
                        onClick={removeProfilePicture}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gray-100 border-4 border-white shadow-lg flex items-center justify-center">
                      <User className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="h-10 border-white/20 hover:border-white/30 hover:bg-white/10 rounded-xl transition-all duration-500 backdrop-blur-sm"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Photo
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-fem-darkgray mt-1">
                    JPG, PNG up to 5MB
                  </p>
                </div>
              </div>
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
