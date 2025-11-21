import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Building2, ArrowRight, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

const UserTypeSelectionPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { getOTPData } = useAuth();
  const [selectedType, setSelectedType] = useState<'community' | 'business' | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Get userId from location state or OTP data
  const userId = location.state?.userId as number | undefined;
  const otpData = getOTPData();
  const finalUserId = userId || otpData?.userId;

  const handleTypeSelection = (type: 'community' | 'business') => {
    setSelectedType(type);
  };

  const handleContinue = async () => {
    if (!selectedType) return;

    setIsLoading(true);
    
    // Simulate a brief loading state for better UX
    setTimeout(() => {
      navigate('/profile-update', { state: { userType: selectedType, userId: finalUserId } });
    }, 500);
  };

  const userTypes = [
    {
      id: 'community' as const,
      title: 'Community Member',
      description: 'Join our community to discover and connect with faith-based businesses and services.',
      icon: Users,
      features: [
        'Browse business directory',
        'Save favorite businesses',
        'Read reviews and ratings',
        'Get personalized recommendations'
      ],
      color: 'from-fem-terracotta to-fem-gold',
      bgColor: 'bg-fem-lightgold/20',
      borderColor: 'border-fem-gold/30',
      textColor: 'text-fem-navy'
    },
    {
      id: 'business' as const,
      title: 'Business Owner',
      description: 'List your business and connect with the faith community to grow your customer base.',
      icon: Building2,
      features: [
        'Create business profile',
        'Manage products & services',
        'Connect with customers',
        'Track business analytics'
      ],
      color: 'from-fem-navy to-fem-terracotta',
      bgColor: 'bg-fem-gray/30',
      borderColor: 'border-fem-terracotta/30',
      textColor: 'text-fem-navy'
    }
  ];

  return (
    <div className="min-h-screen bg-white relative flex items-center justify-center p-4 sm:p-6 lg:p-8 py-8 sm:py-12">
      {/* Orange background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-gradient-radial from-fem-terracotta/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-gradient-radial from-fem-terracotta/20 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-6xl relative z-10 mx-auto">
        <Card className="shadow-2xl border-0 bg-white/15 backdrop-blur-xl border border-white/20">
          <CardHeader className="text-center pb-6 sm:pb-8 pt-6 sm:pt-8 px-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-fem-navy mb-3 sm:mb-4">
              Select Account Type
            </h1>
            <p className="text-fem-darkgray text-sm sm:text-base max-w-2xl mx-auto px-2">
              Choose how you'd like to use Faith Connect. You can always change this later in your profile settings.
            </p>
          </CardHeader>

          <CardContent className="px-4 sm:px-6 lg:px-8 pb-6 sm:pb-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
              {userTypes.map((type) => {
                const Icon = type.icon;
                const isSelected = selectedType === type.id;
                
                return (
                  <Card
                    key={type.id}
                    className={cn(
                      'cursor-pointer transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]',
                      'border-2 hover:shadow-xl backdrop-blur-sm',
                      'min-h-[280px] sm:min-h-[320px]',
                      isSelected
                        ? `${type.borderColor} shadow-xl bg-white/20 scale-[1.02]`
                        : 'border-gray-300 hover:border-fem-terracotta/50 bg-white/10 hover:bg-white/15'
                    )}
                    onClick={() => handleTypeSelection(type.id)}
                  >
                    <CardContent className="p-4 sm:p-5 lg:p-6">
                      <div className="flex items-start justify-between mb-4 sm:mb-5">
                        <div className={cn(
                          'w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center',
                          `bg-gradient-to-br ${type.color} shadow-lg`
                        )}>
                          <Icon className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                        </div>
                        {isSelected && (
                          <div className="w-7 h-7 sm:w-8 sm:h-8 bg-green-500 rounded-full flex items-center justify-center shadow-md">
                            <Check className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                          </div>
                        )}
                      </div>

                      <h3 className="text-lg sm:text-xl font-bold text-fem-navy mb-2 sm:mb-3">
                        {type.title}
                      </h3>
                      
                      <p className="text-fem-darkgray text-sm sm:text-base mb-4 sm:mb-5 leading-relaxed">
                        {type.description}
                      </p>

                      <ul className="space-y-2 sm:space-y-3">
                        {type.features.map((feature, index) => (
                          <li key={index} className="flex items-start text-sm sm:text-base text-fem-darkgray">
                            <div className="w-2 h-2 bg-fem-terracotta rounded-full mr-2.5 sm:mr-3 mt-0.5 flex-shrink-0"></div>
                            <span className="leading-snug">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Button
                onClick={() => navigate('/login')}
                variant="outline"
                className="h-12 px-6 sm:px-8 border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-700 rounded-xl transition-all duration-300 w-full sm:w-auto"
              >
                Back to Login
              </Button>
              
              <Button
                onClick={handleContinue}
                disabled={!selectedType || isLoading}
                size="lg"
                className="w-full sm:w-auto h-12 px-6 sm:px-8 bg-gradient-to-r from-fem-terracotta to-fem-gold hover:from-fem-terracotta/90 hover:to-fem-gold/90 text-white shadow-lg hover:shadow-xl transition-all duration-500 border border-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Loading...
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </div>

            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                Don't worry, you can always change your account type later in your profile settings.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserTypeSelectionPage;
