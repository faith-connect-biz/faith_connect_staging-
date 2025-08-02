
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ErrorBoundary from "@/components/ui/ErrorBoundary";
import { OnboardingProvider } from "@/contexts/OnboardingContext";
import Index from "./pages/Index";
import DirectoryPage from "./pages/DirectoryPage";
import AboutPage from "./pages/AboutPage";
import NotFound from "./pages/NotFound";
import SignInPage from "./pages/SignInPage";
import ChatPage from "./pages/ChatPage";
import ProfilePage from "./pages/ProfilePage";

import BusinessDetailPage from "./pages/BusinessDetailPage";
import BusinessRegistrationPage from "./pages/BusinessRegistrationPage";
import BusinessRegistrationSuccessPage from "./pages/BusinessRegistrationSuccessPage";
import UserRegistrationPage from "./pages/UserRegistrationPage";
import WelcomePage from "./pages/WelcomePage";
import BusinessOnboardingPage from "./pages/BusinessOnboardingPage";

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
        <OnboardingProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/directory" element={<DirectoryPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/login" element={<SignInPage />} />
            <Route path="/register" element={<UserRegistrationPage />} />
            <Route path="/welcome" element={<WelcomePage />} />
            <Route path="/business-onboarding" element={<BusinessOnboardingPage />} />
            <Route path="/chat" element={<ChatPage />} />

            <Route path="/business/:id" element={<BusinessDetailPage />} />
            <Route path="/register-business" element={<BusinessRegistrationPage />} />
            <Route path="/business-registration-success" element={<BusinessRegistrationSuccessPage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
          <Sonner />
        </OnboardingProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
