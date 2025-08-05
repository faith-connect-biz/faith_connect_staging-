import { useEffect } from "react";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { useAuth } from "@/contexts/AuthContext";

interface OnboardingCheckProps {
  userType: "community" | "business";
}

export const OnboardingCheck = ({ userType }: OnboardingCheckProps) => {
  const { showOnboarding } = useOnboarding();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    // Check if user is logged in
    if (!isAuthenticated) return;

    // Check if user has seen onboarding before
    const hasSeenOnboarding = localStorage.getItem("hasSeenOnboarding");
    const hasSeenBusinessOnboarding = localStorage.getItem("hasSeenBusinessOnboarding");
    
    // Check if this is a first-time login
    const isFirstTimeLogin = localStorage.getItem("isFirstTimeLogin") === "true";
    
    if (isFirstTimeLogin) {
      // Mark as not first time anymore
      localStorage.setItem("isFirstTimeLogin", "false");
      
      // Show appropriate onboarding
      if (userType === "business" && hasSeenBusinessOnboarding !== "true") {
        showOnboarding("business");
      } else if (userType === "community" && hasSeenOnboarding !== "true") {
        showOnboarding("community");
      }
    }
  }, [isAuthenticated, userType, showOnboarding]);

  return null;
}; 