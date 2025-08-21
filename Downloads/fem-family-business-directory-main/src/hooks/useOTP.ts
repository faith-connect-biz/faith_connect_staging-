import { useState, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';

interface OTPVerificationData {
  email?: string;
  phone?: string;
  otp: string;
  purpose: 'registration' | 'password_reset' | 'email_verification' | 'phone_verification';
}

interface OTPSendData {
  email?: string;
  phone?: string;
  purpose: 'registration' | 'password_reset' | 'email_verification' | 'phone_verification';
}

interface OTPResponse {
  success: boolean;
  message: string;
  data?: {
    user_id?: string;
    token?: string;
  };
}

// Mock API functions - replace with actual API calls when backend is ready
const sendOTP = async (data: OTPSendData): Promise<OTPResponse> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Mock response
  return {
    success: true,
    message: `OTP sent to ${data.email || data.phone}`,
    data: {
      user_id: 'mock-user-id'
    }
  };
};

const verifyOTP = async (data: OTPVerificationData): Promise<OTPResponse> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Mock verification - in real app, this would validate against backend
  if (data.otp === '123456') {
    return {
      success: true,
      message: 'OTP verified successfully',
      data: {
        token: 'mock-jwt-token'
      }
    };
  } else {
    throw new Error('Invalid OTP code');
  }
};

export const useOTP = () => {
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // Send OTP mutation
  const sendOTPMutation = useMutation({
    mutationFn: sendOTP,
    onSuccess: (data) => {
      setSuccess(data.message);
      setError('');
    },
    onError: (error: Error) => {
      setError(error.message || 'Failed to send OTP');
      setSuccess('');
    }
  });

  // Verify OTP mutation
  const verifyOTPMutation = useMutation({
    mutationFn: verifyOTP,
    onSuccess: (data) => {
      setSuccess(data.message);
      setError('');
      // Handle successful verification (e.g., redirect, update user state)
      if (data.data?.token) {
        // Store token in localStorage or state management
        localStorage.setItem('auth_token', data.data.token);
      }
    },
    onError: (error: Error) => {
      setError(error.message || 'Invalid OTP code');
      setSuccess('');
    }
  });

  // Send OTP function
  const sendOTPCode = useCallback(async (data: OTPSendData) => {
    setError('');
    setSuccess('');
    return sendOTPMutation.mutateAsync(data);
  }, [sendOTPMutation]);

  // Verify OTP function
  const verifyOTPCode = useCallback(async (data: OTPVerificationData) => {
    setError('');
    setSuccess('');
    return verifyOTPMutation.mutateAsync(data);
  }, [verifyOTPMutation]);

  // Clear messages
  const clearMessages = useCallback(() => {
    setError('');
    setSuccess('');
  }, []);

  return {
    // State
    error,
    success,
    isLoading: sendOTPMutation.isPending || verifyOTPMutation.isPending,
    
    // Actions
    sendOTPCode,
    verifyOTPCode,
    clearMessages,
    
    // Mutations for direct access if needed
    sendOTPMutation,
    verifyOTPMutation
  };
}; 