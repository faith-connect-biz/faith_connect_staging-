import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { X, Mail, Phone, ArrowLeft, Loader2, Eye, EyeOff } from 'lucide-react';
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
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotMethod, setForgotMethod] = useState<'email' | 'phone'>('phone');
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [forgotStep, setForgotStep] = useState<'request' | 'verify'>('request');
  const [resetOtp, setResetOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
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
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('phone'); // Allow both email and phone
  const [usePhone, setUsePhone] = useState(true); // Toggle between phone and email - allow both
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Enhanced close handler that resets all states
  const handleClose = () => {
    // Reset all states before closing
    setActiveTab('login');
    setSignupStep('form');
    setForgotOpen(false);
    setForgotStep('request');
    setForgotIdentifier('');
    setResetOtp('');
    setNewPassword('');
    setConfirmNewPassword('');
    setForgotMethod('phone');
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
    setAuthMethod('phone');
    setUsePhone(true);
    setShowPassword(false);
    setShowConfirmPassword(false);
    setIsLoading(false);
    
    // Call the original onClose
    onClose();
  };

  const { login, register, verifyRegistrationOTP, resendRegistrationOTP } = useAuth();
  const { toast } = useToast();
  const { handleError, handleAsyncError } = useErrorHandler({ context: 'auth' });
  const navigate = useNavigate();

  // Handle toggle between phone and email - now enabled
  const handleToggleChange = (checked: boolean) => {
    setUsePhone(checked);
    setAuthMethod(checked ? 'phone' : 'email');
    // Clear the other field when switching
    if (checked) {
    setSignupData(prev => ({ ...prev, email: '' }));
    } else {
      setSignupData(prev => ({ ...prev, phone: '' }));
    }
  };

  // Reset all states when modal opens to ensure clean state
  useEffect(() => {
    if (isOpen) {
      // Reset all form states
      setActiveTab('login');
      setSignupStep('form');
      setForgotOpen(false);
      setForgotStep('request');
      setForgotIdentifier('');
      setResetOtp('');
      setNewPassword('');
      setConfirmNewPassword('');
      setForgotMethod('phone');
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
      setAuthMethod('phone');
      setUsePhone(true);
      setShowPassword(false);
      setShowConfirmPassword(false);
    }
  }, [isOpen]);

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
      // Set default to phone for login (email now enabled)
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
        title: "Missing Information",
        description: "Please fill in all required fields.",
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
      handleError(error, 'login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (signupData.password !== signupData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Your passwords do not match. Please try again.",
        variant: "destructive"
      });
      return;
    }

    // Validate that only one contact method is provided based on toggle
    if (usePhone && !signupData.phone) {
      toast({
        title: "Missing Information",
        description: "Please enter your phone number.",
        variant: "destructive"
      });
      return;
    }
    
    if (!usePhone && !signupData.email) {
        toast({
        title: "Missing Information",
        description: "Please enter your email address.",
          variant: "destructive"
        });
        return;
    }

    setIsLoading(true);
    try {
      const response = await register({
        first_name: signupData.firstName,
        last_name: signupData.lastName,
        partnership_number: signupData.partnershipNumber,
        user_type: signupData.userType as 'community' | 'business',
        email: usePhone ? undefined : signupData.email || undefined,
        phone: usePhone ? signupData.phone : undefined,
        password: signupData.password
      });
      
      if (response.success) {
        toast({
          title: "Account Created!",
          description: "Please verify your account with the code we sent.",
        });
        setSignupStep('otp');
      } else {
        // Pass axios error directly so handler can extract data.errors
        handleError(response, 'signup');
      }
    } catch (error: any) {
      // Pass axios error directly so handler can extract data.errors
      handleError(error, 'signup');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (otp: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Use the registration OTP verification method from AuthContext
      const response = await verifyRegistrationOTP(otp);

      if (response.success) {
          toast({
          title: "Account Verified!",
          description: "Your account has been successfully created and verified.",
        });
      onClose();
        // Removed redirect to '/welcome' per requirement
        return true;
      } else {
        handleError(response.message || 'OTP verification failed', 'otp-verification');
        return false;
      }
    } catch (error: any) {
      handleError(error, 'otp-verification');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      // Use the registration OTP resend method from AuthContext
      const response = await resendRegistrationOTP();
      
      if (response.success) {
        toast({
          title: "Code Resent!",
          description: "A new verification code has been sent to your account.",
        });
      } else {
        handleError(response.message || 'Failed to resend code', 'otp-resend');
      }
    } catch (error: any) {
      handleError(error, 'otp-resend');
    }
  };

  const handleBackToSignup = () => {
    setSignupStep('form');
  };

  if (!isOpen) return null;

  // Debug log to track modal state
  console.log('AuthModal state:', { signupStep, activeTab, isOpen });

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md border border-fem-terracotta/10 max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b bg-[#faf9f8]">
          <h2 className="text-xl font-semibold text-fem-navy">
            {signupStep === 'otp' ? 'Verify Your Account' : 'Welcome to FaithConnect'}
          </h2>
          <button
            onClick={handleClose}
            className="text-fem-navy/50 hover:text-fem-terracotta"
            aria-label="Close modal"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="relative flex-1 overflow-y-auto">
          {forgotOpen ? (
            <div className="p-6 space-y-4">
              {/* Close button for forgot password flow */}
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-fem-navy">
                  {forgotStep === 'request' ? 'Reset your password' : 'Enter code and new password'}
                </h3>
                <button
                  onClick={() => {
                    setForgotOpen(false);
                    setForgotStep('request');
                    setForgotIdentifier('');
                    setResetOtp('');
                    setNewPassword('');
                    setConfirmNewPassword('');
                    setActiveTab('login');
                    setSignupStep('form');
                    setForgotMethod('phone');
                    setIsLoading(false);
                  }}
                  className="text-fem-navy/50 hover:text-fem-terracotta"
                  aria-label="Close forgot password"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              {forgotStep==='request' && (
                <>
                  <p className="text-sm text-fem-darkgray">Enter your email or phone to receive a reset code.</p>
                  <div className="flex items-center space-x-2 bg-fem-gray p-1 rounded-md">
                    <button type="button" onClick={() => setForgotMethod('email')} className={`px-3 py-1.5 rounded-md text-sm ${forgotMethod==='email'?'bg-white text-fem-terracotta shadow':'text-fem-navy'}`}>Email</button>
                    <button type="button" onClick={() => setForgotMethod('phone')} className={`px-3 py-1.5 rounded-md text-sm ${forgotMethod==='phone'?'bg-white text-fem-terracotta shadow':'text-fem-navy'}`}>Phone</button>
                  </div>
                  <div>
                    <Label htmlFor="forgot-identifier">{forgotMethod==='email'?'Email address':'Phone number'}</Label>
                    <Input id="forgot-identifier" type={forgotMethod==='email'?'email':'tel'} placeholder={forgotMethod==='email'?'john@email.com':'+2547...'} value={forgotIdentifier} onChange={(e)=>setForgotIdentifier(e.target.value)} className="mt-1 focus:ring-fem-terracotta focus:border-fem-terracotta" />
                  </div>
                  <div className="space-y-2">
                    <Button disabled={isLoading || !forgotIdentifier} onClick={async ()=>{
                      setIsLoading(true);
                      try{
                        const res = await apiService.requestPasswordReset(forgotIdentifier, forgotMethod);
                        if(res.success){
                          if(forgotMethod==='email') localStorage.setItem('reset_email', forgotIdentifier); else localStorage.setItem('reset_phone', forgotIdentifier);
                          if(res.token) localStorage.setItem('reset_token', res.token);
                          toast({title:'Code sent!', description:`We sent a reset code to your ${forgotMethod}.`});
                          setForgotStep('verify');
                        } else {
                          handleError(res.message || 'Unable to send reset code', 'password-reset');
                        }
                      } catch(err:any){
                        handleError(err, 'password-reset');
                      } finally {
                        setIsLoading(false);
                      }
                    }} className="w-full bg-fem-terracotta hover:bg-fem-terracotta/90 text-white">{isLoading?'Sending...':'Send Reset Code'}</Button>
                    <Button variant="outline" onClick={()=>{
                      setForgotOpen(false);
                      setForgotStep('request');
                      setForgotIdentifier('');
                      setResetOtp('');
                      setNewPassword('');
                      setConfirmNewPassword('');
                      setActiveTab('login');
                      setSignupStep('form');
                    }} className="w-full border-fem-terracotta text-fem-terracotta hover:bg-fem-terracotta hover:text-white">Back</Button>
                  </div>
                </>
              )}

              {forgotStep==='verify' && (
                <>
                  <div>
                    <Label htmlFor="otp-code">6-digit code</Label>
                    <Input id="otp-code" inputMode="numeric" maxLength={6} value={resetOtp} onChange={(e)=>setResetOtp(e.target.value.replace(/\D/g,''))} className="mt-1 focus:ring-fem-terracotta focus:border-fem-terracotta" />
                  </div>
                  <div>
                    <Label htmlFor="new-pass">New password</Label>
                    <div className="relative">
                      <Input 
                        id="new-pass" 
                        type={showPassword ? "text" : "password"} 
                        value={newPassword} 
                        onChange={(e)=>setNewPassword(e.target.value)} 
                        className="mt-1 focus:ring-fem-terracotta focus:border-fem-terracotta pr-10" 
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-fem-terracotta transition-colors"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="confirm-pass">Confirm new password</Label>
                    <div className="relative">
                      <Input 
                        id="confirm-pass" 
                        type={showConfirmPassword ? "text" : "password"} 
                        value={confirmNewPassword} 
                        onChange={(e)=>setConfirmNewPassword(e.target.value)} 
                        className="mt-1 focus:ring-fem-terracotta focus:border-fem-terracotta pr-10" 
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-fem-terracotta transition-colors"
                        aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Button disabled={isLoading || resetOtp.length!==6 || !newPassword || newPassword!==confirmNewPassword} onClick={async ()=>{
                      setIsLoading(true);
                      try{
                        const res = await apiService.resetPasswordWithOTP(forgotIdentifier, resetOtp, newPassword);
                        if(res.success){
                          toast({title:'Password updated', description:'Please login with your new password.'});
                          // switch to login
                          setActiveTab('login');
                          setForgotOpen(false);
                        } else {
                          handleError(res.message || 'Could not update password', 'password-reset');
                        }
                      } catch(err:any){
                        handleError(err, 'password-reset');
                      } finally {
                        setIsLoading(false);
                      }
                    }} className="w-full bg-fem-terracotta hover:bg-fem-terracotta/90 text-white">{isLoading?'Updating...':'Set New Password'}</Button>
                    <Button variant="outline" onClick={()=>setForgotStep('request')} className="w-full border-fem-terracotta text-fem-terracotta hover:bg-fem-terracotta hover:text-white">Back</Button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
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
                title={usePhone ? "Verify Your Phone" : "Verify Your Email"}
                description={usePhone 
                  ? "We sent a 6-digit verification code to your phone number"
                  : "We sent a 6-digit verification code to your email address"
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
          <TabsList className="grid w-full grid-cols-2 bg-fem-gray text-fem-navy rounded-md">
                  <TabsTrigger value="login" className="data-[state=active]:bg-white data-[state=active]:text-fem-terracotta hover:text-fem-terracotta">Login</TabsTrigger>
            <TabsTrigger value="signup" className="data-[state=active]:bg-white data-[state=active]:text-fem-terracotta hover:text-fem-terracotta">Sign Up</TabsTrigger>
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
                        <span className={`text-xs ${!usePhone ? 'text-fem-terracotta font-medium' : 'text-gray-500'}`}>
                          Email
                        </span>
                        <Switch
                          checked={usePhone}
                          onCheckedChange={handleToggleChange}
                          className="data-[state=checked]:bg-fem-terracotta"
                        />
                        <span className={`text-xs ${usePhone ? 'text-fem-terracotta font-medium' : 'text-gray-500'}`}>
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
                          className="focus:ring-fem-terracotta focus:border-fem-terracotta"
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
                          className="focus:ring-fem-terracotta focus:border-fem-terracotta"
                        />
                      </div>
                    )}
                    
                    <div>
                      <Label htmlFor="login-password">Password</Label>
                      <div className="relative">
                        <Input
                          id="login-password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          required
                          className="focus:ring-fem-terracotta focus:border-fem-terracotta pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-fem-terracotta transition-colors"
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    
                    <Button type="submit" className="w-full bg-fem-terracotta hover:bg-fem-terracotta/90 text-white" disabled={isLoading}>
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
                        setForgotOpen(true);
                        setForgotMethod('phone');
                        setForgotIdentifier('');
                      }}
                      className="text-sm text-fem-terracotta hover:text-fem-terracotta/80 underline"
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
                          <span className={`text-xs ${!usePhone ? 'text-fem-terracotta font-medium' : 'text-gray-500'}`}>
                            Email
                          </span>
                          <Switch
                            checked={usePhone}
                            onCheckedChange={handleToggleChange}
                            className="data-[state=checked]:bg-fem-terracotta"
                          />
                          <span className={`text-xs ${usePhone ? 'text-fem-terracotta font-medium' : 'text-gray-500'}`}>
                            Phone
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
                            className="text-sm focus:ring-fem-terracotta focus:border-fem-terracotta"
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
                            className="text-sm focus:ring-fem-terracotta focus:border-fem-terracotta"
                            required
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            OTP will be sent to this email address
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Password Fields */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="password">Password</Label>
                        <div className="relative">
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            value={signupData.password}
                            onChange={(e) => setSignupData({...signupData, password: e.target.value})}
                            placeholder="Password"
                            required
                            className="focus:ring-fem-terracotta focus:border-fem-terracotta pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-fem-terracotta transition-colors"
                            aria-label={showPassword ? "Hide password" : "Show password"}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
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
                        <div className="relative">
                          <Input
                            id="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            value={signupData.confirmPassword}
                            onChange={(e) => setSignupData({...signupData, confirmPassword: e.target.value})}
                            placeholder="Confirm"
                            required
                            className="focus:ring-fem-terracotta focus:border-fem-terracotta pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-fem-terracotta transition-colors"
                            aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                          >
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
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
                      <Select
                        value={signupData.userType}
                        onValueChange={(val) => setSignupData({ ...signupData, userType: val })}
                      >
                        <SelectTrigger className="mt-1 focus:ring-fem-terracotta focus:border-fem-terracotta">
                          <SelectValue placeholder="Select user type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="community">Community Member</SelectItem>
                          <SelectItem value="business">Business Owner</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Terms and Conditions Checkbox */}
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <input
                          type="checkbox"
                          id="termsAcceptance"
                          required
                          className="mt-1 h-4 w-4 text-fem-terracotta focus:ring-fem-terracotta border-gray-300 rounded"
                        />
                        <div className="text-sm text-gray-700">
                          <label htmlFor="termsAcceptance" className="font-medium">
                            I agree to the{' '}
                            <a 
                              href="/terms-and-conditions" 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-fem-terracotta hover:text-fem-terracotta/80 underline"
                            >
                              Terms and Conditions
                            </a>
                            {' '}and{' '}
                            <a 
                              href="/privacy-policy" 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-fem-terracotta hover:text-fem-terracotta/80 underline"
                            >
                              Privacy Policy
                            </a>
                          </label>
                          <p className="text-xs text-gray-500 mt-1">
                            You must accept these terms to create an account
                          </p>
                        </div>
                      </div>
                    </div>

                    <Button type="submit" className="w-full bg-fem-terracotta hover:bg-fem-terracotta/90 text-white" disabled={isLoading}>
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
        </>
      )}
    </div>
  </div>
</div>
);
}


