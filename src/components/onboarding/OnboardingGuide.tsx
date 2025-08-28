import React, { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, Play, Users, Building2, Search, Star, MessageCircle, MapPin, Phone, Mail, Clock, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  target?: string;
}

interface OnboardingGuideProps {
  isOpen: boolean;
  onClose: () => void;
  userType: 'community' | 'business';
}

const OnboardingGuide: React.FC<OnboardingGuideProps> = ({ isOpen, onClose, userType }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setCurrentStep(0);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const nextStep = () => {
    if (currentStep < getSteps().length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getSteps = (): OnboardingStep[] => {
    if (userType === 'community') {
      return [
        {
          id: 'welcome',
          title: 'Welcome to Faith Connect!',
          description: 'Discover local businesses and connect with your community.',
          icon: <Users className="w-6 h-6 text-fem-terracotta" />
        },
        {
          id: 'search',
          title: 'Find Businesses',
          description: 'Use the search bar to find services you need.',
          icon: <Search className="w-6 h-6 text-fem-terracotta" />,
          target: '.search-container'
        },
        {
          id: 'directory',
          title: 'Business Directory',
          description: 'Browse all businesses by category or location.',
          icon: <Building2 className="w-6 h-6 text-fem-terracotta" />,
          target: '.directory-section'
        },
        {
          id: 'favorites',
          title: 'Save Favorites',
          description: 'Bookmark businesses you love for quick access.',
          icon: <Star className="w-6 h-6 text-fem-terracotta" />,
          target: '.favorites-section'
        },
        {
          id: 'contact',
          title: 'Get in Touch',
          description: 'Contact businesses directly through phone, email, or website.',
          icon: <MessageCircle className="w-6 h-6 text-fem-terracotta" />
        }
      ];
    } else {
      return [
        {
          id: 'welcome',
          title: 'Welcome Business Owner!',
          description: 'Grow your business and connect with customers.',
          icon: <Building2 className="w-6 h-6 text-fem-terracotta" />
        },
        {
          id: 'profile',
          title: 'Complete Your Profile',
          description: 'Add photos, descriptions, and contact information.',
          icon: <Users className="w-6 h-6 text-fem-terracotta" />,
          target: '.profile-section'
        },
        {
          id: 'services',
          title: 'List Your Services',
          description: 'Showcase what you offer with detailed descriptions.',
          icon: <Star className="w-6 h-6 text-fem-terracotta" />,
          target: '.services-section'
        },
        {
          id: 'hours',
          title: 'Set Business Hours',
          description: 'Let customers know when you\'re available.',
          icon: <Clock className="w-6 h-6 text-fem-terracotta" />,
          target: '.hours-section'
        },
        {
          id: 'grow',
          title: 'Grow Your Business',
          description: 'Get featured, respond to reviews, and attract more customers.',
          icon: <TrendingUp className="w-6 h-6 text-fem-terracotta" />
        }
      ];
    }
  };

  const steps = getSteps();
  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            {currentStepData.icon}
            <div>
              <h3 className="font-semibold text-fem-navy">
                {userType === 'community' ? 'Community Guide' : 'Business Guide'}
              </h3>
              <p className="text-sm text-gray-500">Step {currentStep + 1} of {steps.length}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6">
          <h2 className="text-xl font-bold text-fem-navy mb-3">
            {currentStepData.title}
          </h2>
          <p className="text-gray-600 mb-6 leading-relaxed">
            {currentStepData.description}
          </p>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
            <div
              className="bg-fem-terracotta h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
              className="border-fem-terracotta text-fem-terracotta hover:bg-fem-terracotta hover:text-white"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            <Button
              onClick={nextStep}
              className="bg-fem-terracotta hover:bg-fem-terracotta/90 text-white"
            >
              {isLastStep ? 'Get Started' : 'Next'}
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>

        {/* Skip Option */}
        <div className="px-6 pb-6 text-center">
          <Button
            variant="ghost"
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 text-sm"
          >
            Skip tour
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingGuide;
