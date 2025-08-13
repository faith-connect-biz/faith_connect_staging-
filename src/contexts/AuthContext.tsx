import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiService, User, LoginRequest, RegisterRequest, AuthTokens } from '@/services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isLoggingOut: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<{ user: User; tokens: AuthTokens }>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<void>;
  setUser: (user: User | null) => void;
  forceReAuth: () => Promise<void>;
  isBusinessUser: () => boolean;
  isCommunityUser: () => boolean;
  canAccessBusinessFeatures: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

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

  const register = async (data: RegisterRequest) => {
    try {
      setIsLoading(true);
      const response = await apiService.register(data);
      apiService.setAuthTokens(response.tokens);
      setUser(response.user);
      return response; // Return the response so we can access user data
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
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
      const updatedUser = await apiService.updateProfile(data);
      setUser(updatedUser);
    } catch (error) {
      console.error('Profile update failed:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    isLoggingOut,
    login,
    register,
    logout,
    updateUser,
    setUser,
    forceReAuth,
    isBusinessUser: () => user?.user_type === 'business',
    isCommunityUser: () => user?.user_type === 'community',
    canAccessBusinessFeatures: () => user?.user_type === 'business',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 