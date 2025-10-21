import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, CheckCircle, Loader2, RefreshCw } from 'lucide-react';
import { OTPInput } from '@/components/auth/OTPInput';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/api';
import { toast } from 'sonner';

const OTPVerificationPage: React.FC = () => {
  const navigate = useNavigate();
  const { getOTPData, clearOTPData, login } = useAuth();
  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [isVerified, setIsVerified] = useState(false);
  const [otpData, setOtpData] = useState<{ contact: string; method: 'email' | 'phone' } | null>(null);

  useEffect(() => {
    const data = getOTPData();
    if (!data) {
      toast.error('No OTP data found. Please start over.');
      navigate('/login');
      return;
    }
    setOtpData(data);
  }, [getOTPData, navigate]);

  useEffect(() => {
    // Start resend timer
    setResendTimer(30);
    const timer = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleOTPComplete = async (otpValue: string) => {
    if (!otpData) return;

    console.log('OTP Complete triggered with:', otpValue);
    setIsVerifying(true);
    setOtp(otpValue);

    try {
      const response = await apiService.verifyOTP(otpData.contact, otpValue, otpData.method);
      console.log('OTP verification response:', response);
      
      if (response.success) {
        setIsVerified(true);
        
        if (response.is_new_user) {
          // New user - redirect to user type selection
          toast.success('OTP verified! Please complete your profile.');
          setTimeout(() => {
            navigate('/user-type-selection');
          }, 1500);
        } else if (response.user && response.tokens) {
          // Existing user - log them in
          login(response.user, response.tokens);
          clearOTPData();
          toast.success('Welcome back!');
          setTimeout(() => {
            navigate('/');
          }, 1500);
        }
      } else {
        toast.error(response.message || 'Invalid OTP. Please try again.');
        setOtp('');
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      toast.error('Something went wrong. Please try again.');
      setOtp('');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOTP = async () => {
    if (!otpData || resendTimer > 0) return;

    setIsResending(true);

    try {
      const response = await apiService.sendOTP(otpData.contact, otpData.method);
      
      if (response.success) {
        toast.success(`OTP resent to your ${otpData.method}`);
        setResendTimer(30);
        
        // Restart timer
        const timer = setInterval(() => {
          setResendTimer((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        toast.error(response.message || 'Failed to resend OTP');
      }
    } catch (error) {
      console.error('Error resending OTP:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const handleGoBack = () => {
    clearOTPData();
    navigate('/login');
  };

  const maskContact = (contact: string, method: 'email' | 'phone') => {
    if (method === 'email') {
      const [username, domain] = contact.split('@');
      const maskedUsername = username.length > 2 
        ? username.substring(0, 2) + '*'.repeat(username.length - 2)
        : username;
      return `${maskedUsername}@${domain}`;
    } else {
      // Phone number masking
      if (contact.length > 4) {
        return contact.substring(0, 3) + '*'.repeat(contact.length - 6) + contact.substring(contact.length - 3);
      }
      return contact;
    }
  };

  if (!otpData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white relative flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Orange background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-gradient-radial from-fem-terracotta/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-gradient-radial from-fem-terracotta/20 to-transparent rounded-full blur-3xl" />
      </div>

      <Card className="w-full max-w-md sm:max-w-lg relative z-10 shadow-2xl border-0 bg-white/15 backdrop-blur-xl border border-white/20 mx-4 sm:mx-0">
        <CardHeader className="text-center pb-8 pt-8 px-6 sm:px-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-fem-navy mb-2">
            {isVerified ? 'Verified! ✅' : 'Enter Verification Code 🔐'}
          </h1>
          <p className="text-fem-darkgray text-sm sm:text-base">
            {isVerified 
              ? 'Redirecting you to the next step...'
              : `We've sent a 6-digit code to your ${otpData.method === 'email' ? 'email' : 'phone'}`
            }
          </p>
          {!isVerified && otpData && (
            <p className="text-fem-terracotta font-medium text-sm sm:text-base mt-2">
              {maskContact(otpData.contact, otpData.method)}
            </p>
          )}
        </CardHeader>

        <CardContent className="px-6 sm:px-8 pb-8">
          {!isVerified && (
            <>
              <div className="mb-8">
                <OTPInput
                  onComplete={handleOTPComplete}
                  onValueChange={setOtp}
                  disabled={isVerifying}
                />
              </div>

              {isVerifying && (
                <div className="flex items-center justify-center mb-6">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-600 mr-2" />
                  <span className="text-gray-600">Verifying OTP...</span>
                </div>
              )}

              <div className="space-y-4">
                <Button
                  onClick={() => handleOTPComplete(otp)}
                  disabled={otp.length !== 6 || isVerifying}
                  size="lg"
                  className="w-full"
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      Verify OTP
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>

                <Button
                  onClick={handleResendOTP}
                  disabled={resendTimer > 0 || isResending}
                  variant="outline"
                  size="lg"
                  className="w-full"
                >
                  {isResending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Resending...
                    </>
                  ) : resendTimer > 0 ? (
                    `Resend in ${resendTimer}s`
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Resend OTP
                    </>
                  )}
                </Button>

                <Button
                  onClick={handleGoBack}
                  variant="ghost"
                  className="w-full h-12 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-xl transition-all duration-200"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Change {otpData.method === 'email' ? 'Email' : 'Phone Number'}
                </Button>
              </div>
            </>
          )}

          {isVerified && (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-gray-600">
                {otpData ? 'Redirecting you to the next step...' : 'Welcome back!'}
              </p>
            </div>
          )}

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Didn't receive the code? Check your spam folder or{' '}
              <button
                onClick={handleResendOTP}
                disabled={resendTimer > 0}
                className="text-blue-600 hover:underline disabled:opacity-50"
              >
                resend
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OTPVerificationPage;
