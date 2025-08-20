import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { OTPInput } from '@/components/otp/OTPInput';
import { useToast } from '@/hooks/use-toast';
import { apiService } from '@/services/api';
import { Loader2, ArrowLeft, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PasswordResetOTPPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');

  useEffect(() => {
    // Get user info from URL params or localStorage
    const email = searchParams.get('email') || localStorage.getItem('reset_email');
    const phone = searchParams.get('phone') || localStorage.getItem('reset_phone');
    const token = searchParams.get('token') || localStorage.getItem('reset_token');

    if ((!email && !phone) || !token) {
      toast({
        title: "Missing Information",
        description: "Please request a password reset first.",
        variant: "destructive"
      });
      navigate(-1);
      return;
    }

    setUserEmail(email || '');
    setUserPhone(phone || '');
    setResetToken(token);
    
    // Determine auth method based on what's available
    if (email) {
      setAuthMethod('email');
    } else if (phone) {
      setAuthMethod('phone');
    }
  }, [searchParams, navigate, toast]);

  const handleVerifyOTP = async (otp: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Call your backend API to verify the password reset OTP
      const response = await apiService.verifyPasswordResetOTP(resetToken, otp);
      
      if (response.success) {
        // Store the verified token for the next step (new password)
        localStorage.setItem('verified_reset_token', resetToken);
        
        toast({
          title: "Success!",
          description: "Code verified! Please enter your new password.",
        });
        
        // Redirect to new password page
        setTimeout(() => {
          navigate('/new-password');
        }, 2000);
        
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      toast({
        title: "Error",
        description: "Failed to verify code. Please try again.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async (): Promise<void> => {
    try {
      // Call your backend API to resend password reset OTP
      const response = await apiService.resendPasswordResetOTP(userEmail);
      
      if (response.success) {
        toast({
          title: "Code Sent!",
          description: "A new password reset code has been sent to your email.",
        });
      } else {
        throw new Error(response.message || 'Failed to resend code');
      }
    } catch (error) {
      console.error('Error resending OTP:', error);
      toast({
        title: "Error",
        description: "Failed to resend password reset code. Please try again.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (!userEmail || !resetToken) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf9f8] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="flex items-center space-x-2 text-fem-navy hover:text-fem-terracotta"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Password Reset</span>
          </Button>
        </div>

        {/* Header Icon */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-fem-gray rounded-full mb-4">
            <Lock className="h-8 w-8 text-fem-terracotta" />
          </div>
        </div>

        {/* OTP Input Component */}
        <OTPInput
          type="password-reset"
          email={userEmail}
          phone={userPhone}
          onVerify={handleVerifyOTP}
          onResend={handleResendOTP}
          onBack={handleBack}
          title="Reset Your Password"
          description={authMethod === 'email' 
            ? 'Enter the 6-digit code sent to your email'
            : 'Enter the 6-digit code sent to your phone'
          }
        />

        {/* Additional Help */}
        <div className="mt-6 text-center">
          <p className="text-sm text-fem-darkgray">
            Didn't receive the code? Check your spam folder or{' '}
            <button
              onClick={() => navigate('/contact-support')}
              className="text-fem-terracotta hover:text-fem-terracotta/80 underline"
            >
              contact support
            </button>
          </p>
        </div>

        {/* Security Note */}
        <div className="mt-4 p-3 bg-fem-gray rounded-md">
          <p className="text-xs text-fem-navy text-center">
            🔒 This code expires in 15 minutes for security reasons
          </p>
        </div>
      </div>
    </div>
  );
};

export default PasswordResetOTPPage;
