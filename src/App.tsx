
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ErrorBoundary from "@/components/ui/ErrorBoundary";
import Index from "./pages/Index";
import JobsPage from "./pages/JobsPage";
import JobDetailPage from "./pages/JobDetailPage";
import JobApplicationPage from "./pages/JobApplicationPage";
import PostJobPage from "./pages/PostJobPage";
import JobPostedSuccessPage from "./pages/JobPostedSuccessPage";
import CreateProfilePage from "./pages/CreateProfilePage";
import AboutPage from "./pages/AboutPage";
import NotFound from "./pages/NotFound";
import SignInPage from "./pages/SignInPage";
import ChatPage from "./pages/ChatPage";
import ProfilePage from "./pages/ProfilePage";
import RegisterJobPosterPage from "./pages/RegisterJobPosterPage";

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
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/jobs" element={<JobsPage />} />
          <Route path="/jobs/:id" element={<JobDetailPage />} />
          <Route path="/jobs/:id/apply" element={<JobApplicationPage />} />
          <Route path="/post-job" element={<PostJobPage />} />
          <Route path="/job-posted-success" element={<JobPostedSuccessPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/register" element={<CreateProfilePage />} />
          <Route path="/register-job-poster" element={<RegisterJobPosterPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/login" element={<SignInPage />} />
          <Route path="/chat" element={<ChatPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
        <Sonner />
      </BrowserRouter>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
