import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import OnboardingGuide from './OnboardingGuide';

interface HelpButtonProps {
  onStartTour?: () => void;
}

const HelpButton: React.FC<HelpButtonProps> = ({ onStartTour }) => {
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();

  const handleHelpClick = () => {
    if (onStartTour) {
      onStartTour();
    } else {
      setIsGuideOpen(true);
    }
  };

  const closeGuide = () => {
    setIsGuideOpen(false);
  };

  // Determine user type for the guide
  const getUserType = () => {
    if (!isAuthenticated) return 'community';
    return user?.user_type === 'business' ? 'business' : 'community';
  };

  return (
    <>
      {/* Floating Help Button */}
      <Button
        onClick={handleHelpClick}
        className="fixed bottom-6 right-6 z-40 bg-fem-terracotta hover:bg-fem-terracotta/90 text-white rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-all duration-300 group"
        size="icon"
        title="Get Help & Start Tour"
      >
        <HelpCircle className="w-6 h-6 group-hover:scale-110 transition-transform duration-200" />
      </Button>

      {/* Onboarding Guide */}
      <OnboardingGuide
        isOpen={isGuideOpen}
        onClose={closeGuide}
        userType={getUserType()}
      />
    </>
  );
};

export default HelpButton;
