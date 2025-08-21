import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireBusinessUser?: boolean;
  requireCommunityUser?: boolean;
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireBusinessUser = false,
  requireCommunityUser = false,
  redirectTo = '/'
}) => {
  const { isAuthenticated, isLoading, isBusinessUser, isCommunityUser } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-fem-terracotta"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to home page and show login modal
    return <Navigate to={redirectTo} state={{ from: location, showLogin: true }} replace />;
  }

  // Check if business user access is required
  if (requireBusinessUser && !isBusinessUser()) {
    return (
      <Navigate 
        to={redirectTo} 
        state={{ 
          from: location, 
          error: 'Business account required. Please log in with a business account to access this feature.' 
        }} 
        replace 
      />
    );
  }

  // Check if community user access is required
  if (requireCommunityUser && !isCommunityUser()) {
    return (
      <Navigate 
        to={redirectTo} 
        state={{ 
          from: location, 
          error: 'Community account required. Please log in with a community account to access this feature.' 
        }} 
        replace 
      />
    );
  }

  return <>{children}</>;
};
