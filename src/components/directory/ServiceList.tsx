import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useBusiness } from '@/contexts/BusinessContext';
import { Service, Business } from '@/services/api';
import { Pagination } from '@/components/Pagination';
import { Search, Filter, Star, MapPin, Building2, Settings, Grid3X3, List, Eye, Share2, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { AnimatePresence } from 'framer-motion';
import { useAuth } from "@/contexts/AuthContext";
import LikeButton from "@/components/LikeButton";
import ShareModal from "@/components/ui/ShareModal";
import { type ShareData } from "@/utils/sharing";
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { getBusinessImageUrl, getBusinessLogoUrl } from '@/utils/imageUtils';

interface ServiceListProps {
  filters: {
    searchTerm: string;
    category: string;
    county: string;
    rating: [number, number];
    priceRange: [number, number];
    verifiedOnly: boolean;
    openNow: boolean;
    hasPhotos: boolean;
    sortBy: string;
    priceRange?: string;
    duration?: string;
  };
  itemsPerPage?: number;
}

export const ServiceList: React.FC<ServiceListProps> = ({ 
  filters, 
  itemsPerPage = 15 
}) => {
  const { services, businesses, isLoading, fetchServices, totalServicesCount } = useBusiness();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { isAuthenticated } = useAuth();
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [currentShareData, setCurrentShareData] = useState<ShareData | null>(null);

  // Calculate paging window from API pagination
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  // We rely on server-side pagination; services already represent the current page
  const filteredServices = Array.isArray(services) ? services : [];

  // Update total items and pages when filtered services change
  useEffect(() => {
    console.log('ServiceList - totalServicesCount:', totalServicesCount);
    console.log('ServiceList - filteredServices.length:', filteredServices.length);
    setTotalItems(totalServicesCount || filteredServices.length);
    setTotalPages(Math.ceil((totalServicesCount || filteredServices.length) / itemsPerPage) || 1);
    console.log('ServiceList - Setting totalItems to:', totalServicesCount || filteredServices.length);
  }, [filteredServices, itemsPerPage, totalServicesCount]);

  // Separate effect to ensure totalServicesCount updates are handled
  useEffect(() => {
    console.log('ServiceList - totalServicesCount changed to:', totalServicesCount);
    if (totalServicesCount > 0) {
      setTotalItems(totalServicesCount);
      setTotalPages(Math.ceil(totalServicesCount / itemsPerPage));
      console.log('ServiceList - Updated totalItems to:', totalServicesCount);
      console.log('ServiceList - Updated totalPages to:', Math.ceil(totalServicesCount / itemsPerPage));
    }
  }, [totalServicesCount, itemsPerPage]);

  // Fetch from API when page, page size, or filters change
  useEffect(() => {
    const params: any = { page: currentPage, limit: itemsPerPage };
    // Map a subset of filters to API params if available
    if (filters?.priceRange && filters.priceRange !== 'all') params.price_range = filters.priceRange;
    if (filters?.duration && filters.duration !== 'all') params.duration = filters.duration;
    if (filters?.category && filters.category !== 'all') params.category = filters.category;
    if (filters?.searchTerm) params.search = filters.searchTerm;
    fetchServices(params);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, itemsPerPage, filters.searchTerm, filters.category, filters.priceRange, filters.duration]);

  // Services are already paginated by server
  const paginatedServices = filteredServices;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleServiceClick = (service: Service) => {
    // Navigate to the business page when service is clicked
    let business;
    if (typeof service.business === 'string') {
      // Business is an ID string, find it in the businesses array
      business = businesses.find(b => b.id === service.business);
    } else {
      business = service.business;
    }
    
    if (business && typeof business === 'object' && business.id) {
      navigate(`/business/${business.id}`);
    } else if (typeof service.business === 'string') {
      // If we can't find the business but have the ID, navigate to it directly
      navigate(`/business/${service.business}`);
    }
  };

  const handleShare = (e: React.MouseEvent, service: Service, business: Business) => {
    e.stopPropagation();
    
    const shareData: ShareData = {
      title: service.name,
      description: service.description || `Check out ${service.name} from ${business.business_name}`,
      url: window.location.href,
      imageUrl: service.service_image_url || business.business_image_url,
      businessName: business.business_name,
      category: business.category?.name || 'Service'
    };
    
    setCurrentShareData(shareData);
    setShareModalOpen(true);
  };

  const ServiceCard = ({ service }: { service: Service }) => {
    let business;
    if (typeof service.business === 'string') {
      business = businesses.find(b => b.id === service.business);
    } else {
      business = service.business;
    }

    if (!business) return null;

    return (
      <Card 
        key={service.id} 
        className="group relative overflow-hidden bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer border-0"
        onClick={() => handleServiceClick(service)}
      >
        {/* Service Image */}
        <div className="relative h-48 overflow-hidden">
          <img
            src={service.service_image_url || business.business_logo_url || business.business_image_url || "/placeholder.svg"}
            alt={service.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "/placeholder.svg";
            }}
          />
          
          {/* Overlay with Action Buttons */}
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-end p-3">
            <div className="flex gap-2">
              {isAuthenticated && (
                <LikeButton
                  itemId={service.id}
                  itemType="service"
                  itemName={service.name}
                  businessName={business.business_name}
                  businessId={business.id}
                  description={service.description}
                  price={service.price_range}
                  priceCurrency=""
                  rating={business.rating}
                  reviewCount={business.review_count}
                  inStock={true}
                  isActive={true}
                  size="sm"
                  className="bg-white/90 hover:bg-white shadow-lg"
                />
              )}
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => handleShare(e, service, business)}
                className="bg-white/90 hover:bg-white text-fem-navy hover:text-fem-terracotta shadow-lg h-8 w-8 p-0 rounded-full"
              >
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Price Tag - Floating Design */}
          <div className="absolute bottom-3 left-3">
            <div className="bg-fem-terracotta text-white px-4 py-2 rounded-full shadow-xl font-bold text-sm">
              {service.price_range}
            </div>
          </div>
          
          {/* Duration Indicator */}
          {service.duration && (
            <div className="absolute bottom-3 right-3">
              <Badge className="bg-black/80 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg border border-white/20">
                <Clock className="w-3 h-3 mr-1" />
                {service.duration}
              </Badge>
            </div>
          )}
        </div>

        <CardContent className="p-5">
          {/* Service Name */}
          <h3 className="font-bold text-lg text-fem-navy mb-3 group-hover:text-fem-terracotta transition-colors duration-300 cursor-pointer line-clamp-2">
            {service.name}
          </h3>

          {/* Business Name with Verification */}
          <div className="flex items-center gap-2 mb-3">
            <Building2 className="w-4 h-4 text-fem-terracotta" />
            <span className="text-sm font-medium text-gray-700">{business.business_name}</span>
            {business.is_verified && (
              <Badge className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                <Star className="w-2 h-2 mr-1" />
                Verified
              </Badge>
            )}
          </div>

          {/* Service Description */}
          {service.description && (
            <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
              {service.description}
            </p>
          )}

          {/* Business Location */}
          <div className="flex items-center text-sm text-gray-500 mb-4">
            <MapPin className="w-4 h-4 mr-2 text-fem-terracotta" />
            <span>{business.city && business.county ? `${business.city}, ${business.county}` : business.address}</span>
          </div>

          {/* Business Rating and Reviews */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                <span className="text-sm font-bold text-gray-800 ml-1">
                  {typeof business.rating === 'number' ? business.rating.toFixed(1) : business.rating}
                </span>
              </div>
              <span className="text-xs text-gray-500">
                ({business.review_count || 0} reviews)
              </span>
            </div>
          </div>
          
          {/* Action Button */}
          <Button
            className="w-full bg-gradient-to-r from-fem-terracotta to-fem-navy hover:from-fem-terracotta/90 hover:to-fem-navy/90 text-white font-semibold py-2 rounded-lg transition-all duration-300 hover:scale-105 shadow-lg"
            onClick={(e) => {
              e.stopPropagation();
              handleServiceClick(service);
            }}
          >
            <Eye className="w-4 h-4 mr-2" />
            View Service Details
          </Button>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* View Mode Toggle */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
            className="flex items-center space-x-2"
          >
            <Grid3X3 className="w-4 h-4" />
            <span>Grid</span>
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
            className="flex items-center space-x-2"
          >
            <List className="w-4 h-4" />
            <span>List</span>
          </Button>
        </div>
        
        <div className="text-sm text-gray-600">
          Showing {startIndex + 1}-{Math.min(endIndex, totalItems)} of {totalItems} services
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-48 w-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Services Grid */}
      {!isLoading && paginatedServices.length > 0 && (
        <div className={`grid gap-6 ${
          viewMode === 'grid' 
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
            : 'grid-cols-1'
        }`}>
          <AnimatePresence>
            {paginatedServices.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* No Services Found */}
      {!isLoading && paginatedServices.length === 0 && (
        <div className="text-center py-12">
          <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No services found</h3>
          <p className="text-gray-500">Try adjusting your filters or search terms.</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
          />
        </div>
      )}

      {/* Share Modal */}
      {currentShareData && (
        <ShareModal
          isOpen={shareModalOpen}
          onClose={() => setShareModalOpen(false)}
          shareData={currentShareData}
        />
      )}
    </div>
  );
}; 