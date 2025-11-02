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
        
        // Handle different response structures from backend
        // Expected format: { success, message, data: { access_token, refresh_token, user, requires_profile_completion, first_time } }
        const responseData = (response as any).data || response;
        const user = responseData.user || (response as any).user;
        
        // Extract requires_profile_completion - check multiple locations
        const requiresProfileCompletion = 
          responseData.requires_profile_completion ?? 
          responseData.user?.requires_profile_completion ?? 
          (response as any).requires_profile_completion ?? 
          false;
        
        // Extract first_time flag
        const firstTime = responseData.first_time ?? (response as any).is_new_user ?? false;
        
        // Extract tokens - handle both access_token/refresh_token and tokens.access/tokens.refresh formats
        let tokens: { access: string; refresh: string } | undefined;
        
        if (responseData.access_token && responseData.refresh_token) {
          // New format: access_token and refresh_token directly in data object
          tokens = {
            access: responseData.access_token,
            refresh: responseData.refresh_token
          };
        } else if ((response as any).tokens) {
          // Old format: tokens.access and tokens.refresh at root level
          tokens = (response as any).tokens;
        } else if (responseData.tokens) {
          // Format: tokens nested in data object
          tokens = responseData.tokens;
        }
        
        console.log('Extracted data:', {
          user: !!user,
          tokens: !!tokens,
          requiresProfileCompletion,
          firstTime
        });
        
        if (user && tokens) {
          // Log the user in first
          login(user, tokens);
          clearOTPData();
          
          // Get user type from user object
          const userType = (user as any).user_type || user.userType;
          
          // For first-time users, always require user type selection
          // (Even if backend has a default 'community', user should explicitly choose)
          if (firstTime) {
            // First-time user must select user type first
            console.log('First-time user - redirecting to /user-type-selection');
            toast.success('OTP verified! Please select your user type to continue.');
            setTimeout(() => {
              navigate('/user-type-selection');
            }, 1500);
          } else if (requiresProfileCompletion) {
            // User has type but needs to complete profile
            console.log('Profile completion required - redirecting to /profile-update');
            toast.success(response.message || 'Phone verified successfully! Please complete your profile.');
            setTimeout(() => {
              // Pass user type if available
              navigate('/profile-update', {
                state: {
                  userType: userType || 'community'
                }
              });
            }, 1500);
          } else {
            // Profile is complete - go to home
            console.log('Profile complete - redirecting to home');
            toast.success(response.message || 'Welcome back!');
            setTimeout(() => {
              navigate('/');
            }, 1500);
          }
        } else if (firstTime || (response as any).is_new_user) {
          // New user without tokens yet - redirect to user type selection
          console.log('New user - redirecting to /user-type-selection');
          toast.success('OTP verified! Please select your user type to continue.');
          setTimeout(() => {
            navigate('/user-type-selection');
          }, 1500);
        } else {
          console.error('Missing required data:', { user: !!user, tokens: !!tokens });
          toast.error('Unexpected response format. Please try again.');
          setOtp('');
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
