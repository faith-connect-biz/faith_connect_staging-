import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface User {
  id: string;
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  userType?: 'community' | 'business';
  profilePicture?: string;
  bio?: string;
  isComplete?: boolean;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  sessionExpiryTime: number | null;
  timeUntilLogout: number | null;
}

export interface AuthContextType extends AuthState {
  login: (userData: User, tokens: AuthTokens) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  setOTPData: (data: { contact: string; method: 'email' | 'phone' }) => void;
  getOTPData: () => { contact: string; method: 'email' | 'phone' } | null;
  clearOTPData: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [tokens, setTokens] = useState<AuthTokens | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionExpiryTime, setSessionExpiryTime] = useState<number | null>(null);
  const [timeUntilLogout, setTimeUntilLogout] = useState<number | null>(null);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedUser = localStorage.getItem('user');
        const storedTokens = localStorage.getItem('tokens');
        const storedExpiry = localStorage.getItem('sessionExpiry');

        if (storedUser && storedTokens && storedExpiry) {
          const userData = JSON.parse(storedUser);
          const tokenData = JSON.parse(storedTokens);
          const expiryTime = parseInt(storedExpiry);

          // Check if session is still valid
          if (Date.now() < expiryTime) {
            setUser(userData);
            setTokens(tokenData);
            setSessionExpiryTime(expiryTime);
          } else {
            // Session expired, clear storage
            localStorage.removeItem('user');
            localStorage.removeItem('tokens');
            localStorage.removeItem('sessionExpiry');
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        // Clear corrupted data
        localStorage.removeItem('user');
        localStorage.removeItem('tokens');
        localStorage.removeItem('sessionExpiry');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Session expiry timer
  useEffect(() => {
    if (sessionExpiryTime) {
      const timer = setInterval(() => {
        const now = Date.now();
        const timeLeft = sessionExpiryTime - now;

        if (timeLeft <= 0) {
          logout();
      } else {
          setTimeUntilLogout(timeLeft);
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [sessionExpiryTime]);

  const login = (userData: User, tokens: AuthTokens) => {
    setUser(userData);
    setTokens(tokens);
    
    // Set session expiry to 12 hours from now
    const expiryTime = Date.now() + (12 * 60 * 60 * 1000);
    setSessionExpiryTime(expiryTime);
    
    // Store in localStorage
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('tokens', JSON.stringify(tokens));
    localStorage.setItem('sessionExpiry', expiryTime.toString());
  };

  const logout = () => {
    setUser(null);
    setTokens(null);
    setSessionExpiryTime(null);
    setTimeUntilLogout(null);
    
    // Clear localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('tokens');
    localStorage.removeItem('sessionExpiry');
    localStorage.removeItem('otpData');
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const setOTPData = (data: { contact: string; method: 'email' | 'phone' }) => {
    localStorage.setItem('otpData', JSON.stringify(data));
  };

  const getOTPData = (): { contact: string; method: 'email' | 'phone' } | null => {
    try {
      const stored = localStorage.getItem('otpData');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  };

  const clearOTPData = () => {
    localStorage.removeItem('otpData');
  };

  const isAuthenticated = !!user && !!tokens;

  const contextValue: AuthContextType = {
    user,
    tokens,
    isAuthenticated,
    isLoading,
    sessionExpiryTime,
    timeUntilLogout,
    login,
    logout,
    updateUser,
    setOTPData,
    getOTPData,
    clearOTPData,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}; 
