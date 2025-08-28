import { useState, useRef } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import AuthModal from "@/components/auth/AuthModal";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Mail, Phone, MapPin, Clock, MessageCircle, Heart, Zap, Users, ChevronUp, CheckCircle, AlertCircle } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";

const ContactPage = () => {
  const { isAuthenticated, isBusinessUser } = useAuth();
  const navigate = useNavigate();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');

  const handleOpenAuthModal = () => {
    setIsAuthModalOpen(true);
  };

  const handleRegisterBusinessClick = () => {
    // If user is authenticated and is a business user, navigate directly
    if (isAuthenticated && isBusinessUser()) {
      navigate('/register-business');
    } else {
      // Otherwise, open the auth modal
      handleOpenAuthModal();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setSubmitMessage('');

    try {
      // Determine API base URL - use localhost for development
      const isDevelopment = import.meta.env.DEV || window.location.hostname === 'localhost';
      const API_BASE_URL = isDevelopment 
        ? 'http://localhost:8000' 
        : import.meta.env.VITE_API_BASE_URL || 'https://femdjango-production.up.railway.app';
      
      // Prepare the payload to match the backend API expectations
      const payload = {
        name: formData.fullName.trim(),
        email: formData.email.trim(),
        subject: formData.subject.trim(),
        message: formData.message.trim()
      };

      console.log('Submitting contact form to:', `${API_BASE_URL}/api/contact`);
      console.log('Payload:', payload);

      const response = await fetch(`${API_BASE_URL}/api/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log('Contact form response:', data);

      if (response.ok && data.success) {
        setSubmitStatus('success');
        setSubmitMessage('Thank you! Your message has been sent successfully. We\'ll get back to you soon.');
        
        // Reset form after successful submission
        setFormData({
          fullName: "",
          email: "",
          subject: "",
          message: ""
        });
      } else {
        throw new Error(data.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error submitting contact form:', error);
      setSubmitStatus('error');
      setSubmitMessage(
        error instanceof Error 
          ? `Failed to send message: ${error.message}` 
          : 'Failed to send message. Please try again later.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative h-[60vh] bg-gradient-to-br from-fem-navy to-fem-terracotta flex items-center justify-center overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0"
            style={{
              backgroundImage: 'url(/man-in-apron-packing-boxes-at-a-table-surrounded-2025-03-08-11-33-37-utc 2.jpg)'
            }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-br from-fem-navy/80 to-fem-terracotta/80 z-10"></div>
          <div className="relative z-20 text-center text-white px-4">
            <div className="w-20 h-20 bg-fem-gold rounded-full flex items-center justify-center mx-auto mb-6 animate-float">
              <MessageCircle className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Get in <span className="text-fem-gold">Touch</span>
            </h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed">
              We'd love to hear from you. Connect with our team and let's build something amazing together.
            </p>
          </div>
        </section>

        {/* Contact Information Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-fem-navy mb-4">How to Reach Us</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Multiple ways to connect with our team and get the support you need.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
              <div className="text-center animate-fade-in" style={{ animationDelay: '0.1s' }}>
                <div className="w-16 h-16 bg-fem-terracotta rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-fem-navy mb-2">Email Us</h3>
                <p className="text-fem-terracotta font-medium mb-2">info@faithconnect.biz</p>
                <p className="text-gray-600 text-sm">Send us an email anytime</p>
              </div>
              
              <div className="text-center animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <div className="w-16 h-16 bg-fem-terracotta rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-fem-navy mb-2">Call Us</h3>
                <p className="text-fem-terracotta font-medium mb-2">0714777797</p>
                <p className="text-gray-600 text-sm">Mon-Fri from 8am to 6pm</p>
              </div>
              
              <div className="text-center animate-fade-in" style={{ animationDelay: '0.3s' }}>
                <div className="w-16 h-16 bg-fem-terracotta rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-fem-navy mb-2">Visit Us</h3>
                <p className="text-fem-terracotta font-medium mb-2">Nairobi, Kenya</p>
                <p className="text-gray-600 text-sm">FEM Family Church Headquarters</p>
              </div>
              
              <div className="text-center animate-fade-in" style={{ animationDelay: '0.4s' }}>
                <div className="w-16 h-16 bg-fem-terracotta rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-fem-navy mb-2">Office Hours</h3>
                <p className="text-fem-terracotta font-medium mb-2">Monday - Friday</p>
                <p className="text-gray-600 text-sm">9:00 AM - 5:00 PM EAT</p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Form Section */}
        <section className="py-20 bg-fem-gray">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-16 max-w-6xl mx-auto">
              {/* Left Column - Information */}
              <div className="animate-slide-in-left">
                <h2 className="text-4xl font-bold text-fem-navy mb-6">Send Us a Message</h2>
                <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                  Have a question, suggestion, or just want to say hello? We'd love to hear from you. Fill out the form and we'll get back to you as soon as possible.
                </p>
                
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-fem-terracotta/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <Users className="w-6 h-6 text-fem-terracotta" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-fem-navy mb-2">Community Support</h3>
                      <p className="text-gray-600">Get help with your account or business</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-fem-terracotta/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <Heart className="w-6 h-6 text-fem-terracotta" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-fem-navy mb-2">Partnership Inquiries</h3>
                      <p className="text-gray-600">Let's explore collaboration opportunities</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-fem-terracotta/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <Zap className="w-6 h-6 text-fem-terracotta" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-fem-navy mb-2">Feature Requests</h3>
                      <p className="text-gray-600">Help us improve our platform</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Right Column - Contact Form */}
              <div className="animate-slide-in-right">
                <div className="bg-white p-8 rounded-2xl shadow-xl">
                  <h3 className="text-2xl font-bold text-fem-navy mb-2">Contact Form</h3>
                  <p className="text-gray-600 mb-6">We'll get back to you within 24 hours</p>
                  
                  {/* Status Message */}
                  {submitStatus !== 'idle' && (
                    <div className={`p-4 rounded-lg flex items-center space-x-2 ${
                      submitStatus === 'success' 
                        ? 'bg-green-50 text-green-700 border border-green-200' 
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                      {submitStatus === 'success' ? (
                        <CheckCircle className="w-5 h-5 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                      )}
                      <p className="text-sm">{submitMessage}</p>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label htmlFor="fullName" className="block text-sm font-medium text-fem-navy mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        id="fullName"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        placeholder="Enter your full name"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fem-terracotta focus:border-transparent transition-all duration-300"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-fem-navy mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Enter your email"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fem-terracotta focus:border-transparent transition-all duration-300"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-fem-navy mb-2">
                        Subject
                      </label>
                      <input
                        type="text"
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        placeholder="What's this about?"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fem-terracotta focus:border-transparent transition-all duration-300"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-fem-navy mb-2">
                        Message
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        rows={5}
                        placeholder="Tell us more about your inquiry..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fem-terracotta focus:border-transparent transition-all duration-300 resize-none"
                        required
                      />
                    </div>
                    
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-fem-terracotta to-fem-navy text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Sending...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                          <span>Send Message</span>
                        </>
                      )}
                    </Button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Additional Contact Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-fem-navy mb-6">Get Started Today</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Ready to join our faith-based business community? Start your journey with Faith Connect today.
              </p>
            </div>
            
            <div className="max-w-4xl mx-auto text-center">
              <div className="bg-gradient-to-br from-fem-gray to-fem-lightgold p-12 rounded-2xl shadow-xl">
                <h3 className="text-3xl font-bold text-fem-navy mb-6">Join Our Community</h3>
                <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
                  Connect with trusted faith-based businesses or list your own. Together, we can build a stronger, more connected community.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    onClick={handleRegisterBusinessClick}
                    className="bg-fem-terracotta text-white px-8 py-4 rounded-lg font-semibold hover:bg-fem-terracotta/90 transition-colors text-lg"
                  >
                    Register Your Business
                  </Button>
                  <Button 
                    onClick={handleOpenAuthModal}
                    className="bg-fem-navy text-white px-8 py-4 rounded-lg font-semibold hover:bg-fem-navy/90 transition-colors text-lg"
                  >
                    Join Our Community
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      
      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
};

export default ContactPage;
