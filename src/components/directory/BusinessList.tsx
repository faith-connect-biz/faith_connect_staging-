import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import LikeButton from "@/components/LikeButton";
import { Pagination } from "@/components/Pagination";
import { 
  Star, 
  Phone, 
  MapPin, 
  Shield, 
  Heart, 
  Grid3X3, 
  List,
  Settings,
  Package,
  Award,
  X,
  Building2,
  Users,
  CheckCircle,
  MessageCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MotionWrapper, HoverCard, GlassmorphismCard, GlowingCard } from "@/components/ui/MotionWrapper";
import { scrollAnimations, hoverAnimations } from "@/utils/animation";
import { useBusiness } from "@/contexts/BusinessContext";
import { useAuth } from "@/contexts/AuthContext";
import { Business, apiService } from "@/services/api";
import { toast } from "@/hooks/use-toast";
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { getBusinessImageUrl, getBusinessLogoUrl } from '@/utils/imageUtils';
import { ProtectedContactInfo } from '@/components/ui/ProtectedContactInfo';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

interface BusinessListProps {
  filters: any;
  currentPage?: number;
  itemsPerPage?: number;
  onPageChange?: (page: number) => void;
  totalCount?: number;
}

export const BusinessList = ({ filters, currentPage = 1, itemsPerPage = 15, onPageChange, totalCount }: BusinessListProps) => {
  const navigate = useNavigate();
  const { businesses, isLoadingBusinesses, fetchBusinesses, totalCount: contextTotalCount } = useBusiness();
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(currentPage);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Debug logging - reduce spam
  // console.log('BusinessList - businesses received:', businesses);
  // console.log('BusinessList - isLoadingBusinesses:', isLoadingBusinesses);
  // console.log('BusinessList - filters:', filters);
  // console.log('BusinessList - contextTotalCount:', contextTotalCount);
  // console.log('BusinessList - totalCount prop:', totalCount);

  // Use context total count if available, otherwise use prop
  const effectiveTotalCount = contextTotalCount || totalCount || 0;

  // Update total items and pages when businesses change
  useEffect(() => {
    // console.log('BusinessList - effectiveTotalCount:', effectiveTotalCount);
    // console.log('BusinessList - businesses.length:', businesses?.length);
    setTotalItems(effectiveTotalCount);
    setTotalPages(Math.ceil(effectiveTotalCount / itemsPerPage) || 1);
    // console.log('BusinessList - Setting totalItems to:', effectiveTotalCount);
    // console.log('BusinessList - Setting totalPages to:', Math.ceil(effectiveTotalCount / itemsPerPage) || 1);
  }, [effectiveTotalCount, itemsPerPage, businesses]);

  // Fetch businesses when page or filters change
  useEffect(() => {
    const params: any = { page, limit: itemsPerPage };
    // Map filters to API params
    if (filters?.category && filters.category !== 'all') params.category = filters.category;
    if (filters?.county && filters.county !== 'all') params.county = filters.county;
    if (filters?.rating && filters.rating[1] < 5) params.rating = filters.rating[1];
    if (filters?.verifiedOnly) params.is_featured = filters.verifiedOnly;
    if (filters?.searchTerm) params.search = filters.searchTerm;
    
    // console.log('BusinessList - calling fetchBusinesses with params:', params);
    fetchBusinesses(params);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, itemsPerPage, filters.searchTerm, filters.category, filters.county, filters.rating, filters.verifiedOnly]);

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    if (onPageChange) {
      onPageChange(newPage);
    }
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // GSAP Scroll Animations
  useEffect(() => {
    if (listRef.current) {
      scrollAnimations.staggerFadeInOnScroll('.business-card', 0.1);
    }

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [businesses]);

  // Filter businesses based on filters
  const filteredBusinesses = Array.isArray(businesses) ? businesses.filter(business => {
    // Filter by search term
    if (filters.searchTerm && 
        !business.business_name.toLowerCase().includes(filters.searchTerm.toLowerCase()) &&
        !business.description?.toLowerCase().includes(filters.searchTerm.toLowerCase())) return false;
    
    // Filter by category
    if (filters.category && filters.category !== "all" && business.category?.name !== filters.category) return false;
    
    // Filter by county
    if (filters.county && filters.county !== "all" && business.county !== filters.county) return false;
    
    // Filter by rating
    const rating = Number(business.rating);
    if (isNaN(rating) || rating < filters.rating[0] || rating > filters.rating[1]) return false;
    
    // Filter by verified only
    if (filters.verifiedOnly && !business.is_verified) return false;
    
    return true;
  }) : [];

  // Pagination logic - removed since we're getting paginated data from API
  // const totalItems = filteredBusinesses.length;
  // const totalPages = Math.ceil(totalItems / itemsPerPage);
  // const startIndex = (currentPage - 1) * itemsPerPage;
  // const endIndex = startIndex + itemsPerPage;
  // const paginatedBusinesses = filteredBusinesses.slice(startIndex, endIndex);
  
  // Use all businesses received from API (they're already paginated)
  const paginatedBusinesses = filteredBusinesses;

  const handleBusinessClick = (business: Business) => {
    // Navigate to the business page when business is clicked
    navigate(`/business/${business.id}`);
  };

  const BusinessCard = ({ business }: { business: Business }) => (
    <MotionWrapper animation="fadeIn" delay={0.1}>
      <HoverCard className="h-full">
        <Card 
          className="business-card h-full bg-white/90 backdrop-blur-sm border-2 border-fem-navy/10 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer"
          onClick={() => handleBusinessClick(business)}
        >
          <div className="relative">
            <img 
              src={business.business_image_url || business.business_logo_url || "/placeholder.svg"} 
              alt={business.business_name}
              className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-100"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "/placeholder.svg";
              }}
            />
            
            {/* Business Status Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-2">
              <Badge variant={business.is_active ? "default" : "secondary"} className="bg-fem-navy/90 text-white">
                {business.is_active ? "Active" : "Inactive"}
              </Badge>
              {business.is_featured && (
                <Badge variant="default" className="bg-fem-gold text-white">
                  <Award className="w-3 h-3 mr-1" />
                  Featured
                </Badge>
              )}
            </div>

            {/* Business Verification Badge */}
            {business.is_verified && (
              <div className="absolute top-3 right-3">
                <Badge variant="default" className="bg-green-600 text-white">
                  <Shield className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
              </div>
            )}

            {/* Action Buttons */}
            <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              {/* Like Button - Only show if user doesn't own the business */}
              {user && business.user?.id && String(business.user.id) !== String(user.id) && (
                <LikeButton
                  itemId={business.id}
                  itemType="business"
                  itemName={business.business_name}
                  businessName={business.business_name}
                  businessId={business.id}
                  description={business.description}
                  rating={business.rating}
                  reviewCount={business.review_count}
                  isActive={business.is_active}
                  size="sm"
                  className="bg-white/80 hover:bg-white"
                />
              )}
            </div>
          </div>

          <CardContent className="p-4">
            {/* Business Name */}
            <h3 className="font-semibold text-lg text-fem-navy mb-2 group-hover:text-fem-blue transition-colors duration-200">
              {business.business_name}
            </h3>

            {/* Business Description */}
            {business.description && (
              <p className="text-gray-700 text-sm mb-3 line-clamp-2">
                {business.description}
              </p>
            )}

            {/* Business Category */}
            {business.category && (
              <div className="mb-3">
                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                  {business.category.name}
                </Badge>
              </div>
            )}

            {/* Business Contact Info */}
            <div className="mb-3">
              <ProtectedContactInfo 
                phone={business.phone}
                email={business.email}
                variant="inline"
              />
            </div>

            {/* Business Location */}
            <div className="flex items-center text-sm text-gray-600 mb-3">
              <MapPin className="w-4 h-4 mr-1" />
              {business.city && business.county ? `${business.city}, ${business.county}` : business.address}
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
      </HoverCard>
    </MotionWrapper>
  );

  if (isLoadingBusinesses) {
    return (
      <div className="space-y-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex space-x-4">
            <Skeleton className="h-48 w-48" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!filteredBusinesses.length) {
    return (
      <div className="text-center py-12">
        <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No businesses found</h3>
        <p className="text-gray-500">Try adjusting your filters or search terms.</p>
      </div>
    );
  }

  return (
    <div ref={listRef} className="space-y-6">
      {/* View Mode Toggle */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("grid")}
          >
            <Grid3X3 className="w-4 h-4 mr-1" />
            Grid
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("list")}
          >
            <List className="w-4 h-4 mr-1" />
            List
          </Button>
        </div>
        
        <div className="text-sm text-gray-500">
          Showing {((page - 1) * itemsPerPage) + 1}-{Math.min(page * itemsPerPage, totalItems)} of {totalItems} businesses
        </div>
      </div>

      {/* Businesses Grid/List */}
      <div className={viewMode === "grid" 
        ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
        : "space-y-4"
      }>
        <AnimatePresence>
          {businesses.map((business) => (
            <BusinessCard key={business.id} business={business} />
          ))}
        </AnimatePresence>
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
          />
        </div>
      )}
    </div>
  );
};