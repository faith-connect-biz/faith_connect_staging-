import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { apiService } from '@/services/api';
import { Loader2, ArrowLeft, Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';

interface PasswordRequirement {
  id: string;
  text: string;
  met: boolean;
}

const NewPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resetToken, setResetToken] = useState('');

  // Password validation
  const [passwordRequirements, setPasswordRequirements] = useState<PasswordRequirement[]>([
    { id: 'length', text: 'At least 8 characters', met: false },
    { id: 'uppercase', text: 'One uppercase letter', met: false },
    { id: 'lowercase', text: 'One lowercase letter', met: false },
    { id: 'number', text: 'One number', met: false },
    { id: 'special', text: 'One special character', met: false }
  ]);

  useEffect(() => {
    // Get reset token from localStorage
    const token = localStorage.getItem('verified_reset_token');
    if (!token) {
      toast({
        title: "Missing Information",
        description: "Please complete the password reset process first.",
        variant: "destructive"
      });
      navigate('/forgot-password');
      return;
    }
    setResetToken(token);
  }, [navigate, toast]);

  // Check password requirements in real-time
  useEffect(() => {
    setPasswordRequirements([
      { id: 'length', text: 'At least 8 characters', met: password.length >= 8 },
      { id: 'uppercase', text: 'One uppercase letter', met: /[A-Z]/.test(password) },
      { id: 'lowercase', text: 'One lowercase letter', met: /[a-z]/.test(password) },
      { id: 'number', text: 'One number', met: /\d/.test(password) },
      { id: 'special', text: 'One special character', met: /[!@#$%^&*(),.?":{}|<>]/.test(password) }
    ]);
  }, [password]);

  const isPasswordValid = passwordRequirements.every(req => req.met);
  const isFormValid = password && confirmPassword && isPasswordValid && password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid) {
      toast({
        title: "Invalid Information",
        description: "Please check your password requirements and confirmation",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // Call your backend API to reset password
      const response = await apiService.resetPassword(resetToken, password);
      
      if (response.success) {
        // Clear stored reset data
        localStorage.removeItem('verified_reset_token');
        localStorage.removeItem('reset_email');
        localStorage.removeItem('reset_token');
        
        toast({
          title: "Password Reset Successful!",
          description: "Your password has been updated. You can now sign in with your new password.",
        });
        
        // Redirect to login after a short delay
        setTimeout(() => {
          navigate('/');
        }, 3000);
        
      } else {
        throw new Error(response.message || 'Failed to reset password');
      }
    } catch (error: any) {
      console.error('Password reset failed:', error);
      
      let errorMessage = "Failed to reset password. Please try again.";
      
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
    navigate('/password-reset-otp');
  };

  if (!resetToken) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Verification</span>
          </Button>
        </div>

        {/* Header Icon */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <Lock className="h-8 w-8 text-green-600" />
          </div>
        </div>

        {/* Main Form */}
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Set New Password</CardTitle>
            <CardDescription>
              Create a strong password for your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* New Password */}
              <div>
                <Label htmlFor="new-password">New Password</Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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

              {/* Confirm Password */}
              <div>
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                
                {/* Password Match Indicator */}
                {confirmPassword && (
                  <div className="mt-2 flex items-center space-x-2 text-xs">
                    <CheckCircle 
                      className={`h-3 w-3 ${password === confirmPassword ? 'text-green-500' : 'text-red-500'}`} 
                    />
                    <span className={password === confirmPassword ? 'text-green-600' : 'text-red-600'}>
                      {password === confirmPassword ? 'Passwords match' : 'Passwords do not match'}
                    </span>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={!isFormValid || isLoading}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating Password...
                  </>
                ) : (
                  'Update Password'
                )}
              </Button>
            </form>

            {/* Security Note */}
            <div className="mt-6 p-3 bg-blue-50 rounded-md">
              <p className="text-xs text-blue-700 text-center">
                🔒 Your new password will be encrypted and stored securely
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NewPasswordPage;
