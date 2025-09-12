import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBusiness } from '@/contexts/BusinessContext';
import { Business } from '@/services/api';
import { Pagination } from '@/components/Pagination';
import { Star, MapPin, Building2, Phone, Globe, Eye, Share2, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useAuth } from "@/contexts/AuthContext";
import LikeButton from "@/components/LikeButton";
import ShareModal from "@/components/ui/ShareModal";
import { type ShareData } from "@/utils/sharing";
import { getBusinessImageUrl } from '@/utils/imageUtils';

interface BusinessListProps {
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
  };
  itemsPerPage?: number;
}

export const BusinessList: React.FC<BusinessListProps> = ({ 
  filters, 
  itemsPerPage = 15
}) => {
  const { businesses, isLoading, fetchBusinessesWithSearch, totalCount, currentPage: contextCurrentPage, totalPages: contextTotalPages } = useBusiness();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const { isAuthenticated } = useAuth();
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [currentShareData, setCurrentShareData] = useState<ShareData | null>(null);

  // Shuffle function to randomize order and prevent bias
  const shuffleArray = (array: any[]) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Use businesses directly from server (server-side filtering)
  const filteredBusinesses = useMemo(() => {
    if (!Array.isArray(businesses)) return [];
    
    // Randomize the order to prevent bias
    return shuffleArray(businesses);
  }, [businesses]);

  // Update pagination from context (server-side pagination)
  useEffect(() => {
    setTotalItems(totalCount || 0);
    setTotalPages(contextTotalPages || 1);
    setCurrentPage(contextCurrentPage || 1);
  }, [totalCount, contextTotalPages, contextCurrentPage]);

  // Fetch businesses from API with server-side pagination and search
  useEffect(() => {
    const searchParams: any = { page: currentPage, limit: itemsPerPage };
    
    // Add search term if provided
    if (filters.searchTerm && filters.searchTerm.trim()) {
      searchParams.search = filters.searchTerm.trim();
    }
    
    // Add category filter if provided
    if (filters.category && filters.category.trim()) {
      searchParams.category = filters.category;
    }
    
    fetchBusinessesWithSearch(searchParams);
  }, [fetchBusinessesWithSearch, currentPage, itemsPerPage, filters.searchTerm, filters.category]);

  // Use filtered businesses directly (no client-side pagination)
  const paginatedBusinesses = filteredBusinesses;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Fetch new page data with current filters
    const searchParams: any = { page, limit: itemsPerPage };
    
    if (filters.searchTerm && filters.searchTerm.trim()) {
      searchParams.search = filters.searchTerm.trim();
    }
    
    if (filters.category && filters.category.trim()) {
      searchParams.category = filters.category;
    }
    
    fetchBusinessesWithSearch(searchParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBusinessClick = (business: Business) => {
    navigate(`/business/${business.id}`);
  };

  const handleShare = (e: React.MouseEvent, business: Business) => {
    e.stopPropagation();
    
    const shareData: ShareData = {
      title: business.business_name,
      text: business.description || `Check out ${business.business_name}`,
      url: window.location.href,
      image: business.business_image_url,
    };
    
    setCurrentShareData(shareData);
    setShareModalOpen(true);
  };

  const BusinessCard = ({ business }: { business: Business }) => {
    return (
      <Card 
        key={business.id} 
        className="h-full bg-white/90 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden group cursor-pointer hover:scale-[1.02] rounded-2xl"
        onClick={() => handleBusinessClick(business)}
      >
        {/* Business Image */}
        <div className="relative h-48 overflow-hidden">
          <img
            src={getBusinessImageUrl(business)}
            alt={business.business_name}
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
                  itemId={String(business.id)}
                  itemType="business"
                  itemName={business.business_name}
                  businessName={business.business_name}
                  businessId={business.id}
                  description={business.description}
                  price=""
                  priceCurrency=""
                  rating={Number(business.rating)}
                  reviewCount={Number(business.review_count)}
                  inStock={true}
                  isActive={true}
                  size="sm"
                  className="bg-white/90 hover:bg-white shadow-lg"
                />
              )}
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => handleShare(e, business)}
                className="bg-white/90 hover:bg-white text-fem-navy hover:text-fem-terracotta shadow-lg h-8 w-8 p-0 rounded-full"
              >
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Business Status Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            <Badge variant={business.is_active ? "default" : "secondary"} className="bg-fem-navy/90 text-white">
              {business.is_active ? "Active" : "Inactive"}
            </Badge>
            {business.is_featured && (
              <Badge variant="default" className="bg-fem-gold text-white">
                <Star className="w-3 h-3 mr-1" />
                Featured
              </Badge>
            )}
          </div>

          {/* Business Verification Badge */}
          {business.is_verified && (
            <div className="absolute top-3 right-3">
              <Badge variant="default" className="bg-green-600 text-white">
                <Star className="w-3 h-3 mr-1" />
                Verified
              </Badge>
            </div>
          )}
        </div>

        <CardContent className="p-5">
          {/* Business Name */}
          <h3 className="font-bold text-lg text-fem-navy mb-3 group-hover:text-fem-terracotta transition-colors duration-300 cursor-pointer line-clamp-2">
            {business.business_name}
          </h3>

          {/* Business Category */}
          {business.category && (
            <div className="mb-3">
              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                {business.category.name}
              </Badge>
            </div>
          )}

          {/* Business Description */}
          {business.description && (
            <p className="text-gray-700 text-sm mb-3 line-clamp-2">
              {business.description}
            </p>
          )}

          {/* Business Location */}
          <div className="flex items-center text-sm text-gray-600 mb-3">
            <MapPin className="w-4 h-4 mr-1" />
            {business.city && (business as any).county ? `${business.city}, ${(business as any).county}` : business.address}
          </div>

          {/* Business Contact Info */}
          <div className="mb-3">
            {business.phone && (
              <div className="flex items-center text-sm text-gray-600 mb-1">
                <Phone className="w-4 h-4 mr-1" />
                {business.phone}
              </div>
            )}
            {business.website && (
              <div className="flex items-center text-sm text-gray-600">
                <Globe className="w-4 h-4 mr-1" />
                <span className="truncate">{business.website}</span>
              </div>
            )}
          </div>

          {/* Business Rating */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Star className="w-4 h-4 text-yellow-500 mr-1" />
              <span className="text-sm font-medium text-gray-700">
                {business.rating && !isNaN(Number(business.rating)) ? Number(business.rating).toFixed(1) : '0.0'}
              </span>
              <span className="text-sm text-gray-500 ml-1">
                ({business.review_count || 0} reviews)
              </span>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              className="text-fem-navy border-fem-navy hover:bg-fem-navy hover:text-white"
              onClick={(e) => {
                e.stopPropagation();
                handleBusinessClick(business);
              }}
            >
              View Details
            </Button>
          </div>
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

      {/* Businesses Grid */}
      {!isLoading && paginatedBusinesses.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedBusinesses.map((business) => (
            <BusinessCard key={business.id} business={business} />
          ))}
        </div>
      )}

      {/* No Businesses Found */}
      {!isLoading && paginatedBusinesses.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No businesses found</h3>
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