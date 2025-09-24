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
  Package, 
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

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  price_currency: string;
  product_image_url?: string;
  images?: string[];
  is_active?: boolean;
  in_stock: boolean;
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

export const ProductDetailPage: React.FC = () => {
  const { id, categorySlug, productSlug } = useParams<{ 
    id?: string; 
    categorySlug?: string; 
    productSlug?: string; 
  }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [business, setBusiness] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (id || (categorySlug && productSlug)) {
      loadProductDetails();
    }
  }, [id, categorySlug, productSlug]);

  const loadProductDetails = async () => {
    try {
      setIsLoading(true);
      let productData: Product;
      
      if (categorySlug && productSlug) {
        // Use new category-based API
        productData = await apiService.getProductByCategory(categorySlug, productSlug);
      } else if (id) {
        // Use legacy ID-based API
        productData = await apiService.getProduct(id);
      } else {
        throw new Error('No valid product identifier provided');
      }
      
      setProduct(productData);
      
      if (productData.business) {
        setBusiness(productData.business);
      }
    } catch (error) {
      console.error('Error loading product details:', error);
      toast({
        title: "Error",
        description: "Failed to load product details. Please try again.",
        variant: "destructive"
      });
      navigate('/directory');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageNavigation = (direction: 'next' | 'prev') => {
    if (!product) return;
    
    const allImages = [
      ...(product.images || []),
      ...(product.product_image_url ? [product.product_image_url] : [])
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
            <p className="mt-4 text-gray-600">Loading product details...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="p-6 text-center">
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Product Not Found</h2>
              <p className="text-gray-600 mb-4">
                The product you're looking for doesn't exist or has been removed.
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
    ...(product.images || []),
    ...(product.product_image_url ? [product.product_image_url] : [])
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

          {/* Product Gallery Section */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Package className="h-5 w-5 text-fem-terracotta" />
                <h2 className="text-xl font-semibold text-gray-900">Product Gallery</h2>
              </div>
              
              <div className="flex gap-4">
                {/* Main Image - Smaller, more visible */}
                <div className="relative w-64 h-48 bg-white rounded-xl shadow-md overflow-hidden flex-shrink-0">
                  {allImages.length > 0 ? (
                    <img 
                      src={allImages[currentImageIndex]} 
                      alt={`${product.name} - Image ${currentImageIndex + 1}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                      <div className="text-center">
                        <Package className="h-12 w-12 text-gray-400 mx-auto mb-2" />
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
                          alt={`${product.name} thumbnail ${index + 1}`}
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

          {/* Product Reviews Section - Creative Design */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-gradient-to-r from-fem-terracotta to-fem-gold rounded-full flex items-center justify-center">
                  <Star className="h-4 w-4 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Product Reviews</h2>
                <Badge variant="outline" className="ml-auto bg-gradient-to-r from-fem-terracotta/10 to-fem-gold/10 text-fem-terracotta border-fem-terracotta/30">
                  0 Reviews
                </Badge>
              </div>

              {/* Creative Empty State */}
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
                  Be the first to share your experience with this product! Your review helps others make informed decisions.
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

              {/* Review Guidelines */}
              <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                  <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">i</span>
                  </div>
                  Review Guidelines
                </h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Share your honest experience with the product</li>
                  <li>• Include details about quality, delivery, and seller communication</li>
                  <li>• Help other buyers make informed decisions</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Side - Product Details */}
            <div className="space-y-6">
              {/* Product Title & Meta */}
              <div>
                <div className="flex items-start justify-between mb-2">
                  <h1 className="text-3xl font-bold text-gray-900 leading-tight">{product.name}</h1>
                  <Badge variant="outline" className="bg-gradient-to-r from-fem-terracotta/10 to-fem-gold/10 text-fem-terracotta border-fem-terracotta/30">
                    {product.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {business?.city}, {business?.county}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {product.created_at ? formatToBritishDate(product.created_at) : 'Recently added'}
                  </span>
                </div>
              </div>

              {/* Price Section */}
              <Card className="p-6 bg-gradient-to-r from-fem-terracotta/5 to-fem-gold/5 border-fem-terracotta/20">
                <div className="flex items-baseline gap-3 mb-2">
                  <span className="text-4xl font-bold text-fem-terracotta">
                    {product.price.toLocaleString()} {product.price_currency}
                  </span>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    {product.in_stock ? "In Stock" : "Out of Stock"}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">Price is negotiable</p>
              </Card>

              {/* Description */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                <p className="text-gray-700 leading-relaxed">
                  {product.description || 'No detailed description available for this product.'}
                </p>
              </Card>

              {/* Business Information */}
              {business && (
                <Card className="p-6 bg-gray-50">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Seller Information</h3>
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
                      Contact Seller
                    </Button>
                    <Button variant="outline" className="flex-1 border-fem-terracotta text-fem-terracotta hover:bg-fem-terracotta hover:text-white">
                      <Mail className="h-4 w-4 mr-2" />
                      Send Message
                    </Button>
                  </div>
                </Card>
              )}

              {/* Product Details */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Product Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Status</span>
                    <Badge variant={product.is_active ? "default" : "secondary"}>
                      {product.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Stock</span>
                    <span className="font-medium">{product.in_stock ? "Available" : "Out of Stock"}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Currency</span>
                    <span className="font-medium">{product.price_currency}</span>
                  </div>
                  {product.created_at && (
                    <div className="flex justify-between py-2">
                      <span className="text-gray-600">Listed</span>
                      <span className="font-medium">{formatToBritishDate(product.created_at)}</span>
                    </div>
                  )}
                </div>
              </Card>

              {/* Safety Tips */}
              <Card className="p-6 bg-blue-50 border-blue-200">
                <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">!</span>
                  </div>
                  Safety Tips
                </h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Always meet in a public place</li>
                  <li>• Inspect the product before payment</li>
                  <li>• Avoid prepayments or advance payments</li>
                  <li>• Check all documents and receipts</li>
                </ul>
              </Card>

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
        </div>
      </main>
      <Footer />
    </div>
  );
};
