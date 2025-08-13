import { useState, useEffect, useRef } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BusinessList } from "@/components/directory/BusinessList";
import { ServiceList } from "@/components/directory/ServiceList";
import { ProductList } from "@/components/directory/ProductList";
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
  Building2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useNavigate } from "react-router-dom";
import { useBusiness } from "@/contexts/BusinessContext";

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

const DirectoryPage = () => {
  const { businesses, categories, services, products, isLoading } = useBusiness();
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
  
  const headerRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

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

  const handleSearch = () => {
    // Search functionality is handled by BusinessList component
    setIsSearchExpanded(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
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
  };

  // Calculate statistics
  const stats = {
    totalServices: Array.isArray(services) ? services.length : 0,
    totalProducts: Array.isArray(products) ? products.length : 0,
    verifiedBusinesses: Array.isArray(businesses) ? businesses.filter(b => b.is_verified).length : 0,
    averageRating: (() => {
      if (!Array.isArray(businesses) || businesses.length === 0) return "0.0";
      
      // Calculate average rating from all reviews (matching admin dashboard logic)
      const allReviews = businesses.flatMap(b => 
        Array(b.review_count).fill(b.rating).filter(rating => rating > 0)
      );
      
      return allReviews.length > 0 
        ? (allReviews.reduce((sum, rating) => sum + rating, 0) / allReviews.length).toFixed(1)
        : "0.0";
    })(),
    totalReviews: Array.isArray(businesses) ? businesses.reduce((sum, b) => sum + b.review_count, 0) : 0
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
                      <Select value={filters.category} onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="All Categories" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Categories</SelectItem>
                          {categoryNames.map((category) => (
                            <SelectItem key={category} value={category}>{category}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                  {/* County Filter */}
                    <div>
                      <Label className="text-sm font-medium text-fem-navy">County</Label>
                    <Select value={filters.county} onValueChange={(value) => setFilters(prev => ({ ...prev, county: value }))}>
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
                        onValueChange={(value) => setFilters(prev => ({ ...prev, rating: value as [number, number] }))}
                      max={5}
                      min={0}
                      step={0.5}
                      className="mt-2"
                    />
                    </div>

                    {/* Checkboxes */}
                    <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="verified"
                        checked={filters.verifiedOnly}
                        onCheckedChange={(checked) => setFilters(prev => ({ ...prev, verifiedOnly: checked as boolean }))}
                      />
                        <Label htmlFor="verified" className="text-sm">Verified Only</Label>
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
                      {activeTab === "services" ? "Services" : activeTab === "products" ? "Products" : "Businesses"}
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
                        value="services" 
                        className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-fem-terracotta data-[state=active]:to-fem-gold data-[state=active]:text-white"
                      >
                        <Settings className="w-4 h-4" />
                        Services
                      </TabsTrigger>
                      <TabsTrigger 
                        value="products" 
                        className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-fem-terracotta data-[state=active]:to-fem-gold data-[state=active]:text-white"
                      >
                        <Package className="w-4 h-4" />
                        Products
                      </TabsTrigger>
                      <TabsTrigger 
                        value="businesses" 
                        className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-fem-terracotta data-[state=active]:to-fem-gold data-[state=active]:text-white"
                      >
                        <Building2 className="w-4 h-4" />
                        Businesses
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="services" className="mt-4 sm:mt-6">
                      <div className="mb-6">
                            <h3 className="text-xl sm:text-2xl font-bold text-fem-navy mb-2">Professional Services</h3>
                        <p className="text-gray-600">Discover trusted service providers in our community</p>
                          </div>
                          
                      <ServiceList filters={{ ...filters, searchTerm }} />
                    </TabsContent>

                    <TabsContent value="products" className="mt-4 sm:mt-6">
                      <div className="mb-6">
                        <h3 className="text-xl sm:text-2xl font-bold text-fem-navy mb-2">Quality Products</h3>
                        <p className="text-gray-600">Find high-quality products from local businesses</p>
                        </div>
                        
                      <ProductList filters={{ ...filters, searchTerm }} />
                    </TabsContent>

                    <TabsContent value="businesses" className="mt-4 sm:mt-6">
                      <div className="mb-6">
                        <h3 className="text-xl sm:text-2xl font-bold text-fem-navy mb-2">Faith Community Businesses</h3>
                        <p className="text-gray-600">Explore local faith-based businesses and their offerings</p>
                      </div>
                      <BusinessList filters={{ ...filters, searchTerm }} />
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