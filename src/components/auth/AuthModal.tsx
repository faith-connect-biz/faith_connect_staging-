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
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');
  const [usePhone, setUsePhone] = useState(false); // Toggle between phone and email

  const { login, register } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Handle toggle between phone and email
  const handleToggleChange = (checked: boolean) => {
    setUsePhone(checked);
    if (checked) {
      // Switching to phone - clear email and set auth method
      setSignupData(prev => ({ ...prev, email: '' }));
      setAuthMethod('phone');
    } else {
      // Switching to email - clear phone and set auth method
      setSignupData(prev => ({ ...prev, phone: '' }));
      setAuthMethod('email');
    }
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

  // Reset form when modal opens/closes
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
      setAuthMethod('email');
      setUsePhone(false); // Reset toggle to email
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
      // Set default to email for login
      setUsePhone(false);
      setAuthMethod('email');
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
        auth_method: usePhone ? 'phone' : 'email' 
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
    
    if (!usePhone && !signupData.email) {
      toast({
        title: "Error",
        description: "Please provide your email address.",
        variant: "destructive"
      });
      return;
    }

    console.log('Starting signup process...', { signupData });
    setIsLoading(true);
    try {
      const registerResponse = await register({
        first_name: signupData.firstName,
        last_name: signupData.lastName,
        partnership_number: signupData.partnershipNumber,
        email: usePhone ? undefined : signupData.email,
        phone: usePhone ? signupData.phone : undefined,
        password: signupData.password,
        user_type: signupData.userType as 'community' | 'business'
      });
      
      console.log('Registration successful:', registerResponse);
      console.log('Registration response structure:', {
        success: registerResponse.success,
        message: registerResponse.message,
        registration_token: registerResponse.registration_token,
        requires_otp: registerResponse.requires_otp,
        otp_sent_to: registerResponse.otp_sent_to
      });
      
      // Check if we have the required data
      if (!registerResponse.registration_token) {
        console.error('Missing registration_token in response:', registerResponse);
        throw new Error('Registration failed: Missing registration token');
      }
      
      // Store signup data for OTP verification
      localStorage.setItem('signup_email', usePhone ? '' : signupData.email);
      localStorage.setItem('signup_phone', usePhone ? signupData.phone : '');
      localStorage.setItem('signup_registration_token', registerResponse.registration_token);
      localStorage.setItem('signup_user_type', signupData.userType);
      localStorage.setItem('signup_partnership_number', signupData.partnershipNumber);
      localStorage.setItem('signup_auth_method', usePhone ? 'phone' : 'email');

      // Set auth method based on toggle and move to OTP step
      setAuthMethod(usePhone ? 'phone' : 'email');
      setSignupStep('otp');

      console.log(`Using ${usePhone ? 'phone' : 'email'} verification`);

      toast({
        title: "Registration successful!",
        description: `Please verify your ${usePhone ? 'phone number' : 'email address'} to complete registration.`,
      });
    } catch (error: any) {
      console.error('Registration failed:', error);
      toast({
        title: "Registration failed",
        description: error.message || "Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (otp: string): Promise<boolean> => {
    try {
      console.log('Verifying OTP:', { otp, authMethod, signupData });
      
      // Get the registration token from localStorage
      const registrationToken = localStorage.getItem('signup_registration_token');
      
      if (!registrationToken) {
        toast({
          title: "Error",
          description: "Registration session expired. Please register again.",
          variant: "destructive"
        });
        return false;
      }
      
      // Call the registration OTP verification endpoint
      const data = {
        registration_token: registrationToken,
        otp: otp
      };

      console.log('Calling registration OTP verification endpoint with data:', data);
      const response = await apiService.post('/verify-registration-otp', data);
      console.log('OTP verification response:', response);
      
      if (response.success) {
        // Get stored signup data
        const userType = localStorage.getItem('signup_user_type');
        const partnershipNumber = localStorage.getItem('signup_partnership_number');
        
        // Clear stored signup data
        localStorage.removeItem('signup_email');
        localStorage.removeItem('signup_phone');
        localStorage.removeItem('signup_registration_token');
        localStorage.removeItem('signup_user_id');
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
      } else {
        toast({
          title: "Verification failed",
          description: response.message || "Invalid OTP. Please try again.",
          variant: "destructive"
        });
        return false;
      }
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
      
      // Get the registration token from localStorage
      const registrationToken = localStorage.getItem('signup_registration_token');
      console.log('Retrieved registration token from localStorage:', registrationToken);
      
      if (!registrationToken) {
        toast({
          title: "Error",
          description: "Registration session expired. Please register again.",
          variant: "destructive"
        });
        return;
      }
      
      // Call the registration resend OTP endpoint
      const data = {
        registration_token: registrationToken
      };

      console.log('Calling resend registration OTP endpoint with data:', data);
      const response = await apiService.post('/resend-registration-otp', data);
      console.log('Resend OTP response:', response);
      
      if (response.success) {
        toast({
          title: "OTP Resent!",
          description: `A new verification code has been sent to your ${response.otp_sent_to === 'email' ? 'email' : 'phone'}.`,
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
                email={usePhone ? undefined : signupData.email}
                phone={usePhone ? signupData.phone : undefined}
                onVerify={handleVerifyOTP}
                onResend={handleResendOTP}
                onBack={handleBackToSignup}
                title={authMethod === 'email' ? 'Verify Your Email' : 'Verify Your Phone'}
                description={authMethod === 'email' 
                  ? 'We sent a verification link to your email address'
                  : 'We sent a 6-digit verification code to your phone number'
                }
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
                        <span className={`text-xs ${!usePhone ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
                          Email
                        </span>
                        <Switch
                          checked={usePhone}
                          onCheckedChange={handleToggleChange}
                          className="data-[state=checked]:bg-blue-600"
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
                        <Label htmlFor="login-email">Email Address</Label>
                        <Input
                          id="login-email"
                          name="email"
                          type="email"
                          placeholder="Enter your email address"
                          required
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
                          <span className={`text-xs ${!usePhone ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
                            Email
                          </span>
                          <Switch
                            checked={usePhone}
                            onCheckedChange={handleToggleChange}
                            className="data-[state=checked]:bg-blue-600"
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
                          <Label htmlFor="email" className="text-sm">Email Address</Label>
                          <Input
                            id="email"
                            type="email"
                            value={signupData.email}
                            onChange={(e) => setSignupData({...signupData, email: e.target.value})}
                            placeholder="Enter your email address"
                            className="text-sm"
                            required
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Verification link will be sent to this email
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
