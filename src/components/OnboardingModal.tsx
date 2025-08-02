import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ChevronRight, 
  ChevronLeft, 
  X, 
  Building2, 
  Users, 
  MessageCircle, 
  Search, 
  Package, 
  Settings, 
  Star,
  CheckCircle,
  ArrowRight,
  ShoppingBag,
  Heart,
  Camera
} from "lucide-react";

interface OnboardingModalProps {
  userType: "community" | "business";
  isOpen: boolean;
  onComplete: () => void;
}

const communitySteps = [
  {
    title: "Welcome to Faith Connect!",
    subtitle: "Your journey begins here",
    content: "We're excited to have you join our community. Faith Connect helps you discover and connect with trusted businesses within our church family.",
    icon: Heart,
    color: "from-fem-navy to-fem-terracotta"
  },
  {
    title: "Explore Businesses",
    subtitle: "Browse categories and search",
    content: "Discover trusted businesses in our community. Browse by category, search for specific services, and view detailed business profiles with photos and reviews.",
    icon: Search,
    color: "from-fem-terracotta to-fem-gold"
  },
  {
    title: "View Products & Services",
    subtitle: "See what businesses offer",
    content: "Each business profile shows their services and products with pricing. You can view photos, read descriptions, and get contact information.",
    icon: Package,
    color: "from-fem-gold to-fem-navy"
  },
  {
    title: "Connect with Businesses",
    subtitle: "Reach out and engage",
    content: "Use our built-in chat to communicate with business owners, ask questions, schedule appointments, and build meaningful relationships.",
    icon: MessageCircle,
    color: "from-fem-navy to-fem-terracotta"
  },
  {
    title: "You're Ready!",
    subtitle: "Let's begin your journey",
    content: "You're all set to start exploring our business directory. Click 'Get Started' to begin discovering trusted businesses in our community!",
    icon: CheckCircle,
    color: "from-fem-terracotta to-fem-gold"
  }
];

const businessSteps = [
  {
    title: "Welcome Business Owner!",
    subtitle: "Your business journey begins here",
    content: "We're excited to have your business join our community. Faith Connect helps you showcase your services and products to our trusted church family.",
    icon: Building2,
    color: "from-fem-navy to-fem-terracotta"
  },
  {
    title: "Create Your Business Profile",
    subtitle: "Showcase your business",
    content: "Start by creating your business profile with contact information, services, photos, and business details. This helps community members discover and trust your business.",
    icon: Settings,
    color: "from-fem-terracotta to-fem-gold"
  },
  {
    title: "Post Your Services & Products",
    subtitle: "Display what you offer",
    content: "Add your services and products with pricing information. Community members can browse and find exactly what they need from your business.",
    icon: ShoppingBag,
    color: "from-fem-gold to-fem-navy"
  },
  {
    title: "Connect with Community",
    subtitle: "Build meaningful relationships",
    content: "Use our built-in chat to communicate with community members, answer questions, schedule appointments, and grow your customer base.",
    icon: Users,
    color: "from-fem-navy to-fem-terracotta"
  },
  {
    title: "You're Ready!",
    subtitle: "Let's grow your business",
    content: "You're all set to start your business journey with Faith Connect. Click 'Get Started' to begin creating your business profile!",
    icon: Star,
    color: "from-fem-terracotta to-fem-gold"
  }
];

export const OnboardingModal = ({ userType, isOpen, onComplete }: OnboardingModalProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const navigate = useNavigate();
  
  const steps = userType === "community" ? communitySteps : businessSteps;
  
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
    }
  }, [isOpen]);

  const handleNext = async () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Mark onboarding as complete
      const key = userType === "community" ? "hasSeenOnboarding" : "hasSeenBusinessOnboarding";
      localStorage.setItem(key, "true");
      
      // Animate out before navigation
      await new Promise(resolve => setTimeout(resolve, 500));
      onComplete();
    }
    
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const handlePrev = () => {
    if (isTransitioning || currentStep === 0) return;
    setIsTransitioning(true);
    setCurrentStep(currentStep - 1);
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const handleSkip = () => {
    const key = userType === "community" ? "hasSeenOnboarding" : "hasSeenBusinessOnboarding";
    localStorage.setItem(key, "true");
    onComplete();
  };

  const handleStepClick = (stepIndex: number) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentStep(stepIndex);
    setTimeout(() => setIsTransitioning(false), 300);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="w-full max-w-4xl max-h-[90vh] overflow-hidden"
        >
          <Card className="relative h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-fem-navy to-fem-terracotta rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="font-semibold text-fem-navy">
                    {userType === "community" ? "Community Member" : "Business Directory"} Onboarding
                  </h2>
                  <p className="text-sm text-gray-600">Step {currentStep + 1} of {steps.length}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSkip}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Content */}
            <div className="flex-1 p-6">
              <div className="flex items-center justify-center min-h-[400px]">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="text-center max-w-2xl"
                >
                  {/* Icon */}
                  <div className="mb-6">
                    <div className={`w-20 h-20 bg-gradient-to-r ${steps[currentStep].color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                      {(() => {
                        const IconComponent = steps[currentStep].icon;
                        return <IconComponent className="w-10 h-10 text-white" />;
                      })()}
                    </div>
                  </div>

                  {/* Title and Subtitle */}
                  <h1 className="text-3xl font-bold text-fem-navy mb-2">
                    {steps[currentStep].title}
                  </h1>
                  <p className="text-lg text-fem-terracotta mb-6">
                    {steps[currentStep].subtitle}
                  </p>

                  {/* Content */}
                  <p className="text-gray-700 text-lg leading-relaxed">
                    {steps[currentStep].content}
                  </p>
                </motion.div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t bg-gray-50">
              {/* Progress Indicators */}
              <div className="flex items-center justify-center gap-2 mb-6">
                {steps.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => handleStepClick(index)}
                    className={`w-3 h-3 rounded-full transition-all ${
                      index === currentStep
                        ? "bg-fem-terracotta scale-125"
                        : index < currentStep
                        ? "bg-fem-gold"
                        : "bg-gray-300 hover:bg-gray-400"
                    }`}
                  />
                ))}
              </div>

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={handlePrev}
                  disabled={currentStep === 0 || isTransitioning}
                  className="flex items-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>

                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    onClick={handleSkip}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    Skip
                  </Button>
                  <Button
                    onClick={handleNext}
                    disabled={isTransitioning}
                    className="bg-fem-terracotta hover:bg-fem-terracotta/90 text-white flex items-center gap-2"
                  >
                    {currentStep === steps.length - 1 ? (
                      <>
                        Get Started
                        <ArrowRight className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        Next
                        <ChevronRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}; 