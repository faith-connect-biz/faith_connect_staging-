import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiService, User, LoginRequest, RegisterRequest, AuthTokens } from '@/services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isBusiness: boolean;
  isCommunity: boolean;
  userType: 'business' | 'community' | null;
  isLoading: boolean;
  isLoggingOut: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<{ 
    success: boolean; 
    message: string; 
    registration_token?: string; 
    requires_otp?: boolean; 
    otp_sent_to?: string; 
    user?: User; 
    tokens?: AuthTokens; 
  }>;
  verifyRegistrationOTP: (otp: string) => Promise<{ 
    success: boolean; 
    message: string; 
    user?: User; 
    tokens?: AuthTokens; 
  }>;
  resendRegistrationOTP: () => Promise<{ 
    success: boolean; 
    message: string; 
    otp_sent_to?: string; 
  }>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<void>;
  setTokens: (tokens: AuthTokens) => void;
  forceReAuth: () => void;
  isBusinessUser: () => boolean;
  isCommunityUser: () => boolean;
  canAccessBusinessFeatures: () => boolean;
  registrationToken: string;
  otpSentTo: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [registrationToken, setRegistrationToken] = useState('');
  const [otpSentTo, setOtpSentTo] = useState('');
  const [authTokens, setAuthTokens] = useState<AuthTokens | null>(null);
  const [userType, setUserType] = useState<'business' | 'community' | null>(null);
  const [isBusiness, setIsBusiness] = useState(false);
  const [isCommunity, setIsCommunity] = useState(false);

  const isAuthenticated = !!user;

  // Check if user is already authenticated on app load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check for real authentication first
        if (apiService.isAuthenticated()) {
          // Validate the token with the backend
          const isValid = await apiService.validateToken();
          if (isValid) {
            const userData = await apiService.getCurrentUser();
            setUser(userData);
            setIsLoading(false);
            return;
          } else {
            // Token is invalid, clear it
            console.log('Invalid token found, clearing auth state...');
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user');
          }
        }

        // Fallback to mock user data (for demo purposes)
        const mockUserData = localStorage.getItem('user');
        if (mockUserData) {
          const user = JSON.parse(mockUserData);
          setUser(user);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        // Clear invalid tokens
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (data: LoginRequest) => {
    try {
      setIsLoading(true);
      const response = await apiService.login(data);
      apiService.setAuthTokens(response.tokens);
      setUser(response.user);
      
      // Force a re-render by updating the state
      setTimeout(() => {
        setUser({ ...response.user });
      }, 100);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterRequest): Promise<{ 
    success: boolean; 
    message: string; 
    registration_token?: string; 
    requires_otp?: boolean; 
    otp_sent_to?: string; 
    user?: User; 
    tokens?: AuthTokens; 
  }> => {
    try {
      const response = await apiService.register(data);
      
      if (response.success && response.requires_otp) {
        // Store registration token for OTP verification
        setRegistrationToken(response.registration_token || '');
        setOtpSentTo(response.otp_sent_to || '');
        
        return {
          success: true,
          message: response.message,
          registration_token: response.registration_token,
          requires_otp: true,
          otp_sent_to: response.otp_sent_to
        };
      }
      
      return response;
    } catch (error) {
      console.error('Registration failed:', error);
      return {
        success: false,
        message: 'Registration failed. Please try again.'
      };
    }
  };

  const verifyRegistrationOTP = async (otp: string): Promise<{ 
    success: boolean; 
    message: string; 
    user?: User; 
    tokens?: AuthTokens; 
  }> => {
    try {
      if (!registrationToken) {
        return {
          success: false,
          message: 'No registration token found. Please register again.'
        };
      }
      
      const response = await apiService.verifyRegistrationOTP(registrationToken, otp);
      
      if (response.success && response.user && response.tokens) {
        // User created successfully, set auth state
        setUser(response.user);
        setAuthTokens(response.tokens);
        setUserType(response.user.user_type);
        setIsBusiness(response.user.user_type === 'business');
        setIsCommunity(response.user.user_type === 'community');
        
        // Clear registration state
        setRegistrationToken('');
        setOtpSentTo('');
        
        return response;
      }
      
      return response;
    } catch (error) {
      console.error('OTP verification failed:', error);
      return {
        success: false,
        message: 'OTP verification failed. Please try again.'
      };
    }
  };

  const resendRegistrationOTP = async (): Promise<{ 
    success: boolean; 
    message: string; 
    otp_sent_to?: string; 
  }> => {
    try {
      if (!registrationToken) {
        return {
          success: false,
          message: 'No registration token found. Please register again.'
        };
      }
      
      const response = await apiService.resendRegistrationOTP(registrationToken);
      
      if (response.success) {
        setOtpSentTo(response.otp_sent_to || '');
      }
      
      return response;
    } catch (error) {
      console.error('Failed to resend OTP:', error);
      return {
        success: false,
        message: 'Failed to resend OTP. Please try again.'
      };
    }
  };

  const logout = async () => {
    // Prevent multiple logout calls
    if (isLoggingOut) {
      return;
    }
    
    try {
      setIsLoggingOut(true);
      await apiService.logout();
    } catch (error) {
      console.error('Logout failed:', error);
      // Continue with local cleanup even if logout fails
    } finally {
      // Always clear local state regardless of API response
      setUser(null);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      setIsLoggingOut(false);
    }
  };

  const forceReAuth = async () => {
    try {
      console.log('Forcing re-authentication...');
      setUser(null);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      
      // Try to get fresh user data
      if (apiService.isAuthenticated()) {
        const userData = await apiService.getCurrentUser();
        setUser(userData);
      }
    } catch (error) {
      console.error('Force re-auth failed:', error);
    }
  };

  const updateUser = async (data: Partial<User>) => {
    try {
      // This function should only update local state, not make API calls
      // The profile update API call is handled by the ProfilePage
      if (typeof data === 'object' && data !== null) {
        setUser(prevUser => prevUser ? { ...prevUser, ...data } : data as User);
      }
    } catch (error) {
      console.error('User state update failed:', error);
      throw error;
    }
  };

  const setTokens = (tokens: AuthTokens) => {
    apiService.setAuthTokens(tokens);
  };

  const contextValue: AuthContextType = {
    user,
    isAuthenticated,
    isBusiness,
    isCommunity,
    userType,
    isLoading,
    isLoggingOut,
    login,
    register,
    verifyRegistrationOTP,
    resendRegistrationOTP,
    logout,
    updateUser,
    registrationToken,
    otpSentTo,
    setTokens,
    forceReAuth,
    isBusinessUser: () => user?.user_type === 'business',
    isCommunityUser: () => user?.user_type === 'community',
    canAccessBusinessFeatures: () => user?.user_type === 'business'
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 