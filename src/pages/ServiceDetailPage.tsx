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
  Building2
} from 'lucide-react';
import { apiService } from '@/services/api';
import { formatToBritishDate } from '@/utils/dateUtils';
import { toast } from '@/hooks/use-toast';

interface Service {
  id: string;
  name: string;
  description?: string;
  price_range?: string;
  duration?: string;
  service_image_url?: string;
  images?: string[];
  is_active?: boolean;
  created_at?: string;
  business?: {
    id: string;
    business_name: string;
    city?: string;
    county?: string;
    phone?: string;
    email?: string;
    business_image_url?: string;
  };
}

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

          {/* Service Gallery Section */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Settings className="h-5 w-5 text-fem-terracotta" />
                <h2 className="text-xl font-semibold text-gray-900">Service Gallery</h2>
              </div>
              
              <div className="flex gap-4">
                {/* Main Image - Smaller, more visible */}
                <div className="relative w-64 h-48 bg-white rounded-xl shadow-md overflow-hidden flex-shrink-0">
                  {allImages.length > 0 ? (
                    <img 
                      src={allImages[currentImageIndex] || allImages[0]} 
                      alt={`${service.name} - Image ${currentImageIndex + 1}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                      <div className="text-center">
                        <Settings className="h-12 w-12 text-gray-400 mx-auto mb-2" />
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
                </div>

                {/* Thumbnail Gallery - Vertical */}
                {allImages.length > 1 && (
                  <div className="flex flex-col gap-2 overflow-y-auto max-h-48">
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
                          alt={`${service.name} thumbnail ${index + 1}`}
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

          {/* Reviews moved to bottom for improved hierarchy. */}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Side - Service Details */}
            <div className="space-y-6">
              {/* Service Title & Meta */}
              <div>
                <div className="flex items-start justify-between mb-2">
                  <h1 className="text-3xl font-bold text-gray-900 leading-tight">{service.name}</h1>
                  <Badge variant="outline" className="bg-gradient-to-r from-fem-terracotta/10 to-fem-gold/10 text-fem-terracotta border-fem-terracotta/30">
                    {service.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {business?.city}, {business?.county}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {service.created_at ? formatToBritishDate(service.created_at) : 'Recently added'}
                  </span>
                </div>
              </div>

              {/* Price Section */}
              <Card className="p-6 bg-gradient-to-r from-fem-terracotta/5 to-fem-gold/5 border-fem-terracotta/20">
                <div className="flex items-baseline gap-3 mb-2">
                  <span className="text-4xl font-bold text-fem-terracotta">
                    {service.price_range || 'Contact for pricing'}
                  </span>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    Service
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">Price is negotiable</p>
              </Card>

              {/* Description */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Service Description</h3>
                <p className="text-gray-700 leading-relaxed">
                  {service.description || 'No detailed description available for this service.'}
                </p>
              </Card>

              {/* Service Details - cleaner structured layout */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-lg border border-gray-100 p-4 bg-white">
                    <div className="text-xs uppercase tracking-wide text-gray-500">Duration</div>
                    <div className="mt-1 font-semibold text-fem-navy">{service.duration || 'Not specified'}</div>
                  </div>
                  <div className="rounded-lg border border-gray-100 p-4 bg-white">
                    <div className="text-xs uppercase tracking-wide text-gray-500">Status</div>
                    <div className="mt-1">
                      <Badge variant={service.is_active ? 'default' : 'secondary'}>
                        {service.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                  {service.created_at && (
                    <div className="rounded-lg border border-gray-100 p-4 bg-white sm:col-span-2">
                      <div className="text-xs uppercase tracking-wide text-gray-500">Listed</div>
                      <div className="mt-1 font-semibold text-fem-navy">{formatToBritishDate(service.created_at)}</div>
                    </div>
                  )}
                </div>
              </Card>

              {/* Business Information */}
              {business && (
                <Card className="p-6 bg-gray-50">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Service Provider</h3>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-fem-terracotta to-fem-gold rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-lg">
                        {business.business_name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{business.business_name}</p>
                      <p className="text-sm text-gray-600">Verified Business</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button className="flex-1 bg-gradient-to-r from-fem-terracotta to-fem-gold hover:from-fem-terracotta/90 hover:to-fem-gold/90 text-white">
                      <Phone className="h-4 w-4 mr-2" />
                      Contact Provider
                    </Button>
                    <Button variant="outline" className="flex-1 border-fem-terracotta text-fem-terracotta hover:bg-fem-terracotta hover:text-white">
                      <Mail className="h-4 w-4 mr-2" />
                      Send Message
                    </Button>
                  </div>
                </Card>
              )}

              

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button className="flex-1 bg-gradient-to-r from-fem-terracotta to-fem-gold hover:from-fem-terracotta/90 hover:to-fem-gold/90 text-white">
                  <Heart className="h-4 w-4 mr-2" />
                  Save to Favorites
                </Button>
                <Button variant="outline" className="flex-1 border-fem-terracotta text-fem-terracotta hover:bg-fem-terracotta hover:text-white">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </div>

          {/* Service Reviews Section - placed at the bottom */}
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
      </main>
      <Footer />
    </div>
  );
};
