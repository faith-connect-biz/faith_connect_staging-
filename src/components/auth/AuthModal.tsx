import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  const [signupUserId, setSignupUserId] = useState('');
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');

  const { login, register } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

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
      setSignupUserId('');
      setAuthMethod('email');
    }
  }, [isOpen]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      await login({ identifier: email, password, auth_method: 'email' });
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

    if (!signupData.email && !signupData.phone) {
      toast({
        title: "Error",
        description: "Please provide either email or phone number.",
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
        email: signupData.email || undefined,
        phone: signupData.phone || undefined,
        password: signupData.password,
        user_type: signupData.userType as 'community' | 'business'
      });
      
      console.log('Registration successful:', registerResponse);
      
      // Store signup data for OTP verification
      localStorage.setItem('signup_email', signupData.email || '');
      localStorage.setItem('signup_phone', signupData.phone || '');
      localStorage.setItem('signup_user_id', registerResponse.user.id);
      localStorage.setItem('signup_user_type', signupData.userType);
      localStorage.setItem('signup_partnership_number', signupData.partnershipNumber);

      // Determine auth method and move to OTP step
      if (signupData.email) {
        setAuthMethod('email');
        console.log('Using email verification');
      } else {
        setAuthMethod('phone');
        console.log('Using phone verification');
      }
      setSignupUserId(registerResponse.user.id);
      setSignupStep('otp');

      toast({
        title: "Registration successful!",
        description: `Please verify your ${signupData.email ? 'email' : 'phone'} to complete registration.`,
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
      
      // Call the correct backend API to verify the OTP
      const endpoint = authMethod === 'email' ? '/verify-email-confirm' : '/verify-phone-confirm';
      const data = authMethod === 'email' 
        ? { email: signupData.email, token: otp }
        : { phone_number: signupData.phone, otp: otp };

      console.log('Calling endpoint:', endpoint, 'with data:', data);
      const response = await apiService.post(endpoint, data);
      console.log('OTP verification response:', response);
      
      if (response.success) {
        // Get stored signup data
        const userType = localStorage.getItem('signup_user_type');
        const partnershipNumber = localStorage.getItem('signup_partnership_number');
        
        // Clear stored signup data
        localStorage.removeItem('signup_email');
        localStorage.removeItem('signup_phone');
        localStorage.removeItem('signup_user_id');
        localStorage.removeItem('signup_user_type');
        localStorage.removeItem('signup_partnership_number');
        
        toast({
          title: "Success!",
          description: `${authMethod === 'email' ? 'Email' : 'Phone'} verified successfully!`,
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
      console.log('Resending OTP for:', { authMethod, signupData });
      
      // Call the correct backend API to resend OTP
      const endpoint = authMethod === 'email' ? '/verify-email' : '/verify-phone';
      const data = authMethod === 'email' 
        ? { email: signupData.email }
        : { phone_number: signupData.phone };

      console.log('Calling resend endpoint:', endpoint, 'with data:', data);
      const response = await apiService.post(endpoint, data);
      console.log('Resend OTP response:', response);
      
      if (response.success) {
        toast({
          title: "OTP Resent!",
          description: `A new verification code has been sent to your ${authMethod === 'email' ? 'email' : 'phone'}.`,
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
    setSignupUserId('');
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
                email={signupData.email}
                phone={signupData.phone}
                onVerify={handleVerifyOTP}
                onResend={handleResendOTP}
                onBack={handleBackToSignup}
                title={authMethod === 'email' ? 'Verify Your Email' : 'Verify Your Phone'}
                description={authMethod === 'email' 
                  ? 'We sent a 6-digit verification code to your email address'
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
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                      <Label htmlFor="login-email">Email</Label>
                <Input
                        id="login-email"
                        name="email"
                        type="email"
                        placeholder="Enter your email"
                  required
                />
              </div>
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

                    {/* Compact Contact Fields */}
                    <div className="grid grid-cols-2 gap-4">
              <div>
                        <Label htmlFor="email" className="text-sm">Email</Label>
                  <Input
                          id="email"
                          type="email"
                          value={signupData.email}
                          onChange={(e) => setSignupData({...signupData, email: e.target.value})}
                          placeholder="Email"
                          className="text-sm"
                        />
                </div>
                      <div>
                        <Label htmlFor="phone" className="text-sm">Phone</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={signupData.phone}
                          onChange={(e) => setSignupData({...signupData, phone: e.target.value})}
                          placeholder="Phone"
                          className="text-sm"
                        />
                </div>
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
