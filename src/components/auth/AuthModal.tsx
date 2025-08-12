import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, EyeOff, Phone, Mail, CheckCircle, X, ArrowRight } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'login' | 'signup';
}

interface PasswordRequirement {
  id: string;
  text: string;
  met: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose, 
  defaultTab = 'login' 
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form states
  const [loginData, setLoginData] = useState({
    identifier: '', // email/phone or partnership number
    password: '',
    userType: 'community' as 'community' | 'business'
  });
  
  const [signupData, setSignupData] = useState({
    firstName: '',
    lastName: '',
    partnershipNumber: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    userType: 'community' as 'community' | 'business'
  });

  const { login, register } = useAuth();
  const navigate = useNavigate();

  // Password validation
  const [passwordRequirements, setPasswordRequirements] = useState<PasswordRequirement[]>([
    { id: 'length', text: 'At least 8 characters', met: false },
    { id: 'uppercase', text: 'One uppercase letter', met: false },
    { id: 'lowercase', text: 'One lowercase letter', met: false },
    { id: 'number', text: 'One number', met: false },
    { id: 'special', text: 'One special character', met: false }
  ]);

  // Check password requirements in real-time
  useEffect(() => {
    const password = signupData.password;
    setPasswordRequirements([
      { id: 'length', text: 'At least 8 characters', met: password.length >= 8 },
      { id: 'uppercase', text: 'One uppercase letter', met: /[A-Z]/.test(password) },
      { id: 'lowercase', text: 'One lowercase letter', met: /[a-z]/.test(password) },
      { id: 'number', text: 'One number', met: /\d/.test(password) },
      { id: 'special', text: 'One special character', met: /[!@#$%^&*(),.?":{}|<>]/.test(password) }
    ]);
  }, [signupData.password]);

  const isPasswordValid = passwordRequirements.every(req => req.met);
  const isSignupValid = signupData.firstName && signupData.lastName && 
                       signupData.partnershipNumber && signupData.password && 
                       signupData.confirmPassword && isPasswordValid &&
                       (signupData.email || signupData.phone);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginData.identifier || !loginData.password) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // Determine if identifier is email/phone or partnership number
      const isPartnershipNumber = !loginData.identifier.includes('@') && !loginData.identifier.includes('+');
      
      let loginResponse;
      
      if (isPartnershipNumber) {
        // Login with partnership number
        loginResponse = await login({
          partnership_number: loginData.identifier,
          password: loginData.password
        });
      } else {
        // Login with email/phone - send the correct field names
        loginResponse = await login({
          identifier: loginData.identifier,
          auth_method: authMethod,
          password: loginData.password
        });
      }

      toast({
        title: "Login successful",
        description: "Welcome back to Faith Connect!",
      });

      // Handle post-login flow based on user type
      if (loginData.userType === 'business') {
        // Check if user already has a business
        try {
          // For now, we'll redirect to business management
          // In the future, you could add a method to check if user has existing businesses
          navigate('/manage-business');
        } catch (error) {
          // If there's an error, redirect to business management
          navigate('/manage-business');
        }
      } else {
        navigate('/');
      }
      
      onClose();
    } catch (error: any) {
      console.error('Login failed:', error);
      
      // Handle specific validation errors from the backend
      let errorMessage = "Please check your credentials and try again";
      
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        errorMessage = Object.values(errors).join(', ');
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: "Login failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSignupValid) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    if (signupData.password !== signupData.confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const registerResponse = await register({
        first_name: signupData.firstName,
        last_name: signupData.lastName,
        partnership_number: signupData.partnershipNumber,
        email: signupData.email || undefined,
        phone: signupData.phone || undefined,
        password: signupData.password,
        user_type: signupData.userType
      });

      toast({
        title: "Registration successful!",
        description: "Welcome to Faith Connect!",
      });

      // Handle post-registration flow based on user type
      if (signupData.userType === 'business') {
        navigate('/register-business');
      } else {
        navigate('/');
      }
      
      onClose();
    } catch (error: any) {
      console.error('Registration failed:', error);
      
      // Handle specific validation errors from the backend
      let errorMessage = "Please try again or contact support";
      
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        errorMessage = Object.values(errors).join(', ');
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: "Registration failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value as 'login' | 'signup');
    // Reset form data when switching tabs
    setLoginData({ identifier: '', password: '', userType: 'community' });
    setSignupData({
      firstName: '', lastName: '', partnershipNumber: '', 
      email: '', phone: '', password: '', confirmPassword: '', userType: 'community'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {activeTab === 'login' ? 'Sign In' : 'Create Account'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          {/* Login Tab */}
          <TabsContent value="login" className="p-6">
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Auth Method Toggle */}
              <div className="flex items-center space-x-2 bg-gray-100 p-2 rounded-lg">
                <button
                  type="button"
                  onClick={() => setAuthMethod('email')}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    authMethod === 'email' 
                      ? 'bg-white text-fem-terracotta shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Mail className="h-4 w-4" />
                  <span>Email</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMethod('phone')}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    authMethod === 'phone' 
                      ? 'bg-white text-fem-terracotta shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Phone className="h-4 w-4" />
                  <span>Phone</span>
                </button>
              </div>

              {/* Identifier Input */}
              <div>
                <Label htmlFor="login-identifier">
                  {authMethod === 'email' ? 'Email' : 'Phone'} or Partnership Number
                </Label>
                <Input
                  id="login-identifier"
                  type={authMethod === 'email' ? 'email' : 'text'}
                  placeholder={authMethod === 'email' ? 'email@example.com' : '+1234567890 or PART123'}
                  value={loginData.identifier}
                  onChange={(e) => setLoginData(prev => ({ ...prev, identifier: e.target.value }))}
                  required
                />
              </div>

              {/* Password Input */}
              <div>
                <Label htmlFor="login-password">Password</Label>
                <div className="relative">
                  <Input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={loginData.password}
                    onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* User Type Selection */}
              <div>
                <Label>Login As</Label>
                <div className="flex gap-4 mt-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="loginUserType"
                      value="community"
                      checked={loginData.userType === 'community'}
                      onChange={(e) => setLoginData(prev => ({ ...prev, userType: e.target.value as 'community' | 'business' }))}
                      className="text-fem-terracotta"
                    />
                    <span className="text-sm">Community</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="loginUserType"
                      value="business"
                      checked={loginData.userType === 'business'}
                      onChange={(e) => setLoginData(prev => ({ ...prev, userType: e.target.value as 'community' | 'business' }))}
                      className="text-fem-terracotta"
                    />
                    <span className="text-sm">Business</span>
                  </label>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-fem-terracotta hover:bg-fem-terracotta/90"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
          </TabsContent>

          {/* Signup Tab */}
          <TabsContent value="signup" className="p-6">
            <form onSubmit={handleSignup} className="space-y-4">
              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="signup-firstName">First Name *</Label>
                  <Input
                    id="signup-firstName"
                    placeholder="John"
                    value={signupData.firstName}
                    onChange={(e) => setSignupData(prev => ({ ...prev, firstName: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="signup-lastName">Last Name *</Label>
                  <Input
                    id="signup-lastName"
                    placeholder="Smith"
                    value={signupData.lastName}
                    onChange={(e) => setSignupData(prev => ({ ...prev, lastName: e.target.value }))}
                    required
                  />
                </div>
              </div>

              {/* Partnership Number */}
              <div>
                <Label htmlFor="signup-partnershipNumber">Partnership Number *</Label>
                <Input
                  id="signup-partnershipNumber"
                  placeholder="PART123"
                  value={signupData.partnershipNumber}
                  onChange={(e) => setSignupData(prev => ({ ...prev, partnershipNumber: e.target.value }))}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Your unique identifier in our church community
                </p>
              </div>

              {/* Auth Method Toggle */}
              <div className="flex items-center space-x-2 bg-gray-100 p-2 rounded-lg">
                <button
                  type="button"
                  onClick={() => setAuthMethod('email')}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    authMethod === 'email' 
                      ? 'bg-white text-fem-terracotta shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Mail className="h-4 w-4" />
                  <span>Email</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMethod('phone')}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    authMethod === 'phone' 
                      ? 'bg-white text-fem-terracotta shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Phone className="h-4 w-4" />
                  <span>Phone</span>
                </button>
              </div>

              {/* Contact Input */}
              <div>
                <Label htmlFor="signup-contact">
                  {authMethod === 'email' ? 'Email Address' : 'Phone Number'} *
                </Label>
                <Input
                  id="signup-contact"
                  type={authMethod === 'email' ? 'email' : 'tel'}
                  placeholder={authMethod === 'email' ? 'john@email.com' : '+1234567890'}
                  value={authMethod === 'email' ? signupData.email : signupData.phone}
                  onChange={(e) => {
                    if (authMethod === 'email') {
                      setSignupData(prev => ({ ...prev, email: e.target.value }));
                    } else {
                      setSignupData(prev => ({ ...prev, phone: e.target.value }));
                    }
                  }}
                  required
                />
              </div>

              {/* Password Fields */}
              <div>
                <Label htmlFor="signup-password">Password *</Label>
                <div className="relative">
                  <Input
                    id="signup-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={signupData.password}
                    onChange={(e) => setSignupData(prev => ({ ...prev, password: e.target.value }))}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                
                {/* Password Requirements */}
                <div className="mt-2 space-y-1">
                  {passwordRequirements.map((req) => (
                    <div key={req.id} className="flex items-center space-x-2 text-xs">
                      <CheckCircle 
                        className={`h-3 w-3 ${req.met ? 'text-green-500' : 'text-gray-300'}`} 
                      />
                      <span className={req.met ? 'text-green-600' : 'text-gray-500'}>
                        {req.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="signup-confirmPassword">Confirm Password *</Label>
                <Input
                  id="signup-confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={signupData.confirmPassword}
                  onChange={(e) => setSignupData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  required
                />
                {signupData.confirmPassword && signupData.password !== signupData.confirmPassword && (
                  <p className="text-xs text-red-500 mt-1">Passwords don't match</p>
                )}
              </div>

              {/* User Type Selection */}
              <div>
                <Label>Account Type</Label>
                <div className="flex gap-4 mt-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="signupUserType"
                      value="community"
                      checked={signupData.userType === 'community'}
                      onChange={(e) => setSignupData(prev => ({ ...prev, userType: e.target.value as 'community' | 'business' }))}
                      className="text-fem-terracotta"
                    />
                    <span className="text-sm">Community Member</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="signupUserType"
                      value="business"
                      checked={signupData.userType === 'business'}
                      onChange={(e) => setSignupData(prev => ({ ...prev, userType: e.target.value as 'community' | 'business' }))}
                      className="text-fem-terracotta"
                    />
                    <span className="text-sm">Business Directory</span>
                  </label>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-fem-terracotta hover:bg-fem-terracotta/90"
                disabled={!isSignupValid || isLoading}
              >
                {isLoading ? 'Creating account...' : 'Create Account'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
