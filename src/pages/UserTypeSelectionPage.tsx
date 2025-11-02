import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Building2, ArrowRight, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const UserTypeSelectionPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState<'community' | 'business' | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleTypeSelection = (type: 'community' | 'business') => {
    setSelectedType(type);
  };

  const handleContinue = async () => {
    if (!selectedType) return;

    setIsLoading(true);
    
    // Simulate a brief loading state for better UX
    setTimeout(() => {
      navigate('/profile-update', { state: { userType: selectedType } });
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
    <div className="min-h-screen bg-white relative flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Orange background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-gradient-radial from-fem-terracotta/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-gradient-radial from-fem-terracotta/20 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-4xl sm:max-w-5xl relative z-10 mx-4 sm:mx-0">
        <Card className="shadow-2xl border-0 bg-white/15 backdrop-blur-xl border border-white/20">
          <CardHeader className="text-center pb-8 pt-8 px-6 sm:px-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-fem-navy mb-2">
              Select Your Account Type
            </h1>
            <p className="text-fem-darkgray text-sm sm:text-base max-w-md mx-auto">
              Please choose how you'd like to use Faith Connect. This helps us personalize your experience. You can change this later in your profile settings.
            </p>
          </CardHeader>

          <CardContent className="px-8 pb-8">
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {userTypes.map((type) => {
                const Icon = type.icon;
                const isSelected = selectedType === type.id;
                
                return (
                  <Card
                    key={type.id}
                    className={cn(
                      'cursor-pointer transition-all duration-500 transform hover:scale-105',
                      'border-2 hover:shadow-xl backdrop-blur-sm',
                      isSelected
                        ? `${type.borderColor} shadow-xl scale-105 bg-white/20`
                        : 'border-white/20 hover:border-white/30 bg-white/10'
                    )}
                    onClick={() => handleTypeSelection(type.id)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className={cn(
                          'w-12 h-12 rounded-xl flex items-center justify-center',
                          `bg-gradient-to-br ${type.color}`
                        )}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        {isSelected && (
                          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>

                      <h3 className="text-xl font-semibold text-fem-navy mb-2">
                        {type.title}
                      </h3>
                      
                      <p className="text-fem-darkgray text-sm mb-4">
                        {type.description}
                      </p>

                      <ul className="space-y-2">
                        {type.features.map((feature, index) => (
                          <li key={index} className="flex items-center text-sm text-fem-darkgray">
                            <div className="w-1.5 h-1.5 bg-fem-terracotta rounded-full mr-3 flex-shrink-0"></div>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => navigate('/login')}
                variant="outline"
                className="h-12 px-8 border-white/20 hover:border-white/30 hover:bg-white/10 rounded-xl transition-all duration-500 backdrop-blur-sm"
              >
                Back to Login
              </Button>
              
              <Button
                onClick={handleContinue}
                disabled={!selectedType || isLoading}
                size="lg"
                variant={selectedType === 'community' ? 'default' : selectedType === 'business' ? 'navy' : 'secondary'}
                className="w-full sm:w-auto"
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

            {!selectedType && (
              <div className="mt-6 text-center">
                <p className="text-sm text-fem-terracotta font-medium">
                  Please select an account type to continue
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserTypeSelectionPage;
