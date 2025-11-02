import React, { useState, useRef, useEffect } from 'react';
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
  const { getOTPData, clearOTPData, login, user, updateUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const firstNameInputRef = useRef<HTMLInputElement>(null);
  
  // Get user type from location state, authenticated user
  // If no user type is set, redirect to user type selection (for first-time users)
  const userTypeFromState = location.state?.userType;
  const userTypeFromUser = user?.userType || (user as any)?.user_type;
  const userType = (userTypeFromState || userTypeFromUser) as 'community' | 'business' | null;
  const otpData = getOTPData();
  
  // Redirect to user type selection if user type is not set (first-time users)
  useEffect(() => {
    // If user is authenticated but no user type is set, redirect to selection
    if (user && !userTypeFromState && !userTypeFromUser) {
      console.log('No user type set - redirecting to user type selection');
      navigate('/user-type-selection', { replace: true });
      return;
    }
  }, [user, userTypeFromState, userTypeFromUser, navigate]);
  
  // Use 'community' as default only if explicitly set or if coming from state
  // Don't default if user type selection is required
  const finalUserType = userType || (userTypeFromState ? 'community' : null);
  
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

  // Pre-populate form with user data if already authenticated
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        firstName: prev.firstName || user.firstName || (user as any).first_name || '',
        lastName: prev.lastName || user.lastName || (user as any).last_name || '',
        email: prev.email || user.email || '',
        phone: prev.phone || user.phone || '',
        partnershipNumber: prev.partnershipNumber || (user as any).partnership_number || '',
        bio: prev.bio || user.bio || '',
        profilePictureUrl: prev.profilePictureUrl || user.profilePicture || ''
      }));
    }
  }, [user]);

  // Auto-focus first name input when component mounts
  useEffect(() => {
    // Small delay to ensure the input is rendered
    const timer = setTimeout(() => {
      firstNameInputRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

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
    // Partnership number is optional, email/phone should already be set from OTP
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      console.log('Updating profile with data:', formData);
      
      // Prepare data in the format expected by the backend API (snake_case)
      const updateData: any = {
        first_name: formData.firstName.trim(),
        last_name: formData.lastName.trim(),
        bio: formData.bio.trim() || undefined,
      };

      // Add optional fields only if they have values
      if (formData.email.trim()) {
        updateData.email = formData.email.trim();
      }
      if (formData.phone.trim()) {
        updateData.phone = formData.phone.trim();
      }
      if (formData.partnershipNumber.trim()) {
        updateData.partnership_number = formData.partnershipNumber.trim();
      }
      // Always include user type in the update
      updateData.user_type = finalUserType;

      console.log('Sending profile update request:', updateData);

      // Call the profile update API directly since user is already authenticated
      const updateResponse = await apiService.updateProfile(updateData);

      if (updateResponse.success) {
        // Update the user context with the new data
        if (updateResponse.user) {
          // Map backend response to frontend user format
          const updatedUserData = {
            id: updateResponse.user.id?.toString() || user?.id || '',
            firstName: updateResponse.user.first_name || updateResponse.user.firstName,
            lastName: updateResponse.user.last_name || updateResponse.user.lastName,
            email: updateResponse.user.email,
            phone: updateResponse.user.phone,
            userType: updateResponse.user.user_type || updateResponse.user.userType,
            bio: updateResponse.user.bio,
            profilePicture: updateResponse.user.profile_image_url || updateResponse.user.profilePicture
          };
          updateUser(updatedUserData);
        }
        
        toast.success(updateResponse.message || 'Profile updated successfully!');
        
        // Clear OTP data if it exists
        if (otpData) {
          clearOTPData();
        }
        
        // Redirect based on user type
        setTimeout(async () => {
          if (finalUserType === 'business') {
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
            // Community member - go to home
            navigate('/');
          }
        }, 1500);
      } else {
        toast.error(updateResponse.message || 'Failed to update profile. Please try again.');
      }
    } catch (error: any) {
      console.error('Error updating profile:', error);
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Something went wrong. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    if (finalUserType === 'business') {
      navigate('/business-registration');
    } else {
      navigate('/');
    }
  };

  // Show loading or redirect if user type is not available
  if (!finalUserType) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-fem-navy">Redirecting to user type selection...</p>
        </div>
      </div>
    );
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
            Add some details to personalize your {finalUserType === 'business' ? 'business' : 'community'} experience
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
                    ref={firstNameInputRef}
                    id="firstName"
                    type="text"
                    placeholder="e.g., John"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className="pl-10 h-12 border-white/20 focus:border-fem-terracotta focus:ring-fem-terracotta rounded-xl bg-white/10 backdrop-blur-sm"
                    autoFocus
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
                    placeholder="e.g., Doe"
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
                Partnership Number <span className="text-xs text-fem-darkgray font-normal">(Optional)</span>
              </Label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-fem-darkgray w-5 h-5" />
                <Input
                  id="partnershipNumber"
                  type="text"
                  placeholder="e.g., PART123456 (if applicable)"
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
                    placeholder="e.g., john.doe@example.com"
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
                    placeholder="e.g., 254712345678"
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
