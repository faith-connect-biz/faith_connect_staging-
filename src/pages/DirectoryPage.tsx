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
  MessageSquare
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
      name: "Grace Family Restaurant",
      category: "Food & Dining",
      county: "Nairobi",
      rating: 4.8,
      verified: true,
      description: "Family-owned restaurant serving authentic Kenyan cuisine",
      services: [
        {
          name: "Catering Services",
          description: "Full-service catering for events and gatherings",
          duration: "Flexible"
        },
        {
          name: "Private Dining",
          description: "Intimate private dining experiences",
          duration: "2-3 hours"
        }
      ],
      products: [
        {
          id: 1,
          name: "Homemade Chapati",
          description: "Fresh baked chapati made daily with local ingredients",
          price: "KSH 50",
          photo: "/lovable-uploads/f1a3f2a4-bbe7-46e5-be66-1ad39e35defa.png"
        },
        {
          id: 2,
          name: "Signature Pilau",
          description: "Traditional Kenyan pilau with aromatic spices",
          price: "KSH 350",
          photo: "/lovable-uploads/b392f8fd-6fc5-4bfe-96aa-dc60f6854ba2.png"
        }
      ]
    },
    {
      id: 2,
      name: "Tech Solutions Kenya",
      category: "Technology",
      county: "Nairobi",
      rating: 4.6,
      verified: true,
      description: "Professional IT services and computer repair",
      services: [
        {
          name: "Computer Repair",
          description: "Fast and reliable computer repair services",
          duration: "1-2 hours"
        },
        {
          name: "Network Setup",
          description: "Professional network installation and configuration",
          duration: "2-4 hours"
        }
      ],
      products: [
        {
          id: 3,
          name: "Laptop Screen",
          description: "High-quality replacement laptop screens",
          price: "KSH 15,000",
          photo: "/lovable-uploads/placeholder.svg"
        }
      ]
    },
    {
      id: 3,
      name: "AutoCare Center",
      category: "Automotive",
      county: "Mombasa",
      rating: 4.7,
      verified: true,
      description: "Complete automotive repair and maintenance services",
      services: [
        {
          name: "Oil Change Service",
          description: "Complete oil change with premium quality oil",
          duration: "30 minutes"
        },
        {
          name: "Brake System Repair",
          description: "Comprehensive brake system inspection and repair",
          duration: "2-3 hours"
        }
      ],
      products: [
        {
          id: 4,
          name: "Premium Motor Oil",
          description: "High-performance motor oil for all vehicle types",
          price: "KSH 2,500",
          photo: "/lovable-uploads/placeholder.svg"
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
          
          {/* Enhanced Header */}
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
            
            {/* Enhanced Sidebar */}
            <motion.div 
              ref={sidebarRef}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="lg:w-1/4"
            >
              <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-xl sticky top-8">
                <CardHeader className="bg-gradient-to-r from-fem-navy to-fem-terracotta text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-2">
                    <Filter className="w-5 h-5" />
                    Filter Businesses
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  
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
                        className="pl-10 bg-white/50 backdrop-blur-sm border-gray-200 focus:border-fem-terracotta"
                      />
                    </div>
                  </motion.div>

                  {/* County Filter */}
                  <motion.div variants={itemVariants}>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">
                      County
                    </Label>
                    <Select value={filters.county} onValueChange={(value) => setFilters(prev => ({ ...prev, county: value }))}>
                      <SelectTrigger className="bg-white/50 backdrop-blur-sm border-gray-200">
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
                      <SelectTrigger className="bg-white/50 backdrop-blur-sm border-gray-200">
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

            {/* Enhanced Main Content */}
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
                <CardContent className="p-6">
                  
                  {/* Enhanced Tabs */}
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 bg-gray-100 p-1 rounded-xl mb-8">
                      <TabsTrigger 
                        value="services" 
                        className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-fem-terracotta data-[state=active]:to-fem-gold data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 rounded-lg"
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Services
                      </TabsTrigger>
                      <TabsTrigger 
                        value="products" 
                        className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-fem-terracotta data-[state=active]:to-fem-gold data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 rounded-lg"
                      >
                        <Package className="w-4 h-4 mr-2" />
                        Products
                      </TabsTrigger>
                    </TabsList>

                    {/* Services Tab Content */}
                    <TabsContent value="services" className="mt-6">
                      <motion.div 
                        variants={itemVariants}
                        className="space-y-6"
                      >
                        <div className="text-center mb-8">
                          <h3 className="text-2xl font-bold text-fem-navy mb-2">Professional Services</h3>
                          <p className="text-gray-600">Discover trusted service providers in our community</p>
                        </div>
                        
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
                    <TabsContent value="products" className="mt-6">
                      <motion.div 
                        variants={itemVariants}
                        className="space-y-8"
                      >
                        <div className="text-center mb-8">
                          <h3 className="text-3xl font-bold text-fem-navy mb-3">Discover Amazing Products</h3>
                          <p className="text-gray-600 text-lg">Explore products from our trusted business community</p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                          {filteredBusinesses.map((business: any) => 
                            business.products?.map((product: any) => (
                              <motion.div 
                                key={`${business.id}-${product.id}`}
                                variants={itemVariants}
                                className="group relative"
                              >
                                {/* Enhanced Product Card */}
                                <div className="bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden border-0 transform hover:-translate-y-2">
                                  {/* Product Image Container */}
                                  <div className="relative h-56 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                                    {product.photo ? (
                                      <img 
                                        src={product.photo} 
                                        alt={product.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center">
                                        <div className="w-20 h-20 bg-gradient-to-br from-fem-terracotta to-fem-gold rounded-full flex items-center justify-center">
                                          <Package className="w-10 h-10 text-white" />
                                        </div>
                                      </div>
                                    )}
                                    
                                    {/* Business Badge */}
                                    <div className="absolute top-4 left-4">
                                      <div className="bg-white/95 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg border border-gray-100">
                                        <span className="text-xs font-semibold text-fem-navy">{business.name}</span>
                                      </div>
                                    </div>
                                    
                                    {/* Price Badge */}
                                    <div className="absolute top-4 right-4">
                                      <div className="bg-gradient-to-r from-fem-terracotta to-fem-gold text-white rounded-full px-4 py-2 shadow-lg">
                                        <span className="text-sm font-bold">{product.price}</span>
                                      </div>
                                    </div>
                                    
                                    {/* Hover Overlay */}
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-4 group-hover:translate-y-0">
                                        <Button
                                          size="sm"
                                          className="bg-white/95 backdrop-blur-sm text-fem-navy hover:bg-white shadow-lg"
                                          onClick={() => navigate(`/business/${business.id}`)}
                                        >
                                          <Eye className="w-4 h-4 mr-2" />
                                          View Details
                                        </Button>
                                      </div>
                                    </div>
                                    
                                    {/* Category Badge */}
                                    <div className="absolute bottom-4 left-4">
                                      <div className="bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 shadow-lg">
                                        <span className="text-xs text-gray-600">{business.category}</span>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {/* Product Info */}
                                  <div className="p-6">
                                    <div className="mb-4">
                                      <h4 className="text-lg font-bold text-fem-navy mb-2 group-hover:text-fem-terracotta transition-colors duration-300 line-clamp-1">
                                        {product.name}
                                      </h4>
                                      <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">
                                        {product.description}
                                      </p>
                                    </div>
                                    
                                    {/* Product Features */}
                                    <div className="flex items-center justify-between mb-4">
                                      <div className="flex items-center gap-1">
                                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                        <span className="text-sm font-medium text-gray-600">{business.rating}</span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                        <span className="text-xs text-gray-500">In Stock</span>
                                      </div>
                                    </div>
                                    
                                    {/* Action Buttons */}
                                    <div className="flex gap-3">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex-1 text-sm border-fem-terracotta text-fem-terracotta hover:bg-fem-terracotta hover:text-white transition-all duration-300 rounded-xl"
                                      >
                                        <Eye className="w-4 h-4 mr-2" />
                                        Photos
                                      </Button>
                                      <Button
                                        size="sm"
                                        className="flex-1 text-sm bg-gradient-to-r from-fem-terracotta to-fem-gold text-white hover:from-fem-gold hover:to-fem-terracotta transition-all duration-300 rounded-xl shadow-lg"
                                        onClick={() => navigate(`/chat?business=${business.id}`)}
                                      >
                                        <MessageSquare className="w-4 h-4 mr-2" />
                                        Contact
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Decorative Elements */}
                                <div className="absolute -top-2 -right-2 w-4 h-4 bg-gradient-to-br from-fem-terracotta to-fem-gold rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-gradient-to-br from-fem-gold to-fem-terracotta rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100"></div>
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