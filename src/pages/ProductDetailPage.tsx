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
  Package, 
  MapPin, 
  Clock, 
  Phone, 
  Mail, 
  Edit,
  Share2,
  Heart,
  Star,
  Building2,
  Settings,
  MessageSquare,
  Eye
} from 'lucide-react';
import { apiService, Product } from '@/services/api';
import { formatToBritishDate } from '@/utils/dateUtils';
import { toast } from '@/hooks/use-toast';
import { BookingModal } from '@/components/modals/BookingModal';
import { ContactModal } from '@/components/modals/ContactModal';
import { analytics } from '@/services/analytics';
import type { BusinessHour } from '@/services/api';
import { ReviewSection } from '@/components/ReviewSection';
import { useAuth } from '@/contexts/AuthContext';

export const ProductDetailPage: React.FC = () => {
  const { id, categorySlug, productSlug } = useParams<{ 
    id?: string; 
    categorySlug?: string; 
    productSlug?: string; 
  }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [business, setBusiness] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [contactDetails, setContactDetails] = useState<any>(null);
  const [businessHours, setBusinessHours] = useState<BusinessHour[]>([]);
  const [isLoadingHours, setIsLoadingHours] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please log in to view product details.",
        variant: "default"
      });
      navigate('/login', { state: { from: `/product/${id || (categorySlug && productSlug ? `${categorySlug}/${productSlug}` : '')}` } });
      return;
    }
  }, [isAuthenticated, navigate, id, categorySlug, productSlug]);

  useEffect(() => {
    if (isAuthenticated && (id || (categorySlug && productSlug))) {
      loadProductDetails();
    }
  }, [id, categorySlug, productSlug, isAuthenticated]);

  // Load business hours when business info is available
  useEffect(() => {
    const loadHours = async () => {
      if (!business?.id) return;
      try {
        setIsLoadingHours(true);
        const hoursData = await apiService.getBusinessHoursPublic(String(business.id));
        setBusinessHours(hoursData || []);
      } catch (err) {
        console.error('Error loading business hours for product view:', err);
        setBusinessHours([]);
      } finally {
        setIsLoadingHours(false);
      }
    };

    loadHours();
  }, [business?.id]);

  const loadProductDetails = async () => {
    try {
      setIsLoading(true);
      let productData: Product;
      
      if (categorySlug && productSlug) {
        // Use new category-based API
        productData = await apiService.getProductByCategory(categorySlug, productSlug);
      } else if (id) {
        // Use legacy ID-based API
        productData = await apiService.getProduct(id);
      } else {
        throw new Error('No valid product identifier provided');
      }
      
      setProduct(productData);
      
      if (productData.business) {
        setBusiness(productData.business);
      }
      
      // Track product view - simplified to avoid type issues
      analytics.trackServiceView(
        String(productData.id || ''), 
        productData.name, 
        ''
      );
    } catch (error) {
      console.error('Error loading product details:', error);
      toast({
        title: "Error",
        description: "Failed to load product details. Please try again.",
        variant: "destructive"
      });
      navigate('/directory');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageNavigation = (direction: 'next' | 'prev') => {
    if (!product) return;
    
    const allImages = [
      ...(product.images || []),
      ...(product.product_image_url ? [product.product_image_url] : [])
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

  const handleBuyNow = () => {
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
    analytics.trackServiceBookingClick(String(product?.id || ''), product?.name || '', business?.id || '');
    
    // Create mailto link with pre-filled subject and body
    const subject = `Product Purchase Request`;
    const body = `Hello, I would like to purchase your product: ${product?.name || 'your product'}.`;
    
    // Open default email client
    const mailtoLink = `mailto:${business.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink);
    
    toast({
      title: "Email Client Opened",
      description: "Your default email client has been opened with a pre-filled purchase request.",
    });
  };

  const handleShowContact = async () => {
    if (!business?.id) return;
    
    try {
      analytics.trackContactShowClick(business.id, business.business_name);
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
        const message = `Hello, I'm interested in your ${product?.name || 'product'}.`;
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
      const message = `Hello, I'm interested in your ${product?.name || 'product'}.`;
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
            <p className="mt-4 text-gray-600">Loading product details...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="p-6 text-center">
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Product Not Found</h2>
              <p className="text-gray-600 mb-4">
                The product you're looking for doesn't exist or has been removed.
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
    ...(product.images || []),
    ...(product.product_image_url ? [product.product_image_url] : [])
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

          {/* Hero Section - Product Gallery */}
          <Card className="mb-8 overflow-hidden">
            <CardContent className="p-0">
              <div className="flex gap-4">
                {/* Main Image - Large */}
                <div className="relative w-full h-96 bg-white rounded-xl shadow-md overflow-hidden flex-shrink-0">
                  {allImages.length > 0 ? (
                    <img
                      src={allImages[currentImageIndex]}
                      alt={`${product.name} - Image ${currentImageIndex + 1}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <div className="text-center">
                        <Package className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500 text-sm">No images available</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Navigation Arrows */}
                  {allImages.length > 1 && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg rounded-full p-2"
                        onClick={() => handleImageNavigation('prev')}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg rounded-full p-2"
                        onClick={() => handleImageNavigation('next')}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                  
                  {/* Image Counter */}
                  {allImages.length > 1 && (
                    <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded-full text-xs font-medium">
                      {currentImageIndex + 1} / {allImages.length}
                    </div>
                  )}

                  {/* Status Badge */}
                  <div className="absolute top-4 right-4">
                    <Badge variant="outline" className="bg-white/90 text-gray-900 border-gray-300">
                      {product.in_stock ? "In Stock" : "Out of Stock"}
                    </Badge>
                  </div>
                </div>

                {/* Thumbnail Gallery - Vertical */}
                {allImages.length > 1 && (
                  <div className="flex flex-col gap-2 overflow-y-auto max-h-96">
                    {allImages.slice(0, 6).map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`flex-shrink-0 relative group ${
                          index === currentImageIndex 
                            ? 'ring-2 ring-fem-terracotta ring-offset-1' 
                            : 'hover:ring-2 hover:ring-gray-300 ring-offset-1'
                        }`}
                      >
                        <img
                          src={image}
                          alt={`${product.name} thumbnail ${index + 1}`}
                          className="w-16 h-16 object-cover rounded-lg border-2 border-gray-200 hover:border-gray-300 transition-colors"
                        />
                        {index === currentImageIndex && (
                          <div className="absolute inset-0 bg-fem-terracotta/20 rounded-lg flex items-center justify-center">
                            <div className="w-1.5 h-1.5 bg-fem-terracotta rounded-full"></div>
                          </div>
                        )}
                      </button>
                    ))}
                    {allImages.length > 6 && (
                      <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-lg border-2 border-gray-200 flex items-center justify-center">
                        <span className="text-xs font-medium text-gray-600">+{allImages.length - 6}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Product Information */}
            <div className="lg:col-span-2 space-y-6">
              {/* Product Title & Meta */}
              <div>
                <div className="flex items-start justify-between mb-2">
                  <h1 className="text-3xl font-bold text-gray-900 leading-tight">{product.name}</h1>
                  <Badge variant="outline" className="bg-gradient-to-r from-fem-terracotta/10 to-fem-gold/10 text-fem-terracotta border-fem-terracotta/30">
                    {product.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {business?.city}, {business?.county}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {product.created_at ? formatToBritishDate(product.created_at) : 'Recently added'}
                  </span>
                </div>

                {/* Product Tags */}
                <div className="flex gap-2 mb-4">
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    {product.in_stock ? "Available" : "Out of Stock"}
                  </Badge>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    {product.price_currency}
                  </Badge>
                </div>
              </div>

              {/* Description Section */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Description</h3>
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    {product.description || 'No detailed description available for this product.'}
                  </p>
                  
                  {/* Product Features */}
                  <div className="mt-6">
                    <h4 className="font-semibold text-gray-900 mb-3">What's Included:</h4>
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-fem-terracotta rounded-full mt-2 flex-shrink-0"></div>
                        <span>Quality product guarantee</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-fem-terracotta rounded-full mt-2 flex-shrink-0"></div>
                        <span>Secure packaging</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-fem-terracotta rounded-full mt-2 flex-shrink-0"></div>
                        <span>Customer support</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-fem-terracotta rounded-full mt-2 flex-shrink-0"></div>
                        <span>Flexible delivery options</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </Card>

              {/* Social Sharing */}
              <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
                <span className="text-sm text-gray-600">Share this product:</span>
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
                    {product.price.toLocaleString()} {product.price_currency}
                  </div>
                  <p className="text-sm text-gray-600">Negotiable</p>
                </div>
                
                <div className="space-y-3">
                  <Button 
                    onClick={handleBuyNow}
                    className="w-full bg-gradient-to-r from-fem-terracotta to-fem-gold hover:from-fem-terracotta/90 hover:to-fem-gold/90 text-white"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Buy Now
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
                <Card className="p-6 space-y-4">
                  <div>
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
                    </div>
                  </div>

                  {/* Business Hours */}
                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-fem-terracotta" />
                        <span className="text-sm font-semibold text-gray-900">
                          Business Hours
                        </span>
                      </div>
                      {isLoadingHours && (
                        <span className="text-xs text-gray-500">Loading...</span>
                      )}
                    </div>
                    {businessHours && businessHours.length > 0 ? (
                      <div className="space-y-2 text-sm">
                        {/* Today chip */}
                        {(() => {
                          const todayIdx = new Date().getDay();
                          const today = businessHours.find(h => h.day_of_week === todayIdx);
                          const fmt = (t?: string | null) =>
                            t ? t.split(':').slice(0, 2).join(':') : '';
                          const label = !today
                            ? 'Hours not available'
                            : today.is_closed
                            ? 'Closed today'
                            : `Open today ${fmt(today.open_time)} - ${fmt(today.close_time)}`;
                          return (
                            <div className="inline-flex items-center gap-2 rounded-full bg-fem-terracotta/5 px-3 py-1 border border-fem-terracotta/20 text-fem-terracotta">
                              <span className="text-xs font-semibold uppercase tracking-wide">
                                Today
                              </span>
                              <span className="text-xs font-medium">{label}</span>
                            </div>
                          );
                        })()}

                        {/* Condensed weekly summary */}
                        {(() => {
                          const daysShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                          const fmt = (t?: string | null) =>
                            t ? t.split(':').slice(0, 2).join(':') : '';

                          const sorted = businessHours
                            .slice()
                            .sort((a, b) => a.day_of_week - b.day_of_week);

                          type Segment = { start: number; end: number; label: string };
                          const segments: Segment[] = [];

                          sorted.forEach(h => {
                            const label = h.is_closed
                              ? 'Closed'
                              : `${fmt(h.open_time)}-${fmt(h.close_time)}`;
                            const last = segments[segments.length - 1];
                            if (last && last.label === label && last.end === h.day_of_week - 1) {
                              last.end = h.day_of_week;
                            } else {
                              segments.push({ start: h.day_of_week, end: h.day_of_week, label });
                            }
                          });

                          const summary = segments
                            .map(seg => {
                              const dayRange =
                                seg.start === seg.end
                                  ? daysShort[seg.start]
                                  : `${daysShort[seg.start]}–${daysShort[seg.end]}`;
                              return seg.label === 'Closed'
                                ? `${dayRange}: Closed`
                                : `${dayRange}: ${seg.label.replace('-', '–')}`;
                            })
                            .join(' • ');

                          return (
                            <p className="text-xs text-gray-700 leading-relaxed">
                              {summary}
                            </p>
                          );
                        })()}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-500">
                        Business hours have not been added yet.
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-gray-200">
                    <Link to={`/business/${business.id}`} className="block">
                      <Button className="w-full bg-fem-terracotta hover:bg-fem-terracotta/90 text-white">
                        <Building2 className="h-4 w-4 mr-2" />
                        View Business Profile
                      </Button>
                    </Link>
                  </div>
                </Card>
              )}
            </div>
          </div>

          {/* Product Reviews Section */}
          {product && (
            <ReviewSection
              type="product"
              itemId={product.id.toString()}
              itemName={product.name}
              canReview={true}
            />
          )}
        </div>
      </main>
      <Footer />

      {/* Modals */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        serviceName={product?.name || ''}
        businessEmail={business?.email || ''}
        onBookingSuccess={() => {
          toast({
            title: "Purchase Request Sent",
            description: "Your purchase request has been sent to the business.",
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
