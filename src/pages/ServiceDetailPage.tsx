import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  ArrowLeft, 
  ChevronLeft, 
  ChevronRight, 
  Settings, 
  MapPin, 
  Clock, 
  Phone, 
  Mail, 
  Edit,
  Share2,
  Heart,
  Star,
  Building2,
  Eye,
  MessageSquare
} from 'lucide-react';
import { apiService, Service } from '@/services/api';
import { formatToBritishDate } from '@/utils/dateUtils';
import { toast } from '@/hooks/use-toast';
import { BookingModal } from '@/components/modals/BookingModal';
import { ContactModal } from '@/components/modals/ContactModal';
import { analytics } from '@/services/analytics';

export const ServiceDetailPage: React.FC = () => {
  const { id, categorySlug, serviceSlug } = useParams<{ 
    id?: string; 
    categorySlug?: string; 
    serviceSlug?: string; 
  }>();
  const navigate = useNavigate();
  const [service, setService] = useState<Service | null>(null);
  const [business, setBusiness] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [contactDetails, setContactDetails] = useState<any>(null);

  useEffect(() => {
    if (id || (categorySlug && serviceSlug)) {
      loadServiceDetails();
    }
  }, [id, categorySlug, serviceSlug]);

  const loadServiceDetails = async () => {
    try {
      setIsLoading(true);
      let serviceData: Service;
      
      if (categorySlug && serviceSlug) {
        // Use new category-based API
        serviceData = await apiService.getServiceByCategory(categorySlug, serviceSlug);
      } else if (id) {
        // Use legacy ID-based API
        serviceData = await apiService.getService(id);
      } else {
        throw new Error('No valid service identifier provided');
      }
      
      setService(serviceData);
      
      if (serviceData.business) {
        setBusiness(serviceData.business);
      }
      
      // Track service view - simplified to avoid type issues
      analytics.trackServiceView(
        String(serviceData.id || ''), 
        serviceData.name, 
        ''
      );
    } catch (error) {
      console.error('Error loading service details:', error);
      toast({
        title: "Error",
        description: "Failed to load service details. Please try again.",
        variant: "destructive"
      });
      navigate('/directory');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageNavigation = (direction: 'next' | 'prev') => {
    if (!service) return;
    
    const allImages = [
      ...(service.images || []),
      ...(service.service_image_url ? [service.service_image_url] : [])
    ];
    
    if (direction === 'next') {
      setCurrentImageIndex((prev) => 
        prev === allImages.length - 1 ? 0 : prev + 1
      );
    } else {
      setCurrentImageIndex((prev) => 
        prev === 0 ? allImages.length - 1 : prev - 1
      );
    }
  };

  const handleBookService = () => {
    if (!business?.email) {
      // Show alternative contact options when email is not available
      toast({
        title: "Email Not Available",
        description: "This business hasn't provided an email. Try 'Show Contact' for phone number or 'Start Chat' for WhatsApp.",
        variant: "destructive",
        duration: 5000
      });
      
      // Automatically open the contact modal to show alternative options
      setTimeout(() => {
        handleShowContact();
      }, 1000);
      return;
    }
    
    // Track analytics
    analytics.trackServiceBookingClick(service?.id?.toString() || '', service?.name || '', business?.id || '');
    
    // Create mailto link with pre-filled subject and body
    const subject = `Service Booking Request`;
    const body = `Hello, I would like to book your service: ${service?.name || 'your service'}.`;
    
    // Open default email client
    const mailtoLink = `mailto:${business.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink);
    
    toast({
      title: "Email Client Opened",
      description: "Your default email client has been opened with a pre-filled booking request.",
    });
  };

  const handleShowContact = async () => {
    if (!business?.id) return;
    
    try {
      // Track analytics
      analytics.trackContactShowClick(business.id, business.business_name);
      
      // For now, we'll use the business data we already have
      // In a real implementation, you'd call the API endpoint
      const contactData = {
        business_name: business.business_name,
        phone: business.phone,
        email: business.email,
        whatsapp: business.phone, // Use phone number for WhatsApp
        address: business.address,
        city: business.city,
        website: business.website
      };
      
      setContactDetails(contactData);
      setIsContactModalOpen(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load contact details.",
        variant: "destructive"
      });
    }
  };

  const handleStartChat = async () => {
    if (!business?.phone) {
      toast({
        title: "Phone Not Available",
        description: "This business has not provided a phone number.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Show loading state
      toast({
        title: "Checking WhatsApp...",
        description: "Verifying if this number is registered on WhatsApp.",
      });
      
      // Check if the number is registered on WhatsApp
      const result = await apiService.checkWhatsAppNumber(business.phone);
      
      if (result.success && result.is_whatsapp) {
        // Track analytics
        analytics.trackWhatsAppClick(business.id, business.business_name, business.phone);
        
        // Clean the number and open WhatsApp
        const cleanNumber = business.phone.replace(/\D/g, '');
        const message = `Hello, I'm interested in your ${service?.name || 'service'}.`;
        window.open(`https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`);
        
        toast({
          title: "WhatsApp Opened",
          description: "WhatsApp has been opened with your message.",
        });
      } else {
        // Number is not registered on WhatsApp
        toast({
          title: "WhatsApp Not Available",
          description: "The phone number listed by this business is not registered on WhatsApp.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('WhatsApp check error:', error);
      
      // On error, still try to open WhatsApp (fallback behavior)
      toast({
        title: "Opening WhatsApp...",
        description: "Unable to verify WhatsApp registration, opening WhatsApp anyway.",
      });
      
      // Track analytics
      analytics.trackWhatsAppClick(business.id, business.business_name, business.phone);
      
      const cleanNumber = business.phone.replace(/\D/g, '');
      const message = `Hello, I'm interested in your ${service?.name || 'service'}.`;
      window.open(`https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fem-terracotta mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading service details...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="p-6 text-center">
              <Settings className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Service Not Found</h2>
              <p className="text-gray-600 mb-4">
                The service you're looking for doesn't exist or has been removed.
              </p>
              <Button onClick={() => navigate('/directory')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Directory
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const allImages = [
    ...(service.images || []),
    ...(service.service_image_url ? [service.service_image_url] : [])
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          {/* Back Button */}
          <div className="mb-6">
            <Button 
              variant="ghost" 
              onClick={() => navigate(-1)}
              className="text-fem-terracotta hover:text-fem-terracotta/80"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>

          {/* Hero Section - Large Image Gallery */}
          <div className="mb-8">
            <div className="relative w-full h-96 bg-white rounded-xl shadow-lg overflow-hidden">
                  {allImages.length > 0 ? (
                    <img 
                      src={allImages[currentImageIndex] || allImages[0]} 
                      alt={`${service.name} - Image ${currentImageIndex + 1}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                      <div className="text-center">
                    <Settings className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No images available</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Navigation Arrows */}
                  {allImages.length > 1 && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg rounded-full p-3"
                        onClick={() => handleImageNavigation('prev')}
                      >
                    <ChevronLeft className="h-5 w-5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg rounded-full p-3"
                        onClick={() => handleImageNavigation('next')}
                      >
                    <ChevronRight className="h-5 w-5" />
                      </Button>
                    </>
                  )}
                  
                  {/* Image Counter */}
                  {allImages.length > 1 && (
                <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium">
                      {currentImageIndex + 1} / {allImages.length}
                    </div>
                  )}

              {/* Status Badge */}
              <div className="absolute top-4 left-4">
                <Badge className="bg-gradient-to-r from-fem-terracotta to-fem-gold text-white">
                  {service.is_active ? "Available" : "Unavailable"}
                </Badge>
              </div>
                </div>

            {/* Thumbnail Gallery */}
                {allImages.length > 1 && (
              <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
                {allImages.slice(0, 8).map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`flex-shrink-0 relative group ${
                          index === currentImageIndex 
                        ? 'ring-2 ring-fem-terracotta ring-offset-2' 
                        : 'hover:ring-2 hover:ring-gray-300 ring-offset-2'
                        }`}
                      >
                        <img
                          src={image}
                          alt={`${service.name} thumbnail ${index + 1}`}
                      className="w-20 h-20 object-cover rounded-lg border-2 border-gray-200 hover:border-gray-300 transition-colors"
                        />
                        {index === currentImageIndex && (
                          <div className="absolute inset-0 bg-fem-terracotta/20 rounded-lg flex items-center justify-center">
                        <div className="w-2 h-2 bg-fem-terracotta rounded-full"></div>
                          </div>
                        )}
                      </button>
                    ))}
                {allImages.length > 8 && (
                  <div className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded-lg border-2 border-gray-200 flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-600">+{allImages.length - 8}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Main Content Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Service Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Service Title & Meta */}
              <div>
                <div className="flex items-start justify-between mb-3">
                  <h1 className="text-3xl font-bold text-gray-900 leading-tight">{service.name}</h1>
                </div>
                <div className="flex items-center gap-6 text-sm text-gray-500 mb-4">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {business?.city}, {business?.county}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {service.created_at ? formatToBritishDate(service.created_at) : 'Recently added'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    154 views
                  </span>
              </div>

                {/* Service Tags */}
                <div className="flex gap-2 mb-4">
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Local Service
                  </Badge>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    Professional
                  </Badge>
                </div>
              </div>


              {/* Description Section */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Description</h3>
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-700 leading-relaxed mb-4">
                  {service.description || 'No detailed description available for this service.'}
                </p>
                  
                  {/* Service Features */}
                  <div className="mt-6">
                    <h4 className="font-semibold text-gray-900 mb-3">What's Included:</h4>
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-fem-terracotta rounded-full mt-2 flex-shrink-0"></div>
                        <span>Professional service delivery</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-fem-terracotta rounded-full mt-2 flex-shrink-0"></div>
                        <span>Quality assurance guarantee</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-fem-terracotta rounded-full mt-2 flex-shrink-0"></div>
                        <span>Customer support</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-fem-terracotta rounded-full mt-2 flex-shrink-0"></div>
                        <span>Flexible scheduling</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </Card>



              {/* Social Sharing */}
              <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
                <span className="text-sm text-gray-600">Share this service:</span>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white">
                    <Share2 className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" className="border-green-600 text-green-600 hover:bg-green-600 hover:text-white">
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" className="border-gray-600 text-gray-600 hover:bg-gray-600 hover:text-white">
                    <Mail className="h-4 w-4" />
                  </Button>
                </div>
              </div>
                    </div>

            {/* Right Column - Pricing & Actions */}
            <div className="space-y-6">
              {/* Pricing Section */}
              <Card className="p-6 bg-gradient-to-r from-fem-terracotta/5 to-fem-gold/5 border-fem-terracotta/20">
                <div className="text-center mb-4">
                  <div className="text-3xl font-bold text-fem-terracotta mb-2">
                    {service.price_range || 'Contact for pricing'}
                  </div>
                  <p className="text-sm text-gray-600">Negotiable</p>
                    </div>
                
                <div className="space-y-3">
                  <Button 
                    onClick={handleBookService}
                    className="w-full bg-gradient-to-r from-fem-terracotta to-fem-gold hover:from-fem-terracotta/90 hover:to-fem-gold/90 text-white"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Book Service Now
                  </Button>
                  <Button 
                    onClick={handleShowContact}
                    variant="outline" 
                    className="w-full border-fem-terracotta text-fem-terracotta hover:bg-fem-terracotta hover:text-white"
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Show Contact
                  </Button>
                  <Button 
                    onClick={handleStartChat}
                    variant="outline" 
                    className="w-full border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Start Chat
                  </Button>
                </div>
              </Card>

              {/* Provider Quick Info */}
              {business && (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Provider Details</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-fem-terracotta to-fem-gold rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">
                        {business.business_name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{business.business_name}</p>
                        <p className="text-sm text-gray-600">Verified Provider</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-gray-700">
                        <MapPin className="h-4 w-4 text-fem-terracotta" />
                        <span>{business.city}, {business.county}</span>
                      </div>
                        {business.phone && (
                            <div className="flex items-center gap-2 text-gray-700">
                              <Phone className="h-4 w-4 text-fem-terracotta" />
                          <span>{business.phone}</span>
                          </div>
                        )}
                        {business.email && (
                            <div className="flex items-center gap-2 text-gray-700">
                              <Mail className="h-4 w-4 text-fem-terracotta" />
                          <span>{business.email}</span>
                          </div>
                        )}
                      </div>

                    <div className="pt-3 border-t border-gray-200">
                      <Link to={`/business/${business.id}`} className="block">
                        <Button className="w-full bg-fem-terracotta hover:bg-fem-terracotta/90 text-white">
                          <Building2 className="h-4 w-4 mr-2" />
                          Visit Business Profile
                        </Button>
                        </Link>
                      </div>
                  </div>
                  </Card>
                )}

            </div>
          </div>

        {/* Service Reviews Section - placed at the bottom */}
        <div className="container mx-auto px-4 pb-12">
          <Card className="mt-8">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-gradient-to-r from-fem-terracotta to-fem-gold rounded-full flex items-center justify-center">
                  <Star className="h-4 w-4 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Service Reviews</h2>
                <Badge variant="outline" className="ml-auto bg-gradient-to-r from-fem-terracotta/10 to-fem-gold/10 text-fem-terracotta border-fem-terracotta/30">
                  0 Reviews
                </Badge>
              </div>

              <div className="text-center py-12">
                <div className="relative mb-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-fem-terracotta/10 to-fem-gold/10 rounded-full mx-auto flex items-center justify-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-fem-terracotta/20 to-fem-gold/20 rounded-full flex items-center justify-center">
                      <Star className="h-8 w-8 text-fem-terracotta/60" />
                    </div>
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-fem-gold rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">!</span>
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Reviews Yet</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Be the first to share your experience with this service! Your review helps others make informed decisions.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button className="bg-gradient-to-r from-fem-terracotta to-fem-gold hover:from-fem-terracotta/90 hover:to-fem-gold/90 text-white">
                    <Star className="h-4 w-4 mr-2" />
                    Write First Review
                  </Button>
                  <Button variant="outline" className="border-fem-terracotta text-fem-terracotta hover:bg-fem-terracotta hover:text-white">
                    <Heart className="h-4 w-4 mr-2" />
                    Save for Later
                  </Button>
                </div>
              </div>

              <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                  <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">i</span>
                  </div>
                  Review Guidelines
                </h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Share your honest experience with the service</li>
                  <li>• Include details about quality, timeliness, and communication</li>
                  <li>• Help other customers make informed decisions</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
        </div>
      </main>
      <Footer />
      
      {/* Modals */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        serviceName={service?.name || ''}
        businessEmail={business?.email || ''}
        onBookingSuccess={() => {
          toast({
            title: "Booking Request Sent",
            description: "Your booking request has been sent to the business.",
          });
        }}
      />
      
      <ContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        contactDetails={contactDetails}
      />
    </div>
  );
};