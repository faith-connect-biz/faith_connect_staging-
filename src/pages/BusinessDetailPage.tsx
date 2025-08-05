import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Star, 
  Phone, 
  MapPin, 
  Mail, 
  Globe, 
  Clock, 
  Heart, 
  Share2, 
  MessageSquare,
  Camera,
  Package,
  Settings,
  Shield,
  Award,
  Users,
  Calendar,
  ThumbsUp,
  ThumbsDown,
  X,
  ExternalLink,
  TrendingUp
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MotionWrapper, HoverCard, GlassmorphismCard } from "@/components/ui/MotionWrapper";
import { apiService } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

const BusinessDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [business, setBusiness] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [userReview, setUserReview] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  
  const headerRef = useRef<HTMLDivElement>(null);
  const reviewsRef = useRef<HTMLDivElement>(null);

  // Fetch business data
  useEffect(() => {
    const fetchBusiness = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        const businessData = await apiService.getBusiness(id);
        setBusiness(businessData);
        
        // Fetch additional data like services, products, reviews
        // This would be implemented based on your API structure
        
      } catch (err) {
        console.error('Error fetching business:', err);
        setError('Failed to load business details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBusiness();
  }, [id]);

  // GSAP Animations
  useEffect(() => {
    if (headerRef.current && business) {
      gsap.fromTo(headerRef.current, 
        { y: -50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power2.out" }
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
  }, [business]);

  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite);
    // TODO: Implement favorite toggle with API
  };

  const StarRating = ({ rating, onRatingChange, interactive = false, size = "md" }: {
    rating: number;
    onRatingChange?: (rating: number) => void;
    interactive?: boolean;
    size?: "sm" | "md" | "lg";
  }) => {
    const sizeClasses = {
      sm: "w-3 h-3",
      md: "w-4 h-4", 
      lg: "w-5 h-5"
    };

    const renderStar = (starIndex: number) => {
      const isFilled = starIndex < rating;
      const isHalf = starIndex === Math.floor(rating) && rating % 1 !== 0;
      
      return (
        <button
          key={starIndex}
          type="button"
          onClick={() => interactive && onRatingChange?.(starIndex + 1)}
          className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-all duration-200`}
          disabled={!interactive}
        >
          <Star 
            className={`${sizeClasses[size]} ${
              isFilled 
                ? 'text-yellow-400 fill-current' 
                : isHalf 
                  ? 'text-yellow-400 fill-current opacity-50' 
                  : 'text-gray-300'
            }`} 
          />
        </button>
      );
    };

    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, index) => renderStar(index))}
      </div>
    );
  };

  const handleSubmitRating = () => {
    if (userRating === 0) return;
    
    // TODO: Implement review submission with API
    console.log('Submitting review:', { rating: userRating, review: userReview });
    
    setShowReviewForm(false);
    setUserRating(0);
    setUserReview("");
  };

  const ProductPhotoModal = ({ product, onClose }: { product: any, onClose: () => void }) => (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-fem-navy">{product.name}</h3>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
          
          <div className="aspect-square rounded-lg overflow-hidden mb-4">
            <img 
              src={product.product_image_url || "/placeholder.svg"} 
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="space-y-2">
            <p className="text-gray-600">{product.description}</p>
            <p className="text-lg font-bold text-fem-terracotta">
              KSH {product.price.toLocaleString()}
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <Skeleton className="h-64 w-full mb-6" />
                <Skeleton className="h-8 w-3/4 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3 mb-6" />
                <Skeleton className="h-32 w-full" />
              </div>
              <div>
                <Skeleton className="h-48 w-full mb-4" />
                <Skeleton className="h-6 w-full mb-2" />
                <Skeleton className="h-6 w-3/4 mb-4" />
                <Skeleton className="h-8 w-full" />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !business) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="w-12 h-12 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Business Not Found</h2>
            <p className="text-gray-600 mb-6">{error || "The business you're looking for doesn't exist."}</p>
            <Button onClick={() => navigate('/directory')}>
              Back to Directory
            </Button>
          </div>
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
          
          {/* Enhanced Header */}
          <motion.div 
            ref={headerRef}
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="mb-8"
          >
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden">
              <div className="relative h-64 md:h-80">
                <img 
                  src={business.business_image_url || business.business_logo_url || "/placeholder.svg"} 
                  alt={business.business_name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                
                {/* Action Buttons */}
                <div className="absolute top-4 right-4 flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="bg-white/90 text-gray-800 hover:bg-white"
                    onClick={handleToggleFavorite}
                  >
                    <Heart className={`w-4 h-4 mr-2 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                    {isFavorite ? 'Saved' : 'Save'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="bg-white/90 text-gray-800 hover:bg-white"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </div>

                {/* Business Info Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <div className="flex items-center gap-3 mb-2">
                    {business.is_verified && (
                      <Badge className="bg-green-500 text-white">
                        <Shield className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                    {business.is_featured && (
                      <Badge className="bg-fem-gold text-white">
                        <Award className="w-3 h-3 mr-1" />
                        Featured
                      </Badge>
                    )}
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold mb-2">{business.business_name}</h1>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="font-medium">{business.rating}</span>
                      <span className="text-gray-300">({business.review_count} reviews)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{business.city}, {business.county}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Main Content */}
            <div className="lg:col-span-2">
              <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-fem-navy to-fem-terracotta text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Business Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-4 bg-gray-100/50 backdrop-blur-sm">
                      <TabsTrigger value="overview">Overview</TabsTrigger>
                      <TabsTrigger value="services">Services</TabsTrigger>
                      <TabsTrigger value="products">Products</TabsTrigger>
                      <TabsTrigger value="reviews">Reviews</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="overview" className="mt-6">
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-xl font-semibold text-fem-navy mb-3">About</h3>
                          <p className="text-gray-600 leading-relaxed">
                            {business.description || business.long_description || "No description available."}
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-semibold text-fem-navy mb-3">Contact Information</h4>
                            <div className="space-y-2">
                              {business.phone && (
                                <div className="flex items-center gap-2 text-gray-600">
                                  <Phone className="w-4 h-4 text-fem-terracotta" />
                                  <span>{business.phone}</span>
                                </div>
                              )}
                              {business.email && (
                                <div className="flex items-center gap-2 text-gray-600">
                                  <Mail className="w-4 h-4 text-fem-terracotta" />
                                  <span>{business.email}</span>
                                </div>
                              )}
                              {business.website && (
                                <div className="flex items-center gap-2 text-gray-600">
                                  <Globe className="w-4 h-4 text-fem-terracotta" />
                                  <a href={business.website} target="_blank" rel="noopener noreferrer" className="text-fem-terracotta hover:underline">
                                    Visit Website
                                  </a>
                                </div>
                              )}
                              <div className="flex items-center gap-2 text-gray-600">
                                <MapPin className="w-4 h-4 text-fem-terracotta" />
                                <span>{business.address}</span>
                              </div>
                            </div>
                          </div>

                          <div>
                            <h4 className="font-semibold text-fem-navy mb-3">Business Information</h4>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-gray-600">
                                <Package className="w-4 h-4 text-fem-terracotta" />
                                <span>Category: {business.category?.name}</span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-600">
                                <Users className="w-4 h-4 text-fem-terracotta" />
                                <span>Member since: {new Date(business.created_at).toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-600">
                                <Star className="w-4 h-4 text-fem-terracotta" />
                                <span>Rating: {business.rating} ({business.review_count} reviews)</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="services" className="mt-6">
                      <div className="text-center py-12">
                        <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-fem-navy mb-2">Services Coming Soon</h3>
                        <p className="text-gray-600">Service listings will be available here once businesses add their services.</p>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="products" className="mt-6">
                      <div className="text-center py-12">
                        <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-fem-navy mb-2">Products Coming Soon</h3>
                        <p className="text-gray-600">Product listings will be available here once businesses add their products.</p>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="reviews" className="mt-6">
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <h3 className="text-xl font-semibold text-fem-navy">Customer Reviews</h3>
                          {user && (
                            <Button
                              onClick={() => setShowReviewForm(true)}
                              className="bg-gradient-to-r from-fem-terracotta to-fem-gold hover:from-fem-terracotta/90 hover:to-fem-gold/90 text-white"
                            >
                              Write Review
                            </Button>
                          )}
                        </div>

                        <div className="text-center py-12">
                          <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-semibold text-fem-navy mb-2">Reviews Coming Soon</h3>
                          <p className="text-gray-600">Customer reviews will be displayed here once they start coming in.</p>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="space-y-6">
                {/* Contact Card */}
                <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-xl">
                  <CardHeader className="bg-gradient-to-r from-fem-navy to-fem-terracotta text-white rounded-t-lg">
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="w-5 h-5" />
                      Contact Business
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <Button 
                        className="w-full bg-gradient-to-r from-fem-terracotta to-fem-gold hover:from-fem-terracotta/90 hover:to-fem-gold/90 text-white"
                        onClick={() => navigate(`/chat?business=${business.id}`)}
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Send Message
                      </Button>
                      
                      {business.phone && (
                        <Button variant="outline" className="w-full">
                          <Phone className="w-4 h-4 mr-2" />
                          Call Now
                        </Button>
                      )}
                      
                      {business.website && (
                        <Button variant="outline" className="w-full">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Visit Website
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Business Stats */}
                <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-xl">
                  <CardHeader className="bg-gradient-to-r from-fem-navy to-fem-terracotta text-white rounded-t-lg">
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Business Stats
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Rating</span>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="font-semibold">{business.rating}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Reviews</span>
                        <span className="font-semibold">{business.review_count}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Member Since</span>
                        <span className="font-semibold">{new Date(business.created_at).getFullYear()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BusinessDetailPage; 