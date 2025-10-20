import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useBusiness } from '@/contexts/BusinessContext';
import { FadeIn, SlideUp, ScaleIn } from '@/components/ui/ScrollAnimation';

// Error Boundary Component for DirectoryPage
class DirectoryPageErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('DirectoryPage Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center max-w-md mx-auto p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h2>
            <p className="text-gray-600 mb-6">
              We're sorry, but something went wrong while loading the directory.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-fem-terracotta text-white px-6 py-3 rounded-lg hover:bg-fem-terracotta/90 transition-colors"
            >
              Try again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
import { Search, Filter, X, Building2, Settings, Package, Star, MessageSquare, Sparkles, TrendingUp, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BusinessList } from '@/components/directory/BusinessList';
import { ServiceList } from '@/components/directory/ServiceList';
import { ProductList } from '@/components/directory/ProductList';
import { DirectorySkeleton } from '@/components/directory/DirectorySkeleton';
import { BusinessCategories } from '@/components/home/BusinessCategories';
import { EpicSearchBar } from '@/components/search/EpicSearchBar';
import { AdvancedSearchFilters } from '@/components/search/AdvancedSearchFilters';
import { DirectoryBreadcrumb } from '@/components/ui/DirectoryBreadcrumb';
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
  // Add error handling for BusinessContext
  const businessContext = useBusiness();
  if (!businessContext) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Loading...</h2>
          <p className="text-gray-600">Please wait while we load the directory.</p>
        </div>
      </div>
    );
  }

  const { 
    fetchBusinesses, 
    fetchServices, 
    fetchProducts, 
    fetchCategories,
    fetchServicesWithPagination,
    fetchProductsWithPagination,
    businesses, 
    services,
    products,
    totalServicesCount, 
    totalProductsCount,
    isLoading,
    isLoadingBusinesses,
    isLoadingServices,
    isLoadingProducts,
    getPriceRanges
  } = businessContext;
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('services');
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

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Handle URL parameters for search from landing page
  useEffect(() => {
    const urlSearchTerm = searchParams.get('search');
    const urlCategory = searchParams.get('category');
    
    if (urlSearchTerm) {
      setSearchTerm(decodeURIComponent(urlSearchTerm));
    }
    
    if (urlCategory) {
      const decodedCategory = decodeURIComponent(urlCategory);
      setFilters(prev => ({ ...prev, category: decodedCategory }));
    }
    
    // Scroll to top when URL parameters change (e.g., category filter from landing page)
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [searchParams]);

  // Instant search - update filters immediately when search term changes
  useEffect(() => {
    setFilters(prev => ({ ...prev, searchTerm }));
    
    // Update URL parameters when search term changes, but preserve category
    const currentCategory = searchParams.get('category');
    if (searchTerm) {
      const newParams: any = { search: searchTerm };
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

  // Scroll to top when active tab changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  // Add a timeout to ensure loading states don't stay true indefinitely
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isLoadingServices) {
        console.log('🔍 DirectoryPage - Services loading timeout, forcing loading to false');
        // The loading state should be managed by the context, but this is a fallback
      }
    }, 40000); // 40 second timeout

    return () => clearTimeout(timeout);
  }, [isLoadingServices]);

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

  // Note: Data loading is handled by BusinessContext, no need to duplicate here

  // Shuffle data based on session key for consistent randomization per session
  const shuffledBusinesses = useMemo(() => {
    if (!Array.isArray(businesses)) return [];
    return [...businesses].sort(() => {
      // Use session key to create consistent but random ordering
      return 0.5 - (parseInt(sessionKey, 36) % 100) / 100;
    });
  }, [businesses, sessionKey]);

  // Calculate statistics
  const verifiedBusinesses = shuffledBusinesses.filter(b => (b as any).is_verified).length;
  
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
  
  const totalReviews = shuffledBusinesses.reduce((sum, b) => sum + ((b as any).review_count || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <FadeIn delay={100}>
            <div className="mb-8">
              <DirectoryBreadcrumb activeTab={activeTab as 'services' | 'businesses' | 'products'} className="shadow-xl" />
            </div>
          </FadeIn>
          
          {/* Enhanced Header */}
          <SlideUp delay={200}>
            <div className="mb-8 text-center">
              <div className="inline-flex items-center gap-3 bg-gradient-to-r from-fem-navy to-fem-terracotta text-white px-4 sm:px-6 py-3 rounded-full shadow-lg mb-4">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                <h1 className="text-xl sm:text-2xl font-bold">Services & Products Directory</h1>
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <p className="text-gray-800 max-w-2xl mx-auto px-6 py-4 text-sm sm:text-base bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-white/20">
                Discover trusted businesses, services, and quality products from our faith community. Connect with local entrepreneurs through their offerings.
              </p>
            </div>
          </SlideUp>

          {/* Stats Section */}
          <ScaleIn delay={300}>
            <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-2 sm:p-4 text-center shadow-lg">
              <div className="w-6 h-6 sm:w-12 sm:h-12 bg-gradient-to-br from-fem-terracotta to-fem-gold rounded-full flex items-center justify-center mx-auto mb-1 sm:mb-2">
                <Settings className="w-3 h-3 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="text-sm sm:text-2xl font-bold text-fem-navy">{totalServicesCount || 0}</div>
              <div className="text-xs text-gray-700 font-medium">Total Services</div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-2 sm:p-4 text-center shadow-lg">
              <div className="w-6 h-6 sm:w-12 sm:h-12 bg-gradient-to-br from-fem-navy to-fem-terracotta rounded-full flex items-center justify-center mx-auto mb-1 sm:mb-2">
                <Package className="w-3 h-3 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="text-sm sm:text-2xl font-bold text-fem-navy">{totalProductsCount || 0}</div>
              <div className="text-xs text-gray-700 font-medium">Total Products</div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-2 sm:p-4 text-center shadow-lg">
              <div className="w-6 h-6 sm:w-12 sm:h-12 bg-gradient-to-br from-fem-gold to-fem-terracotta rounded-full flex items-center justify-center mx-auto mb-1 sm:mb-2">
                <Star className="w-3 h-3 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="text-sm sm:text-2xl font-bold text-fem-navy">{averageRating}</div>
              <div className="text-xs text-gray-700 font-medium">Avg Rating</div>
            </div>
            
          </div>
          </ScaleIn>

          {/* Epic Search Section */}
          <FadeIn delay={400}>
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

            {/* Epic Search Bar */}
            <div className="max-w-4xl mx-auto mb-6">
              <EpicSearchBar
                onSearch={(query, customFilters) => {
                  setSearchTerm(query);
                  if (customFilters) {
                    setFilters(prev => ({ ...prev, ...customFilters }));
                  }
                }}
                placeholder="Search businesses, services, and products..."
                showFilters={true}
                className="w-full"
              />
            </div>

            {/* Search Actions */}
            <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 bg-white border-2 border-gray-200 hover:border-fem-terracotta hover:bg-fem-terracotta/5 text-gray-700 hover:text-fem-terracotta shadow-md hover:shadow-lg transition-all duration-200 px-6 py-3"
              >
                <Filter className="w-4 h-4" />
                <span className="font-medium">{showFilters ? 'Hide Filters' : 'Advanced Filters'}</span>
              </Button>
              <Button
                onClick={() => navigate('/epic-search')}
                className="flex items-center space-x-2 bg-gradient-to-r from-fem-terracotta to-fem-gold hover:from-fem-terracotta/90 hover:to-fem-gold/90 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-3 font-medium"
              >
                <Zap className="w-4 h-4" />
                <span>Epic Search</span>
              </Button>
            </div>
          </div>
          </FadeIn>

          {/* Advanced Filters Panel */}
          {showFilters && (
            <AdvancedSearchFilters
              filters={filters}
              onFiltersChange={setFilters}
              onClearFilters={() => {
                setFilters({
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
                setSearchParams({}, { replace: true });
              }}
              isOpen={showFilters}
              onToggle={() => setShowFilters(!showFilters)}
            />
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
                  {isLoadingServices ? (
                    <DirectorySkeleton count={6} type="service" />
                  ) : services && services.length > 0 ? (
                    <ServiceList filters={filters} />
                  ) : (
                    <div className="text-center py-12">
                      <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No services found</h3>
                      <p className="text-gray-500">Try adjusting your filters or search terms.</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="businesses" className="mt-4 sm:mt-6">
                  <div className="mb-4 sm:mb-6">
                    <h3 className="text-lg sm:text-xl sm:text-2xl font-bold text-fem-navy mb-2">Local Businesses</h3>
                    <p className="text-gray-600 text-sm sm:text-base">Discover trusted businesses in our community</p>
                  </div>
                  {isLoadingBusinesses ? (
                    <DirectorySkeleton count={6} type="business" />
                  ) : (
                    <BusinessList filters={filters} />
                  )}
                </TabsContent>

                <TabsContent value="products" className="mt-4 sm:mt-6">
                  <div className="mb-4 sm:mb-6">
                    <h3 className="text-lg sm:text-xl sm:text-2xl font-bold text-fem-navy mb-2">Quality Products</h3>
                    <p className="text-gray-600 text-sm sm:text-base">Find high-quality products from local businesses</p>
                  </div>
                  {isLoadingProducts ? (
                    <DirectorySkeleton count={6} type="product" />
                  ) : (
                    <ProductList filters={filters} />
                  )}
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

// Wrap DirectoryPage with Error Boundary
const DirectoryPageWithErrorBoundary = () => (
  <DirectoryPageErrorBoundary>
    <DirectoryPage />
  </DirectoryPageErrorBoundary>
);

export default DirectoryPageWithErrorBoundary;