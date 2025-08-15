import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Star, 
  Phone, 
  MapPin, 
  Shield, 
  Heart, 
  Grid3X3, 
  List,
  Package,
  Clock,
  ExternalLink,
  Camera,
  Eye,
  MessageCircle,
  TrendingUp,
  Award,
  X,
  Building2,
  ShoppingCart,
  DollarSign,
  Tag,
  Truck,
  CheckCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MotionWrapper, HoverCard, GlassmorphismCard, GlowingCard } from "@/components/ui/MotionWrapper";
import { scrollAnimations, hoverAnimations } from "@/utils/animation";
import { useBusiness } from "@/contexts/BusinessContext";
import { Product } from "@/services/api";
import { Pagination } from "@/components/Pagination";

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

interface ProductListProps {
  filters: any;
  currentPage?: number;
  itemsPerPage?: number;
  onPageChange?: (page: number) => void;
}

export const ProductList = ({ filters, currentPage = 1, itemsPerPage = 15, onPageChange }: ProductListProps) => {
  const navigate = useNavigate();
  const { products, businesses, isLoading } = useBusiness();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  // Debug logging
  console.log('ProductList - products received:', products);
  console.log('ProductList - businesses received:', businesses);
  console.log('ProductList - isLoading:', isLoading);
  console.log('ProductList - filters:', filters);

  // GSAP Scroll Animations
  useEffect(() => {
    if (listRef.current) {
      scrollAnimations.staggerFadeInOnScroll('.product-card', 0.1);
    }

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [products]);

  // Filter products based on filters
  const filteredProducts = Array.isArray(products) ? products.filter(product => {
    // Get the business for this product
    const businessId = typeof product.business === 'string' ? product.business : product.business?.id;
    const business = businesses.find(b => b.id === businessId);
    if (!business) return false;

    // Filter by search term
    if (filters.searchTerm && 
        !product.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) &&
        !product.description?.toLowerCase().includes(filters.searchTerm.toLowerCase()) &&
        !business.business_name.toLowerCase().includes(filters.searchTerm.toLowerCase())) return false;
    
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
    
    return true;
  }) : [];

  // Pagination logic
  const totalItems = filteredProducts.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  const toggleFavorite = (productId: string) => {
    setFavorites(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleProductClick = (product: Product) => {
    // Navigate to the business page when product is clicked
    // Handle both string and object business references
    const businessId = typeof product.business === 'string' ? product.business : product.business.id;
    const business = businesses.find(b => b.id === businessId);
    if (business) {
      navigate(`/business/${business.id}`);
    }
  };

  const ProductCard = ({ product }: { product: Product }) => {
    // Handle both string and object business references
    const businessId = typeof product.business === 'string' ? product.business : product.business.id;
    const business = businesses.find(b => b.id === businessId);
    
    if (!business) return null;

    return (
      <MotionWrapper animation="fadeIn" delay={0.1}>
        <HoverCard className="h-full">
          <Card 
            className="product-card h-full bg-white/90 backdrop-blur-sm border-2 border-fem-navy/10 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer"
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
                    <Shield className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                </div>
              )}

              {/* Favorite Button */}
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white/80 hover:bg-white"
                                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(product.id || '');
                  }}
              >
                <Heart 
                  className={`w-4 h-4 ${favorites.includes(product.id || '') ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} 
                />
              </Button>
            </div>

            <CardContent className="p-4">
              {/* Product Name */}
              <h3 className="font-semibold text-lg text-fem-navy mb-2 group-hover:text-fem-blue transition-colors duration-200">
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
                  <DollarSign className="w-4 h-4 mr-1" />
                  <span className="font-medium">
                    {product.price} {product.price_currency}
                  </span>
                </div>
                
                <div className="flex items-center text-sm text-gray-600">
                  <Tag className="w-4 h-4 mr-1" />
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
        </HoverCard>
      </MotionWrapper>
    );
  };

  if (isLoading) {
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

  if (!filteredProducts.length) {
    return (
      <div className="text-center py-12">
        <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
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
          {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
        </div>
      </div>

      {/* Products Grid/List */}
      <div className={viewMode === "grid" 
        ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
        : "space-y-4"
      }>
        <AnimatePresence>
          {paginatedProducts.map((product, index) => (
            <ProductCard key={product.id || `product-${index}`} product={product} />
          ))}
        </AnimatePresence>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange || (() => {})}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
          />
        </div>
      )}
    </div>
  );
}; 