import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useBusiness } from '@/contexts/BusinessContext';
import { Product, Business } from '@/services/api';
import { Pagination } from '@/components/Pagination';
import { Search, Filter, Star, MapPin, Building2, Package, Grid3X3, List } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { AnimatePresence } from 'framer-motion';

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
  const { products, businesses, isLoadingProducts } = useBusiness();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Calculate pagination
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  // Filter products based on filters - show all products for now
  const filteredProducts = Array.isArray(products) ? products.filter(product => {
    // If businesses are not yet loaded, show all products
    if (!Array.isArray(businesses) || businesses.length === 0) {
      console.log('ProductList - businesses not loaded yet, showing all products');
      return true;
    }

    // Handle both business as ID string and business as object
    let business;
    if (typeof product.business === 'string') {
      // Business is an ID string, find it in the businesses array
      business = businesses.find(b => b.id === product.business);
      if (!business) {
        console.log('ProductList - business not found for ID:', product.business, 'but showing product anyway');
        // Don't filter out products whose business is not found - show them all
        return true;
      }
    } else {
      business = product.business;
    }

    // If we have business info, apply filters
    if (business && typeof business === 'object') {
      // Filter by search term
      if (filters.searchTerm && 
          !product.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) &&
          !product.description?.toLowerCase().includes(filters.searchTerm.toLowerCase()) &&
          !business.business_name?.toLowerCase().includes(filters.searchTerm.toLowerCase())) return false;
      
      // Filter by category
      if (filters.category && filters.category !== "all" && business.category?.name !== filters.category) return false;
      
      // Filter by county
      if (filters.county && filters.county !== "all" && business.county !== filters.county) return false;
      
      // Filter by rating
      if (business.rating < filters.rating[0] || business.rating > filters.rating[1]) return false;
      
      // Filter by verified only
      if (filters.verifiedOnly && !business.is_verified) return false;
      
      // Filter by in stock
      if (filters.inStock && !product.in_stock) return false;
    }
    
    // Show all products by default
    return true;
  }) : [];

  // Update total items and pages when filtered products change
  useEffect(() => {
    setTotalItems(filteredProducts.length);
    setTotalPages(Math.ceil(filteredProducts.length / itemsPerPage));
    // Reset to first page when filters change
    setCurrentPage(1);
  }, [filteredProducts, itemsPerPage]);

  // Get paginated products
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

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
        className="h-full bg-white/90 backdrop-blur-sm border-2 border-fem-navy/10 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer hover:border-fem-navy/30 hover:scale-[1.02]"
        onClick={() => handleProductClick(product)}
      >
        <div className="relative">
          <img 
            src={product.product_image_url || product.images?.[0] || business.business_image_url || business.business_logo_url || "/placeholder.svg"} 
            alt={product.name}
            className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/placeholder.svg";
            }}
          />
          
          {/* Product Status Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            <Badge variant={product.is_active ? "default" : "secondary"} className="bg-fem-navy/90 text-white">
              {product.is_active ? "Available" : "Unavailable"}
            </Badge>
            <Badge variant={product.in_stock ? "default" : "destructive"} className="bg-green-600 text-white">
              {product.in_stock ? "In Stock" : "Out of Stock"}
            </Badge>
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

        <CardContent className="p-4">
          {/* Product Name */}
          <h3 className="font-semibold text-lg text-fem-navy mb-2 group-hover:text-fem-blue transition-colors duration-200 cursor-pointer">
            {product.name}
          </h3>

          {/* Business Name */}
          <p className="text-sm text-gray-600 mb-2 flex items-center">
            <Building2 className="w-4 h-4 mr-1" />
            {business.business_name}
          </p>

          {/* Product Description */}
          {product.description && (
            <p className="text-gray-700 text-sm mb-3 line-clamp-2">
              {product.description}
            </p>
          )}

          {/* Product Details */}
          <div className="space-y-2 mb-3">
            <div className="flex items-center text-sm text-gray-600">
              <Package className="w-4 h-4 mr-1" />
              <span className="font-medium">
                {product.price} {product.price_currency}
              </span>
            </div>
            
            <div className="flex items-center text-sm text-gray-600">
              <Package className="w-4 h-4 mr-1" />
              <span>Product</span>
            </div>
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
                {typeof business.rating === 'number' ? business.rating.toFixed(1) : business.rating}
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
                handleProductClick(product);
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
    </div>
  );
}; 