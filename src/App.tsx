
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ErrorBoundary from "@/components/ui/ErrorBoundary";
import { OnboardingProvider } from "@/contexts/OnboardingContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { BusinessProvider } from "@/contexts/BusinessContext";
import PWAInstallPrompt from "@/components/pwa/PWAInstallPrompt";
import Index from "./pages/Index";
import DirectoryPage from "./pages/DirectoryPage";
import EpicSearchPage from "./pages/EpicSearchPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import FavoritesPage from "./pages/FavoritesPage";
import NotFound from "./pages/NotFound";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import TermsAndConditionsPage from "./pages/TermsAndConditionsPage";
import FAQPage from "./pages/FAQPage";

import ProfilePage from "./pages/ProfilePage";

import BusinessDetailPage from "./pages/BusinessDetailPage";
import BusinessRegistrationPage from "./pages/BusinessRegistrationPage";
import BusinessRegistrationSuccessPage from "./pages/BusinessRegistrationSuccessPage";
import WelcomePage from "./pages/WelcomePage";
import BusinessOnboardingPage from "./pages/BusinessOnboardingPage";
import { BusinessManagementPage } from "./pages/BusinessManagementPage";
import { ProductDetailPage } from "./pages/ProductDetailPage";
import { ServiceDetailPage } from "./pages/ServiceDetailPage";
import { OTPVerificationPage } from "@/components/otp/OTPVerificationPage";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import SignupOTPPage from "./pages/otp/SignupOTPPage";
import PasswordResetOTPPage from "./pages/otp/PasswordResetOTPPage";
import OTPTestPage from "./pages/OTPTestPage";
import NewPasswordPage from "./pages/NewPasswordPage";

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
                <Route path="/epic-search" element={<EpicSearchPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/favorites" element={<FavoritesPage />} />
                <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                <Route path="/terms-and-conditions" element={<TermsAndConditionsPage />} />
                <Route path="/faq" element={<FAQPage />} />
                <Route path="/welcome" element={<WelcomePage />} />
                <Route path="/business-onboarding" element={<BusinessOnboardingPage />} />
        

                <Route path="/business/:id" element={<BusinessDetailPage />} />
                <Route path="/product/:id" element={<ProductDetailPage />} />
                <Route path="/service/:id" element={<ServiceDetailPage />} />
                <Route path="/category/:categorySlug/product/:productSlug" element={<ProductDetailPage />} />
                <Route path="/category/:categorySlug/service/:serviceSlug" element={<ServiceDetailPage />} />
                <Route path="/register-business" element={
                  <ProtectedRoute requireBusinessUser={true}>
                    <BusinessRegistrationPage />
                  </ProtectedRoute>
                } />
                <Route path="/business/register" element={
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
                <Route path="/signup-otp" element={<SignupOTPPage />} />
                <Route path="/password-reset-otp" element={<PasswordResetOTPPage />} />
                <Route path="/otp-test" element={<OTPTestPage />} />
                <Route path="/new-password" element={<NewPasswordPage />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Toaster />
              <Sonner />
              <PWAInstallPrompt />
            </OnboardingProvider>
          </BusinessProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
