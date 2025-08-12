
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ErrorBoundary from "@/components/ui/ErrorBoundary";
import { OnboardingProvider } from "@/contexts/OnboardingContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { BusinessProvider } from "@/contexts/BusinessContext";
import Index from "./pages/Index";
import DirectoryPage from "./pages/DirectoryPage";
import AboutPage from "./pages/AboutPage";
import NotFound from "./pages/NotFound";

import ProfilePage from "./pages/ProfilePage";

import BusinessDetailPage from "./pages/BusinessDetailPage";
import BusinessRegistrationPage from "./pages/BusinessRegistrationPage";
import BusinessRegistrationSuccessPage from "./pages/BusinessRegistrationSuccessPage";
import WelcomePage from "./pages/WelcomePage";
import BusinessOnboardingPage from "./pages/BusinessOnboardingPage";
import { BusinessManagementPage } from "./pages/BusinessManagementPage";
import { OTPVerificationPage } from "@/components/otp/OTPVerificationPage";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <BusinessProvider>
            <OnboardingProvider>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/directory" element={<DirectoryPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/welcome" element={<WelcomePage />} />
                <Route path="/business-onboarding" element={<BusinessOnboardingPage />} />
        

                <Route path="/business/:id" element={<BusinessDetailPage />} />
                <Route path="/register-business" element={
                  <ProtectedRoute requireBusinessUser={true}>
                    <BusinessRegistrationPage />
                  </ProtectedRoute>
                } />
                <Route path="/business-registration-success" element={<BusinessRegistrationSuccessPage />} />
                <Route path="/manage-business" element={
                  <ProtectedRoute requireBusinessUser={true}>
                    <BusinessManagementPage />
                  </ProtectedRoute>
                } />
                <Route path="/verify-otp" element={<OTPVerificationPage />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Toaster />
              <Sonner />
            </OnboardingProvider>
          </BusinessProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
