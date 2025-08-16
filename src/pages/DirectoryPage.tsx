import { useState, useEffect, useRef } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

import { ServiceList } from "@/components/directory/ServiceList";
import { ProductList } from "@/components/directory/ProductList";
import { BusinessList } from "@/components/directory/BusinessList";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { 
  Search, 
  Settings, 
  Package, 
  Filter, 
  MapPin, 
  Star, 
  Clock,
  Phone,
  X,
  Sparkles,
  TrendingUp,
  Award,
  Heart,
  Globe,
  Users,
  Eye,
  MessageSquare,
  Grid3X3,
  List,
  Shield,
  Building2,

} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useNavigate } from "react-router-dom";
import { useBusiness } from "@/contexts/BusinessContext";

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

const DirectoryPage = () => {
  const { businesses, categories, services, products, isLoading, fetchBusinesses, fetchProducts, totalCount } = useBusiness();
  
  // Debug logging
  console.log('DirectoryPage - businesses:', businesses);
  console.log('DirectoryPage - services:', services);
  console.log('DirectoryPage - products:', products);
  console.log('DirectoryPage - isLoading:', isLoading);
  
  // Debug rating calculation
  if (businesses && businesses.length > 0) {
    console.log('DirectoryPage - Rating debug:', businesses.map(b => ({
      id: b.id,
      name: b.business_name,
      rating: b.rating,
      ratingType: typeof b.rating,
      reviewCount: b.review_count
    })));
  }
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState("businesses");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [filters, setFilters] = useState({
    county: "all",
    category: "all",
    rating: [0, 5],
    priceRange: [0, 10000],
    verifiedOnly: false,
    openNow: false,
    hasPhotos: false,
    sortBy: "default"
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15); // Changed from 12 to 15 businesses per page
  
  const headerRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Fetch businesses with pagination and filters
  useEffect(() => {
    // Always fetch businesses, but use categories for filtering when available
    if (fetchBusinesses) {
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        category: categories && filters.category !== 'all' ? categories.find(cat => cat.name === filters.category)?.id : undefined,
        county: filters.county !== 'all' ? filters.county : undefined,
        rating: filters.rating[1] < 5 ? filters.rating[1] : undefined,
        is_featured: filters.verifiedOnly
      };
      console.log('DirectoryPage - calling fetchBusinesses with params:', params);
      fetchBusinesses(params);
    }
  }, [currentPage, itemsPerPage, filters, categories, fetchBusinesses]);

  // Fetch products when products tab is active
  useEffect(() => {
    if (activeTab === "products" && fetchProducts) {
      console.log('DirectoryPage - calling fetchProducts for products tab');
      fetchProducts();
    }
  }, [activeTab, fetchProducts]);

  // Pagination functions
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle page size change
  const handlePageSizeChange = (newPageSize: number) => {
    setItemsPerPage(newPageSize);
    setCurrentPage(1); // Reset to first page when changing page size
    // Scroll to top when page size changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Reset pagination when filters change
  const resetPagination = () => {
    setCurrentPage(1);
  };

  // Handle URL search parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    
    // Handle search parameter
    const searchParam = urlParams.get('search');
    if (searchParam) {
      setSearchTerm(decodeURIComponent(searchParam));
      setIsSearchExpanded(true);
    }
    
    // Handle category parameter
    const categoryParam = urlParams.get('category');
    if (categoryParam && categories) {
      // Find the category by slug
      const category = categories.find(cat => cat.slug === categoryParam);
      if (category) {
        setFilters(prev => ({
          ...prev,
          category: category.name
        }));
      }
    }
  }, [categories]);

  // GSAP Animations
  useEffect(() => {
    if (headerRef.current) {
      gsap.fromTo(headerRef.current, 
        { y: -50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power2.out" }
      );
    }

    if (statsRef.current) {
      gsap.fromTo(statsRef.current.children,
        { y: 50, opacity: 0 },
        { 
          y: 0, 
          opacity: 1, 
          duration: 0.6, 
          stagger: 0.1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: statsRef.current,
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play none none reverse"
          }
        }
      );
    }

    if (sidebarRef.current) {
      gsap.fromTo(sidebarRef.current,
        { x: -100, opacity: 0 },
        { 
          x: 0, 
          opacity: 1, 
          duration: 0.8, 
          delay: 0.2,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sidebarRef.current,
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play none none reverse"
          }
        }
      );
    }

    if (contentRef.current) {
      gsap.fromTo(contentRef.current,
        { x: 100, opacity: 0 },
        { 
          x: 0, 
          opacity: 1, 
          duration: 0.8, 
          delay: 0.4,
          ease: "power2.out",
          scrollTrigger: {
            trigger: contentRef.current,
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play none none reverse"
          }
        }
      );
    }

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  // Get unique counties from businesses
  const counties = Array.isArray(businesses) ? Array.from(new Set(businesses.map(b => b.county).filter(Boolean))).sort() : [];

  // Get category names from categories
  const categoryNames = Array.isArray(categories) ? categories.map(cat => cat.name) : [];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearchExpanded(false);
    resetPagination(); // Reset pagination when searching
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(e);
    }
  };

  const clearFilters = () => {
    setFilters({
      county: "all",
      category: "all",
      rating: [0, 5],
      priceRange: [0, 10000],
      verifiedOnly: false,
      openNow: false,
      hasPhotos: false,
      sortBy: "default"
    });
    resetPagination();
  };

  // Calculate statistics
  const stats = {
    totalServices: Array.isArray(services) ? services.length : 0,
    totalProducts: Array.isArray(products) ? products.length : 0,
    verifiedBusinesses: Array.isArray(businesses) ? businesses.filter(b => b.is_verified).length : 0,
    averageRating: (() => {
      if (!Array.isArray(businesses) || businesses.length === 0) return "0.0";
      
      // Calculate average rating from businesses with ratings > 0
      const businessesWithRatings = businesses.filter(b => 
        b.rating && Number(b.rating) > 0 && !isNaN(Number(b.rating))
      );
      
      if (businessesWithRatings.length === 0) return "0.0";
      
      const totalRating = businessesWithRatings.reduce((sum, b) => {
        const rating = Number(b.rating);
        return sum + (isNaN(rating) ? 0 : rating);
      }, 0);
      
      return (totalRating / businessesWithRatings.length).toFixed(1);
    })(),
    totalReviews: Array.isArray(businesses) ? businesses.reduce((sum, b) => sum + (b.review_count || 0), 0) : 0
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          
          {/* Enhanced Header */}
          <motion.div 
            ref={headerRef}
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="mb-8 text-center"
          >
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-fem-navy to-fem-terracotta text-white px-6 py-3 rounded-full shadow-lg mb-4">
              <Sparkles className="w-5 h-5" />
              <h1 className="text-2xl font-bold">Services & Products Directory</h1>
              <Sparkles className="w-5 h-5" />
            </div>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover trusted businesses, services, and quality products from our faith community. Connect with local entrepreneurs through their offerings.
            </p>
          </motion.div>

          {/* Stats Section */}
          <motion.div 
            ref={statsRef}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
          >
            <motion.div variants={itemVariants} className="bg-white/80 backdrop-blur-sm rounded-xl p-4 text-center shadow-lg">
              <div className="w-12 h-12 bg-gradient-to-br from-fem-terracotta to-fem-gold rounded-full flex items-center justify-center mx-auto mb-2">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-fem-navy">{stats.totalServices || 0}</div>
              <div className="text-sm text-gray-600">Total Services</div>
            </motion.div>
            
            <motion.div variants={itemVariants} className="bg-white/80 backdrop-blur-sm rounded-xl p-4 text-center shadow-lg">
              <div className="w-12 h-12 bg-gradient-to-br from-fem-navy to-fem-terracotta rounded-full flex items-center justify-center mx-auto mb-2">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-fem-navy">{stats.totalProducts || 0}</div>
              <div className="text-sm text-gray-600">Total Products</div>
            </motion.div>
            
            <motion.div variants={itemVariants} className="bg-white/80 backdrop-blur-sm rounded-xl p-4 text-center shadow-lg">
              <div className="w-12 h-12 bg-gradient-to-br from-fem-gold to-fem-terracotta rounded-full flex items-center justify-center mx-auto mb-2">
                <Star className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-fem-navy">{stats.averageRating}</div>
              <div className="text-sm text-gray-600">Avg Rating</div>
            </motion.div>
            
            <motion.div variants={itemVariants} className="bg-white/80 backdrop-blur-sm rounded-xl p-4 text-center shadow-lg">
              <div className="w-12 h-12 bg-gradient-to-br from-fem-terracotta to-fem-navy rounded-full flex items-center justify-center mx-auto mb-2">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-fem-navy">{stats.totalReviews}</div>
              <div className="text-sm text-gray-600">Reviews</div>
            </motion.div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* Enhanced Sidebar */}
            <motion.div 
              ref={sidebarRef}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="lg:col-span-1"
            >
              <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-xl sticky top-8">
                <CardHeader className="bg-gradient-to-r from-fem-navy to-fem-terracotta text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-2">
                    <Filter className="w-5 h-5" />
                    Filters
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-6">
                  
                  {/* Search */}
                    <div>
                      <Label htmlFor="search" className="text-sm font-medium text-fem-navy">Search</Label>
                      <Input
                        id="search"
                        placeholder="Search services and products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="mt-1"
                      />
                    </div>

                    {/* Category Filter */}
                    <div>
                      <Label className="text-sm font-medium text-fem-navy">Category</Label>
                      <Select value={filters.category} onValueChange={(value) => {
                        setFilters(prev => ({ ...prev, category: value }));
                        resetPagination();
                      }}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="All Categories" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Categories</SelectItem>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.name}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                  {/* County Filter */}
                    <div>
                      <Label className="text-sm font-medium text-fem-navy">County</Label>
                    <Select value={filters.county} onValueChange={(value) => {
                      setFilters(prev => ({ ...prev, county: value }));
                      resetPagination();
                    }}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="All Counties" />
                      </SelectTrigger>
                      <SelectContent>
                          <SelectItem value="all">All Counties</SelectItem>
                        {counties.map((county) => (
                          <SelectItem key={county} value={county}>{county}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    </div>

                    {/* Rating Filter */}
                    <div>
                      <Label className="text-sm font-medium text-fem-navy">Rating: {filters.rating[0]} - {filters.rating[1]}</Label>
                    <Slider
                      value={filters.rating}
                      onValueChange={(value) => {
                        setFilters(prev => ({ ...prev, rating: value as [number, number] }));
                        resetPagination();
                      }}
                      max={5}
                      min={0}
                      step={0.5}
                      className="w-full"
                    />
                    </div>

                    {/* Checkboxes */}
                    <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="verified"
                        checked={filters.verifiedOnly}
                        onCheckedChange={(checked) => {
                          setFilters(prev => ({ ...prev, verifiedOnly: checked as boolean }));
                          resetPagination();
                        }}
                      />
                      <Label htmlFor="verified" className="text-sm text-fem-navy">
                        Verified businesses only
                      </Label>
                    </div>
                    </div>

                  {/* Clear Filters */}
                    <Button
                      onClick={clearFilters}
                      variant="outline"
                      className="w-full"
                    >
                      Clear Filters
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Enhanced Content */}
            <motion.div 
              ref={contentRef}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="lg:col-span-3"
            >
              <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-fem-navy to-fem-terracotta text-white rounded-t-lg">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      {activeTab === "businesses" ? "Businesses" : activeTab === "services" ? "Services" : "Products"}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-white/20 text-white border-white/30 hover:bg-white/30"
                        onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
                      >
                        {viewMode === "grid" ? <List className="w-4 h-4" /> : <Grid3X3 className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-3 bg-gray-100/50 backdrop-blur-sm">
                      <TabsTrigger 
                        value="businesses" 
                        className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-fem-terracotta data-[state=active]:to-fem-gold data-[state=active]:text-white"
                      >
                        <Building2 className="w-4 h-4" />
                        Businesses
                      </TabsTrigger>
                      <TabsTrigger 
                        value="services" 
                        className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-fem-terracotta data-[state=active]:to-fem-gold data-[state=active]:text-white"
                      >
                        <Settings className="w-4 h-4" />
                        Services
                      </TabsTrigger>
                      <TabsTrigger 
                        value="products" 
                        className="flex items-center gap-2 data-[state=active]:bg-gradient-outline data-[state=active]:bg-gradient-to-r data-[state=active]:from-fem-terracotta data-[state=active]:to-fem-gold data-[state=active]:text-white"
                      >
                        <Package className="w-4 h-4" />
                        Products
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="businesses" className="mt-4 sm:mt-6">
                      <div className="mb-6">
                        <h3 className="text-xl sm:text-2xl font-bold text-fem-navy mb-2">Local Businesses</h3>
                        <p className="text-gray-600">Discover trusted businesses in our community</p>
                      </div>
                      
                      <BusinessList 
                        filters={{ ...filters, searchTerm }} 
                        currentPage={currentPage}
                        itemsPerPage={itemsPerPage}
                        onPageChange={handlePageChange}
                        totalCount={totalCount}
                      />
                      
                      {/* Page Size Selector and Pagination for Businesses */}
                      <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-gray-50/50 rounded-lg border">
                        <div className="flex items-center gap-3">
                          <Label htmlFor="page-size" className="text-sm font-medium text-gray-700">
                            Items per page:
                          </Label>
                          <Select value={itemsPerPage.toString()} onValueChange={(value) => handlePageSizeChange(Number(value))}>
                            <SelectTrigger className="w-20">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="15">15</SelectItem>
                              <SelectItem value="30">30</SelectItem>
                              <SelectItem value="60">60</SelectItem>
                              <SelectItem value="100">100</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        {/* Pagination Info */}
                        <div className="text-sm text-gray-600">
                          {isLoading ? (
                            <span>Loading...</span>
                          ) : (
                            `Showing ${((currentPage - 1) * itemsPerPage) + 1} to ${Math.min(currentPage * itemsPerPage, totalCount || 0)} of ${totalCount || 0} businesses`
                          )}
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="services" className="mt-4 sm:mt-6">
                      <div className="mb-6">
                            <h3 className="text-xl sm:text-2xl font-bold text-fem-navy mb-2">Professional Services</h3>
                        <p className="text-gray-600">Discover trusted service providers in our community</p>
                          </div>
                          
                      <ServiceList 
                        filters={{ ...filters, searchTerm }} 
                        currentPage={currentPage}
                        itemsPerPage={itemsPerPage}
                        onPageChange={handlePageChange}
                      />
                    </TabsContent>

                    <TabsContent value="products" className="mt-4 sm:mt-6">
                      <div className="mb-6">
                        <h3 className="text-xl sm:text-2xl font-bold text-fem-navy mb-2">Quality Products</h3>
                        <p className="text-gray-600">Find high-quality products from local businesses</p>
                        </div>
                        
                      <ProductList 
                        filters={{ ...filters, searchTerm }} 
                        itemsPerPage={itemsPerPage}
                      />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DirectoryPage;