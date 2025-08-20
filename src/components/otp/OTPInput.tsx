import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, RefreshCw, Phone, Mail } from 'lucide-react';

interface OTPInputProps {
  type: 'signup' | 'password-reset';
  phone?: string;
  email?: string;
  onVerify: (otp: string) => Promise<boolean>;
  onResend: () => Promise<void>;
  title?: string;
  description?: string;
  onBack?: () => void;
}

export const OTPInput: React.FC<OTPInputProps> = ({
  type,
  phone,
  email,
  onVerify,
  onResend,
  title,
  description,
  onBack
}) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { toast } = useToast();

  const maxAttempts = 3;

  useEffect(() => {
    // Start countdown for resend
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  useEffect(() => {
    // Auto-focus first input
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return; // Prevent multiple characters

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      // Move to previous input on backspace
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').slice(0, 6);
    if (/^\d{6}$/.test(pastedData)) {
      const newOtp = pastedData.split('');
      setOtp([...newOtp, ...Array(6 - newOtp.length).fill('')]);
      // Focus last filled input
      const lastFilledIndex = Math.min(newOtp.length - 1, 5);
      inputRefs.current[lastFilledIndex]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter the complete 6-digit code",
        variant: "destructive"
      });
      return;
    }

    if (attempts >= maxAttempts) {
      toast({
        title: "Too Many Attempts",
        description: "Please wait before trying again or request a new code",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const success = await onVerify(otpString);
      if (success) {
        toast({
          title: "Success!",
          description: type === 'signup' 
            ? (phone ? "Phone number verified successfully! You can now sign in." : "Email verified successfully! You can now sign in.")
            : "Password reset code verified!",
        });
      } else {
        setAttempts(prev => prev + 1);
        toast({
          title: "Invalid Code",
          description: `Invalid verification code. ${maxAttempts - attempts - 1} attempts remaining.`,
          variant: "destructive"
        });
        // Clear OTP on failed attempt
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    try {
      await onResend();
      setCountdown(60); // 60 second cooldown
      setAttempts(0); // Reset attempts
      toast({
        title: "Code Sent!",
        description: "A new verification code has been sent.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send new code. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsResending(false);
    }
  };

  const canResend = countdown === 0 && !isResending;
  const isOtpComplete = otp.every(digit => digit !== '');
  const isMaxAttemptsReached = attempts >= maxAttempts;

  const getTitle = () => {
    if (title) return title;
    return type === 'signup' 
      ? (phone ? 'Verify Your Phone' : 'Verify Your Email')
      : 'Reset Your Password';
  };

  const getDescription = () => {
    if (description) return description;
    return type === 'signup' 
      ? (phone 
          ? 'We sent a 6-digit verification code to your phone'
          : 'We sent a 6-digit verification code to your email'
        )
      : 'Enter the 6-digit code sent to your email';
  };

  return (
    <Card className="w-full max-w-md mx-auto border border-fem-terracotta/10 shadow-lg">
      <CardHeader className="text-center bg-[#faf9f8]">
        <CardTitle className="text-2xl font-bold text-fem-navy">{getTitle()}</CardTitle>
        <CardDescription className="text-fem-darkgray">
          {getDescription()}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Contact Info Display */}
        <div className="flex flex-col items-center justify-center space-y-2 text-sm text-muted-foreground">
          {phone && (
            <div className="flex items-center space-x-2">
              <Phone className="h-4 w-4" />
              <span>{phone}</span>
            </div>
          )}
          {email && (
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4" />
              <span>{email}</span>
            </div>
          )}
        </div>

        {/* OTP Input Fields */}
        <div className="space-y-4">
          <Label htmlFor="otp" className="text-sm font-medium">
            Enter 6-digit code
          </Label>
        <div className="flex justify-center space-x-2">
          {otp.map((digit, index) => (
              <Input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                className="w-12 h-12 text-center text-lg font-semibold border-gray-300 focus:ring-2 focus:ring-fem-terracotta focus:border-fem-terracotta"
                disabled={isLoading || isMaxAttemptsReached}
              />
            ))}
          </div>
        </div>

        {/* Attempts Warning */}
        {attempts > 0 && (
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              {maxAttempts - attempts} attempts remaining
            </p>
          </div>
        )}

        {/* Max Attempts Warning */}
        {isMaxAttemptsReached && (
          <div className="text-center p-3 bg-destructive/10 rounded-md">
            <p className="text-sm text-destructive font-medium">
              Too many failed attempts. Please wait before trying again.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={handleVerify}
            disabled={!isOtpComplete || isLoading || isMaxAttemptsReached}
            className="w-full bg-fem-terracotta hover:bg-fem-terracotta/90 text-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              'Verify Code'
            )}
          </Button>

          {onBack && (
            <Button
              variant="outline"
              onClick={onBack}
              disabled={isLoading}
              className="w-full border-fem-terracotta text-fem-terracotta hover:bg-fem-terracotta hover:text-white"
            >
              Back
            </Button>
          )}
        </div>

        {/* Resend Section */}
        <div className="text-center">
          <p className="text-sm text-fem-darkgray mb-2">
            Didn't receive the code?
          </p>
            <Button
            variant="link"
              onClick={handleResend}
            disabled={!canResend}
            className="p-0 h-auto text-sm text-fem-terracotta hover:text-fem-terracotta/80"
          >
            {isResending ? (
              <>
                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                Sending...
              </>
            ) : countdown > 0 ? (
              `Resend in ${countdown}s`
            ) : (
              <>
                <RefreshCw className="mr-2 h-3 w-3" />
                Resend Code
              </>
              )}
            </Button>
          </div>
      </CardContent>
    </Card>
  );
}; 