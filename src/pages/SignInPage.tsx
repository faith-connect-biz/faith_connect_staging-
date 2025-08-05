
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from "@/components/ui/card";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { useAuth } from "@/contexts/AuthContext";

const SignInPage = () => {
  const [password, setPassword] = useState("");
  const [partnershipNumber, setPartnershipNumber] = useState("");
  const [userType, setUserType] = useState("community");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { showOnboarding } = useOnboarding();
  const { login, setUser } = useAuth();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // For demo purposes, we'll create a mock user and tokens
      // In a real app, this would call the actual login API
      if (password && partnershipNumber) {
        // Create mock user data
        const mockUser = {
          id: "1",
          first_name: "Demo",
          last_name: "User",
          partnership_number: partnershipNumber,
          email: "user@faithconnect.com",
          user_type: userType as "community" | "business",
          is_verified: true,
          email_verified: true,
          phone_verified: false,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        // Create mock tokens
        const mockTokens = {
          access: "mock-access-token-" + Date.now(),
          refresh: "mock-refresh-token-" + Date.now()
        };

        // For demo purposes, we'll bypass the API call and set up mock authentication
        // In a real app, this would call the actual login API

        // Set tokens in localStorage (this is what AuthContext expects)
        localStorage.setItem('access_token', mockTokens.access);
        localStorage.setItem('refresh_token', mockTokens.refresh);

        // Set user data in localStorage for demo purposes
        localStorage.setItem('user', JSON.stringify(mockUser));
        
        // Update AuthContext state
        setUser(mockUser);

        // For testing: Clear onboarding flags to ensure onboarding shows
        localStorage.removeItem("hasSeenOnboarding");
        localStorage.removeItem("hasSeenBusinessOnboarding");
        localStorage.removeItem("isFirstTimeLogin");
        
        // Check if this is the first time logging in
        const hasLoggedInBefore = localStorage.getItem("hasLoggedInBefore");
        if (!hasLoggedInBefore) {
          localStorage.setItem("hasLoggedInBefore", "true");
        }
        
        toast({
          title: "Sign in successful",
          description: "Welcome to Faith Connect!",
        });
        
        // Check if user has seen onboarding before
        const hasSeenOnboarding = localStorage.getItem("hasSeenOnboarding");
        const hasSeenBusinessOnboarding = localStorage.getItem("hasSeenBusinessOnboarding");
        
        // For demo purposes, always show onboarding for first-time users
        if (userType === "business") {
          if (hasSeenBusinessOnboarding !== "true") {
            // Show onboarding modal for first-time business users
            showOnboarding("business");
          } else {
            // Navigate directly to business registration
            navigate("/register-business");
          }
        } else {
          if (hasSeenOnboarding !== "true") {
            // Show onboarding modal for first-time community users
            showOnboarding("community");
          } else {
            // Navigate directly to home page
            navigate("/");
          }
        }
      } else {
        toast({
          title: "Sign in failed",
          description: "Please check your password and partnership number",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Sign in failed",
        description: "Please check your credentials and try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-grow flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center text-fem-navy">Sign In to Faith Connect</CardTitle>
            <CardDescription className="text-center text-fem-darkgray">
              Use your partnership number to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="partnershipNumber" className="text-sm font-medium">
                  Partnership Number <span className="text-fem-terracotta">*</span>
                </label>
                <Input
                  id="partnershipNumber"
                  type="text"
                  placeholder="Enter your unique partnership number"
                  value={partnershipNumber}
                  onChange={(e) => setPartnershipNumber(e.target.value)}
                  required
                  className="border-fem-navy/20 focus:border-fem-terracotta"
                />
                <p className="text-xs text-gray-500">
                  Your partnership number is your unique identifier in our church community
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-sm font-medium">Password</label>
                  <Link to="/forgot-password" className="text-xs font-medium text-fem-terracotta hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Login As</label>
                <div className="flex gap-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="userType"
                      value="community"
                      checked={userType === "community"}
                      onChange={(e) => setUserType(e.target.value)}
                      className="text-fem-terracotta"
                    />
                    <span className="text-sm">Community Member</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="userType"
                      value="business"
                      checked={userType === "business"}
                      onChange={(e) => setUserType(e.target.value)}
                      className="text-fem-terracotta"
                    />
                    <span className="text-sm">Business Directory</span>
                  </label>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                />
                <label htmlFor="remember" className="text-sm text-gray-600">
                  Remember me
                </label>
              </div>
              <Button 
                type="submit" 
                className="w-full bg-fem-terracotta hover:bg-fem-terracotta/90"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-center text-sm text-gray-600">
              Don't have an account?{" "}
              <Link to="/register" className="text-fem-terracotta hover:underline">
                Register here
              </Link>
            </div>
          </CardFooter>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default SignInPage;
