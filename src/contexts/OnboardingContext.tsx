import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { OnboardingModal } from "@/components/OnboardingModal";

interface OnboardingContextType {
  showOnboarding: (userType: "community" | "business") => void;
  hideOnboarding: () => void;
  isOnboardingOpen: boolean;
  currentUserType: "community" | "business" | null;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error("useOnboarding must be used within an OnboardingProvider");
  }
  return context;
};

interface OnboardingProviderProps {
  children: ReactNode;
}

export const OnboardingProvider = ({ children }: OnboardingProviderProps) => {
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [currentUserType, setCurrentUserType] = useState<"community" | "business" | null>(null);
  const navigate = useNavigate();

  const showOnboarding = (userType: "community" | "business") => {
    setCurrentUserType(userType);
    setIsOnboardingOpen(true);
  };

  const hideOnboarding = () => {
    setIsOnboardingOpen(false);
    setCurrentUserType(null);
  };

  const handleOnboardingComplete = () => {
    hideOnboarding();
    
    // Navigate based on user type
    if (currentUserType === "community") {
      navigate("/");
    } else if (currentUserType === "business") {
      navigate("/register-business");
    }
  };

  return (
    <OnboardingContext.Provider
      value={{
        showOnboarding,
        hideOnboarding,
        isOnboardingOpen,
        currentUserType,
      }}
    >
      {children}
      <OnboardingModal
        userType={currentUserType as "community" | "business"}
        isOpen={isOnboardingOpen}
        onComplete={handleOnboardingComplete}
      />
    </OnboardingContext.Provider>
  );
}; 