import React, { useState, useEffect } from 'react';
import { X, Play, Users, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

interface WelcomeBannerProps {
  onStartTour: () => void;
}

const WelcomeBanner: React.FC<WelcomeBannerProps> = ({ onStartTour }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    // Show banner for first-time users (not dismissed)
    const hasSeenBanner = localStorage.getItem('welcome_banner_dismissed');
    if (!hasSeenBanner && !isDismissed) {
      setTimeout(() => setIsVisible(true), 1000);
    }
  }, [isDismissed]);

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    localStorage.setItem('welcome_banner_dismissed', 'true');
  };

  const handleStartTour = () => {
    handleDismiss();
    onStartTour();
  };

  if (!isVisible || isDismissed) return null;

  const getUserType = () => {
    if (!isAuthenticated) return 'community';
    return user?.user_type === 'business' ? 'business' : 'community';
  };

  const userType = getUserType();

  return (
    <div className="fixed top-20 left-4 right-4 z-40 bg-gradient-to-r from-fem-navy to-fem-terracotta text-white rounded-lg shadow-2xl p-6 transform transition-all duration-500">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="bg-white/20 rounded-full p-3">
            {userType === 'business' ? (
              <Building2 className="w-6 h-6 text-white" />
            ) : (
              <Users className="w-6 h-6 text-white" />
            )}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold mb-2">
              Welcome to Faith Connect!
            </h3>
            <p className="text-white/90 mb-4 leading-relaxed">
              {userType === 'business' 
                ? 'Get started by completing your business profile and listing your services. Our quick guide will show you everything you need to know!'
                : 'Discover local businesses, save your favorites, and connect with your community. Let us show you around!'
              }
            </p>
            <div className="flex gap-3">
              <Button
                onClick={handleStartTour}
                className="bg-white text-fem-navy hover:bg-white/90 font-semibold"
              >
                <Play className="w-4 h-4 mr-2" />
                Start Quick Tour
              </Button>
              <Button
                variant="outline"
                onClick={handleDismiss}
                className="border-white/30 text-white hover:bg-white/20"
              >
                Maybe Later
              </Button>
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDismiss}
          className="text-white/70 hover:text-white hover:bg-white/20"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};

export default WelcomeBanner;
