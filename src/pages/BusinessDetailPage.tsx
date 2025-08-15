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
  TrendingUp,
  PenTool,
  Plus,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MotionWrapper, HoverCard, GlassmorphismCard } from "@/components/ui/MotionWrapper";
import { apiService } from "@/services/api";
import type { Business, Review } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ProductForm } from "@/components/ProductForm";
import { ServiceForm } from "@/components/ServiceForm";

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
  const [reviews, setReviews] = useState<Review[]>([]);
  const [userReviewData, setUserReviewData] = useState<Review | null>(null);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  
  // Image viewer state
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedProductForImages, setSelectedProductForImages] = useState<any>(null);
  
  // Services state
  const [services, setServices] = useState<any[]>([]);
  const [isLoadingServices, setIsLoadingServices] = useState(false);

  // Business ownership state
  const [isBusinessOwner, setIsBusinessOwner] = useState(false);

  // Enhanced product and service detail states
  const [showProductDetailModal, setShowProductDetailModal] = useState(false);
  const [selectedProductDetail, setSelectedProductDetail] = useState<any>(null);
  const [currentProductImageIndex, setCurrentProductImageIndex] = useState(0);
  
  const [showServiceDetailModal, setShowServiceDetailModal] = useState(false);
  const [selectedServiceDetail, setSelectedServiceDetail] = useState<any>(null);
  const [currentServiceImageIndex, setCurrentServiceImageIndex] = useState(0);
  
  // Service form states
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);

  const headerRef = useRef<HTMLDivElement>(null);
  const reviewsRef = useRef<HTMLDivElement>(null);

  // Fetch business data and reviews
  useEffect(() => {
    const fetchBusinessData = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const businessData = await apiService.getBusiness(id);
        if (!businessData) {
          throw new Error('Failed to fetch business data');
        }
        setBusiness(businessData);
        
        // Fetch reviews for this business
        let reviewsArray: Review[] = [];
        try {
          const reviewsData = await apiService.getBusinessReviews(id);
          // Ensure reviewsData is an array
          reviewsArray = Array.isArray(reviewsData) ? reviewsData : [];
          setReviews(reviewsArray);
          console.log('Reviews fetched successfully:', reviewsArray);
        } catch (error) {
          console.error('Failed to fetch reviews:', error);
          // Set empty reviews array and show error toast
          setReviews([]);
          toast({
            title: "Reviews Unavailable",
            description: "Unable to load reviews at this time. The business stats show there are reviews, but we cannot display them due to a technical issue.",
            variant: "destructive"
          });
        }
        
        // Check if current user has already reviewed this business
        if (user && reviewsArray.length > 0) {
          const userReview = reviewsArray.find((review: Review) => review.user === user.partnership_number);
          if (userReview) {
            setUserReviewData(userReview);
            setUserRating(userReview.rating);
            setUserReview(userReview.review_text || '');
          }
        }
        
        // Fetch services for this business
        setIsLoadingServices(true);
        const servicesData = await apiService.getBusinessServices(id);
        // Ensure servicesData is an array
        const servicesArray = Array.isArray(servicesData) ? servicesData : [];
        setServices(servicesArray);
        
      } catch (error) {
        console.error('Error fetching business data:', error);
        toast({
          title: "Error",
          description: "Failed to load business information. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
        setIsLoadingServices(false);
      }
    };

    fetchBusinessData();
  }, [id, user]);

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

  // Check if current user owns this business
  useEffect(() => {
    const checkBusinessOwnership = async () => {
      if (user && business) {
        try {
          const ownsBusiness = await apiService.isBusinessOwner(business.id);
          setIsBusinessOwner(ownsBusiness);
        } catch (error) {
          console.error('Error checking business ownership:', error);
          setIsBusinessOwner(false);
        }
      }
    };

    checkBusinessOwnership();
  }, [user, business]);

  // Debug reviews state
  useEffect(() => {
    console.log('Reviews state changed:', reviews);
    console.log('Reviews length:', reviews.length);
    console.log('Business review count:', business?.review_count);
  }, [reviews, business?.review_count]);

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
        {[...Array(5)].map((_, index) => (
          <div key={index}>
            {renderStar(index)}
          </div>
        ))}
      </div>
    );
  };

  const handleSubmitReview = async () => {
    if (!user || !id) return;
    
    if (userRating === 0) {
      toast({
        title: "Rating Required",
        description: "Please select a rating before submitting your review.",
        variant: "destructive"
      });
      return;
    }

    // Check if user owns this business
    if (isBusinessOwner) {
      toast({
        title: "Cannot Review Own Business",
        description: "Business owners cannot review their own businesses.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmittingReview(true);
    try {
      if (userReviewData) {
        // Update existing review
        const updatedReview = await apiService.updateReview(id!, userReviewData.id, {
          rating: userRating,
          review_text: userReview
        });
        
        // Update local state
        setReviews(prev => prev.map(review => 
          review.id === updatedReview.id ? updatedReview : review
        ));
        setUserReviewData(updatedReview);
        
        toast({
          title: "Review Updated",
          description: "Your review has been updated successfully!",
          variant: "default"
        });
      } else {
        // Create new review
        const newReview = await apiService.createReview(id!, {
          rating: userRating,
          review_text: userReview
        });
        
        // Add to local state
        setReviews(prev => [...prev, newReview]);
        setUserReviewData(newReview);
        
        toast({
          title: "Review Submitted",
          description: "Thank you for your review!",
          variant: "default"
        });
      }
    
    setShowReviewForm(false);
    } catch (error: any) {
      console.error('Error submitting review:', error);
      let errorMessage = "Failed to submit review. Please try again.";
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      toast({
        title: "Review Submission Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!userReviewData) return;
    
    if (!confirm('Are you sure you want to delete your review?')) return;
    
    try {
      await apiService.deleteReview(id!, userReviewData.id);
      
      // Remove from local state
      setReviews(prev => prev.filter(review => review.id !== userReviewData.id));
      setUserReviewData(null);
    setUserRating(0);
      setUserReview('');
      
      toast({
        title: "Review Deleted",
        description: "Your review has been deleted successfully.",
        variant: "default"
      });
    } catch (error) {
      console.error('Error deleting review:', error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete review. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Product Management Functions
  const handleAddProduct = () => {
    setEditingProduct(null);
    setShowProductForm(true);
  };

  const handleEditProduct = (product: any) => {
    setEditingProduct(product);
    setShowProductForm(true);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
      await apiService.deleteProduct(productId);
      // Refresh business data
      const businessData = await apiService.getBusiness(id!);
      setBusiness(businessData);
      toast({
        title: "Product Deleted",
        description: "Product has been deleted successfully.",
        variant: "default"
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete product. Please try again.",
        variant: "destructive"
      });
    }
  };





  const handleViewProductImages = (product: any) => {
    setSelectedProductForImages(product);
    setShowImageModal(true);
  };

  // Enhanced product and service detail functions
  const handleProductClick = (product: any) => {
    setSelectedProductDetail(product);
    setCurrentProductImageIndex(0);
    setShowProductDetailModal(true);
  };

  const handleServiceClick = (service: any) => {
    setSelectedServiceDetail(service);
    setCurrentServiceImageIndex(0);
    setShowServiceDetailModal(true);
  };

  const nextProductImage = () => {
    if (selectedProductDetail) {
      const totalImages = (selectedProductDetail.images?.length || 0) + (selectedProductDetail.product_image_url ? 1 : 0);
      setCurrentProductImageIndex((prev) => (prev + 1) % totalImages);
    }
  };

  const prevProductImage = () => {
    if (selectedProductDetail) {
      const totalImages = (selectedProductDetail.images?.length || 0) + (selectedProductDetail.product_image_url ? 1 : 0);
      setCurrentProductImageIndex((prev) => (prev - 1 + totalImages) % totalImages);
    }
  };

  const nextServiceImage = () => {
    if (selectedServiceDetail) {
      const totalImages = (selectedServiceDetail.images?.length || 0) + (selectedServiceDetail.service_image_url ? 1 : 0);
      setCurrentServiceImageIndex((prev) => (prev + 1) % totalImages);
    }
  };

  const prevServiceImage = () => {
    if (selectedServiceDetail) {
      const totalImages = (selectedServiceDetail.images?.length || 0) + (selectedServiceDetail.service_image_url ? 1 : 0);
      setCurrentServiceImageIndex((prev) => (prev - 1 + totalImages) % totalImages);
    }
  };

  const getCurrentProductImage = () => {
    if (!selectedProductDetail) return '';
    if (currentProductImageIndex === 0 && selectedProductDetail.product_image_url) {
      return selectedProductDetail.product_image_url;
    }
    const imageIndex = selectedProductDetail.product_image_url ? currentProductImageIndex - 1 : currentProductImageIndex;
    return selectedProductDetail.images?.[imageIndex] || '';
  };

  const getCurrentServiceImage = () => {
    if (!selectedServiceDetail) return '';
    if (currentProductImageIndex === 0 && selectedServiceDetail.service_image_url) {
      return selectedServiceDetail.service_image_url;
    }
    const imageIndex = selectedServiceDetail.service_image_url ? currentProductImageIndex - 1 : currentProductImageIndex;
    return selectedServiceDetail.images?.[imageIndex] || '';
  };

  // Service management functions
  const handleAddService = () => {
    setEditingService(null);
    setShowServiceForm(true);
  };

  const handleEditService = (service: any) => {
    setEditingService(service);
    setShowServiceForm(true);
  };

  const handleDeleteService = async (serviceId: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return;
    
    try {
      await apiService.deleteService(serviceId);
      // Refresh services data
      const servicesData = await apiService.getBusinessServices(id!);
      setServices(servicesData);
      toast({
        title: "Service Deleted",
        description: "Service has been deleted successfully.",
        variant: "default"
      });
    } catch (error) {
      console.error('Error deleting service:', error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete service. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleServiceSuccess = async () => {
    // Refresh services data
    const servicesData = await apiService.getBusinessServices(id!);
    setServices(servicesData);
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
            <Button onClick={() => navigate('/directory')} className="bg-gradient-to-r from-fem-navy to-fem-terracotta text-white hover:from-fem-navy/90 hover:to-fem-terracotta/90">
              <Settings className="w-4 h-4 mr-2" />
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
            {/* Breadcrumb Navigation */}
            <div className="mb-4">
              <nav className="flex items-center gap-2 text-sm text-gray-600">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/directory')}
                  className="text-gray-500 hover:text-fem-navy p-1 h-auto"
                >
                  <Settings className="w-4 h-4 mr-1" />
                  Directory
                </Button>
                <span className="text-gray-400">/</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(`/directory?category=${business.category?.name || 'all'}`)}
                  className="text-gray-500 hover:text-fem-navy p-1 h-auto"
                >
                  {business.category?.name || 'Business'}
                </Button>
                <span className="text-gray-400">/</span>
                <span className="text-fem-navy font-medium">{business.business_name}</span>
              </nav>
            </div>
            
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
                      <TabsTrigger value="services">Services ({services.length}/20)</TabsTrigger>
                      <TabsTrigger value="products">Products ({business.products ? business.products.length : 0}/20)</TabsTrigger>
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
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <h3 className="text-xl font-semibold text-fem-navy">Services</h3>
                          {user && user.user_type === 'business' && isBusinessOwner && (
                            <div className="flex items-center gap-3">
                              {services.length >= 20 ? (
                                <div className="text-sm text-gray-500 italic">
                                  Service limit reached (20/20)
                                </div>
                              ) : (
                                <Button
                                  onClick={handleAddService}
                                  className="bg-gradient-to-r from-fem-terracotta to-fem-gold hover:from-fem-terracotta/90 hover:to-fem-gold/90 text-white"
                                >
                                  <Settings className="w-4 h-4 mr-2" />
                                  Add Service ({services.length}/20)
                                </Button>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Services List */}
                        {isLoadingServices ? (
                          <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fem-terracotta mx-auto"></div>
                            <p className="text-gray-600 mt-2">Loading services...</p>
                          </div>
                        ) : services && services.length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                            {services.map((service: any) => (
                              <Card 
                                key={service.id} 
                                className="h-full hover:shadow-lg transition-all duration-200 cursor-pointer group"
                                onClick={() => handleServiceClick(service)}
                              >
                                <div className="relative">
                                  {/* Service Image */}
                                  <img 
                                    src={service.service_image_url || service.images?.[0] || "/placeholder.svg"} 
                                    alt={service.name}
                                    className="w-full h-48 sm:h-40 md:h-48 object-cover rounded-t-lg hover:opacity-90 transition-opacity"
                                  />
                                  
                                  {/* Multiple Images Indicator */}
                                  {service.images && service.images.length > 0 && (
                                    <div className="absolute top-2 left-2">
                                      <Badge className="bg-black/80 text-white text-xs font-medium px-2 py-1 rounded-full border border-white/20 shadow-lg">
                                        {service.images.length + (service.service_image_url ? 1 : 0)} images
                                      </Badge>
                                    </div>
                                  )}
                                  
                                  <div className="absolute top-2 right-2">
                                    <Badge className={`px-2 py-1 text-xs font-medium rounded-full ${
                                      service.is_active
                                        ? 'bg-green-100 text-green-800 border border-green-200' 
                                        : 'bg-red-100 text-red-800 border border-red-200'
                                    }`}>
                                      {service.is_active ? 'Available' : 'Unavailable'}
                                    </Badge>
                                  </div>
                                  
                                  {/* Image Gallery Preview */}
                                  {service.images && service.images.length > 0 && (
                                    <div className="absolute bottom-2 left-2 right-2">
                                      <div className="flex space-x-1">
                                        {service.images.slice(0, 4).map((imageUrl: string, index: number) => (
                                          <img
                                            key={index}
                                            src={imageUrl}
                                            alt={`${service.name} view ${index + 1}`}
                                            className="w-8 h-8 object-cover rounded border border-white shadow-sm"
                                          />
                                        ))}
                                        {service.images.length > 4 && (
                                          <div className="w-8 h-8 bg-black/70 rounded border border-white shadow-sm flex items-center justify-center">
                                            <span className="text-white text-xs font-bold">+{service.images.length - 4}</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                                <CardContent className="p-3 md:p-4">
                                  <h4 className="font-semibold text-fem-navy mb-2 text-sm md:text-base line-clamp-2">{service.name}</h4>
                                  <p className="text-xs md:text-sm text-gray-600 mb-3 line-clamp-2">
                                    {service.description || 'No description available'}
                                  </p>
                                  <div className="space-y-2">
                                    {service.price_range && (
                                      <div className="flex items-center gap-2 text-xs md:text-sm">
                                        <span className="text-gray-500">Price:</span>
                                        <span className="font-semibold text-fem-terracotta bg-gradient-to-r from-fem-terracotta to-fem-gold bg-clip-text text-transparent">{service.price_range}</span>
                                      </div>
                                    )}
                                    {service.duration && (
                                      <div className="flex items-center gap-2 text-xs md:text-sm">
                                        <span className="text-gray-500">Duration:</span>
                                        <span className="font-semibold text-gray-700">{service.duration}</span>
                                      </div>
                                    )}
                                  </div>
                                  
                                  {/* Action Buttons for Business Owners */}
                                  {user && user.user_type === 'business' && isBusinessOwner && (
                                    <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleEditService(service);
                                        }}
                                        className="text-xs border-fem-terracotta text-fem-terracotta hover:bg-fem-terracotta hover:text-white transition-colors flex-1 min-w-0"
                                      >
                                        <PenTool className="w-3 h-3 mr-1 flex-shrink-0" />
                                        <span className="truncate">Edit</span>
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteService(service.id);
                                        }}
                                        className="text-xs text-red-600 border-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-700 transition-colors flex-1 min-w-0"
                                      >
                                        <X className="w-3 h-3 mr-1 flex-shrink-0" />
                                        <span className="truncate">Delete</span>
                                      </Button>
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-12">
                            <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-fem-navy mb-2">No Services Yet</h3>
                            <p className="text-gray-600 mb-4">
                              {user && user.user_type === 'business' 
                                ? "Start adding services to showcase your offerings to customers."
                                : "This business hasn't added any services yet."
                              }
                            </p>
                            {user && user.user_type === 'business' && isBusinessOwner && (
                              services.length >= 20 ? (
                                <div className="text-sm text-gray-500 italic">
                                  Service limit reached (20/20)
                                </div>
                              ) : (
                                <Button
                                  onClick={handleAddService}
                                  className="bg-gradient-to-r from-fem-terracotta to-fem-gold hover:from-fem-terracotta/90 hover:to-fem-gold/90 text-white"
                                >
                                  <Settings className="w-4 h-4 mr-2" />
                                  Add Your First Service ({services.length}/20)
                                </Button>
                              )
                            )}
                          </div>
                        )}
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="products" className="mt-6">
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <h3 className="text-xl font-semibold text-fem-navy">Products</h3>
                          {user && user.user_type === 'business' && isBusinessOwner && (
                            <div className="flex items-center gap-3">
                              {business.products && business.products.length >= 20 ? (
                                <div className="text-sm text-gray-500 italic">
                                  Product limit reached (20/20)
                                </div>
                              ) : (
                                <Button
                                  onClick={handleAddProduct}
                                  className="bg-gradient-to-r from-fem-terracotta to-fem-gold hover:from-fem-terracotta/90 hover:to-fem-gold/90 text-white"
                                >
                                  <Package className="w-4 h-4 mr-2" />
                                  Add Product ({business.products ? business.products.length : 0}/20)
                                </Button>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Products List */}
                        {business.products && business.products.length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                            {business.products.map((product: any) => (
                              <Card 
                                key={product.id} 
                                className="h-full hover:shadow-lg transition-all duration-200 cursor-pointer group"
                                onClick={() => handleProductClick(product)}
                              >
                                <div className="relative">
                                  {/* Main Product Image */}
                                  <img 
                                    src={product.product_image_url || product.images?.[0] || "/placeholder.svg"} 
                                    alt={product.name}
                                    className="w-full h-48 sm:h-40 md:h-48 object-cover rounded-t-lg hover:opacity-90 transition-opacity"
                                  />
                                  
                                  {/* Multiple Images Indicator */}
                                  {product.images && product.images.length > 0 && (
                                    <div className="absolute top-2 left-2">
                                      <Badge className="bg-black/80 text-white text-xs font-medium px-2 py-1 rounded-full border border-white/20 shadow-lg">
                                        {product.images.length + (product.product_image_url ? 1 : 0)} images
                                      </Badge>
                                    </div>
                                  )}
                                  
                                  {/* Status Badges - Better positioned and spaced */}
                                  <div className="absolute top-2 right-2 flex flex-col gap-1">
                                    {/* Stock Status Badge */}
                                    <Badge className={`px-2 py-1 text-xs font-medium rounded-full shadow-sm ${
                                      product.in_stock 
                                        ? 'bg-green-100 text-green-800 border border-green-200' 
                                        : 'bg-red-100 text-red-800 border border-red-200'
                                    }`}>
                                      {product.in_stock ? 'In Stock' : 'Out of Stock'}
                                    </Badge>
                                    
                                    {/* Active Status Badge */}
                                    <Badge className={`px-2 py-1 text-xs font-medium rounded-full shadow-sm ${
                                      product.is_active !== false
                                        ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                                        : 'bg-gray-100 text-gray-800 border border-gray-200'
                                    }`}>
                                      {product.is_active !== false ? 'Active' : 'Inactive'}
                                    </Badge>
                                  </div>
                                  
                                  {/* Image Gallery Preview */}
                                  {product.images && product.images.length > 0 && (
                                    <div className="absolute bottom-2 left-2 right-2">
                                      <div className="flex space-x-1">
                                        {product.images.slice(0, 4).map((imageUrl: string, index: number) => (
                                          <img
                                            key={index}
                                            src={imageUrl}
                                            alt={`${product.name} view ${index + 1}`}
                                            className="w-8 h-8 object-cover rounded border border-white shadow-sm"
                                          />
                                        ))}
                                        {product.images.length > 4 && (
                                          <div className="w-8 h-8 bg-black/70 rounded border border-white shadow-sm flex items-center justify-center">
                                            <span className="text-white text-xs font-bold">+{product.images.length - 4}</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                                <CardContent className="p-3 md:p-4">
                                  <h4 className="font-semibold text-fem-navy mb-2 text-sm md:text-base line-clamp-2 leading-tight">{product.name}</h4>
                                  <p className="text-xs md:text-sm text-gray-600 mb-3 line-clamp-2 leading-relaxed">
                                    {product.description || 'No description available'}
                                  </p>
                                  <div className="flex items-center justify-between mb-3">
                                    <div className="text-base md:text-lg font-bold text-fem-terracotta bg-gradient-to-r from-fem-terracotta to-fem-gold bg-clip-text text-transparent">
                                      {product.price} {product.price_currency}
                                    </div>
                                  </div>
                                  
                                  {/* Action Buttons - Fixed layout and spacing */}
                                  {user && user.user_type === 'business' && (
                                    <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleEditProduct(product);
                                        }}
                                        className="text-xs border-fem-terracotta text-fem-terracotta hover:bg-fem-terracotta hover:text-white transition-colors flex-1 min-w-0 h-8"
                                      >
                                        <PenTool className="w-3 h-3 mr-1 flex-shrink-0" />
                                        <span className="truncate">Edit</span>
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteProduct(product.id);
                                        }}
                                        className="text-xs text-red-600 border-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-700 transition-colors flex-1 min-w-0 h-8"
                                      >
                                        <X className="w-3 h-3 mr-1 flex-shrink-0" />
                                        <span className="truncate">Delete</span>
                                      </Button>
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-12">
                            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-fem-navy mb-2">No Products Yet</h3>
                            <p className="text-gray-600 mb-4">
                              {user && user.user_type === 'business' 
                                ? "Start adding products to showcase your offerings to customers."
                                : "This business hasn't added any products yet."
                              }
                            </p>
                            {user && user.user_type === 'business' && isBusinessOwner && (
                              (business.products && business.products.length >= 20) ? (
                                <div className="text-sm text-gray-500 italic">
                                  Product limit reached (20/20)
                                </div>
                              ) : (
                                <Button
                                  onClick={handleAddProduct}
                                  className="bg-gradient-to-r from-fem-terracotta to-fem-gold hover:from-fem-terracotta/90 hover:to-fem-gold/90 text-white"
                                >
                                  <Package className="w-4 h-4 mr-2" />
                                  Add Your First Product ({business.products ? business.products.length : 0}/20)
                                </Button>
                              )
                            )}
                          </div>
                        )}
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="reviews" className="mt-6">
                      <div ref={reviewsRef} className="space-y-6">
                        <div className="flex items-center justify-between">
                          <h3 className="text-xl font-semibold text-fem-navy">Customer Reviews</h3>
                          {user && !userReviewData && !isBusinessOwner && (
                            <Button
                              onClick={() => !isBusinessOwner && setShowReviewForm(true)}
                              className="bg-gradient-to-r from-fem-terracotta to-fem-gold hover:from-fem-terracotta/90 hover:to-fem-gold/90 text-white"
                            >
                              Write Review
                            </Button>
                          )}
                          {user && userReviewData && !isBusinessOwner && (
                            <div className="flex gap-2">
                              <Button
                                onClick={() => !isBusinessOwner && setShowReviewForm(true)}
                                variant="outline"
                                className="border-fem-gold text-fem-gold hover:bg-fem-gold hover:text-white"
                              >
                                Edit Review
                              </Button>
                              <Button
                                onClick={handleDeleteReview}
                                variant="outline"
                                className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                              >
                                Delete Review
                              </Button>
                            </div>
                          )}
                          {isBusinessOwner && (
                            <div className="text-sm text-gray-500 italic">
                              Business owners cannot review their own business
                            </div>
                          )}
                        </div>

                        {/* Reviews List */}
                        {reviews.length > 0 ? (
                          <div className="space-y-4">
                            {reviews.map((review) => (
                              <div key={review.id} className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-gray-200">
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 border border-gray-200">
                                      <img 
                                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(review.user || 'User')}&background=6366f1&color=fff&size=32&font-size=14&bold=true`}
                                        alt={review.user || 'User'}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                          const target = e.target as HTMLImageElement;
                                          target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(review.user?.[0] || 'U')}&background=6366f1&color=fff&size=32&font-size=14&bold=true`;
                                        }}
                                      />
                                    </div>
                                    <span className="font-medium text-gray-900">{review.user}</span>
                                    {review.is_verified && (
                                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                        Verified
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    {[...Array(5)].map((_, index) => (
                                      <Star
                                        key={index}
                                        className={`w-4 h-4 ${
                                          index < review.rating
                                            ? 'text-yellow-400 fill-current'
                                            : 'text-gray-300'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                </div>
                                {review.review_text && (
                                  <p className="text-gray-700 text-sm leading-relaxed">{review.review_text}</p>
                                )}
                                <div className="text-xs text-gray-500 mt-2">
                                  {new Date(review.created_at).toLocaleDateString()}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                        <div className="text-center py-12">
                          <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-fem-navy mb-2">
                              {business?.review_count > 0 ? 'Reviews Temporarily Unavailable' : 'No Reviews Yet'}
                            </h3>
                            <p className="text-gray-600">
                              {business?.review_count > 0 
                                ? `This business has ${business.review_count} reviews, but they cannot be displayed at the moment due to a technical issue. Please try again later.`
                                : 'Be the first to review this business!'
                              }
                            </p>
                        </div>
                        )}
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
                      <Phone className="w-5 h-5" />
                      Contact Business
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {business.phone && (
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => window.open(`tel:${business.phone}`, '_self')}
                        >
                          <Phone className="w-4 h-4 mr-2" />
                          Call Now
                        </Button>
                      )}
                      
                      {business.website ? (
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => window.open(business.website, '_blank')}
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Visit Website
                        </Button>
                      ) : (
                        <Button 
                          variant="outline" 
                          className="w-full opacity-50 cursor-not-allowed"
                          disabled
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          No Website
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

      {/* Image Viewer Modal */}
      {showImageModal && selectedProductForImages && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-lg bg-white p-6">
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute right-4 top-4 z-10 rounded-full bg-white/20 p-2 text-white backdrop-blur-sm hover:bg-white/30"
            >
              <X className="h-6 w-6" />
            </button>
            
            <div className="mb-4 text-center">
              <h3 className="text-xl font-semibold text-gray-900">
                {selectedProductForImages.name} - Image Gallery
              </h3>
              <p className="text-sm text-gray-600">
                {selectedProductForImages.images?.length || 0} images
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {selectedProductForImages.images?.map((imageUrl, index) => (
                <div key={index} className="group relative overflow-hidden rounded-lg">
                  <img
                    src={imageUrl}
                    alt={`${selectedProductForImages.name} image ${index + 1}`}
                    className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder-product.jpg';
                    }}
                  />
                  <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20" />
                  <div className="absolute bottom-2 right-2 rounded-full bg-black/50 px-2 py-1 text-xs text-white">
                    {index + 1}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={() => setShowImageModal(false)}
                className="rounded-lg bg-fem-terracotta px-6 py-2 text-white hover:bg-fem-terracotta/90"
              >
                Close Gallery
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Product Detail Modal */}
      <AnimatePresence>
        {showProductDetailModal && selectedProductDetail && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowProductDetailModal(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-fem-navy">
                  {selectedProductDetail.name}
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowProductDetailModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="relative h-64 md:h-80 mb-4 rounded-lg overflow-hidden">
                <img 
                  src={getCurrentProductImage()} 
                  alt={selectedProductDetail.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 flex items-center justify-between p-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={prevProductImage}
                    disabled={currentProductImageIndex === 0 && !selectedProductDetail.product_image_url}
                    className="text-white hover:bg-black/70"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={nextProductImage}
                    disabled={(selectedProductDetail.images?.length || 0) === 0}
                    className="text-white hover:bg-black/70"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-fem-navy">Description</h3>
                <p className="text-gray-700 leading-relaxed">{selectedProductDetail.description}</p>
                
                {/* Enhanced Status Section */}
                <div className="flex items-center justify-between">
                  <div className="text-lg font-bold text-fem-terracotta bg-gradient-to-r from-fem-terracotta to-fem-gold bg-clip-text text-transparent">
                    {selectedProductDetail.price} {selectedProductDetail.price_currency}
                  </div>
                  
                  {/* Status Badges */}
                  <div className="flex items-center gap-3">
                    {/* Stock Status Badge */}
                    <Badge 
                      className={`px-3 py-1.5 text-xs font-medium rounded-full ${
                        selectedProductDetail.in_stock 
                          ? 'bg-green-100 text-green-800 border border-green-200' 
                          : 'bg-red-100 text-red-800 border border-red-200'
                      }`}
                    >
                      {selectedProductDetail.in_stock ? 'In Stock' : 'Out of Stock'}
                    </Badge>
                    
                    {/* Active Status Badge */}
                    <Badge 
                      className={`px-3 py-1.5 text-xs font-medium rounded-full ${
                        selectedProductDetail.is_active !== false
                          ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                          : 'bg-gray-100 text-gray-800 border border-gray-200'
                      }`}
                    >
                      {selectedProductDetail.is_active !== false ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
                
                {/* Additional Product Info */}
                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-gray-600 text-sm">
                    <Package className="w-4 h-4 text-fem-terracotta" />
                    <span>Stock: {selectedProductDetail.in_stock ? 'Available' : 'Unavailable'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 text-sm">
                    <Clock className="w-4 h-4 text-fem-terracotta" />
                    <span>Added: {selectedProductDetail.created_at ? new Date(selectedProductDetail.created_at).toLocaleDateString() : 'N/A'}</span>
                  </div>
                </div>
                
                {/* Action Buttons for Business Owners */}
                {user && user.user_type === 'business' && (
                  <div className="flex gap-2 pt-2 border-t border-gray-100">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditProduct(selectedProductDetail)}
                      className="text-xs border-fem-terracotta text-fem-terracotta hover:bg-fem-terracotta hover:text-white transition-colors"
                    >
                      <PenTool className="w-3 h-3 mr-1" />
                      Edit Product
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteProduct(selectedProductDetail.id)}
                      className="text-xs text-red-600 border-red-600 hover:bg-red-50"
                    >
                      <X className="w-3 h-3 mr-1" />
                      Delete
                    </Button>
                  </div>
                )}
              </div>

              {selectedProductDetail.images && selectedProductDetail.images.length > 0 && (
                <div className="mt-6 grid grid-cols-1 gap-2">
                  {selectedProductDetail.images.map((imageUrl, index) => (
                    <img
                      key={index}
                      src={imageUrl}
                      alt={`${selectedProductDetail.name} detail image ${index + 1}`}
                      className="w-full h-24 object-cover rounded-md cursor-pointer hover:opacity-90"
                      onClick={() => {
                        setSelectedProductDetail(prev => ({ ...prev, product_image_url: imageUrl }));
                        setCurrentProductImageIndex(index);
                      }}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Service Detail Modal */}
      <AnimatePresence>
        {showServiceDetailModal && selectedServiceDetail && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowServiceDetailModal(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-fem-navy">
                  {selectedServiceDetail.name}
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowServiceDetailModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="relative h-64 md:h-80 mb-4 rounded-lg overflow-hidden">
                <img 
                  src={getCurrentServiceImage()} 
                  alt={selectedServiceDetail.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 flex items-center justify-between p-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={prevServiceImage}
                    disabled={currentServiceImageIndex === 0 && !selectedServiceDetail.service_image_url}
                    className="text-white hover:bg-black/70"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={nextServiceImage}
                    disabled={(selectedServiceDetail.images?.length || 0) === 0}
                    className="text-white hover:bg-black/70"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-fem-navy">Description</h3>
                <p className="text-gray-700 leading-relaxed">{selectedServiceDetail.description}</p>
                
                {/* Enhanced Status Section */}
                <div className="flex items-center justify-between">
                  <div className="text-lg font-bold text-fem-terracotta bg-gradient-to-r from-fem-terracotta to-fem-gold bg-clip-text text-transparent">
                    {selectedServiceDetail.price_range}
                  </div>
                  
                  {/* Status Badge */}
                  <Badge 
                    className={`px-3 py-1.5 text-xs font-medium rounded-full ${
                      selectedServiceDetail.is_active
                        ? 'bg-green-100 text-green-800 border border-green-200' 
                        : 'bg-red-100 text-red-800 border border-red-200'
                    }`}
                  >
                    {selectedServiceDetail.is_active ? 'Available' : 'Unavailable'}
                  </Badge>
                </div>
                
                {/* Additional Service Info */}
                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-gray-600 text-sm">
                    <Clock className="w-4 h-4 text-fem-terracotta" />
                    <span>Duration: {selectedServiceDetail.duration || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 text-sm">
                    <Package className="w-4 h-4 text-fem-terracotta" />
                    <span>Status: {selectedServiceDetail.is_active ? 'Active' : 'Inactive'}</span>
                  </div>
                </div>
                
                {/* Action Buttons for Business Owners */}
                {user && user.user_type === 'business' && (
                  <div className="flex gap-2 pt-2 border-t border-gray-100">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditService(selectedServiceDetail)}
                      className="text-xs border-fem-terracotta text-fem-terracotta hover:bg-fem-terracotta hover:text-white transition-colors"
                    >
                      <PenTool className="w-3 h-3 mr-1" />
                      Edit Service
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteService(selectedServiceDetail.id)}
                      className="text-xs text-red-600 border-red-600 hover:bg-red-50"
                    >
                      <X className="w-3 h-3 mr-1" />
                      Delete
                    </Button>
                  </div>
                )}
              </div>

              {selectedServiceDetail.images && selectedServiceDetail.images.length > 0 && (
                <div className="mt-6 grid grid-cols-1 gap-2">
                  {selectedServiceDetail.images.map((imageUrl, index) => (
                    <img
                      key={index}
                      src={imageUrl}
                      alt={`${selectedServiceDetail.name} detail image ${index + 1}`}
                      className="w-full h-24 object-cover rounded-md cursor-pointer hover:opacity-90"
                      onClick={() => {
                        setSelectedServiceDetail(prev => ({ ...prev, service_image_url: imageUrl }));
                        setCurrentServiceImageIndex(index);
                      }}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Review Form Modal */}
      <AnimatePresence>
        {showReviewForm && !isBusinessOwner && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowReviewForm(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-fem-navy">
                  {userReviewData ? 'Edit Review' : 'Write a Review'}
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowReviewForm(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="space-y-6">
                {/* Rating Selection */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-3 block">Your Rating *</Label>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        type="button"
                        onClick={() => setUserRating(rating)}
                        className="p-1 hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`w-8 h-8 ${
                            rating <= userRating
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {userRating === 0 && 'Click to select your rating'}
                    {userRating === 1 && 'Poor'}
                    {userRating === 2 && 'Fair'}
                    {userRating === 3 && 'Good'}
                    {userRating === 4 && 'Very Good'}
                    {userRating === 5 && 'Excellent'}
                  </p>
                </div>

                {/* Review Text */}
                <div>
                  <Label htmlFor="reviewText" className="text-sm font-medium text-gray-700">
                    Your Review (Optional)
                  </Label>
                  <Textarea
                    id="reviewText"
                    value={userReview}
                    onChange={(e) => setUserReview(e.target.value)}
                    placeholder="Share your experience with this business..."
                    rows={4}
                    className="mt-1"
                  />
                </div>

                {/* Submit Button */}
                <div className="flex gap-3">
                  <Button
                    onClick={handleSubmitReview}
                    disabled={isSubmittingReview || userRating === 0}
                    className="flex-1 bg-gradient-to-r from-fem-terracotta to-fem-gold hover:from-fem-terracotta/90 hover:to-fem-gold/90 text-white"
                  >
                    {isSubmittingReview ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        {userReviewData ? 'Updating...' : 'Submitting...'}
                      </>
                    ) : (
                      <>
                        <MessageSquare className="w-4 h-4 mr-2" />
                        {userReviewData ? 'Update Review' : 'Submit Review'}
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowReviewForm(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>



      {/* Service Form Modal */}
      <ServiceForm
        isOpen={showServiceForm}
        onClose={() => setShowServiceForm(false)}
        businessId={id!}
        service={editingService}
        onSuccess={handleServiceSuccess}
      />

      {/* Product Form Modal */}
      <ProductForm
        isOpen={showProductForm}
        onClose={() => setShowProductForm(false)}
        businessId={id!}
        product={editingProduct}
        onSuccess={async () => {
          // Refresh business data
          const businessData = await apiService.getBusiness(id!);
          setBusiness(businessData);
        }}
      />

      <Footer />
    </div>
  );
};

export default BusinessDetailPage; 