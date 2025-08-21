import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { apiService } from '@/services/api';
import { Loader2, ArrowLeft, Mail, Phone, Lock } from 'lucide-react';

const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');
  const [identifier, setIdentifier] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!identifier) {
      toast({
        title: "Missing Information",
        description: "Please enter your email or phone number",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // Call your backend API to send password reset OTP
      const response = await apiService.requestPasswordReset(identifier, authMethod);
      
      if (response.success) {
        // Store reset data for OTP verification
        if (authMethod === 'email') {
          localStorage.setItem('reset_email', identifier);
        } else {
          localStorage.setItem('reset_phone', identifier);
        }
        localStorage.setItem('reset_token', response.token || 'temp-token');
        
        setIsSubmitted(true);
        
        toast({
          title: "Reset Code Sent!",
          description: `A password reset code has been sent to your ${authMethod === 'email' ? 'email' : 'phone'}`,
        });
        
        // Redirect to OTP verification after a short delay
        setTimeout(() => {
          navigate('/password-reset-otp');
        }, 2000);
        
      } else {
        throw new Error(response.message || 'Failed to send reset code');
      }
    } catch (error: any) {
      console.error('Password reset request failed:', error);
      
      let errorMessage = "Failed to send reset code. Please try again.";
      
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

  const handleBack = () => {
    navigate(-1);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Mail className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-green-800">
              Check Your {authMethod === 'email' ? 'Email' : 'Phone'}
            </CardTitle>
            <CardDescription className="text-green-700">
              We've sent a password reset code to your {authMethod === 'email' ? 'email' : 'phone'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-green-600">
              Please check your {authMethod === 'email' ? 'email' : 'phone'} and enter the code on the next page.
            </p>
            <Button
              onClick={() => navigate('/password-reset-otp')}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              Continue to Verification
            </Button>
            <Button
              variant="outline"
              onClick={handleBack}
              className="w-full"
            >
              Back to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Login</span>
          </Button>
        </div>

        {/* Header Icon */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <Lock className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        {/* Main Form */}
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Forgot Password?</CardTitle>
            <CardDescription>
              Enter your email or phone number to receive a password reset code
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Auth Method Toggle */}
              <div className="flex items-center space-x-2 bg-gray-100 p-2 rounded-lg">
                <button
                  type="button"
                  onClick={() => setAuthMethod('email')}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    authMethod === 'email' 
                      ? 'bg-blue-600 text-white shadow-sm' 
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
                      ? 'bg-blue-600 text-white shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Phone className="h-4 w-4" />
                  <span>Phone</span>
                </button>
              </div>

              {/* Identifier Input */}
              <div>
                <Label htmlFor="reset-identifier">
                  {authMethod === 'email' ? 'Email Address' : 'Phone Number'}
                </Label>
                <Input
                  id="reset-identifier"
                  type={authMethod === 'email' ? 'email' : 'tel'}
                  placeholder={authMethod === 'email' ? 'john@email.com' : '+1234567890'}
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading || !identifier}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending Reset Code...
                  </>
                ) : (
                  'Send Reset Code'
                )}
              </Button>
            </form>

            {/* Additional Help */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Remember your password?{' '}
                <button
                  onClick={handleBack}
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  Back to Login
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
