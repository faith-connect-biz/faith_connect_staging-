import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { X, Mail, Phone, ArrowLeft, Loader2 } from 'lucide-react';
import { OTPInput } from '@/components/otp/OTPInput';
import { apiService } from '@/services/api';

// Password strength checking functions
const getPasswordStrength = (password: string): 'weak' | 'medium' | 'strong' => {
  if (!password) return 'weak';
  
  let score = 0;
  
  // Length check
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  
  // Character variety checks
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  
  if (score <= 2) return 'weak';
  if (score <= 4) return 'medium';
  return 'strong';
};

const getPasswordStrengthText = (password: string): string => {
  const strength = getPasswordStrength(password);
  
  switch (strength) {
    case 'weak':
      return 'Add more characters, numbers, and symbols';
    case 'medium':
      return 'Good! Add uppercase letters and symbols for better security';
    case 'strong':
      return 'Excellent! Your password is strong and secure';
    default:
      return '';
  }
};

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState('login');
  const [isLoading, setIsLoading] = useState(false);
  const [signupStep, setSignupStep] = useState<'form' | 'otp'>('form');
  const [signupData, setSignupData] = useState({
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    userType: 'community',
    partnershipNumber: ''
  });
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('phone'); // Force phone for now
  const [usePhone, setUsePhone] = useState(true); // Toggle between phone and email - force phone for now
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { login, register } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Handle toggle between phone and email - disabled for now
  const handleToggleChange = (checked: boolean) => {
    // Email is temporarily disabled, so force phone
    setUsePhone(true);
    setAuthMethod('phone');
    // Clear email data since it's not usable
    setSignupData(prev => ({ ...prev, email: '' }));
  };

  // Send OTP to phone number when phone is selected
  const sendPhoneOTP = async (phoneNumber: string) => {
    try {
      setIsLoading(true);
      const response = await apiService.post('/verify-phone', { phone_number: phoneNumber });
      if (response.success) {
        toast({
          title: "OTP Sent!",
          description: "A 6-digit code has been sent to your phone number.",
        });
      } else {
        throw new Error(response.error || 'Failed to send OTP');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send OTP to phone number.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      // Always reset to form step when modal opens
      setSignupStep('form');
      setActiveTab('login'); // Default to login tab
      setSignupData({
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        userType: 'community',
        partnershipNumber: ''
      });
      setAuthMethod('phone'); // Force phone for now
      setUsePhone(true); // Reset toggle to phone
    }
  }, [isOpen]);

  // Update toggle when switching between login and signup tabs
  useEffect(() => {
    if (activeTab === 'signup') {
      // Set default to phone for signup
      setUsePhone(true);
      setAuthMethod('phone');
      setSignupData(prev => ({ ...prev, email: '' }));
    } else {
      // Set default to phone for login (email temporarily disabled)
      setUsePhone(true);
      setAuthMethod('phone');
      setSignupData(prev => ({ ...prev, phone: '' }));
    }
  }, [activeTab]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const identifier = usePhone 
      ? formData.get('phone') as string 
      : formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!identifier || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      await login({ 
        identifier, 
        password, 
        auth_method: 'phone' // Force phone since email is disabled
      });
      toast({
        title: "Success!",
        description: "Welcome back!",
      });
      onClose();
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "Please check your credentials.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (signupData.password !== signupData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match.",
        variant: "destructive"
      });
      return;
    }

    // Validate that only one contact method is provided based on toggle
    if (usePhone && !signupData.phone) {
      toast({
        title: "Error",
        description: "Please provide your phone number.",
        variant: "destructive"
      });
      return;
    }
    
    // Validate phone number format (basic validation)
    if (usePhone && signupData.phone) {
      const phoneRegex = /^\+?[\d\s\-\(\)]{7,}$/;
      if (!phoneRegex.test(signupData.phone)) {
        toast({
          title: "Invalid Phone Number",
          description: "Please enter a valid phone number with at least 7 digits.",
          variant: "destructive"
        });
        return;
      }
    }

    console.log('Starting signup process...', { signupData });
    setIsLoading(true);
    
    // Add timeout to prevent hanging
    const timeoutId = setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Registration Timeout",
        description: "Registration is taking longer than expected. Please try again.",
        variant: "destructive"
      });
    }, 30000); // 30 second timeout
    
    try {
      const registerResponse = await register({
        first_name: signupData.firstName,
        last_name: signupData.lastName,
        partnership_number: signupData.partnershipNumber,
        phone: signupData.phone, // Force phone since email is disabled
        email: undefined, // Email temporarily disabled
        password: signupData.password,
        user_type: signupData.userType as 'community' | 'business'
      });
      
      // Clear timeout on success
      clearTimeout(timeoutId);
      
      console.log('Registration successful:', registerResponse);
      console.log('Registration response structure:', {
        success: registerResponse.success,
        message: registerResponse.message,
        user_id: registerResponse.user_id,
        registration_token: registerResponse.registration_token,
        requires_otp: registerResponse.requires_otp,
        otp_sent_to: registerResponse.otp_sent_to
      });
      
      // Handle case where response might be wrapped in data field
      let actualResponse = registerResponse as any;
      if (registerResponse && typeof registerResponse === 'object' && 'data' in registerResponse && registerResponse.data && typeof registerResponse.data === 'object') {
        actualResponse = registerResponse.data as any;
        console.log('Response was wrapped in data field, using:', actualResponse);
      }
      
      // Check if we have the required data
      if (!actualResponse.success) {
        console.error('Registration failed - success is false:', actualResponse);
        throw new Error(actualResponse.message || 'Registration failed');
      }
      
      // Check for either user_id or registration_token
      if (!actualResponse.user_id && !actualResponse.registration_token) {
        console.error('Missing both user_id and registration_token in response:', actualResponse);
        console.error('Full response object:', registerResponse);
        
        // Check if this is a different response structure
        if (actualResponse.message && actualResponse.message.includes('OTP')) {
          // If the message mentions OTP, this might be a success case
          console.log('Response mentions OTP, proceeding with available data');
        } else {
          throw new Error('Registration failed: Server did not return required verification data. Please try again or contact support.');
        }
      }
      
      if (!actualResponse.requires_otp) {
        console.error('Registration response missing requires_otp:', actualResponse);
        throw new Error('Registration failed: OTP verification is required but not configured. Please contact support.');
      }
      
      // Store signup data for OTP verification
      localStorage.setItem('signup_email', usePhone ? '' : signupData.email);
      localStorage.setItem('signup_phone', usePhone ? signupData.phone : '');
      
      // Store either user_id or registration_token
      if (actualResponse.user_id) {
        localStorage.setItem('signup_user_id', actualResponse.user_id.toString());
        console.log('Using user_id for OTP verification:', actualResponse.user_id);
      } else if (actualResponse.registration_token) {
        localStorage.setItem('signup_registration_token', actualResponse.registration_token);
        console.log('Using registration_token for OTP verification:', actualResponse.registration_token);
      }
      
      localStorage.setItem('signup_user_type', signupData.userType);
      localStorage.setItem('signup_partnership_number', signupData.partnershipNumber);
      localStorage.setItem('signup_auth_method', 'phone'); // Force phone since email is disabled

      // Verify that required data was stored correctly
      const storedUserId = localStorage.getItem('signup_user_id');
      const storedToken = localStorage.getItem('signup_registration_token');
      if (!storedUserId && !storedToken) {
        console.error('Failed to store verification data in localStorage');
        throw new Error('Registration failed: Could not save session data. Please try again.');
      }

      console.log('Verification data stored successfully:', { storedUserId, storedToken });

      // Set auth method based on toggle and move to OTP step
      setAuthMethod('phone'); // Force phone since email is disabled
      setSignupStep('otp');

      console.log('Using phone verification'); // Email temporarily disabled

      toast({
        title: "Registration successful!",
        description: "Please verify your phone number to complete registration.",
      });
    } catch (error: any) {
      console.error('Registration failed:', error);
      toast({
        title: "Registration failed",
        description: error.message || "Please try again.",
        variant: "destructive"
      });
    } finally {
      clearTimeout(timeoutId); // Always clear timeout
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (otp: string): Promise<boolean> => {
    try {
      console.log('Verifying OTP:', { otp, authMethod, signupData });
      
      // Get the user ID from localStorage
      const userId = localStorage.getItem('signup_user_id');
      const registrationToken = localStorage.getItem('signup_registration_token');
      
      if (!userId && !registrationToken) {
        console.error('No user ID or registration token found in localStorage for OTP verification');
        toast({
          title: "Error",
          description: "Registration session expired. Please register again.",
          variant: "destructive"
        });
        return false;
      }
      
      // Only validate user ID format if we're actually using user_id
      let parsedUserId = 0;
      if (userId) {
        parsedUserId = parseInt(userId);
        if (isNaN(parsedUserId) || parsedUserId <= 0) {
          console.error('Invalid user ID format in localStorage:', userId);
          toast({
            title: "Error",
            description: "Invalid registration session. Please register again.",
            variant: "destructive"
          });
          // Clear invalid data
          localStorage.removeItem('signup_user_id');
          return false;
        }
      }
      
      // Call the registration OTP verification endpoint
      let response;
      if (userId && parsedUserId > 0) {
        // Use user_id if available
        response = await apiService.verifyRegistrationOTP(parsedUserId, otp);
        console.log('OTP verification response (using user_id):', response);
      } else if (registrationToken) {
        // Use registration_token if user_id is not available
        response = await apiService.verifyRegistrationOTPWithToken(registrationToken, otp);
        console.log('OTP verification response (using registration_token):', response);
      } else {
        throw new Error('No valid verification data available');
      }
      
      console.log('OTP verification response:', response);
      
      if (!response.success) {
        console.error('OTP verification failed:', response);
        toast({
          title: "OTP Verification Failed",
          description: response.message || "Invalid OTP. Please try again.",
          variant: "destructive"
        });
        return false;
      }
      
      // Get stored signup data
      const userType = localStorage.getItem('signup_user_type');
      const partnershipNumber = localStorage.getItem('signup_partnership_number');
      
      // Clear stored signup data
      localStorage.removeItem('signup_email');
      localStorage.removeItem('signup_phone');
      localStorage.removeItem('signup_user_id');
      localStorage.removeItem('signup_registration_token'); // Clear registration token
      localStorage.removeItem('signup_user_type');
      localStorage.removeItem('signup_partnership_number');
      
      // Store user data and tokens for immediate login
      if (response.user && response.tokens) {
        localStorage.setItem('user', JSON.stringify(response.user));
        localStorage.setItem('access_token', response.tokens.access);
        localStorage.setItem('refresh_token', response.tokens.refresh);
      }
      
      toast({
        title: "Success!",
        description: "Account created and verified successfully! Welcome to Faith Connect!",
      });

      // Close modal and redirect based on user type
      onClose();
      if (userType === 'business') {
        navigate('/register-business');
      } else {
        navigate('/');
      }
      
      return true;
    } catch (error) {
      console.error('OTP verification error:', error);
      toast({
        title: "Error",
        description: "Failed to verify OTP. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };

  const handleResendOTP = async (): Promise<void> => {
    try {
      console.log('Resending OTP for registration');
      
      // Get the user ID from localStorage
      const userId = localStorage.getItem('signup_user_id');
      const registrationToken = localStorage.getItem('signup_registration_token');
      console.log('Retrieved user ID from localStorage:', userId);
      
      if (!userId && !registrationToken) {
        toast({
          title: "Error",
          description: "Registration session expired. Please register again.",
          variant: "destructive"
        });
        return;
      }
      
      // Only validate user ID format if we're actually using user_id
      let parsedUserId = 0;
      if (userId) {
        parsedUserId = parseInt(userId);
        if (isNaN(parsedUserId) || parsedUserId <= 0) {
          console.error('Invalid user ID format in localStorage:', userId);
          toast({
            title: "Error",
            description: "Invalid registration session. Please register again.",
            variant: "destructive"
          });
          // Clear invalid data
          localStorage.removeItem('signup_user_id');
          return;
        }
      }
      
      // Call the registration resend OTP endpoint
      let response;
      if (userId && parsedUserId > 0) {
        // Use user_id if available
        response = await apiService.resendRegistrationOTP(parsedUserId);
        console.log('Resend OTP response (using user_id):', response);
      } else if (registrationToken) {
        // Use registration_token if user_id is not available
        response = await apiService.resendRegistrationOTPWithToken(registrationToken);
        console.log('Resend OTP response (using registration_token):', response);
      } else {
        throw new Error('No valid verification data available for resending OTP');
      }
      
      console.log('Resend OTP response:', response);
      
      if (response.success) {
        toast({
          title: "OTP Resent!",
          description: "A new verification code has been sent to your phone.", // Email temporarily disabled
        });
      } else {
        toast({
          title: "Failed to resend",
          description: response.message || "Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      toast({
        title: "Error",
        description: "Failed to resend OTP. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleBackToSignup = () => {
    setSignupStep('form');
  };

  if (!isOpen) return null;

  // Debug log to track modal state
  console.log('AuthModal state:', { signupStep, activeTab, isOpen });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {signupStep === 'otp' ? 'Verify Your Account' : 'Welcome to FaithConnect'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="relative overflow-hidden">
          {/* OTP Verification Step - Only show when signupStep === 'otp' */}
          {signupStep === 'otp' && (
            <div className="p-6 space-y-6">
              {/* OTP Input Component - This will handle all the display */}
              <OTPInput
                type="signup"
                email={undefined} // Email temporarily disabled
                phone={signupData.phone} // Force phone
                onVerify={handleVerifyOTP}
                onResend={handleResendOTP}
                onBack={handleBackToSignup}
                title="Verify Your Phone" // Email temporarily disabled
                description="We sent a 6-digit verification code to your phone number"
              />

              {/* Back to Signup Button */}
              <Button
                variant="ghost"
                onClick={handleBackToSignup}
                className="w-full"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Signup
              </Button>
            </div>
          )}

          {/* Regular Signup/Login Form - Only show when signupStep === 'form' */}
          {signupStep === 'form' && (
            <div className="p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

                <TabsContent value="login" className="space-y-4">
                  {/* Login Contact Method Toggle */}
                  <div className="space-y-3">
                    <div className="text-center mb-2">
                      <p className="text-xs text-gray-600">
                        🔐 Choose your preferred login method
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Login with</Label>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-400 font-medium">
                          Email (Temporarily Disabled)
                        </span>
                        <Switch
                          checked={usePhone}
                          onCheckedChange={handleToggleChange}
                          className="data-[state=checked]:bg-blue-600"
                          disabled={true}
                        />
                        <span className={`text-xs ${usePhone ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
                          Phone
                        </span>
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleLogin} className="space-y-4">
                    {/* Contact Field - Shows only one based on toggle */}
                    {usePhone ? (
                      <div>
                        <Label htmlFor="login-phone">Phone Number</Label>
                        <Input
                          id="login-phone"
                          name="phone"
                          type="tel"
                          placeholder="Enter your phone number"
                          required
                        />
                      </div>
                    ) : (
                      <div>
                        <Label htmlFor="login-email" className="text-gray-400">Email Address (Temporarily Disabled)</Label>
                        <Input
                          id="login-email"
                          name="email"
                          type="email"
                          placeholder="Email temporarily disabled - use phone instead"
                          required
                          disabled={true}
                          className="bg-gray-100 text-gray-400 cursor-not-allowed"
                        />
                      </div>
                    )}
                    
                    <div>
                      <Label htmlFor="login-password">Password</Label>
                      <Input
                        id="login-password"
                        name="password"
                        type="password"
                        placeholder="Enter your password"
                        required
                      />
                    </div>
                    
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Logging in...
                        </>
                      ) : (
                        'Login'
                      )}
                    </Button>
                  </form>
                  
                  {/* Forgot Password Link */}
                  <div className="text-center">
                  <button
                      onClick={() => {
                        onClose();
                        navigate('/forgot-password');
                      }}
                      className="text-sm text-blue-600 hover:text-blue-800 underline"
                    >
                      Forgot Password?
                  </button>
                </div>
          </TabsContent>

                <TabsContent value="signup" className="space-y-4">
            <form onSubmit={handleSignup} className="space-y-4">
              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                        <Label htmlFor="firstName">First Name</Label>
                  <Input
                          id="firstName"
                    value={signupData.firstName}
                          onChange={(e) => setSignupData({...signupData, firstName: e.target.value})}
                          placeholder="First Name"
                    required
                  />
                </div>
                <div>
                        <Label htmlFor="lastName">Last Name</Label>
                  <Input
                          id="lastName"
                    value={signupData.lastName}
                          onChange={(e) => setSignupData({...signupData, lastName: e.target.value})}
                          placeholder="Last Name"
                    required
                  />
                </div>
              </div>

                    {/* Partnership Number - After Names */}
              <div>
                      <Label htmlFor="partnershipNumber">Partnership Number</Label>
                <Input
                        id="partnershipNumber"
                  value={signupData.partnershipNumber}
                        onChange={(e) => setSignupData({...signupData, partnershipNumber: e.target.value})}
                        placeholder="Enter your partnership number"
                  required
                />
              </div>

                    {/* Contact Method Toggle */}
                    <div className="space-y-3">
                      <div className="text-center mb-2">
                        <p className="text-xs text-gray-600">
                          💡 Phone number is recommended for faster verification
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">Contact Method</Label>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-400 font-medium">
                            Email (Temporarily Disabled)
                          </span>
                          <Switch
                            checked={usePhone}
                            onCheckedChange={handleToggleChange}
                            className="data-[state=checked]:bg-blue-600"
                            disabled={true}
                          />
                          <span className={`text-xs ${usePhone ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
                            Phone (Default)
                          </span>
                        </div>
                      </div>
                      
                      {/* Contact Field - Shows only one based on toggle */}
                      {usePhone ? (
                        <div>
                          <Label htmlFor="phone" className="text-sm">Phone Number</Label>
                          <Input
                            id="phone"
                            type="tel"
                            value={signupData.phone}
                            onChange={(e) => setSignupData({...signupData, phone: e.target.value})}
                            placeholder="Enter your phone number"
                            className="text-sm"
                            required
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            OTP will be sent to this phone number
                          </p>
                        </div>
                      ) : (
                        <div>
                          <Label htmlFor="email" className="text-sm text-gray-400">Email Address (Temporarily Disabled)</Label>
                          <Input
                            id="email"
                            type="email"
                            value={signupData.email}
                            onChange={(e) => setSignupData({...signupData, email: e.target.value})}
                            placeholder="Email temporarily disabled - use phone instead"
                            className="text-sm bg-gray-100 text-gray-400 cursor-not-allowed"
                            required
                            disabled={true}
                          />
                          <p className="text-xs text-gray-400 mt-1">
                            Email verification temporarily disabled - use phone instead
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Password Fields */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="password">Password</Label>
                        <Input
                          id="password"
                          type="password"
                          value={signupData.password}
                          onChange={(e) => setSignupData({...signupData, password: e.target.value})}
                          placeholder="Password"
                          required
                        />
                        {/* Password Strength Indicator */}
                        {signupData.password && (
                          <div className="mt-2">
                            <div className="flex items-center gap-2 mb-1">
                              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full transition-all duration-300 ${
                                    getPasswordStrength(signupData.password) === 'weak' ? 'bg-red-500 w-1/3' :
                                    getPasswordStrength(signupData.password) === 'medium' ? 'bg-yellow-500 w-2/3' :
                                    getPasswordStrength(signupData.password) === 'strong' ? 'bg-green-500 w-full' : 'w-0'
                                  }`}
                                />
                              </div>
                              <span className={`text-xs font-medium ${
                                getPasswordStrength(signupData.password) === 'weak' ? 'text-red-600' :
                                getPasswordStrength(signupData.password) === 'medium' ? 'text-yellow-600' :
                                getPasswordStrength(signupData.password) === 'strong' ? 'text-green-600' : 'text-gray-500'
                              }`}>
                                {getPasswordStrength(signupData.password).toUpperCase()}
                              </span>
                            </div>
                            <p className={`text-xs ${
                              getPasswordStrength(signupData.password) === 'weak' ? 'text-red-600' :
                              getPasswordStrength(signupData.password) === 'medium' ? 'text-yellow-600' :
                              getPasswordStrength(signupData.password) === 'strong' ? 'text-green-600' : 'text-gray-500'
                            }`}>
                              {getPasswordStrengthText(signupData.password)}
                            </p>
                          </div>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="confirmPassword">Confirm</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={signupData.confirmPassword}
                          onChange={(e) => setSignupData({...signupData, confirmPassword: e.target.value})}
                          placeholder="Confirm"
                          required
                        />
                        {/* Password Match Indicator */}
                        {signupData.confirmPassword && (
                          <div className="mt-2">
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${
                                signupData.password === signupData.confirmPassword ? 'bg-green-500' : 'bg-red-500'
                              }`} />
                              <span className={`text-xs ${
                                signupData.password === signupData.confirmPassword ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {signupData.password === signupData.confirmPassword ? 'Passwords match' : 'Passwords do not match'}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* User Type */}
                    <div>
                      <Label htmlFor="userType">User Type</Label>
                      <select
                        id="userType"
                        value={signupData.userType}
                        onChange={(e) => setSignupData({...signupData, userType: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        required
                      >
                        <option value="community">Community Member</option>
                        <option value="business">Business Owner</option>
                      </select>
                    </div>

                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Creating account...
                        </>
                      ) : (
                        'Create Account'
                      )}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
