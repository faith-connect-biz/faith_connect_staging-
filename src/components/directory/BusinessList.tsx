import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBusiness } from '@/contexts/BusinessContext';
import { Business } from '@/services/api';
import { Pagination } from '@/components/Pagination';
import { Star, MapPin, Building2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { getBusinessImageUrl } from '@/utils/imageUtils';
import { usePrefetchBusiness } from '@/hooks/useBusinessQuery';

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
  console.log('🔍 BusinessList - Component rendered:', {
    filters,
    itemsPerPage,
    timestamp: new Date().toISOString(),
    renderId: Math.random().toString(36).substring(7)
  });
  
  const { businesses, isLoading, fetchBusinesses, totalCount, currentPage: contextCurrentPage, totalPages: contextTotalPages, categories } = useBusiness();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const prefetchBusiness = usePrefetchBusiness();

  // Use businesses directly from server (server-side filtering) - NO SHUFFLING to prevent UI dancing
  const filteredBusinesses = useMemo(() => {
    if (!Array.isArray(businesses)) return [];
    // Return businesses in their original order from API
    return businesses;
  }, [businesses]);

  // Update pagination from context (server-side pagination)
  // Only update if values actually changed and we're not currently fetching
  useEffect(() => {
    // Skip updates if we're currently fetching to prevent circular updates
    if (isFetchingRef.current) {
      return;
    }
    
    if (totalCount !== totalItems) {
      setTotalItems(totalCount || 0);
    }
    if (contextTotalPages !== totalPages) {
      setTotalPages(contextTotalPages || 1);
    }
    // Only update currentPage if it's significantly different (more than 1 page difference)
    // This prevents minor updates from triggering re-fetches
    if (contextCurrentPage !== currentPage && Math.abs((contextCurrentPage || 1) - currentPage) > 0) {
      setCurrentPage(contextCurrentPage || 1);
    }
  }, [totalCount, contextTotalPages, contextCurrentPage, totalItems, totalPages, currentPage]);

  // Extract stable filter values to prevent unnecessary re-renders
  const searchTerm = useMemo(() => filters.searchTerm?.trim() || '', [filters.searchTerm]);
  const category = useMemo(() => filters.category?.trim() || '', [filters.category]);
  
  // Track previous params to prevent infinite loops
  const prevParamsRef = useRef<string>('');
  const isFetchingRef = useRef<boolean>(false);
  const fetchFnRef = useRef(fetchBusinesses);
  const categoriesRef = useRef(categories);
  
  // Update refs when they change (without triggering fetch)
  useEffect(() => {
    fetchFnRef.current = fetchBusinesses;
  }, [fetchBusinesses]);
  
  useEffect(() => {
    categoriesRef.current = categories;
  }, [categories]);
  
  // Fetch businesses from API with server-side pagination and search
  useEffect(() => {
    // Prevent concurrent fetches
    if (isFetchingRef.current) {
      console.log('🔍 BusinessList - Skipping fetch: already fetching');
      return;
    }
    
    const searchParams: any = { page: currentPage, limit: itemsPerPage };
    
    // Add search term if provided
    if (searchTerm) {
      searchParams.search = searchTerm;
    }
    
    // Convert category slug to category ID if provided (for consistency with services/products)
    if (category) {
      // Check if it's already a number (ID)
      const categoryId = parseInt(category, 10);
      if (!isNaN(categoryId)) {
        searchParams.category = categoryId;
      } else if (categoriesRef.current && categoriesRef.current.length > 0) {
        // It's a slug, find the matching category ID
        const matchedCategory = categoriesRef.current.find(
          (cat): cat is { id: number; slug: string; name: string } => {
            if (!cat || typeof cat !== 'object') return false;
            const categoryObj = cat as any;
            return (categoryObj.slug === category) || 
                   (categoryObj.name?.toLowerCase() === category.toLowerCase());
          }
        );
        if (matchedCategory) {
          searchParams.category = matchedCategory.id;
        }
      }
    }
    
    // Create a stable, normalized key to compare params (sort keys for consistency)
    const normalizedParams = Object.keys(searchParams)
      .sort()
      .reduce((acc: any, key) => {
        acc[key] = searchParams[key];
        return acc;
      }, {});
    const paramsKey = JSON.stringify(normalizedParams);
    
    // Only fetch if params actually changed
    if (prevParamsRef.current === paramsKey) {
      console.log('🔍 BusinessList - Skipping fetch: params unchanged', { paramsKey });
      return;
    }
    
    console.log('🔍 BusinessList - Fetching with new params:', { 
      oldParams: prevParamsRef.current, 
      newParams: paramsKey,
      searchParams 
    });
    
    prevParamsRef.current = paramsKey;
    isFetchingRef.current = true;
    
    // Debounce search to prevent excessive API calls
    const timeoutId = setTimeout(async () => {
      try {
        console.log('🔍 BusinessList - Executing fetch:', searchParams);
        await fetchFnRef.current(searchParams);
      } catch (error) {
        console.error('🔍 BusinessList - Fetch error:', error);
      } finally {
        // Reset fetching flag after state updates complete
        setTimeout(() => {
          isFetchingRef.current = false;
          console.log('🔍 BusinessList - Fetch complete, flag reset');
        }, 200);
      }
    }, searchTerm ? 300 : 0); // 300ms delay for search, immediate for page changes

    return () => {
      clearTimeout(timeoutId);
      // Don't reset flag in cleanup - let the finally block handle it
    };
  }, [currentPage, itemsPerPage, searchTerm, category]); // Use stable memoized values

  // Use filtered businesses directly (no client-side pagination)
  const paginatedBusinesses = filteredBusinesses;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Fetch new page data with current filters
    const searchParams: any = { page, limit: itemsPerPage };
    
    if (filters.searchTerm && filters.searchTerm.trim()) {
      searchParams.search = filters.searchTerm.trim();
    }
    
    // Convert category slug to category ID if provided
    if (filters.category && filters.category.trim()) {
      const categoryId = parseInt(filters.category, 10);
      if (!isNaN(categoryId)) {
        searchParams.category = categoryId;
      } else {
        const matchedCategory = categories.find(
          (cat): cat is { id: number; slug: string; name: string } => {
            if (!cat || typeof cat !== 'object') return false;
            const category = cat as any;
            return (category.slug === filters.category) || 
                   (category.name?.toLowerCase() === filters.category.toLowerCase());
          }
        );
        if (matchedCategory) {
          searchParams.category = matchedCategory.id;
        }
      }
    }
    
    fetchBusinesses(searchParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBusinessClick = (business: Business) => {
    navigate(`/business/${business.id}`);
  };

  const BusinessCard = ({ business }: { business: Business }) => {
    const handleMouseEnter = () => {
      prefetchBusiness(business.id);
    };

    // Get location string
    const location = business.city && (business as any).county 
      ? `${business.city}, ${(business as any).county}` 
      : business.address || 'Location not specified';

    // Get category name
    const categoryName = business.category_details?.name || 
                        (business.category as any)?.name || 
                        'Uncategorized';

    return (
      <Card 
        key={business.id} 
        className="h-full bg-white/90 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden group cursor-pointer hover:scale-[1.02] rounded-2xl"
        onClick={() => handleBusinessClick(business)}
        onMouseEnter={handleMouseEnter}
      >
        {/* Business Image */}
        <div className="relative h-56 overflow-hidden">
          <img
            src={getBusinessImageUrl(business)}
            alt={business.business_name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "/placeholder.svg";
            }}
          />
        </div>
          
        <CardContent className="p-5">
          {/* Business Name */}
          <h3 className="font-bold text-lg text-fem-navy mb-2 group-hover:text-fem-terracotta transition-colors duration-300 cursor-pointer line-clamp-2">
            {business.business_name}
          </h3>

          {/* Business Category */}
          <div className="mb-3">
            <Badge variant="outline" className="text-xs bg-gradient-to-r from-fem-terracotta/10 to-fem-gold/10 text-fem-terracotta border-fem-terracotta/30">
              {categoryName}
            </Badge>
          </div>

          {/* Business Description */}
          {business.description && (
            <p className="text-gray-700 text-sm mb-3 line-clamp-3">
              {business.description}
            </p>
          )}

          {/* Business Location/Address */}
          <div className="flex items-start text-sm text-gray-600 mb-4">
            <MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
            <span className="line-clamp-2">{location}</span>
          </div>

          {/* Business Reviews */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="flex items-center">
              <Star className="w-4 h-4 text-yellow-500 mr-1 fill-yellow-500" />
              <span className="text-sm font-medium text-gray-700">
                {business.rating && !isNaN(Number(business.rating)) ? Number(business.rating).toFixed(1) : '0.0'}
              </span>
              <span className="text-sm text-gray-500 ml-1">
                ({business.review_count || 0} {business.review_count === 1 ? 'review' : 'reviews'})
              </span>
            </div>
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
    </div>
  );
};