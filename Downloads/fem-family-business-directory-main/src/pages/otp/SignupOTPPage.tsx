import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { OTPInput } from '@/components/otp/OTPInput';
import { useToast } from '@/hooks/use-toast';
import { apiService } from '@/services/api';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SignupOTPPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [userId, setUserId] = useState('');
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');

  useEffect(() => {
    // Get user info from URL params or localStorage
    const email = searchParams.get('email') || localStorage.getItem('signup_email');
    const phone = searchParams.get('phone') || localStorage.getItem('signup_phone');
    const id = searchParams.get('user_id') || localStorage.getItem('signup_user_id');

    if (!email && !phone) {
      toast({
        title: "Missing Information",
        description: "Please complete the signup process first.",
        variant: "destructive"
      });
      navigate('/signup');
      return;
    }

    setUserEmail(email || '');
    setUserPhone(phone || '');
    setUserId(id || '');
    
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
      // Call your backend API to verify the OTP
      const response = await apiService.verifyEmailOTP(userId, otp);
      
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
          description: "Verification successful! Please login with your credentials.",
        });
        
        // Set flag to open login modal and redirect to home
        localStorage.setItem('open_login_modal', 'true');
        setTimeout(() => {
          navigate('/');
        }, 1500);
        
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      toast({
        title: "Error",
        description: "Failed to verify OTP. Please try again.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async (): Promise<void> => {
    try {
      // Call your backend API to resend OTP
      const response = await apiService.resendEmailOTP(userId);
      
      if (response.success) {
        toast({
          title: "Code Sent!",
          description: "A new verification code has been sent.",
        });
      } else {
        throw new Error(response.message || 'Failed to resend code');
      }
    } catch (error) {
      console.error('Error resending OTP:', error);
      toast({
        title: "Error",
        description: "Failed to resend verification code. Please try again.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const handleBack = () => {
    navigate('/signup');
  };

  if (!userEmail || !userId) {
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
            <span>Back to Signup</span>
          </Button>
        </div>

        {/* OTP Input Component */}
        <OTPInput
          type="signup"
          email={userEmail}
          phone={userPhone}
          onVerify={handleVerifyOTP}
          onResend={handleResendOTP}
          onBack={handleBack}
          title={authMethod === 'email' ? 'Verify Your Email' : 'Verify Your Phone'}
          description={authMethod === 'email' 
            ? 'We sent a 6-digit verification code to your email address'
            : 'We sent a 6-digit verification code to your phone number'
          }
        />

        {/* Additional Help */}
        <div className="mt-6 text-center">
          <p className="text-sm text-fem-darkgray">
            Having trouble? Check your spam folder or{' '}
            <button
              onClick={() => navigate('/contact-support')}
              className="text-fem-terracotta hover:text-fem-terracotta/80 underline"
            >
              contact support
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupOTPPage;
