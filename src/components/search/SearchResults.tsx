import React, { useState, useMemo } from 'react';
import { Search, Building2, Settings, Package, Star, MapPin, Clock, TrendingUp, Filter } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useBusiness } from '@/contexts/BusinessContext';
import { useNavigate } from 'react-router-dom';
import { usePrefetchBusiness } from '@/hooks/useBusinessQuery';

interface SearchResultsProps {
  searchTerm: string;
  filters: any;
  onResultClick: (result: any, type: 'business' | 'service' | 'product') => void;
}

interface SearchResult {
  id: string;
  slug?: string;
  name: string;
  description?: string;
  type: 'business' | 'service' | 'product';
  business?: any;
  rating?: number;
  reviewCount?: number;
  price?: number;
  priceRange?: string;
  category?: string;
  location?: string;
  image?: string;
  isVerified?: boolean;
  isActive?: boolean;
  inStock?: boolean;
}

export const SearchResults: React.FC<SearchResultsProps> = ({
  searchTerm,
  filters,
  onResultClick
}) => {
  const { businesses, services, products } = useBusiness();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const prefetchBusiness = usePrefetchBusiness();

  // Transform data into unified search results
  const searchResults = useMemo(() => {
    const results: SearchResult[] = [];

    // Add businesses
    businesses.forEach(business => {
      results.push({
        id: business.id,
        name: business.business_name,
        description: business.description,
        type: 'business',
        business: business,
        rating: business.rating,
        reviewCount: (business as any).review_count,
        category: (business as any).category?.name,
        location: business.city || business.address,
        image: business.business_image_url,
        isVerified: (business as any).is_verified,
        isActive: business.is_active
      });
    });

    // Add services
    services.forEach(service => {
      const business = typeof service.business === 'string' 
        ? businesses.find(b => b.id === service.business)
        : service.business;

      results.push({
        id: service.id,
        slug: (service as any).slug,
        name: service.name,
        description: service.description,
        type: 'service',
        business: business,
        priceRange: service.price_range,
        category: service.category,
        location: business?.city || business?.address,
        image: business?.business_image_url,
        isVerified: business ? (business as any).is_verified : false,
        isActive: (service as any).is_active
      });
    });

    // Add products
    products.forEach(product => {
      const business = typeof product.business === 'string' 
        ? businesses.find(b => b.id === product.business)
        : product.business;

      results.push({
        id: product.id,
        slug: (product as any).slug,
        name: product.name,
        description: product.description,
        type: 'product',
        business: business,
        price: product.price,
        category: product.category,
        location: business?.city || business?.address,
        image: business?.business_image_url,
        isVerified: business ? (business as any).is_verified : false,
        isActive: (product as any).is_active,
        inStock: product.in_stock
      });
    });

    return results;
  }, [businesses, services, products]);

  // Filter results based on search term and filters
  const filteredResults = useMemo(() => {
    if (!searchTerm.trim()) return searchResults;

    const searchLower = searchTerm.toLowerCase();
    
    return searchResults.filter(result => {
      // Text search
      const matchesSearch = 
        result.name.toLowerCase().includes(searchLower) ||
        result.description?.toLowerCase().includes(searchLower) ||
        result.business?.business_name?.toLowerCase().includes(searchLower) ||
        result.category?.toLowerCase().includes(searchLower) ||
        result.location?.toLowerCase().includes(searchLower);

      if (!matchesSearch) return false;

      // Apply filters
      if (filters.category && result.category !== filters.category) return false;
      if (filters.verifiedOnly && !result.isVerified) return false;
      if (filters.hasPhotos && !result.image) return false;
      if (filters.inStock && result.type === 'product' && !result.inStock) return false;
      if (filters.rating && result.rating && (result.rating < filters.rating[0] || result.rating > filters.rating[1])) return false;

      return true;
    });
  }, [searchResults, searchTerm, filters]);

  // Group results by type
  const groupedResults = useMemo(() => {
    const grouped = {
      all: filteredResults,
      businesses: filteredResults.filter(r => r.type === 'business'),
      services: filteredResults.filter(r => r.type === 'service'),
      products: filteredResults.filter(r => r.type === 'product')
    };

    // Sort each group
    Object.keys(grouped).forEach(key => {
      grouped[key as keyof typeof grouped].sort((a, b) => {
        switch (filters.sortBy) {
          case 'rating':
            return (b.rating || 0) - (a.rating || 0);
          case 'name':
            return a.name.localeCompare(b.name);
          case '-name':
            return b.name.localeCompare(a.name);
          case 'review_count':
            return (b.reviewCount || 0) - (a.reviewCount || 0);
          default:
            return 0;
        }
      });
    });

    return grouped;
  }, [filteredResults, filters.sortBy]);

  // Handle result click
  const handleResultClick = (result: SearchResult) => {
    onResultClick(result, result.type);
    
    // Navigate to appropriate page based on result type
    if (result.type === 'business') {
      navigate(`/business/${result.id}`);
    } else if (result.type === 'product') {
      // Use category-based URL if available, fallback to ID-based
      if (result.business?.category?.slug) {
        navigate(`/category/${result.business.category.slug}/product/${result.slug || result.id}`);
      } else {
        navigate(`/product/${result.id}`);
      }
    } else if (result.type === 'service') {
      // Use category-based URL if available, fallback to ID-based
      if (result.business?.category?.slug) {
        navigate(`/category/${result.business.category.slug}/service/${result.slug || result.id}`);
      } else {
        navigate(`/service/${result.id}`);
      }
    }
  };

  // Get result type icon
  const getResultTypeIcon = (type: string) => {
    switch (type) {
      case 'business': return <Building2 className="w-4 h-4" />;
      case 'service': return <Settings className="w-4 h-4" />;
      case 'product': return <Package className="w-4 h-4" />;
      default: return <Search className="w-4 h-4" />;
    }
  };

  // Get result type color
  const getResultTypeColor = (type: string) => {
    switch (type) {
      case 'business': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'service': return 'bg-green-100 text-green-800 border-green-200';
      case 'product': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Render result card
  const ResultCard = ({ result }: { result: SearchResult }) => {
    const handleMouseEnter = () => {
      // Only prefetch for business results
      if (result.type === 'business') {
        prefetchBusiness(result.id);
      }
    };

    return (
      <Card 
        className="h-full bg-white/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer hover:scale-[1.02] rounded-xl"
        onClick={() => handleResultClick(result)}
        onMouseEnter={handleMouseEnter}
      >
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={`${getResultTypeColor(result.type)}`}>
              {getResultTypeIcon(result.type)}
              <span className="ml-1 capitalize">{result.type}</span>
            </Badge>
            {result.isVerified && (
              <Badge variant="default" className="bg-green-600 text-white">
                <Star className="w-3 h-3 mr-1" />
                Verified
              </Badge>
            )}
          </div>
          {result.rating && (
            <div className="flex items-center gap-1 text-sm">
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
              <span className="font-medium">{result.rating.toFixed(1)}</span>
              {result.reviewCount && (
                <span className="text-gray-500">({result.reviewCount})</span>
              )}
            </div>
          )}
        </div>

        {/* Title */}
        <h3 className="font-bold text-lg text-fem-navy mb-2 group-hover:text-fem-terracotta transition-colors duration-300 line-clamp-2">
          {result.name}
        </h3>

        {/* Business Name */}
        {result.business && result.type !== 'business' && (
          <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
            <Building2 className="w-3 h-3" />
            <span className="font-medium">{result.business.business_name}</span>
          </div>
        )}

        {/* Description */}
        {result.description && (
          <p className="text-gray-700 text-sm mb-3 line-clamp-2">
            {result.description}
          </p>
        )}

        {/* Category */}
        {result.category && (
          <div className="mb-3">
            <Badge variant="outline" className="text-xs bg-gray-50 text-gray-700 border-gray-200">
              {result.category}
            </Badge>
          </div>
        )}

        {/* Location */}
        {result.location && (
          <div className="flex items-center text-sm text-gray-600 mb-3">
            <MapPin className="w-4 h-4 mr-1" />
            <span className="truncate">{result.location}</span>
          </div>
        )}

        {/* Price */}
        {(result.price || result.priceRange) && (
          <div className="flex items-center text-sm font-medium text-fem-terracotta mb-3">
            <span>
              {result.price ? `KSh ${result.price.toLocaleString()}` : result.priceRange}
            </span>
          </div>
        )}

        {/* Stock Status */}
        {result.type === 'product' && (
          <div className="flex items-center gap-2">
            <Badge 
              variant={result.inStock ? "default" : "secondary"}
              className={result.inStock ? "bg-green-600 text-white" : "bg-red-100 text-red-800"}
            >
              {result.inStock ? 'In Stock' : 'Out of Stock'}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Search Stats */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-fem-navy">
            Search Results for "{searchTerm}"
          </h2>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <TrendingUp className="w-4 h-4" />
            <span>{filteredResults.length} results found</span>
          </div>
        </div>

        {/* Result Type Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-gray-100/50 backdrop-blur-sm">
            <TabsTrigger 
              value="all" 
              className="flex items-center gap-2 text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-fem-terracotta data-[state=active]:to-fem-gold data-[state=active]:text-white"
            >
              <Search className="w-4 h-4" />
              All ({groupedResults.all.length})
            </TabsTrigger>
            <TabsTrigger 
              value="businesses" 
              className="flex items-center gap-2 text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-fem-terracotta data-[state=active]:to-fem-gold data-[state=active]:text-white"
            >
              <Building2 className="w-4 h-4" />
              Businesses ({groupedResults.businesses.length})
            </TabsTrigger>
            <TabsTrigger 
              value="services" 
              className="flex items-center gap-2 text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-fem-terracotta data-[state=active]:to-fem-gold data-[state=active]:text-white"
            >
              <Settings className="w-4 h-4" />
              Services ({groupedResults.services.length})
            </TabsTrigger>
            <TabsTrigger 
              value="products" 
              className="flex items-center gap-2 text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-fem-terracotta data-[state=active]:to-fem-gold data-[state=active]:text-white"
            >
              <Package className="w-4 h-4" />
              Products ({groupedResults.products.length})
            </TabsTrigger>
          </TabsList>

          {/* Results Content */}
          <TabsContent value="all" className="mt-6">
            {groupedResults.all.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groupedResults.all.map((result) => (
                  <ResultCard key={`${result.type}-${result.id}`} result={result} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
                <p className="text-gray-500">Try adjusting your search terms or filters.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="businesses" className="mt-6">
            {groupedResults.businesses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groupedResults.businesses.map((result) => (
                  <ResultCard key={`${result.type}-${result.id}`} result={result} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No businesses found</h3>
                <p className="text-gray-500">Try adjusting your search terms or filters.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="services" className="mt-6">
            {groupedResults.services.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groupedResults.services.map((result) => (
                  <ResultCard key={`${result.type}-${result.id}`} result={result} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No services found</h3>
                <p className="text-gray-500">Try adjusting your search terms or filters.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="products" className="mt-6">
            {groupedResults.products.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groupedResults.products.map((result) => (
                  <ResultCard key={`${result.type}-${result.id}`} result={result} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-500">Try adjusting your search terms or filters.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SearchResults;
