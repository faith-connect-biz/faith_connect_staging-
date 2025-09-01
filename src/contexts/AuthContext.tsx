import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiService } from '@/services/api';
import { User, AuthTokens, LoginRequest, RegisterRequest } from '@/services/api';
import { toast } from 'sonner';

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
    user_id?: number; 
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

  // Update business/community states when user changes
  useEffect(() => {
    console.log('AuthContext: User state changed:', user);
    if (user) {
      console.log('AuthContext: Setting user type:', user.user_type);
      setUserType(user.user_type);
      const newIsBusiness = user.user_type === 'business';
      const newIsCommunity = user.user_type === 'community';
      
      setIsBusiness(newIsBusiness);
      setIsCommunity(newIsCommunity);
      
      console.log('AuthContext: isBusiness set to:', newIsBusiness);
      console.log('AuthContext: isCommunity set to:', newIsCommunity);
    } else {
      console.log('AuthContext: Clearing user states');
      setUserType(null);
      setIsBusiness(false);
      setIsCommunity(false);
    }
  }, [user?.user_type]); // Only depend on user_type, not the entire user object

  const logout = async () => {
    try {
      setIsLoggingOut(true);
      console.log('AuthContext: Logging out user...');
      
      // Clear all auth data
      setUser(null);
      setAuthTokens(null);
      setUserType(null);
      setIsBusiness(false);
      setIsCommunity(false);
      
      // Clear localStorage
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      
      // Call logout API if we have a refresh token
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          await apiService.logout({ refresh: refreshToken });
        } catch (error) {
          console.warn('Logout API call failed, but continuing with local logout:', error);
        }
      }
      
      console.log('AuthContext: Logout completed');
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Session timeout handling - 15 minutes of inactivity
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let warningTimeoutId: NodeJS.Timeout;
    
    const resetTimeout = () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (warningTimeoutId) clearTimeout(warningTimeoutId);
      
      if (user) {
        // Set warning at 14 minutes (14 * 60 * 1000 = 840000ms)
        warningTimeoutId = setTimeout(() => {
          console.log('AuthContext: Session warning - user will be logged out in 1 minute');
          // Show toast notification for session warning
          toast.warning('Your session will expire in 1 minute due to inactivity. Please continue using the app to stay logged in.', {
            duration: 10000, // 10 seconds
            position: 'top-center',
          });
        }, 14 * 60 * 1000); // 14 minutes
        
        // Set 15 minute timeout (15 * 60 * 1000 = 900000ms)
        timeoutId = setTimeout(() => {
          console.log('AuthContext: Session timeout - logging out user due to inactivity');
          // Show logout notification
          toast.error('You have been logged out due to inactivity. Please log in again to continue.', {
            duration: 5000,
            position: 'top-center',
          });
          logout();
        }, 15 * 60 * 1000); // 15 minutes
      }
    };

    // Reset timeout on user activity
    const handleUserActivity = () => {
      if (user) {
        resetTimeout();
      }
    };

    // Add event listeners for user activity
    if (user) {
      resetTimeout();
      window.addEventListener('mousedown', handleUserActivity);
      window.addEventListener('keydown', handleUserActivity);
      window.addEventListener('touchstart', handleUserActivity);
      window.addEventListener('scroll', handleUserActivity);
      window.addEventListener('click', handleUserActivity);
      window.addEventListener('focus', handleUserActivity);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (warningTimeoutId) clearTimeout(warningTimeoutId);
      window.removeEventListener('mousedown', handleUserActivity);
      window.removeEventListener('keydown', handleUserActivity);
      window.removeEventListener('touchstart', handleUserActivity);
      window.removeEventListener('scroll', handleUserActivity);
      window.removeEventListener('click', handleUserActivity);
      window.removeEventListener('focus', handleUserActivity);
    };
  }, [user, logout]);

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
            console.log('AuthContext: User data from checkAuth:', userData);
            console.log('AuthContext: User type from checkAuth:', userData.user_type);
            
            setUser(userData);
            setUserType(userData.user_type);
            setIsBusiness(userData.user_type === 'business');
            setIsCommunity(userData.user_type === 'community');
            
            console.log('AuthContext: After setting states in checkAuth - isBusiness:', userData.user_type === 'business');
            console.log('AuthContext: After setting states in checkAuth - isCommunity:', userData.user_type === 'community');
            
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
          console.log('AuthContext: Mock user data from localStorage:', user);
          console.log('AuthContext: Mock user type from localStorage:', user.user_type);
          
          setUser(user);
          setUserType(user.user_type);
          setIsBusiness(user.user_type === 'business');
          setIsCommunity(user.user_type === 'community');
          
          console.log('AuthContext: After setting mock states - isBusiness:', user.user_type === 'business');
          console.log('AuthContext: After setting mock states - isCommunity:', user.user_type === 'community');
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
      const response: any = await apiService.login(data);
      console.log('AuthContext: Login response:', response);

      // Normalize response to { tokens, user }
      let tokens: AuthTokens | null = null;
      let currentUser: User | null = null;

      if (response?.tokens && response?.user) {
        tokens = response.tokens as AuthTokens;
        currentUser = response.user as User;
      } else {
        const access = response?.access || response?.access_token;
        const refresh = response?.refresh || response?.refresh_token;
        if (access && refresh) {
          tokens = { access, refresh } as AuthTokens;
          apiService.setAuthTokens(tokens);
          // Fetch full user details
          currentUser = await apiService.getCurrentUser();
        }
      }

      if (!tokens || !currentUser) {
        throw new Error('Invalid login response');
      }

      apiService.setAuthTokens(tokens);
      setUser(currentUser);
      setUserType(currentUser.user_type);
      setIsBusiness(currentUser.user_type === 'business');
      setIsCommunity(currentUser.user_type === 'community');

      console.log('AuthContext: After setting states - isBusiness:', currentUser.user_type === 'business');
      console.log('AuthContext: After setting states - isCommunity:', currentUser.user_type === 'community');
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
    user_id?: number; 
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
        const token = response.registration_token || response.user_id?.toString() || '';
        setRegistrationToken(token);
        setOtpSentTo(response.otp_sent_to || '');
        
        return {
          success: true,
          message: response.message,
          user_id: response.user_id,
          registration_token: response.registration_token,
          requires_otp: true,
          otp_sent_to: response.otp_sent_to
        };
      }
      
      return response;
    } catch (error: any) {
      console.error('Registration failed:', error);
      // If backend provided a response, propagate it for UI parsing
      if (error?.response?.data) {
        throw error; // Let the caller handle via error handler to extract field errors
      }
      // Fallback generic error
      throw error;
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
          message: 'No user ID found. Please register again.'
        };
      }
      
      const userId = parseInt(registrationToken);
      if (isNaN(userId)) {
        return {
          success: false,
          message: 'Invalid user ID. Please register again.'
        };
      }
      
      const response = await apiService.verifyRegistrationOTP(userId, otp);
      
      if (response.success && response.user && response.tokens) {
        // User activated successfully, set auth state
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
          message: 'No user ID found. Please register again.'
        };
      }
      
      const userId = parseInt(registrationToken);
      if (isNaN(userId)) {
        return {
          success: false,
          message: 'Invalid user ID. Please register again.'
        };
      }
      
      const response = await apiService.resendRegistrationOTP(userId);
      
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

  const forceReAuth = async () => {
    try {
      console.log('Forcing re-authentication...');
      setUser(null);
      setUserType(null);
      setIsBusiness(false);
      setIsCommunity(false);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      
      // Try to get fresh user data
      if (apiService.isAuthenticated()) {
        const userData = await apiService.getCurrentUser();
        console.log('AuthContext: Fresh user data from forceReAuth:', userData);
        console.log('AuthContext: Fresh user type from forceReAuth:', userData.user_type);
        
        setUser(userData);
        setUserType(userData.user_type);
        setIsBusiness(userData.user_type === 'business');
        setIsCommunity(userData.user_type === 'community');
        
        console.log('AuthContext: After setting fresh states - isBusiness:', userData.user_type === 'business');
        console.log('AuthContext: After setting fresh states - isCommunity:', userData.user_type === 'community');
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
        setUser(prevUser => {
          if (prevUser) {
            const updatedUser = { ...prevUser, ...data };
            // Ensure user_type is preserved
            if (!updatedUser.user_type && prevUser.user_type) {
              updatedUser.user_type = prevUser.user_type;
            }
            // Also ensure other critical fields are preserved
            if (!updatedUser.id && prevUser.id) {
              updatedUser.id = prevUser.id;
            }
            if (!updatedUser.partnership_number && prevUser.partnership_number) {
              updatedUser.partnership_number = prevUser.partnership_number;
            }
            return updatedUser;
          }
          return data as User;
        });
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

  return (
    <AuthContext.Provider value={contextValue}>
      {isLoading ? (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-fem-terracotta"></div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    // Instead of throwing an error immediately, return a default context
    // This prevents the "useAuth must be used within an AuthProvider" error
    console.warn('useAuth called outside of AuthProvider, returning default context');
    return {
      user: null,
      isAuthenticated: false,
      isBusiness: false,
      isCommunity: false,
      userType: null,
      isLoading: true,
      isLoggingOut: false,
      login: async () => { throw new Error('Auth not initialized'); },
      register: async () => { throw new Error('Auth not initialized'); },
      verifyRegistrationOTP: async () => { throw new Error('Auth not initialized'); },
      resendRegistrationOTP: async () => { throw new Error('Auth not initialized'); },
      logout: async () => { throw new Error('Auth not initialized'); },
      updateUser: async () => { throw new Error('Auth not initialized'); },
      registrationToken: null,
      otpSentTo: null,
      setTokens: () => { throw new Error('Auth not initialized'); },
      forceReAuth: async () => { throw new Error('Auth not initialized'); },
      isBusinessUser: () => false,
      isCommunityUser: () => false,
      canAccessBusinessFeatures: () => false
    };
  }
  return context;
}; 