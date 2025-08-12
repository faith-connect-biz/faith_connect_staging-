import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhoneVerificationModal } from "@/components/auth/PhoneVerificationModal";
import { 
  User, 
  Mail, 
  Lock, 
  Building2, 
  ArrowLeft,
  CheckCircle,
  Phone
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

const UserRegistrationPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    userType: "community", // 'community' or 'business'
    partnershipNumber: ""
  });
  
  const [showPhoneVerification, setShowPhoneVerification] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match.",
        variant: "destructive"
      });
      return;
    }

    // Check if phone number is provided and needs verification
    if (formData.phone && !isPhoneVerified) {
      setShowPhoneVerification(true);
      return;
    }

    // Mock registration - in real app, this would call an API
    toast({
      title: "Registration successful!",
      description: "Welcome to Faith Connect. You can now access all features.",
    });

    navigate("/login");
  };

  const handlePhoneVerificationSuccess = () => {
    setIsPhoneVerified(true);
    toast({
      title: "Phone Verified!",
      description: "Your phone number has been verified successfully.",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-4">
                <Building2 className="w-12 h-12 text-fem-terracotta" />
              </div>
              <h1 className="text-3xl font-bold text-fem-navy mb-2">
                Join Faith Connect
              </h1>
              <p className="text-gray-600">
                Connect with fellow believers in our faith-based business directory
              </p>
            </div>

            {/* Registration Form */}
            <Card>
              <CardHeader>
                <CardTitle>Create Your Account</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange("firstName", e.target.value)}
                        placeholder="John"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange("lastName", e.target.value)}
                        placeholder="Smith"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="john@email.com"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <div className="relative">
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        placeholder="+254 700 123 456"
                        required
                        className={isPhoneVerified ? "border-green-500 bg-green-50" : ""}
                      />
                      {isPhoneVerified && (
                        <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {isPhoneVerified 
                        ? "✓ Phone number verified" 
                        : "Enter your Kenyan phone number - verification required"
                      }
                    </p>
                    {formData.phone && !isPhoneVerified && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowPhoneVerification(true)}
                        className="mt-2 text-fem-terracotta border-fem-terracotta hover:bg-fem-terracotta hover:text-white"
                      >
                        <Phone className="w-4 h-4 mr-2" />
                        Verify Phone Number
                      </Button>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="partnershipNumber">Partnership Number</Label>
                    <Input
                      id="partnershipNumber"
                      value={formData.partnershipNumber}
                      onChange={(e) => handleInputChange("partnershipNumber", e.target.value)}
                      placeholder="Optional - Church membership number"
                    />
                  </div>

                  <div>
                    <Label htmlFor="password">Password *</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      placeholder="Create a secure password"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword">Confirm Password *</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                      placeholder="Confirm your password"
                      required
                    />
                  </div>

                  <div>
                    <Label>Account Type</Label>
                    <div className="flex gap-4 mt-2">
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="userType"
                          value="community"
                          checked={formData.userType === "community"}
                          onChange={(e) => handleInputChange("userType", e.target.value)}
                          className="text-fem-terracotta"
                        />
                        <span className="text-sm">Community Member</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="userType"
                          value="business"
                          checked={formData.userType === "business"}
                          onChange={(e) => handleInputChange("userType", e.target.value)}
                          className="text-fem-terracotta"
                        />
                        <span className="text-sm">Business Directory</span>
                      </label>
                    </div>
                  </div>

                  <Button type="submit" className="w-full bg-fem-terracotta hover:bg-fem-terracotta/90">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Create Account
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-600">
                    Already have an account?{" "}
                    <Link to="/login" className="text-fem-terracotta hover:underline">
                      Sign in here
                    </Link>
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Features */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                <Building2 className="w-8 h-8 text-fem-terracotta mx-auto mb-2" />
                <h3 className="font-medium text-fem-navy mb-1">Business Directory</h3>
                <p className="text-sm text-gray-600">Find trusted businesses</p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                <User className="w-8 h-8 text-fem-terracotta mx-auto mb-2" />
                <h3 className="font-medium text-fem-navy mb-1">Community</h3>
                <p className="text-sm text-gray-600">Connect with believers</p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                <CheckCircle className="w-8 h-8 text-fem-terracotta mx-auto mb-2" />
                <h3 className="font-medium text-fem-navy mb-1">Verified</h3>
                <p className="text-sm text-gray-600">Trusted businesses only</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      
      {/* Phone Verification Modal */}
      <PhoneVerificationModal
        isOpen={showPhoneVerification}
        onClose={() => setShowPhoneVerification(false)}
        phone={formData.phone}
        onVerificationSuccess={handlePhoneVerificationSuccess}
        purpose="registration"
      />
    </div>
  );
};

export default UserRegistrationPage; 