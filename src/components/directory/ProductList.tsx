import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useBusiness } from '@/contexts/BusinessContext';
import { Product, Business } from '@/services/api';
import { Pagination } from '@/components/Pagination';
import { Search, Filter, Star, MapPin, Building2, Package, Grid3X3, List, Eye, Share2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { AnimatePresence } from 'framer-motion';
import { useAuth } from "@/contexts/AuthContext";
import LikeButton from "@/components/LikeButton";
import ShareModal from "@/components/ui/ShareModal";
import { type ShareData } from "@/utils/sharing";

interface ProductListProps {
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
    inStock?: boolean;
  };
  itemsPerPage?: number;
}

export const ProductList: React.FC<ProductListProps> = ({ 
  filters, 
  itemsPerPage = 15 
}) => {
  const { products, businesses, isLoadingProducts, fetchProducts, totalProductsCount } = useBusiness();
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

  // We rely on server-side pagination; products already represent the current page
  const filteredProducts = Array.isArray(products) ? products : [];

  // Update total items and pages when filtered products change
  useEffect(() => {
    console.log('ProductList - totalProductsCount:', totalProductsCount);
    console.log('ProductList - filteredProducts.length:', filteredProducts.length);
    setTotalItems(totalProductsCount || filteredProducts.length);
    setTotalPages(Math.ceil((totalProductsCount || filteredProducts.length) / itemsPerPage) || 1);
    console.log('ProductList - Setting totalItems to:', totalProductsCount || filteredProducts.length);
  }, [filteredProducts, itemsPerPage, totalProductsCount]);

  // Separate effect to ensure totalProductsCount updates are handled
  useEffect(() => {
    console.log('ProductList - totalProductsCount changed to:', totalProductsCount);
    if (totalProductsCount > 0) {
      setTotalItems(totalProductsCount);
      setTotalPages(Math.ceil(totalProductsCount / itemsPerPage));
      console.log('ProductList - Updated totalItems to:', totalProductsCount);
      console.log('ProductList - Updated totalPages to:', Math.ceil(totalProductsCount / itemsPerPage));
    }
  }, [totalProductsCount, itemsPerPage]);

  // Fetch from API when page, page size, or filters change
  useEffect(() => {
    const params: any = { page: currentPage, limit: itemsPerPage };
    // Map a subset of filters to API params if available
    if (filters?.inStock !== undefined) params.in_stock = filters.inStock;
    if (filters?.category && filters.category !== 'all') params.category = filters.category;
    if (filters?.searchTerm) params.search = filters.searchTerm;
    fetchProducts(params);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, itemsPerPage, filters.searchTerm, filters.category, filters.inStock]);

  // Products are already paginated by server
  const paginatedProducts = filteredProducts;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleProductClick = (product: Product) => {
    // Navigate to the business page when product is clicked
    let business;
    if (typeof product.business === 'string') {
      // Business is an ID string, find it in the businesses array
      business = businesses.find(b => b.id === product.business);
    } else {
      business = product.business;
    }
    
    if (business && typeof business === 'object' && business.id) {
      navigate(`/business/${business.id}`);
    } else if (typeof product.business === 'string') {
      // If we can't find the business but have the ID, navigate to it directly
      navigate(`/business/${product.business}`);
    }
  };

  const handleShare = (e: React.MouseEvent, product: Product, business: Business) => {
    e.stopPropagation();
    
    const shareData: ShareData = {
      title: `${product.name} - ${business.business_name}`,
      text: product.description || `Check out this amazing product from ${business.business_name}`,
      url: `${window.location.origin}/business/${business.id}`,
    };
    
    setCurrentShareData(shareData);
    setShareModalOpen(true);
  };

  const getBusinessById = (businessId: string): Business | undefined => {
    return businesses.find(business => business.id === businessId);
  };

  console.log('ProductList - products received:', products);
  console.log('ProductList - businesses received:', businesses);
  console.log('ProductList - isLoadingProducts:', isLoadingProducts);
  console.log('ProductList - filters:', filters);
  console.log('ProductList - all products:', products);
  console.log('ProductList - filteredProducts:', filteredProducts);
  console.log('ProductList - totalItems:', filteredProducts.length);
  console.log('ProductList - businesses available:', businesses?.length || 0);
  console.log('ProductList - pagination:', { currentPage, totalPages, startIndex, endIndex, paginatedProducts: paginatedProducts.length });

  // Pagination logic
  const totalPagesForPagination = Math.ceil(totalItems / itemsPerPage);

  const ProductCard = ({ product }: { product: Product }) => {
    // Handle both business as ID string and business as object
    let business;
    if (typeof product.business === 'string') {
      // Business is an ID string, find it in the businesses array
      business = businesses.find(b => b.id === product.business);
      if (!business) {
        console.log('ProductCard - business not found for ID:', product.business, 'but showing product anyway');
        // Show product with minimal info if business not found
        return (
          <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-gray-500 text-xs text-center">No Image</span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-gray-900 truncate">{product.name}</h3>
                <p className="text-sm text-gray-500 truncate">{product.description}</p>
                <p className="text-sm font-medium text-gray-900">
                  {product.price} {product.price_currency}
                </p>
                <p className="text-xs text-gray-400">Business ID: {product.business}</p>
              </div>
            </div>
          </div>
        );
      }
    } else {
      business = product.business;
    }

    if (!business) return null;

    return (
      <Card 
        className="h-full bg-white border-0 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden group cursor-pointer hover:scale-[1.03] rounded-2xl"
        onClick={() => handleProductClick(product)}
      >
        <div className="relative group">
          {/* Product Image with Hover Effects */}
          <div className="aspect-square bg-gray-50 overflow-hidden">
            <img 
              src={product.product_image_url || product.images?.[0] || business.business_image_url || business.business_logo_url || "/placeholder.svg"} 
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/placeholder.svg";
              }}
            />
          </div>
          
          {/* Hover Overlay with Quick Actions */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300">
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Button
                size="sm"
                className="bg-white text-fem-navy hover:bg-fem-terracotta hover:text-white shadow-lg font-semibold px-4"
                onClick={(e) => {
                  e.stopPropagation();
                  handleProductClick(product);
                }}
              >
                <Eye className="w-4 h-4 mr-2" />
                Quick View
              </Button>
            </div>
          </div>
          
          {/* Product Status Badges - Modern Design */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            <Badge className={`px-3 py-1 text-xs font-semibold rounded-full shadow-lg border-0 ${
              product.is_active ? "bg-blue-500 text-white" : "bg-gray-500 text-white"
            }`}>
              {product.is_active ? "Available" : "Unavailable"}
            </Badge>
            <Badge className={`px-3 py-1 text-xs font-semibold rounded-full shadow-lg border-0 ${
              product.in_stock ? "bg-green-500 text-white" : "bg-red-500 text-white"
            }`}>
              {product.in_stock ? "In Stock" : "Out of Stock"}
            </Badge>
          </div>

          {/* Business Verification Badge */}
          {business.is_verified && (
            <div className="absolute top-3 right-3">
              <Badge className="bg-green-500 text-white px-3 py-1 text-xs font-semibold rounded-full shadow-lg border-0">
                <Star className="w-3 h-3 mr-1" />
                Verified
              </Badge>
            </div>
          )}
          
          {/* Action Buttons - Top Right */}
          <div className="absolute top-3 right-3 flex flex-col gap-2">
            {isAuthenticated && (
              <LikeButton
                itemId={product.id}
                itemType="product"
                itemName={product.name}
                businessName={business.business_name}
                businessId={business.id}
                description={product.description}
                price={product.price}
                priceCurrency={product.price_currency}
                rating={business.rating}
                reviewCount={business.review_count}
                inStock={product.in_stock}
                isActive={product.is_active}
                size="sm"
                className="bg-white/90 hover:bg-white shadow-lg"
              />
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => handleShare(e, product, business)}
              className="bg-white/90 hover:bg-white text-fem-navy hover:text-fem-terracotta shadow-lg h-8 w-8 p-0 rounded-full"
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </div>

          {/* Price Tag - Floating Design */}
          <div className="absolute bottom-3 left-3">
            <div className="bg-fem-terracotta text-white px-4 py-2 rounded-full shadow-xl font-bold text-sm">
              {product.price} {product.price_currency}
            </div>
          </div>
          
          {/* Image Gallery Indicator */}
          {product.images && product.images.length > 1 && (
            <div className="absolute bottom-3 right-3">
              <Badge className="bg-black/80 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg border border-white/20">
                <Package className="w-3 h-3 mr-1" />
                {product.images.length} Photos
              </Badge>
            </div>
          )}
        </div>

        <CardContent className="p-5">
          {/* Product Name */}
          <h3 className="font-bold text-lg text-fem-navy mb-3 group-hover:text-fem-terracotta transition-colors duration-300 cursor-pointer line-clamp-2">
            {product.name}
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

          {/* Product Description */}
          {product.description && (
            <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
              {product.description}
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
              handleProductClick(product);
            }}
          >
            <Eye className="w-4 h-4 mr-2" />
            View Product Details
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
          Showing {startIndex + 1}-{Math.min(endIndex, totalItems)} of {totalItems} products
        </div>
      </div>

      {/* Loading State */}
      {isLoadingProducts && (
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

      {/* Products Grid */}
      {!isLoadingProducts && paginatedProducts.length > 0 && (
        <div className={`grid gap-6 ${
          viewMode === 'grid' 
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
            : 'grid-cols-1'
        }`}>
          <AnimatePresence>
            {paginatedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* No Products Found */}
      {!isLoadingProducts && paginatedProducts.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
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