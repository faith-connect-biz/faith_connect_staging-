import { Link } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle, 
  Clock, 
  Shield, 
  Camera, 
  ArrowRight,
  Building2,
  Users,
  Star
} from "lucide-react";

const BusinessRegistrationSuccessPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            {/* Success Icon */}
            <div className="mb-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold text-fem-navy mb-4">
                Business Registration Submitted!
              </h1>
              <p className="text-gray-600 text-lg">
                Thank you for joining our faith-based business directory. Your business is now under review.
              </p>
            </div>

            {/* Status Card */}
            <Card className="mb-8">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-orange-600" />
                    <div className="text-left">
                      <h3 className="font-semibold text-fem-navy">Review Process</h3>
                      <p className="text-sm text-gray-600">We'll review your business within 2-3 business days</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-green-600" />
                    <div className="text-left">
                      <h3 className="font-semibold text-fem-navy">Verification</h3>
                      <p className="text-sm text-gray-600">Your business will be reviewed and verified</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Camera className="w-5 h-5 text-fem-terracotta" />
                    <div className="text-left">
                      <h3 className="font-semibold text-fem-navy">Professional Photos</h3>
                      <p className="text-sm text-gray-600">If requested, photography will be scheduled</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Next Steps */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-fem-navy mb-4">What's Next?</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <div className="w-12 h-12 bg-fem-gold/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Building2 className="w-6 h-6 text-fem-terracotta" />
                  </div>
                  <h3 className="font-medium text-fem-navy mb-2">Complete Your Profile</h3>
                  <p className="text-sm text-gray-600">Add more details to your business listing</p>
                </div>
                
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <div className="w-12 h-12 bg-fem-gold/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Users className="w-6 h-6 text-fem-terracotta" />
                  </div>
                  <h3 className="font-medium text-fem-navy mb-2">Connect with Community</h3>
                  <p className="text-sm text-gray-600">Start building relationships with fellow members</p>
                </div>
                
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <div className="w-12 h-12 bg-fem-gold/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Star className="w-6 h-6 text-fem-terracotta" />
                  </div>
                  <h3 className="font-medium text-fem-navy mb-2">Get Reviews</h3>
                  <p className="text-sm text-gray-600">Encourage customers to leave reviews</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/profile">
                <Button className="bg-fem-terracotta hover:bg-fem-terracotta/90 text-white">
                  <Building2 className="w-4 h-4 mr-2" />
                  Manage My Business
                </Button>
              </Link>
              
              <Link to="/directory">
                <Button variant="outline" className="border-fem-navy text-fem-navy hover:bg-fem-navy hover:text-white">
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Browse Directory
                </Button>
              </Link>
            </div>

            {/* Additional Info */}
            <div className="mt-8 p-6 bg-gradient-to-r from-fem-gold/10 to-fem-terracotta/10 rounded-lg">
              <h3 className="font-semibold text-fem-navy mb-3">Need Help?</h3>
              <p className="text-gray-700 mb-4">
                If you have any questions about your business listing or need assistance, 
                please don't hesitate to contact our support team.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="outline" className="border-fem-navy text-fem-navy hover:bg-fem-navy hover:text-white">
                  Contact Support
                </Button>
                <Button variant="outline" className="border-fem-gold text-fem-gold hover:bg-fem-gold hover:text-white">
                  View Guidelines
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BusinessRegistrationSuccessPage; 