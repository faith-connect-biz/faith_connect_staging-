import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBusiness } from '@/contexts/BusinessContext';
import { Service, Business } from '@/services/api';
import { Pagination } from '@/components/Pagination';
import { Star, MapPin, Building2, Settings, Eye, Share2, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useAuth } from "@/contexts/AuthContext";
import LikeButton from "@/components/LikeButton";
import ShareModal from "@/components/ui/ShareModal";
import { type ShareData } from "@/utils/sharing";
import { getServiceImageUrl } from '@/utils/imageUtils';

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
  const { isAuthenticated } = useAuth();
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [currentShareData, setCurrentShareData] = useState<ShareData | null>(null);

  // Apply client-side filtering - instant search
  const filteredServices = useMemo(() => {
    if (!Array.isArray(services)) return [];
    
    if (filters.searchTerm && filters.searchTerm.trim()) {
      const searchLower = filters.searchTerm.toLowerCase().trim();
      return services.filter(service => {
        const serviceName = service.name?.toLowerCase() || '';
        const serviceDescription = service.description?.toLowerCase() || '';
        const businessName = (typeof service.business === 'object' ? service.business.business_name : '')?.toLowerCase() || '';
        
        return serviceName.includes(searchLower) || 
               serviceDescription.includes(searchLower) || 
               businessName.includes(searchLower);
      });
    }
    
    return services;
  }, [services, filters.searchTerm]);

  // Update pagination
  useEffect(() => {
    setTotalItems(filteredServices.length);
    setTotalPages(Math.ceil(filteredServices.length / itemsPerPage) || 1);
  }, [filteredServices, itemsPerPage]);

  // Fetch services from API - only once on mount
  useEffect(() => {
    fetchServices({ page: 1, limit: 100 }); // Fetch more items for client-side filtering
  }, [fetchServices]);

  // Paginate filtered services
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedServices = filteredServices.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleServiceClick = (service: Service) => {
    let business;
    if (typeof service.business === 'string') {
      business = businesses.find(b => b.id === service.business);
    } else {
      business = service.business;
    }
    
    if (business && typeof business === 'object' && business.id) {
      navigate(`/business/${business.id}`);
    } else if (typeof service.business === 'string') {
      navigate(`/business/${service.business}`);
    }
  };

  const handleShare = (e: React.MouseEvent, service: Service, business: Business) => {
    e.stopPropagation();
    
    const shareData: ShareData = {
      title: service.name,
      text: service.description || `Check out ${service.name} from ${business.business_name}`,
      url: window.location.href,
      image: service.service_image_url || business.business_image_url,
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
        className="h-full bg-white/90 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden group cursor-pointer hover:scale-[1.02] rounded-2xl"
        onClick={() => handleServiceClick(service)}
      >
        {/* Service Image */}
        <div className="relative h-48 overflow-hidden">
          <img
            src={getServiceImageUrl(service, business)}
            alt={service.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "/placeholder.svg";
            }}
          />
          
          {/* Hover Overlay with Action Buttons */}
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-end p-3">
            <div className="flex gap-2">
              {isAuthenticated && (
                <LikeButton
                  itemId={String(service.id)}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedServices.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
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