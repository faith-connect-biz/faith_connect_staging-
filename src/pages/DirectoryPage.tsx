import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useBusiness } from '@/contexts/BusinessContext';
import { Search, Filter, X, Building2, Settings, Package, Star, MessageSquare, Sparkles, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BusinessList } from '@/components/directory/BusinessList';
import { ServiceList } from '@/components/directory/ServiceList';
import { ProductList } from '@/components/directory/ProductList';
import { BusinessCategories } from '@/components/BusinessCategories';
import { toast } from 'sonner';

interface Filters {
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
  inStock?: boolean;
}

export const DirectoryPage: React.FC = () => {
  const { fetchBusinesses, fetchServices, fetchProducts, fetchCategories, businesses, totalServicesCount, totalProductsCount } = useBusiness();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('businesses');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    searchTerm: '',
    category: '',
    county: '',
    rating: [0, 5],
    priceRange: [0, 10000],
    verifiedOnly: false,
    openNow: false,
    hasPhotos: false,
    sortBy: 'name'
  });

  // Session-based randomization key
  const [sessionKey] = useState(() => Math.random().toString(36).substring(7));

  // Handle URL parameters for search from landing page
  useEffect(() => {
    const urlSearchTerm = searchParams.get('search');
    const urlCategory = searchParams.get('category');
    
    if (urlSearchTerm) {
      setSearchTerm(decodeURIComponent(urlSearchTerm));
    }
    
    if (urlCategory) {
      setFilters(prev => ({ ...prev, category: decodeURIComponent(urlCategory) }));
    }
  }, [searchParams]);

  // Instant search - update filters immediately when search term changes
  useEffect(() => {
    setFilters(prev => ({ ...prev, searchTerm }));
    
    // Update URL parameters when search term changes, but preserve category
    const currentCategory = searchParams.get('category');
    if (searchTerm) {
      const newParams = { search: searchTerm };
      if (currentCategory) {
        newParams.category = currentCategory;
      }
      setSearchParams(newParams, { replace: true });
    } else {
      // Only clear search, keep category if it exists
      if (currentCategory) {
        setSearchParams({ category: currentCategory }, { replace: true });
      } else {
        setSearchParams({}, { replace: true });
      }
    }
  }, [searchTerm, setSearchParams, searchParams]);

  // Handle search input changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Clear search
  const clearSearch = () => {
    setSearchTerm('');
    // Preserve category when clearing search
    const currentCategory = searchParams.get('category');
    if (currentCategory) {
      setSearchParams({ category: currentCategory }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  };

  // Load initial data
  useEffect(() => {
    fetchBusinesses({ page: 1, limit: 100 });
    fetchServices({ page: 1, limit: 100 });
    fetchProducts({ page: 1, limit: 100 });
    fetchCategories();
  }, [fetchBusinesses, fetchServices, fetchProducts, fetchCategories]);

  // Shuffle data based on session key for consistent randomization per session
  const shuffledBusinesses = useMemo(() => {
    if (!Array.isArray(businesses)) return [];
    return [...businesses].sort(() => {
      // Use session key to create consistent but random ordering
      return 0.5 - (parseInt(sessionKey, 36) % 100) / 100;
    });
  }, [businesses, sessionKey]);

  // Calculate statistics
  const verifiedBusinesses = shuffledBusinesses.filter(b => b.is_verified).length;
  
  const averageRating = (() => {
    if (shuffledBusinesses.length === 0) return "0.0";
    
    const businessesWithRatings = shuffledBusinesses.filter(b => 
      b.rating && Number(b.rating) > 0 && !isNaN(Number(b.rating))
    );
    
    if (businessesWithRatings.length === 0) return "0.0";
    
    const totalRating = businessesWithRatings.reduce((sum, b) => {
      const rating = Number(b.rating);
      return sum + (isNaN(rating) ? 0 : rating);
    }, 0);
    
    return (totalRating / businessesWithRatings.length).toFixed(1);
  })();
  
  const totalReviews = shuffledBusinesses.reduce((sum, b) => sum + (b.review_count || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          
          {/* Enhanced Header */}
          <div className="mb-8 text-center">
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-fem-navy to-fem-terracotta text-white px-4 sm:px-6 py-3 rounded-full shadow-lg mb-4">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
              <h1 className="text-xl sm:text-2xl font-bold">Services & Products Directory</h1>
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <p className="text-gray-600 max-w-2xl mx-auto px-4 text-sm sm:text-base">
              Discover trusted businesses, services, and quality products from our faith community. Connect with local entrepreneurs through their offerings.
            </p>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 sm:p-4 text-center shadow-lg">
              <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-br from-fem-terracotta to-fem-gold rounded-full flex items-center justify-center mx-auto mb-2">
                <Settings className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="text-lg sm:text-2xl font-bold text-fem-navy">{totalServicesCount || 0}</div>
              <div className="text-xs sm:text-sm text-gray-600">Total Services</div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 sm:p-4 text-center shadow-lg">
              <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-br from-fem-navy to-fem-terracotta rounded-full flex items-center justify-center mx-auto mb-2">
                <Package className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="text-lg sm:text-2xl font-bold text-fem-navy">{totalProductsCount || 0}</div>
              <div className="text-xs sm:text-sm text-gray-600">Total Products</div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 sm:p-4 text-center shadow-lg">
              <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-br from-fem-gold to-fem-terracotta rounded-full flex items-center justify-center mx-auto mb-2">
                <Star className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="text-lg sm:text-2xl font-bold text-fem-navy">{averageRating}</div>
              <div className="text-xs sm:text-sm text-gray-600">Avg Rating</div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 sm:p-4 text-center shadow-lg">
              <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-br from-fem-terracotta to-fem-navy rounded-full flex items-center justify-center mx-auto mb-2">
                <MessageSquare className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="text-lg sm:text-2xl font-bold text-fem-navy">{totalReviews}</div>
              <div className="text-xs sm:text-sm text-gray-600">Reviews</div>
            </div>
          </div>

          {/* Search and Filters Section */}
          <div className="mb-8">
            {/* Category Indicator */}
            {filters.category && (
              <div className="max-w-4xl mx-auto mb-4">
                <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-blue-800 font-medium">Filtering by category:</span>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-300">
                      {filters.category}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setFilters(prev => ({ ...prev, category: '' }));
                      setSearchParams({}, { replace: true });
                    }}
                    className="text-blue-600 hover:text-blue-800 hover:bg-blue-100"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Clear Category
                  </Button>
                </div>
              </div>
            )}

            {/* Search Bar */}
            <div className="max-w-4xl mx-auto mb-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-600 w-6 h-6 z-10 pointer-events-none" />
                <Input
                  type="text"
                  placeholder="Search businesses, services, and products..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="pl-14 pr-12 py-4 text-lg bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-xl relative z-0"
                />
                {searchTerm && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 z-10"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                )}
              </div>
            </div>

            {/* Filter Toggle */}
            <div className="flex justify-center">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm border-0 shadow-lg"
              >
                <Filter className="w-4 h-4" />
                <span>{showFilters ? 'Hide' : 'Show'} Filters</span>
              </Button>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-xl mb-8">
              <CardHeader className="bg-gradient-to-r from-fem-navy to-fem-terracotta text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                  <Filter className="w-4 h-4 sm:w-5 sm:h-5" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-fem-navy mb-2">Category</label>
                    <select
                      value={filters.category}
                      onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white/80 backdrop-blur-sm"
                    >
                      <option value="">All Categories</option>
                      <option value="food">Food & Dining</option>
                      <option value="health">Health & Wellness</option>
                      <option value="retail">Retail</option>
                      <option value="services">Professional Services</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-fem-navy mb-2">Sort By</label>
                    <select
                      value={filters.sortBy}
                      onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white/80 backdrop-blur-sm"
                    >
                      <option value="name">Name</option>
                      <option value="rating">Rating</option>
                      <option value="reviews">Most Reviews</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-fem-navy mb-2">Price Range</label>
                    <select
                      value={`${filters.priceRange[0]}-${filters.priceRange[1]}`}
                      onChange={(e) => {
                        const [min, max] = e.target.value.split('-').map(Number);
                        setFilters(prev => ({ ...prev, priceRange: [min, max] }));
                      }}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white/80 backdrop-blur-sm"
                    >
                      <option value="0-10000">Any Price</option>
                      <option value="0-1000">Under $1,000</option>
                      <option value="1000-5000">$1,000 - $5,000</option>
                      <option value="5000-10000">$5,000+</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Main Content */}
          <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-fem-navy to-fem-terracotta text-white rounded-t-lg">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                  <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
                  {activeTab === "businesses" ? "Businesses" : activeTab === "services" ? "Services" : "Products"}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-gray-100/50 backdrop-blur-sm">
                  <TabsTrigger 
                    value="services" 
                    className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-fem-terracotta data-[state=active]:to-fem-gold data-[state=active]:text-white"
                  >
                    <Settings className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Services</span>
                    <span className="sm:hidden">Services</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="businesses" 
                    className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-fem-terracotta data-[state=active]:to-fem-gold data-[state=active]:text-white"
                  >
                    <Building2 className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Businesses</span>
                    <span className="sm:hidden">Businesses</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="products" 
                    className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-fem-terracotta data-[state=active]:to-fem-gold data-[state=active]:text-white"
                  >
                    <Package className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Products</span>
                    <span className="sm:hidden">Products</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="services" className="mt-4 sm:mt-6">
                  <div className="mb-4 sm:mb-6">
                    <h3 className="text-lg sm:text-xl sm:text-2xl font-bold text-fem-navy mb-2">Professional Services</h3>
                    <p className="text-gray-600 text-sm sm:text-base">Discover trusted service providers in our community</p>
                  </div>
                  <ServiceList filters={filters} />
                </TabsContent>

                <TabsContent value="businesses" className="mt-4 sm:mt-6">
                  <div className="mb-4 sm:mb-6">
                    <h3 className="text-lg sm:text-xl sm:text-2xl font-bold text-fem-navy mb-2">Local Businesses</h3>
                    <p className="text-gray-600 text-sm sm:text-base">Discover trusted businesses in our community</p>
                  </div>
                  <BusinessList filters={filters} />
                </TabsContent>

                <TabsContent value="products" className="mt-4 sm:mt-6">
                  <div className="mb-4 sm:mb-6">
                    <h3 className="text-lg sm:text-xl sm:text-2xl font-bold text-fem-navy mb-2">Quality Products</h3>
                    <p className="text-gray-600 text-sm sm:text-base">Find high-quality products from local businesses</p>
                  </div>
                  <ProductList filters={filters} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DirectoryPage;