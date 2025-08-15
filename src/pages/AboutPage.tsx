
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-fem-navy mb-6">About Faith Connect Business Directory</h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              Faith Connect Business Directory is more than just a business directory—it's a testament to the power of faith-based community.
              We are a house of faith where a powerful community thrives, connecting our faith community with trusted businesses and services across Kenya.
            </p>
          </div>

          <div className="aspect-video mb-8 rounded-lg overflow-hidden shadow-lg">
            <img 
              src="/lovable-uploads/AboutUsPage.png" 
              alt="Faith Connect Business Directory - Connecting Communities Through Business" 
              className="w-full h-full object-cover"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-12 mb-16">
            <div>
              <h2 className="text-2xl font-bold text-fem-navy mb-4">Our Mission</h2>
              <p className="text-gray-600 leading-relaxed">
                To create a thriving ecosystem where faith-based businesses and community members can connect, 
                collaborate, and grow together in a spirit of mutual support and shared values.
              </p>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-fem-navy mb-4">Our Vision</h2>
              <p className="text-gray-600 leading-relaxed">
                To be the leading platform that bridges faith communities with trusted businesses, 
                fostering economic growth while maintaining spiritual and ethical standards.
              </p>
            </div>
          </div>

          <div className="mb-16">
            <h2 className="text-2xl font-bold text-fem-navy mb-6 text-center">What We Offer</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-fem-navy mb-3">For Businesses</h3>
                <ul className="text-gray-600 space-y-2">
                  <li>Free business profile creation and management</li>
                  <li>Access to a trusted, faith-based customer base</li>
                  <li>Marketing tools and community engagement features</li>
                  <li>Networking opportunities with other faith-aligned businesses</li>
                </ul>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-fem-navy mb-3">For Community Members</h3>
                <ul className="text-gray-600 space-y-2">
                  <li>Free profile creation for faith community members to discover services and support fellow believers</li>
                  <li>Access to verified, trusted businesses within our faith community</li>
                  <li>Community features for building meaningful relationships</li>
                  <li>Support for local businesses that share your values</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mb-16">
            <h2 className="text-2xl font-bold text-fem-navy mb-6 text-center">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-fem-terracotta text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">1</div>
                <h3 className="text-xl font-semibold text-fem-navy mb-2">Business Registration</h3>
                <p className="text-gray-600">Businesses create detailed profiles showcasing their services, values, and faith commitment</p>
              </div>
              <div className="text-center">
                <div className="bg-fem-terracotta text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">2</div>
                <h3 className="text-xl font-semibold text-fem-navy mb-2">Community Discovery</h3>
                <p className="text-gray-600">Faith community members search, filter, and discover trusted businesses within our faith family</p>
              </div>
              <div className="text-center">
                <div className="bg-fem-terracotta text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">3</div>
                <h3 className="text-xl font-semibold text-fem-navy mb-2">Meaningful Connections</h3>
                <p className="text-gray-600">Build lasting relationships and support local commerce within our faith community</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-8 rounded-lg text-center">
            <h2 className="text-2xl font-bold text-fem-navy mb-4">Get Started Today</h2>
            <p className="text-gray-600 mb-6">
              Join our growing community of faith-based businesses and community members. 
              Together, we can build a stronger, more connected community.
            </p>
            <div className="space-x-4">
              <Link 
                to="/register-business" 
                className="inline-block bg-fem-terracotta text-white px-6 py-3 rounded-lg font-semibold hover:bg-fem-terracotta/90 transition-colors"
              >
                Register Your Business
              </Link>
              <Link 
                to="/register" 
                className="inline-block bg-fem-navy text-white px-6 py-3 rounded-lg font-semibold hover:bg-fem-navy/90 transition-colors"
              >
                Join Our Community
              </Link>
            </div>
          </div>

          <div className="mt-16 text-center">
            <h2 className="text-2xl font-bold text-fem-navy mb-6">Contact Us</h2>
            <p className="text-gray-600 mb-6">
              If you have any questions about Faith Connect Business Directory, please don't hesitate to contact us:
            </p>
            <div className="space-y-2 text-gray-600">
              <p><span className="font-semibold">Email:</span> info@faithconnect.org</p>
              <p><span className="font-semibold">Phone:</span> +254 700 000 000</p>
              <p><span className="font-semibold">Location:</span> Faith Connect Headquarters, Nairobi, Kenya</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AboutPage;
