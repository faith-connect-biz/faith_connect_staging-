import { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Star, 
  Phone, 
  MapPin, 
  Shield, 
  Heart, 
  Clock, 
  Mail,
  Camera,
  ArrowLeft,
  MessageCircle,
  Package,
  Settings,
  CheckCircle,
  ExternalLink,
  Eye,
  ShoppingCart,
  X,
  Sparkles,
  ThumbsUp,
  MessageSquare,
  Award,
  Users,
  Globe,
  TrendingUp
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

const BusinessDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [business, setBusiness] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [reviewText, setReviewText] = useState("");
  const [userHasRated, setUserHasRated] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const reviewsRef = useRef<HTMLDivElement>(null);

  // Mock business data with Kenyan context
  const mockBusiness = {
    id: 1,
    name: "Grace Family Restaurant",
    category: "Restaurant",
    description: "Family-owned restaurant serving authentic Kenyan cuisine with a warm, welcoming atmosphere. All ingredients sourced locally with love and care.",
    rating: 4.8,
    reviewCount: 42,
    phone: "+254 700 123 456",
    email: "info@gracefamilyrest.com",
    address: "Westlands, Nairobi, Kenya",
    county: "Nairobi",
    verified: true,
    image: "/lovable-uploads/f1a3f2a4-bbe7-46e5-be66-1ad39e35defa.png",
    hours: {
      monday: "7:00 AM - 9:00 PM",
      tuesday: "7:00 AM - 9:00 PM",
      wednesday: "7:00 AM - 9:00 PM",
      thursday: "7:00 AM - 9:00 PM",
      friday: "7:00 AM - 10:00 PM",
      saturday: "7:00 AM - 10:00 PM",
      sunday: "8:00 AM - 8:00 PM"
    },
    services: [
      {
        name: "Catering Services",
        description: "Full-service catering for events and gatherings",
        price: "Starting at KSH 1,500/person",
        duration: "Flexible"
      },
      {
        name: "Private Dining",
        description: "Intimate private dining experiences",
        price: "Contact for pricing",
        duration: "2-3 hours"
      },
      {
        name: "Takeout Service",
        description: "Quick and convenient takeout options",
        price: "Menu prices",
        duration: "15-30 minutes"
      }
    ],
    products: [
      {
        id: 1,
        name: "Homemade Chapati",
        description: "Fresh baked chapati made daily with local ingredients",
        price: "KSH 50",
        image: "/lovable-uploads/f1a3f2a4-bbe7-46e5-be66-1ad39e35defa.png",
        photos: [
          "/lovable-uploads/f1a3f2a4-bbe7-46e5-be66-1ad39e35defa.png",
          "/lovable-uploads/541df702-f215-4b5f-bc60-d08161749258.png"
        ]
      },
      {
        id: 2,
        name: "Signature Pilau",
        description: "Traditional Kenyan pilau with aromatic spices",
        price: "KSH 350",
        image: "/lovable-uploads/f1a3f2a4-bbe7-46e5-be66-1ad39e35defa.png",
        photos: [
          "/lovable-uploads/f1a3f2a4-bbe7-46e5-be66-1ad39e35defa.png",
          "/lovable-uploads/b392f8fd-6fc5-4bfe-96aa-dc60f6854ba2.png"
        ]
      },
      {
        id: 3,
        name: "Nyama Choma Platter",
        description: "Grilled meat platter with traditional sides",
        price: "KSH 800",
        image: "/lovable-uploads/f1a3f2a4-bbe7-46e5-be66-1ad39e35defa.png",
        photos: [
          "/lovable-uploads/f1a3f2a4-bbe7-46e5-be66-1ad39e35defa.png",
          "/lovable-uploads/2461e975-f920-4db9-8bb8-0fa2afe7fe8f.png"
        ]
      }
    ],
    reviews: [
      {
        id: 1,
        user: "Sarah M.",
        rating: 5,
        comment: "Amazing food and great service! The chapati is to die for.",
        date: "2024-01-15"
      },
      {
        id: 2,
        user: "John K.",
        rating: 4,
        comment: "Very good restaurant. Family-friendly atmosphere.",
        date: "2024-01-10"
      },
      {
        id: 3,
        user: "Mary W.",
        rating: 5,
        comment: "Best Kenyan food in Nairobi! Highly recommended.",
        date: "2024-01-05"
      }
    ]
  };

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setBusiness(mockBusiness);
      setLoading(false);
    }, 1000);
  }, [id]);

  // GSAP Animations
  useEffect(() => {
    if (headerRef.current) {
      gsap.fromTo(headerRef.current, 
        { y: -50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power2.out" }
      );
    }

    if (contentRef.current) {
      gsap.fromTo(contentRef.current,
        { x: 100, opacity: 0 },
        { 
          x: 0, 
          opacity: 1, 
          duration: 0.8, 
          delay: 0.2,
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

    if (sidebarRef.current) {
      gsap.fromTo(sidebarRef.current,
        { x: -100, opacity: 0 },
        { 
          x: 0, 
          opacity: 1, 
          duration: 0.8, 
          delay: 0.4,
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

    if (reviewsRef.current) {
      gsap.fromTo(reviewsRef.current.children,
        { y: 50, opacity: 0 },
        { 
          y: 0, 
          opacity: 1, 
          duration: 0.6, 
          stagger: 0.1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: reviewsRef.current,
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

  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite);
    toast({
      title: isFavorite ? "Removed from favorites" : "Added to favorites",
      description: isFavorite ? "Business removed from your favorites" : "Business added to your favorites",
    });
  };

  // Creative Star Rating Component
  const StarRating = ({ rating, onRatingChange, interactive = false, size = "md" }: {
    rating: number;
    onRatingChange?: (rating: number) => void;
    interactive?: boolean;
    size?: "sm" | "md" | "lg";
  }) => {
    const sizeClasses = {
      sm: "w-4 h-4",
      md: "w-5 h-5",
      lg: "w-6 h-6"
    };

    const renderStar = (starIndex: number) => {
      const isFilled = starIndex < rating;
      const isHovered = interactive && starIndex < hoverRating;
      const shouldFill = isFilled || isHovered;

      return (
        <button
          key={starIndex}
          type="button"
          className={`transition-all duration-200 ${
            interactive ? "cursor-pointer hover:scale-110" : ""
          }`}
          onClick={() => interactive && onRatingChange?.(starIndex + 1)}
          onMouseEnter={() => interactive && setHoverRating(starIndex + 1)}
          onMouseLeave={() => interactive && setHoverRating(0)}
          disabled={!interactive}
        >
          <Star
            className={`${sizeClasses[size]} ${
              shouldFill
                ? "fill-yellow-400 text-yellow-400 drop-shadow-sm"
                : "text-gray-300"
            } transition-all duration-200 ${
              shouldFill ? "animate-pulse" : ""
            }`}
          />
        </button>
      );
    };

    return (
      <div className="flex items-center gap-1">
        {[0, 1, 2, 3, 4].map(renderStar)}
      </div>
    );
  };

  const handleSubmitRating = () => {
    if (userRating === 0) {
      toast({
        title: "Please select a rating",
        description: "Choose a star rating before submitting your review.",
        variant: "destructive"
      });
      return;
    }

    // Add the review to the business
    const newReview = {
      id: Date.now(),
      user: "You",
      rating: userRating,
      comment: reviewText,
      date: new Date().toISOString().split('T')[0]
    };

    setBusiness(prev => ({
      ...prev,
      reviews: [newReview, ...prev.reviews],
      rating: ((prev.rating * prev.reviewCount + userRating) / (prev.reviewCount + 1)).toFixed(1),
      reviewCount: prev.reviewCount + 1
    }));

    setUserHasRated(true);
    setShowRatingModal(false);
    setUserRating(0);
    setReviewText("");

    toast({
      title: "Review submitted!",
      description: "Thank you for your feedback. Your review helps other community members.",
    });
  };

  const ProductPhotoModal = ({ product, onClose }: { product: any, onClose: () => void }) => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">{product.name}</h3>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {product.photos?.map((photo: string, index: number) => (
              <div key={index} className="relative">
                <img
                  src={photo}
                  alt={`${product.name} photo ${index + 1}`}
                  className="w-full h-48 object-cover rounded-lg"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fem-terracotta mx-auto mb-4"></div>
            <p className="text-gray-600">Loading business details...</p>
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          
          {/* Header with Back Button */}
          <motion.div 
            ref={headerRef}
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="mb-6"
          >
            <Button variant="outline" onClick={() => navigate(-1)} className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Directory
            </Button>
          </motion.div>

          {business && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Main Content */}
              <motion.div 
                ref={contentRef}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="lg:col-span-2 space-y-6"
              >
                
                {/* Business Header */}
                <Card className="overflow-hidden backdrop-blur-sm bg-white/80 border-0 shadow-xl">
                  <div className="relative h-64 bg-gradient-to-br from-fem-navy to-fem-terracotta">
                    <img
                      src={business.image}
                      alt={business.name}
                      className="w-full h-full object-cover opacity-80"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                      <div className="flex items-center gap-2 mb-2">
                        <h1 className="text-3xl font-bold">{business.name}</h1>
                        {business.verified && (
                          <Shield className="w-6 h-6 text-fem-gold" />
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        <StarRating rating={business.rating} size="lg" />
                        <span className="text-lg font-semibold">{business.rating}</span>
                        <span className="text-sm opacity-90">({business.reviewCount} reviews)</span>
                      </div>
                    </div>
                  </div>
                  
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <Badge variant="outline" className="text-fem-navy border-fem-navy">
                        {business.category}
                      </Badge>
                      <div className="flex gap-2">
                        <Button
                          variant={isFavorite ? "default" : "outline"}
                          size="sm"
                          onClick={handleToggleFavorite}
                        >
                          <Heart className={`w-4 h-4 mr-2 ${isFavorite ? "fill-current" : ""}`} />
                          {isFavorite ? "Favorited" : "Favorite"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowRatingModal(true)}
                          className="border-fem-terracotta text-fem-terracotta hover:bg-fem-terracotta hover:text-white"
                        >
                          <Star className="w-4 h-4 mr-2" />
                          Rate
                        </Button>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 mb-4">{business.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-fem-terracotta" />
                        <span className="text-sm">{business.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-fem-terracotta" />
                        <span className="text-sm">{business.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-fem-terracotta" />
                        <span className="text-sm">{business.address}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-fem-terracotta" />
                        <span className="text-sm">Open Today</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Tabs for Services and Products */}
                <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-xl">
                  <CardHeader className="bg-gradient-to-r from-fem-navy to-fem-terracotta text-white rounded-t-lg">
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Services & Products
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <Tabs defaultValue="services" className="w-full">
                      <TabsList className="grid w-full grid-cols-2 bg-gray-100/50 backdrop-blur-sm">
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
                      </TabsList>
                      
                      <TabsContent value="services" className="mt-6">
                        <div className="space-y-4">
                          {business.services.map((service: any, index: number) => (
                            <motion.div 
                              key={index} 
                              variants={itemVariants}
                              className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                            >
                              <div className="flex justify-between items-start mb-2">
                                <h3 className="font-semibold text-fem-navy">{service.name}</h3>
                                <Badge variant="secondary">{service.price}</Badge>
                              </div>
                              <p className="text-gray-600 text-sm mb-2">{service.description}</p>
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <Clock className="w-3 h-3" />
                                <span>{service.duration}</span>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </TabsContent>
                      
                      {/* Products Section */}
                      <TabsContent value="products" className="mt-6">
                        <div className="text-center mb-8">
                          <h3 className="text-2xl font-bold text-fem-navy mb-2">Discover Our Products</h3>
                          <p className="text-gray-600">Explore our carefully curated collection</p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                          {business.products.map((product: any, index: number) => (
                            <motion.div 
                              key={product.id} 
                              variants={itemVariants}
                              className="group relative"
                            >
                              {/* Product Card */}
                              <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100">
                                {/* Product Image Container */}
                                <div className="relative h-64 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                                  {product.photo ? (
                                    <img 
                                      src={product.photo} 
                                      alt={product.name}
                                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <div className="w-20 h-20 bg-gradient-to-br from-fem-terracotta to-fem-gold rounded-full flex items-center justify-center">
                                        <Package className="w-10 h-10 text-white" />
                                      </div>
                                    </div>
                                  )}
                                  
                                  {/* Floating Price Badge */}
                                  <div className="absolute top-4 right-4">
                                    <div className="bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
                                      <span className="font-bold text-fem-navy">{product.price}</span>
                                    </div>
                                  </div>
                                  
                                  {/* Hover Overlay */}
                                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 flex items-center justify-center">
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                      <Button
                                        size="sm"
                                        className="bg-white/90 backdrop-blur-sm text-fem-navy hover:bg-white"
                                      >
                                        <Eye className="w-4 h-4 mr-2" />
                                        Quick View
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Product Info */}
                                <div className="p-6">
                                  <div className="mb-3">
                                    <h4 className="text-lg font-semibold text-fem-navy mb-2 group-hover:text-fem-terracotta transition-colors duration-300">
                                      {product.name}
                                    </h4>
                                    <p className="text-gray-600 text-sm leading-relaxed">
                                      {product.description}
                                    </p>
                                  </div>
                                  
                                  {/* Product Features */}
                                  <div className="flex items-center gap-2 mb-4">
                                    <div className="flex items-center gap-1">
                                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                      <span className="text-sm text-gray-600">4.8</span>
                                    </div>
                                    <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                                    <span className="text-sm text-gray-500">Premium Quality</span>
                                  </div>
                                  
                                  {/* Action Buttons */}
                                  <div className="flex gap-3">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="flex-1 border-fem-terracotta text-fem-terracotta hover:bg-fem-terracotta hover:text-white transition-all duration-300"
                                    >
                                      <Eye className="w-4 h-4 mr-2" />
                                      View Photos
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
                              <div className="absolute -top-2 -right-2 w-4 h-4 bg-gradient-to-br from-fem-terracotta to-fem-gold rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                              <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-gradient-to-br from-fem-gold to-fem-terracotta rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100"></div>
                            </motion.div>
                          ))}
                        </div>
                        
                        {/* Empty State */}
                        {business.products.length === 0 && (
                          <motion.div 
                            variants={itemVariants}
                            className="text-center py-12"
                          >
                            <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                              <Package className="w-12 h-12 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Products Available</h3>
                            <p className="text-gray-500">This business hasn't added any products yet.</p>
                          </motion.div>
                        )}
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>

                {/* Reviews Section */}
                <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-xl">
                  <CardHeader className="bg-gradient-to-r from-fem-navy to-fem-terracotta text-white rounded-t-lg">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="w-5 h-5" />
                        Community Reviews
                      </CardTitle>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowRatingModal(true)}
                        className="bg-white/20 text-white border-white/30 hover:bg-white/30 hover:text-white"
                      >
                        <Star className="w-4 h-4 mr-2" />
                        Write Review
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div ref={reviewsRef} className="space-y-4">
                      {business.reviews.map((review: any) => (
                        <motion.div 
                          key={review.id} 
                          variants={itemVariants}
                          className="border-b pb-4 last:border-b-0"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-fem-navy">{review.user}</span>
                              <StarRating rating={review.rating} size="sm" />
                            </div>
                            <span className="text-xs text-gray-500">{review.date}</span>
                          </div>
                          <p className="text-gray-600 text-sm">{review.comment}</p>
                        </motion.div>
                      ))}
                      
                      {/* Add a prominent Write Review button at the bottom if no reviews */}
                      {business.reviews.length === 0 && (
                        <motion.div 
                          variants={itemVariants}
                          className="text-center py-8"
                        >
                          <div className="w-16 h-16 bg-gradient-to-br from-fem-terracotta to-fem-gold rounded-full flex items-center justify-center mx-auto mb-4">
                            <Star className="w-8 h-8 text-white" />
                          </div>
                          <h3 className="text-lg font-semibold text-fem-navy mb-2">Be the First to Review</h3>
                          <p className="text-gray-600 mb-4">Share your experience with this business</p>
                          <Button
                            onClick={() => setShowRatingModal(true)}
                            className="bg-gradient-to-r from-fem-terracotta to-fem-gold text-white"
                          >
                            <Star className="w-4 h-4 mr-2" />
                            Write Review
                          </Button>
                        </motion.div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Sidebar */}
              <motion.div 
                ref={sidebarRef}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-6"
              >
                
                {/* Contact Card */}
                <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-xl">
                  <CardHeader className="bg-gradient-to-r from-fem-navy to-fem-terracotta text-white rounded-t-lg">
                    <CardTitle className="flex items-center gap-2">
                      <MessageCircle className="w-5 h-5" />
                      Contact Business
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button className="w-full" onClick={() => navigate(`/chat?business=${business.id}`)}>
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Send Message
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Phone className="w-4 h-4 mr-2" />
                      Call Now
                    </Button>
                    <Button variant="outline" className="w-full">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Visit Website
                    </Button>
                  </CardContent>
                </Card>

                {/* Hours Card */}
                <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-xl">
                  <CardHeader className="bg-gradient-to-r from-fem-navy to-fem-terracotta text-white rounded-t-lg">
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      Business Hours
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {Object.entries(business.hours).map(([day, hours]) => (
                        <div key={day} className="flex justify-between text-sm">
                          <span className="capitalize">{day}</span>
                          <span className="text-gray-600">{hours as string}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          )}
        </div>
      </main>

      {/* Rating Modal */}
      {showRatingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-fem-gold to-fem-terracotta rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-fem-navy mb-2">Rate {business?.name}</h3>
              <p className="text-gray-600">Share your experience with the community</p>
            </div>

            <div className="space-y-4">
              <div className="text-center">
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Your Rating
                </Label>
                <div className="flex justify-center mb-2">
                  <StarRating
                    rating={userRating}
                    onRatingChange={setUserRating}
                    interactive={true}
                    size="lg"
                  />
                </div>
                <p className="text-sm text-gray-500">
                  {userRating === 0 && "Tap the stars to rate"}
                  {userRating === 1 && "Poor"}
                  {userRating === 2 && "Fair"}
                  {userRating === 3 && "Good"}
                  {userRating === 4 && "Very Good"}
                  {userRating === 5 && "Excellent"}
                </p>
              </div>

              <div>
                <Label htmlFor="review" className="text-sm font-medium text-gray-700">
                  Your Review (Optional)
                </Label>
                <Textarea
                  id="review"
                  placeholder="Tell others about your experience..."
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  rows={3}
                  className="mt-1"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowRatingModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-fem-terracotta to-fem-gold"
                  onClick={handleSubmitRating}
                >
                  <ThumbsUp className="w-4 h-4 mr-2" />
                  Submit Review
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Product Photo Modal */}
      {selectedProduct && (
        <ProductPhotoModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
      <Footer />
    </div>
  );
};

export default BusinessDetailPage; 