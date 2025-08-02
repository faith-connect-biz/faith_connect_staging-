import { useState, useEffect, useRef } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
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
  Building2,
  Eye,
  MessageSquare,
  Grid3X3,
  List
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useNavigate } from "react-router-dom";

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

const DirectoryPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState("services");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [filters, setFilters] = useState({
    county: "",
    category: "",
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

  // Handle URL search parameter
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const searchParam = urlParams.get('search');
    if (searchParam) {
      setSearchTerm(decodeURIComponent(searchParam));
      setIsSearchExpanded(true);
    }
  }, []);

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

  const handleSearch = () => {
    // Search functionality will be handled by BusinessList component
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const clearFilters = () => {
    setFilters({
      county: "",
      category: "",
      rating: [0, 5],
      priceRange: [0, 10000],
      verifiedOnly: false,
      openNow: false,
      hasPhotos: false,
      sortBy: "default"
    });
  };

  const counties = [
    "Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret", "Thika", "Nyeri", "Kakamega", "Kisii", "Kericho"
  ];

  const categories = [
    "Technology", "Beauty & Salon", "Automotive", "Food & Dining", "Health & Fitness", 
    "Education", "Real Estate", "Fashion", "Home & Garden", "Professional Services"
  ];

  // Mock business data
  const mockBusinesses = [
    {
      id: 1,
      name: "Nyama Choma Paradise",
      category: "Food & Dining",
      county: "Nairobi",
      rating: 4.8,
      verified: true,
      description: "Authentic Kenyan nyama choma and traditional dishes in a warm, family-friendly atmosphere",
      services: [
        {
          name: "Catering Services",
          description: "Traditional Kenyan catering for events, weddings, and celebrations",
          duration: "Flexible"
        },
        {
          name: "Private Dining",
          description: "Intimate dining experiences with authentic Kenyan cuisine",
          duration: "2-3 hours"
        }
      ],
      products: [
        {
          id: 1,
          name: "Nyama Choma Plate",
          description: "Tender grilled goat meat served with ugali, kachumbari, and sukuma wiki",
          price: "KSH 800",
          photo: "/lovable-uploads/f1a3f2a4-bbe7-46e5-be66-1ad39e35defa.png"
        },
        {
          id: 2,
          name: "Pilau Special",
          description: "Aromatic rice cooked with tender meat, spices, and fresh herbs",
          price: "KSH 450",
          photo: "/lovable-uploads/b392f8fd-6fc5-4bfe-96aa-dc60f6854ba2.png"
        }
      ]
    },
    {
      id: 2,
      name: "TechSavvy Kenya",
      category: "Technology",
      county: "Nairobi",
      rating: 4.6,
      verified: true,
      description: "Professional IT services and computer repair in Nairobi",
      services: [
        {
          name: "Computer Repair",
          description: "Fast and reliable computer repair services for all brands",
          duration: "1-2 hours"
        },
        {
          name: "Network Setup",
          description: "Professional network installation and configuration for homes and offices",
          duration: "2-4 hours"
        }
      ],
      products: [
        {
          id: 3,
          name: "Laptop Screen Replacement",
          description: "High-quality replacement laptop screens for all major brands",
          price: "KSH 15,000",
          photo: "/lovable-uploads/placeholder.svg"
        }
      ]
    },
    {
      id: 3,
      name: "Mombasa AutoCare",
      category: "Automotive",
      county: "Mombasa",
      rating: 4.7,
      verified: true,
      description: "Complete automotive repair and maintenance services in Mombasa",
      services: [
        {
          name: "Oil Change Service",
          description: "Complete oil change with premium quality oil for all vehicle types",
          duration: "30 minutes"
        },
        {
          name: "Brake System Repair",
          description: "Comprehensive brake system inspection and repair services",
          duration: "2-3 hours"
        }
      ],
      products: [
        {
          id: 4,
          name: "Premium Motor Oil",
          description: "High-performance motor oil suitable for all Kenyan road conditions",
          price: "KSH 2,500",
          photo: "/lovable-uploads/placeholder.svg"
        }
      ]
    },
    {
      id: 4,
      name: "Kisumu Fresh Market",
      category: "Food & Dining",
      county: "Kisumu",
      rating: 4.5,
      verified: true,
      description: "Fresh local produce and traditional Luo cuisine",
      services: [
        {
          name: "Fresh Produce Delivery",
          description: "Daily delivery of fresh vegetables and fruits from local farms",
          duration: "Same day"
        },
        {
          name: "Traditional Cooking Classes",
          description: "Learn to cook authentic Luo dishes and traditional Kenyan meals",
          duration: "3-4 hours"
        }
      ],
      products: [
        {
          id: 5,
          name: "Fresh Sukuma Wiki",
          description: "Fresh collard greens harvested daily from local farms",
          price: "KSH 50",
          photo: ""
        },
        {
          id: 6,
          name: "Organic Tomatoes",
          description: "Sweet, ripe tomatoes grown without pesticides",
          price: "KSH 120",
          photo: ""
        }
      ]
    },
    {
      id: 5,
      name: "Nakuru Beauty Salon",
      category: "Health & Beauty",
      county: "Nakuru",
      rating: 4.4,
      verified: true,
      description: "Professional beauty services and hair care in Nakuru",
      services: [
        {
          name: "Hair Styling",
          description: "Professional hair styling, braiding, and treatment services",
          duration: "1-3 hours"
        },
        {
          name: "Facial Treatments",
          description: "Rejuvenating facial treatments using natural Kenyan ingredients",
          duration: "1-2 hours"
        }
      ],
      products: [
        {
          id: 7,
          name: "Natural Hair Oil",
          description: "Organic hair oil made from Kenyan aloe vera and coconut",
          price: "KSH 800",
          photo: ""
        }
      ]
    },
    {
      id: 6,
      name: "Eldoret Sports Equipment",
      category: "Sports & Fitness",
      county: "Eldoret",
      rating: 4.3,
      verified: true,
      description: "Quality sports equipment and fitness gear for athletes",
      services: [
        {
          name: "Equipment Rental",
          description: "Rent sports equipment for events and training sessions",
          duration: "Daily/Weekly"
        },
        {
          name: "Fitness Training",
          description: "Personal training sessions for all fitness levels",
          duration: "1 hour"
        }
      ],
      products: [
        {
          id: 8,
          name: "Running Shoes",
          description: "Professional running shoes suitable for Kenyan terrain",
          price: "KSH 8,500",
          photo: ""
        }
      ]
    }
  ];

  // Filter businesses based on search and filters
  const filteredBusinesses = mockBusinesses.filter(business => {
    const matchesSearch = searchTerm === "" || 
      business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      business.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCounty = filters.county === "" || business.county === filters.county;
    const matchesCategory = filters.category === "" || business.category === filters.category;
    const matchesRating = business.rating >= filters.rating[0] && business.rating <= filters.rating[1];
    const matchesVerified = !filters.verifiedOnly || business.verified;
    
    return matchesSearch && matchesCounty && matchesCategory && matchesRating && matchesVerified;
  });

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
          
          {/* Header */}
          <motion.div 
            ref={headerRef}
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="mb-8 text-center"
          >
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-fem-navy to-fem-terracotta text-white px-6 py-3 rounded-full shadow-lg mb-4">
              <Globe className="w-5 h-5" />
              <h1 className="text-2xl font-bold">Business Directory</h1>
              <Globe className="w-5 h-5" />
            </div>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover trusted businesses in our faith community. Connect with local entrepreneurs and find the services you need.
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
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-fem-navy">150+</div>
              <div className="text-sm text-gray-600">Businesses</div>
            </motion.div>
            
            <motion.div variants={itemVariants} className="bg-white/80 backdrop-blur-sm rounded-xl p-4 text-center shadow-lg">
              <div className="w-12 h-12 bg-gradient-to-br from-fem-navy to-fem-terracotta rounded-full flex items-center justify-center mx-auto mb-2">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-fem-navy">2,500+</div>
              <div className="text-sm text-gray-600">Community Members</div>
            </motion.div>
            
            <motion.div variants={itemVariants} className="bg-white/80 backdrop-blur-sm rounded-xl p-4 text-center shadow-lg">
              <div className="w-12 h-12 bg-gradient-to-br from-fem-gold to-fem-terracotta rounded-full flex items-center justify-center mx-auto mb-2">
                <Star className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-fem-navy">4.8</div>
              <div className="text-sm text-gray-600">Average Rating</div>
            </motion.div>
            
            <motion.div variants={itemVariants} className="bg-white/80 backdrop-blur-sm rounded-xl p-4 text-center shadow-lg">
              <div className="w-12 h-12 bg-gradient-to-br from-fem-terracotta to-fem-navy rounded-full flex items-center justify-center mx-auto mb-2">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-fem-navy">25</div>
              <div className="text-sm text-gray-600">Counties</div>
            </motion.div>
          </motion.div>

          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* Mobile Filter Button */}
            <div className="lg:hidden mb-4">
              <Button 
                onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
                className="w-full bg-gradient-to-r from-fem-navy to-fem-terracotta text-white hover:from-fem-terracotta hover:to-fem-navy"
              >
                <Filter className="w-4 h-4 mr-2" />
                {isMobileSidebarOpen ? "Hide Filters" : "Show Filters"}
              </Button>
            </div>
            
            {/* Sidebar */}
            <motion.div 
              ref={sidebarRef}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className={`lg:w-1/4 ${isMobileSidebarOpen ? 'block' : 'hidden lg:block'}`}
            >
              <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-xl lg:sticky lg:top-8">
                <CardHeader className="bg-gradient-to-r from-fem-navy to-fem-terracotta text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-2">
                    <Filter className="w-5 h-5" />
                    Filter Businesses
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                  
                  {/* Search */}
                  <motion.div variants={itemVariants}>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">
                      Search Businesses
                    </Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Search by name, service..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="pl-10 bg-white/50 backdrop-blur-sm border-gray-200 focus:border-fem-terracotta text-sm"
                      />
                    </div>
                  </motion.div>

                  {/* County Filter */}
                  <motion.div variants={itemVariants}>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">
                      County
                    </Label>
                    <Select value={filters.county} onValueChange={(value) => setFilters(prev => ({ ...prev, county: value }))}>
                      <SelectTrigger className="bg-white/50 backdrop-blur-sm border-gray-200 text-sm">
                        <SelectValue placeholder="Select County" />
                      </SelectTrigger>
                      <SelectContent>
                        {counties.map((county) => (
                          <SelectItem key={county} value={county}>{county}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </motion.div>

                  {/* Category Filter */}
                  <motion.div variants={itemVariants}>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">
                      Category
                    </Label>
                    <Select value={filters.category} onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}>
                      <SelectTrigger className="bg-white/50 backdrop-blur-sm border-gray-200 text-sm">
                        <SelectValue placeholder="Select Category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </motion.div>

                  {/* Rating Filter */}
                  <motion.div variants={itemVariants}>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">
                      Minimum Rating
                    </Label>
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm text-gray-600">{filters.rating[0]}+</span>
                    </div>
                    <Slider
                      value={filters.rating}
                      onValueChange={(value) => setFilters(prev => ({ ...prev, rating: value }))}
                      max={5}
                      min={0}
                      step={0.5}
                      className="mt-2"
                    />
                  </motion.div>

                  {/* Additional Filters */}
                  <motion.div variants={itemVariants} className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="verified"
                        checked={filters.verifiedOnly}
                        onCheckedChange={(checked) => setFilters(prev => ({ ...prev, verifiedOnly: checked as boolean }))}
                      />
                      <Label htmlFor="verified" className="text-sm cursor-pointer">
                        Verified Businesses Only
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="openNow"
                        checked={filters.openNow}
                        onCheckedChange={(checked) => setFilters(prev => ({ ...prev, openNow: checked as boolean }))}
                      />
                      <Label htmlFor="openNow" className="text-sm cursor-pointer">
                        Open Now
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="hasPhotos"
                        checked={filters.hasPhotos}
                        onCheckedChange={(checked) => setFilters(prev => ({ ...prev, hasPhotos: checked as boolean }))}
                      />
                      <Label htmlFor="hasPhotos" className="text-sm cursor-pointer">
                        With Photos
                      </Label>
                    </div>
                  </motion.div>

                  {/* Clear Filters */}
                  <motion.div variants={itemVariants}>
                    <Button
                      variant="outline"
                      onClick={clearFilters}
                      className="w-full bg-gradient-to-r from-fem-terracotta to-fem-gold text-white border-0 hover:from-fem-gold hover:to-fem-terracotta transition-all duration-300"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Clear Filters
                    </Button>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Main Content */}
            <motion.div 
              ref={contentRef}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="lg:w-3/4"
            >
              <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-fem-navy to-fem-terracotta text-white rounded-t-lg">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5" />
                      Discover Businesses
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-white/20 text-white border-white/30">
                        {filteredBusinesses.length} found
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  
                  {/* Tabs */}
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 bg-gray-100 p-1 rounded-xl mb-6 sm:mb-8">
                      <TabsTrigger 
                        value="services" 
                        className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-fem-terracotta data-[state=active]:to-fem-gold data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 rounded-lg text-xs sm:text-sm"
                      >
                        <Settings className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        Services
                      </TabsTrigger>
                      <TabsTrigger 
                        value="products" 
                        className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-fem-terracotta data-[state=active]:to-fem-gold data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 rounded-lg text-xs sm:text-sm"
                      >
                        <Package className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        Products
                      </TabsTrigger>
                    </TabsList>

                    {/* Services Tab Content */}
                    <TabsContent value="services" className="mt-4 sm:mt-6">
                      <motion.div 
                        variants={itemVariants}
                        className="space-y-4 sm:space-y-6"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8">
                          <div className="text-center sm:text-left mb-4 sm:mb-0">
                            <h3 className="text-xl sm:text-2xl font-bold text-fem-navy mb-2">Professional Services</h3>
                            <p className="text-gray-600 text-sm sm:text-base">Discover trusted service providers in our community</p>
                          </div>
                          
                          {/* View Toggle for Services */}
                          <div className="flex items-center justify-center sm:justify-end gap-2 bg-gray-100 p-1 rounded-lg">
                            <Button
                              variant={viewMode === "grid" ? "default" : "ghost"}
                              size="sm"
                              onClick={() => setViewMode("grid")}
                              className={`${
                                viewMode === "grid" 
                                  ? "bg-gradient-to-r from-fem-terracotta to-fem-gold text-white shadow-lg" 
                                  : "text-gray-600 hover:text-gray-900"
                              } transition-all duration-300 text-xs`}
                            >
                              <Grid3X3 className="w-3 h-3 sm:w-4 sm:h-4" />
                            </Button>
                            <Button
                              variant={viewMode === "list" ? "default" : "ghost"}
                              size="sm"
                              onClick={() => setViewMode("list")}
                              className={`${
                                viewMode === "list" 
                                  ? "bg-gradient-to-r from-fem-terracotta to-fem-gold text-white shadow-lg" 
                                  : "text-gray-600 hover:text-gray-900"
                              } transition-all duration-300 text-xs`}
                            >
                              <List className="w-3 h-3 sm:w-4 sm:h-4" />
                            </Button>
                          </div>
                        </div>
                        
                        {/* Services Grid View */}
                        {viewMode === "grid" && (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredBusinesses.map((business: any) => 
                              business.services?.map((service: any, index: number) => (
                                <motion.div 
                                  key={`${business.id}-${index}`}
                                  variants={itemVariants}
                                  className="group relative"
                                >
                                  <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100">
                                    <div className="p-6">
                                      <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                          <h4 className="text-lg font-semibold text-fem-navy mb-2 group-hover:text-fem-terracotta transition-colors duration-300">
                                            {service.name}
                                          </h4>
                                          <p className="text-gray-600 text-sm leading-relaxed mb-3">
                                            {service.description}
                                          </p>
                                        </div>
                                        <div className="ml-4">
                                          <Badge variant="outline" className="bg-gradient-to-r from-fem-terracotta to-fem-gold text-white border-0">
                                            {business.category}
                                          </Badge>
                                        </div>
                                      </div>
                                      
                                      <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                          <Clock className="w-4 h-4 text-fem-terracotta" />
                                          <span className="text-sm text-gray-600">{service.duration}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                          <span className="text-sm text-gray-600">{business.rating}</span>
                                        </div>
                                      </div>
                                      
                                      <div className="flex gap-3">
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="flex-1 border-fem-terracotta text-fem-terracotta hover:bg-fem-terracotta hover:text-white transition-all duration-300"
                                          onClick={() => navigate(`/business/${business.id}`)}
                                        >
                                          <Eye className="w-4 h-4 mr-2" />
                                          View Details
                                        </Button>
                                        <Button
                                          size="sm"
                                          className="flex-1 bg-gradient-to-r from-fem-terracotta to-fem-gold text-white hover:from-fem-gold hover:to-fem-terracotta transition-all duration-300"
                                          onClick={() => navigate(`/chat?business=${business.id}`)}
                                        >
                                          <MessageSquare className="w-4 h-4 mr-2" />
                                          Contact
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {/* Decorative Elements */}
                                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-br from-fem-terracotta to-fem-gold rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                  <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-gradient-to-br from-fem-gold to-fem-terracotta rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100"></div>
                                </motion.div>
                              ))
                            )}
                          </div>
                        )}

                        {/* Services List View */}
                        {viewMode === "list" && (
                          <div className="space-y-4">
                            {filteredBusinesses.map((business: any) => 
                              business.services?.map((service: any, index: number) => (
                                <motion.div 
                                  key={`${business.id}-${index}`}
                                  variants={itemVariants}
                                  className="group"
                                >
                                  <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                                    <div className="p-6">
                                      <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                          <div className="flex items-center gap-3 mb-3">
                                            <h4 className="text-xl font-semibold text-fem-navy group-hover:text-fem-terracotta transition-colors duration-300">
                                              {service.name}
                                            </h4>
                                            <Badge variant="outline" className="bg-gradient-to-r from-fem-terracotta to-fem-gold text-white border-0">
                                              {business.category}
                                            </Badge>
                                          </div>
                                          <p className="text-gray-600 mb-4 leading-relaxed">
                                            {service.description}
                                          </p>
                                          <div className="flex items-center gap-6 text-sm text-gray-500">
                                            <div className="flex items-center gap-1">
                                              <Clock className="w-4 h-4 text-fem-terracotta" />
                                              <span>{service.duration}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                              <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                              <span>{business.rating}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                              <Building2 className="w-4 h-4 text-fem-terracotta" />
                                              <span>{business.name}</span>
                                            </div>
                                          </div>
                                        </div>
                                        <div className="flex gap-3 ml-6">
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            className="border-fem-terracotta text-fem-terracotta hover:bg-fem-terracotta hover:text-white transition-all duration-300"
                                            onClick={() => navigate(`/business/${business.id}`)}
                                          >
                                            <Eye className="w-4 h-4 mr-2" />
                                            View Details
                                          </Button>
                                          <Button
                                            size="sm"
                                            className="bg-gradient-to-r from-fem-terracotta to-fem-gold text-white hover:from-fem-gold hover:to-fem-terracotta transition-all duration-300"
                                            onClick={() => navigate(`/chat?business=${business.id}`)}
                                          >
                                            <MessageSquare className="w-4 h-4 mr-2" />
                                            Contact
                                          </Button>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </motion.div>
                              ))
                            )}
                          </div>
                        )}
                        
                        {/* Empty State for Services */}
                        {filteredBusinesses.filter((business: any) => business.services?.length > 0).length === 0 && (
                          <motion.div 
                            variants={itemVariants}
                            className="text-center py-12"
                          >
                            <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                              <Settings className="w-12 h-12 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Services Found</h3>
                            <p className="text-gray-500">Try adjusting your filters to discover more services.</p>
                          </motion.div>
                        )}
                      </motion.div>
                    </TabsContent>

                    {/* Products Tab Content */}
                    <TabsContent value="products" className="mt-4 sm:mt-6">
                      <motion.div 
                        variants={itemVariants}
                        className="space-y-6 sm:space-y-8"
                      >
                        <div className="text-center mb-6 sm:mb-8">
                          <h3 className="text-xl sm:text-3xl font-bold text-fem-navy mb-2 sm:mb-3">Discover Amazing Products</h3>
                          <p className="text-gray-600 text-sm sm:text-lg">Explore products from our trusted business community</p>
                        </div>
                        
                        {/* Products List View Only */}
                        <div className="space-y-4">
                          {filteredBusinesses.map((business: any) => 
                            business.products?.map((product: any) => (
                              <motion.div 
                                key={`${business.id}-${product.id}`}
                                variants={itemVariants}
                                className="group"
                              >
                                <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                                  <div className="p-4 sm:p-6">
                                    <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6">
                                      {/* Product Image */}
                                      <div className="relative w-full sm:w-24 h-32 sm:h-24 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                        {product.photo ? (
                                          <img 
                                            src={product.photo} 
                                            alt={product.name}
                                            className="w-full h-full object-cover"
                                          />
                                        ) : (
                                          <div className="w-full h-full flex items-center justify-center">
                                            <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-br from-fem-terracotta to-fem-gold rounded-full flex items-center justify-center">
                                              <Package className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                                            </div>
                                          </div>
                                        )}
                                        <div className="absolute top-1 right-1">
                                          <div className="bg-gradient-to-r from-fem-terracotta to-fem-gold text-white rounded-full px-2 py-1 text-xs font-bold">
                                            {product.price}
                                          </div>
                                        </div>
                                      </div>
                                      
                                      {/* Product Info */}
                                      <div className="flex-1 min-w-0">
                                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3">
                                          <div className="flex-1">
                                            <h4 className="text-lg sm:text-xl font-bold text-fem-navy group-hover:text-fem-terracotta transition-colors duration-300 mb-2">
                                              {product.name}
                                            </h4>
                                            <p className="text-gray-600 leading-relaxed text-sm sm:text-base mb-3">
                                              {product.description}
                                            </p>
                                          </div>
                                          <Badge variant="outline" className="bg-gradient-to-r from-fem-terracotta to-fem-gold text-white border-0 self-start sm:self-auto mt-2 sm:mt-0">
                                            {business.category}
                                          </Badge>
                                        </div>
                                        
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 text-xs sm:text-sm text-gray-500 mb-4">
                                          <div className="flex items-center gap-1">
                                            <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-current" />
                                            <span>{business.rating}</span>
                                          </div>
                                          <div className="flex items-center gap-1">
                                            <Building2 className="w-3 h-3 sm:w-4 sm:h-4 text-fem-terracotta" />
                                            <span className="truncate">{business.name}</span>
                                          </div>
                                          <div className="flex items-center gap-1">
                                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                            <span>In Stock</span>
                                          </div>
                                        </div>
                                        
                                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1 border-fem-terracotta text-fem-terracotta hover:bg-fem-terracotta hover:text-white transition-all duration-300 text-xs sm:text-sm h-8 sm:h-9"
                                          >
                                            <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                                            Photos
                                          </Button>
                                          <Button
                                            size="sm"
                                            className="flex-1 bg-gradient-to-r from-fem-terracotta to-fem-gold text-white hover:from-fem-gold hover:to-fem-terracotta transition-all duration-300 text-xs sm:text-sm h-8 sm:h-9"
                                            onClick={() => navigate(`/chat?business=${business.id}`)}
                                          >
                                            <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                                            Contact
                                          </Button>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            ))
                          )}
                        </div>
                        
                        {/* Enhanced Empty State */}
                        {filteredBusinesses.filter((business: any) => business.products?.length > 0).length === 0 && (
                          <motion.div 
                            variants={itemVariants}
                            className="text-center py-16"
                          >
                            <div className="w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-8">
                              <Package className="w-16 h-16 text-gray-400" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-600 mb-4">No Products Found</h3>
                            <p className="text-gray-500 text-lg mb-6">Try adjusting your filters to discover more amazing products.</p>
                            <Button
                              onClick={clearFilters}
                              className="bg-gradient-to-r from-fem-terracotta to-fem-gold text-white"
                            >
                              <X className="w-4 h-4 mr-2" />
                              Clear All Filters
                            </Button>
                          </motion.div>
                        )}
                      </motion.div>
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