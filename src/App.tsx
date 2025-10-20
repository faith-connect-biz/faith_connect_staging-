import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ErrorBoundary from "@/components/ui/ErrorBoundary";
import { OnboardingProvider } from "@/contexts/OnboardingContext";
import { BusinessProvider } from "@/contexts/BusinessContext";
import { AuthProvider } from "@/contexts/AuthContext";
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
// Authentication pages
import LoginPage from "./pages/LoginPage";
import OTPVerificationPage from "./pages/OTPVerificationPage";
import UserTypeSelectionPage from "./pages/UserTypeSelectionPage";
import ProfileUpdatePage from "./pages/ProfileUpdatePage";
import AuthDemoPage from "./pages/AuthDemoPage";

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
      <BrowserRouter future={{ v7_startTransition: true }}>
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
                <Route path="/register-business" element={<BusinessRegistrationPage />} />
                <Route path="/business/register" element={<BusinessRegistrationPage />} />
                <Route path="/business-registration" element={<BusinessRegistrationPage />} />
                <Route path="/business-registration-success" element={<BusinessRegistrationSuccessPage />} />
                <Route path="/manage-business" element={<BusinessManagementPage />} />
                {/* Authentication routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/verify-otp" element={<OTPVerificationPage />} />
                <Route path="/user-type-selection" element={<UserTypeSelectionPage />} />
                <Route path="/profile-update" element={<ProfileUpdatePage />} />
                <Route path="/auth-demo" element={<AuthDemoPage />} />
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