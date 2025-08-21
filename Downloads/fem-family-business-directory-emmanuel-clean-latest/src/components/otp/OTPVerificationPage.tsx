import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { OTPInput } from './OTPInput';
import { useOTP } from '@/hooks/useOTP';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Mail, Phone, Shield, CheckCircle } from 'lucide-react';

interface OTPVerificationPageProps {
  onVerificationSuccess?: (data: any) => void;
  redirectTo?: string;
}

export const OTPVerificationPage: React.FC<OTPVerificationPageProps> = ({
  onVerificationSuccess,
  redirectTo = '/'
}) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { sendOTPCode, verifyOTPCode, error, success, isLoading, clearMessages } = useOTP();
  
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [purpose, setPurpose] = useState<'registration' | 'password_reset' | 'email_verification' | 'phone_verification'>('registration');
  const [isOTPSent, setIsOTPSent] = useState<boolean>(false);
  const [verificationMethod, setVerificationMethod] = useState<'email' | 'phone'>('email');

  // Get data from URL params
  useEffect(() => {
    const emailParam = searchParams.get('email');
    const phoneParam = searchParams.get('phone');
    const purposeParam = searchParams.get('purpose') as any;
    
    if (emailParam) {
      setEmail(emailParam);
      setVerificationMethod('email');
    }
    if (phoneParam) {
      setPhone(phoneParam);
      setVerificationMethod('phone');
    }
    if (purposeParam) {
      setPurpose(purposeParam);
    }
  }, [searchParams]);

  // Auto-send OTP when component mounts if we have contact info
  useEffect(() => {
    if ((email || phone) && !isOTPSent) {
      handleSendOTP();
    }
  }, [email, phone]);

  const handleSendOTP = async () => {
    try {
      const data = {
        [verificationMethod]: verificationMethod === 'email' ? email : phone,
        purpose
      };
      
      await sendOTPCode(data);
      setIsOTPSent(true);
    } catch (error) {
      console.error('Failed to send OTP:', error);
    }
  };

  const handleVerifyOTP = async (otp: string) => {
    try {
      const data = {
        [verificationMethod]: verificationMethod === 'email' ? email : phone,
        otp,
        purpose
      };
      
      const result = await verifyOTPCode(data);
      
      if (result.success) {
        // Call success callback if provided
        if (onVerificationSuccess) {
          onVerificationSuccess(result.data);
        }
        
        // Redirect after successful verification
        setTimeout(() => {
          navigate(redirectTo);
        }, 1500);
      }
    } catch (error) {
      console.error('Failed to verify OTP:', error);
    }
  };

  const handleResendOTP = async () => {
    clearMessages();
    await handleSendOTP();
  };

  const handleBack = () => {
    navigate(-1);
  };

  const getPurposeTitle = () => {
    switch (purpose) {
      case 'registration':
        return 'Complete Your Registration';
      case 'password_reset':
        return 'Reset Your Password';
      case 'email_verification':
        return 'Verify Your Email';
      case 'phone_verification':
        return 'Verify Your Phone';
      default:
        return 'Verify Your Account';
    }
  };

  const getPurposeDescription = () => {
    switch (purpose) {
      case 'registration':
        return 'Please verify your contact information to complete your registration.';
      case 'password_reset':
        return 'Enter the verification code to reset your password.';
      case 'email_verification':
        return 'Please verify your email address to access your account.';
      case 'phone_verification':
        return 'Please verify your phone number to access your account.';
      default:
        return 'Please enter the verification code sent to your contact information.';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-fem-terracotta to-fem-gold rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-fem-navy mb-2">
            {getPurposeTitle()}
          </h1>
          <p className="text-gray-600">
            {getPurposeDescription()}
          </p>
        </div>

        {/* Contact Info Display */}
        {(email || phone) && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                {verificationMethod === 'email' ? (
                  <Mail className="w-5 h-5 text-fem-terracotta" />
                ) : (
                  <Phone className="w-5 h-5 text-fem-terracotta" />
                )}
                <div>
                  <p className="text-sm text-gray-500">Verification code sent to:</p>
                  <p className="font-medium text-fem-navy">
                    {verificationMethod === 'email' ? email : phone}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Success Message */}
        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        {/* OTP Input */}
        {isOTPSent && (
          <OTPInput
            onComplete={handleVerifyOTP}
            onResend={handleResendOTP}
            isLoading={isLoading}
            error={error}
            success={success}
            resendCooldown={60}
          />
        )}

        {/* Manual Send OTP Button */}
        {!isOTPSent && (email || phone) && (
          <Card>
            <CardContent className="p-6">
              <Button
                onClick={handleSendOTP}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-fem-terracotta to-fem-gold text-white hover:from-fem-gold hover:to-fem-terracotta"
              >
                Send Verification Code
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Back Button */}
        <div className="mt-6 text-center">
          <Button
            onClick={handleBack}
            variant="ghost"
            className="text-gray-600 hover:text-fem-navy"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>

        {/* Help Text */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Having trouble? Contact support for assistance.</p>
        </div>
      </div>
    </div>
  );
}; 