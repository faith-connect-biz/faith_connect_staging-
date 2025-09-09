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
  ChevronRight,
  ChevronUp,
  ImageIcon,
  Eye,
  Building2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MotionWrapper, HoverCard, GlassmorphismCard } from "@/components/ui/MotionWrapper";
import { getBusinessImageUrl, getBusinessLogoUrl } from "@/utils/imageUtils";
import { apiService } from "@/services/api";
import type { Business, Review } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ProductForm } from "@/components/ProductForm";
import { ServiceForm } from "@/components/ServiceForm";
import { ProductServiceReviews } from "@/components/ProductServiceReviews";
import { ReviewForm } from "@/components/ReviewForm";
import LikeButton from "@/components/LikeButton";
import ShareModal from "@/components/ui/ShareModal";
import { type ShareData } from "@/utils/sharing";
import { ProtectedContactInfo } from "@/components/ui/ProtectedContactInfo";
import { formatToBritishDate } from '@/utils/dateUtils';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

const BusinessDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
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
  const [reviewError, setReviewError] = useState<string | null>(null);
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
  
  // Share functionality state
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [currentShareData, setCurrentShareData] = useState<ShareData | null>(null);

  // Enhanced product and service detail states
  const [showProductDetailModal, setShowProductDetailModal] = useState(false);
  const [selectedProductDetail, setSelectedProductDetail] = useState<any>(null);
  const [currentProductImageIndex, setCurrentProductImageIndex] = useState(0);
  
  const [showServiceDetailModal, setShowServiceDetailModal] = useState(false);
  const [selectedServiceDetail, setSelectedServiceDetail] = useState<any>(null);
  const [currentServiceImageIndex, setCurrentServiceImageIndex] = useState(0);

  // Review item state for product/service reviews
  const [selectedReviewItem, setSelectedReviewItem] = useState<{
    type: 'product' | 'service';
    id: string;
    name: string;
  } | null>(null);
  
  // Service form states
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);

  // Image upload states
  const [isUploadingProfileImage, setIsUploadingProfileImage] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

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

  // Debug logging for business data
  useEffect(() => {
    if (business) {
      console.log('BusinessDetailPage - Business data:', {
        id: business.id,
        name: business.business_name,
        business_image_url: business.business_image_url,
        business_logo_url: business.business_logo_url,
        hasImage: !!business.business_image_url,
        hasLogo: !!business.business_logo_url,
        processedImageUrl: getBusinessImageUrl(business),
        processedLogoUrl: getBusinessLogoUrl(business)
      });
    }
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
    if (!user) return;
    
    if (userRating === 0) {
      toast({
        title: "Rating Required",
        description: "Please select a rating before submitting your review.",
        variant: "destructive"
      });
      return;
    }

    // Check if user owns this business (only for business reviews)
    if (!selectedReviewItem && isBusinessOwner) {
      toast({
        title: "Cannot Review Own Business",
        description: "Business owners cannot review their own businesses.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmittingReview(true);
    try {
      if (userReviewData && !selectedReviewItem) {
        // Update existing business review
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
      } else if (selectedReviewItem) {
        // Create new product/service review
        let newReview;
        if (selectedReviewItem.type === 'product') {
          newReview = await apiService.createProductReview(selectedReviewItem.id, {
            rating: userRating,
            review_text: userReview
          });
        } else {
          newReview = await apiService.createServiceReview(selectedReviewItem.id, {
            rating: userRating,
            review_text: userReview
          });
        }
        
        toast({
          title: "Review Submitted",
          description: `Thank you for reviewing this ${selectedReviewItem.type}!`,
          variant: "default"
        });
        
        // Reset form and close modal
        setUserRating(0);
        setUserReview('');
        setSelectedReviewItem(null);
        setShowReviewForm(false);
        return;
      } else {
        // Create new business review
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
      
      // Check for different error response formats
      if (error.response?.data?.non_field_errors && error.response.data.non_field_errors.length > 0) {
        // Handle non-field errors (like "You have already reviewed this product")
        errorMessage = error.response.data.non_field_errors[0];
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Set the review error state to display in the UI
      setReviewError(errorMessage);
      
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

  // Reset review form state when opening for product/service review
  const resetReviewForm = () => {
    setUserRating(0);
    setUserReview('');
    setUserReviewData(null);
    setReviewError(null);
  };

  // Product Management Functions
  const handleAddProduct = () => {
    setEditingProduct(null);
    setShowProductForm(true);
  };

  // Edit and Delete functions removed





  const handleViewProductImages = (product: any) => {
    setSelectedProductForImages(product);
    setShowImageModal(true);
  };

  // Enhanced product and service detail functions
  const handleProductClick = (product: any) => {
    setSelectedProductDetail(product);
    setShowProductDetailModal(true);
    setCurrentProductImageIndex(0);
  };

  const handleServiceClick = (service: any) => {
    setSelectedServiceDetail(service);
    setCurrentServiceImageIndex(0);
    setShowServiceDetailModal(true);
  };

  // Share functionality
  const handleShareBusiness = () => {
    const shareData: ShareData = {
      title: `${business?.business_name} - Faith Connect Business`,
      text: business?.description || `Check out this amazing business on Faith Connect`,
      url: `${window.location.origin}/business/${business?.id}`,
    };
    setCurrentShareData(shareData);
    setShareModalOpen(true);
  };

  const handleShareProduct = (product: any) => {
    const shareData: ShareData = {
      title: `${product.name} - ${business?.business_name}`,
      text: product.description || `Check out this amazing product from ${business?.business_name}`,
      url: `${window.location.origin}/business/${business?.id}`,
    };
    setCurrentShareData(shareData);
    setShareModalOpen(true);
  };

  const handleShareService = (service: any) => {
    const shareData: ShareData = {
      title: `${service.name} - ${business?.business_name}`,
      text: service.description || `Check out this amazing service from ${business?.business_name}`,
      url: `${window.location.origin}/business/${business?.id}`,
    };
    setCurrentShareData(shareData);
    setShareModalOpen(true);
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

  // Edit and Delete functions removed

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
              src={product.product_image_url || product.images?.[0] || business.business_logo_url || business.business_image_url || "/placeholder.svg"} 
              alt={product.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "/placeholder.svg";
              }}
            />
          </div>
          
          <div className="space-y-2">
            <p className="text-gray-600">{product.description}</p>
            <p className="text-lg font-bold text-fem-terracotta">
              KSh {product.price.toLocaleString()}
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );

  // Image upload functions
  const handleProfileImageUpload = async (file: File) => {
    if (!file || !business) return;

    setIsUploadingProfileImage(true);
    try {
      // Get pre-signed URL for upload
      const uploadData = await apiService.getBusinessProfileImageUploadUrl(business.id, file.name, file.type);
      
      // Upload to S3
      const uploadResponse = await fetch(uploadData.presigned_url, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload image to S3');
      }

      // Update business with new image
      const updateResponse = await apiService.updateBusinessProfileImage(business.id, uploadData.file_key);
      
      // Update local state
      setBusiness(prev => ({
        ...prev,
        business_image_url: updateResponse.business_image_url
      }));

      toast({
        title: "Success",
        description: "Profile image updated successfully!",
      });
    } catch (error) {
      console.error('Error uploading profile image:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload profile image. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploadingProfileImage(false);
    }
  };

  const handleLogoUpload = async (file: File) => {
    if (!file || !business) return;

    setIsUploadingLogo(true);
    try {
      // Get pre-signed URL for upload
      const uploadData = await apiService.getBusinessLogoUploadUrl(business.id, file.name, file.type);
      
      // Upload to S3
      const uploadResponse = await fetch(uploadData.presigned_url, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload logo to S3');
      }

      // Update business with new logo
      const updateResponse = await apiService.updateBusinessLogo(business.id, uploadData.file_key);
      
      // Update local state
      setBusiness(prev => ({
        ...prev,
        business_logo_url: updateResponse.business_logo_url
      }));

      toast({
        title: "Success",
        description: "Logo updated successfully!",
      });
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload logo. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleImageFileSelect = (event: React.ChangeEvent<HTMLInputElement>, type: 'profile' | 'logo') => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File Type",
        description: "Please select an image file.",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Image must be less than 5MB",
        variant: "destructive"
      });
      return;
    }

    if (type === 'profile') {
      handleProfileImageUpload(file);
    } else {
      handleLogoUpload(file);
    }

    // Reset input
    event.target.value = '';
  };

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
    <div 
      className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 flex flex-col overflow-x-hidden" 
      style={{ 
        scrollBehavior: 'smooth',
        WebkitOverflowScrolling: 'touch',
        overscrollBehavior: 'contain'
      }}
    >
      <Navbar />
      <main 
        className="flex-grow scroll-smooth" 
        style={{ 
          scrollBehavior: 'smooth',
          WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'contain'
        }}
      >
        <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
          
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
              <nav className="flex flex-wrap items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-600">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/directory')}
                  className="text-gray-500 hover:text-fem-navy p-1 h-auto text-xs sm:text-sm"
                >
                  <Settings className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  <span className="hidden sm:inline">Directory</span>
                  <span className="sm:hidden">Dir</span>
                </Button>
                <span className="text-gray-400 text-xs sm:text-sm">/</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(`/directory?category=${business.category?.name || 'all'}`)}
                  className="text-gray-500 hover:text-fem-navy p-1 h-auto text-xs sm:text-sm"
                >
                  <span className="max-w-20 sm:max-w-none truncate">
                  {business.category?.name || 'Business'}
                  </span>
                </Button>
                <span className="text-gray-400 text-xs sm:text-sm">/</span>
                <span className="text-fem-navy font-medium text-xs sm:text-sm max-w-32 sm:max-w-none truncate">{business.business_name}</span>
              </nav>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl overflow-hidden">
              <div className="relative h-48 sm:h-56 md:h-64 lg:h-72 xl:h-80 overflow-hidden flex items-center justify-center">
                <img 
                  src={getBusinessImageUrl(business) || getBusinessLogoUrl(business) || "/placeholder.svg"} 
                  alt={business.business_name}
                  className={`w-full h-full ${
                    getBusinessImageUrl(business) ? 'object-cover' : 'object-contain'
                  } ${!getBusinessImageUrl(business) && getBusinessLogoUrl(business) ? 'bg-white' : ''}`}
                  style={{
                    objectPosition: 'center',
                    minHeight: '100%',
                    minWidth: '100%',
                    maxWidth: '100%',
                    maxHeight: '100%'
                  }}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/placeholder.svg";
                    target.className = "w-full h-full object-cover";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                



                {/* Business Info Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 md:p-6 text-white">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                    {business.is_verified && (
                      <Badge className="bg-green-500 text-white text-xs sm:text-sm px-2 py-1">
                        <Shield className="w-2 h-2 sm:w-3 sm:h-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                    {business.is_featured && (
                      <Badge className="bg-fem-gold text-white text-xs sm:text-sm px-2 py-1">
                        <Award className="w-2 h-2 sm:w-3 sm:h-3 mr-1" />
                        Featured
                      </Badge>
                    )}
                  </div>
                  <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2 leading-tight">{business.business_name}</h1>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm">
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-current" />
                      <span className="font-medium">
                        {business.rating && !isNaN(Number(business.rating)) 
                          ? Number(business.rating).toFixed(1) 
                          : '0.0'
                        }
                      </span>
                      <span className="text-gray-300">({business.review_count || 0} reviews)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>{business.city}, {business.county}</span>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex items-center justify-center sm:justify-start mt-4 sm:mt-6">
                    <div className="bg-black/20 backdrop-blur-md rounded-xl sm:rounded-2xl p-2 sm:p-3 border border-white/20 w-full sm:w-auto">
                      <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
                    {isAuthenticated && (
                      <LikeButton
                        itemId={business.id}
                        itemType="business"
                        itemName={business.business_name}
                        businessName={business.business_name}
                        businessId={business.id}
                        description={business.description}
                        size="md"
                        className="bg-white/95 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 shadow-xl border-2 border-white/50 hover:border-red-300 text-fem-navy hover:text-red-600 font-semibold w-full sm:w-auto transition-all duration-300 hover:scale-105"
                      />
                    )}
                    <Button
                      onClick={handleShareBusiness}
                      variant="outline"
                          size="md"
                      className="group bg-white/95 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 border-2 border-white/50 hover:border-blue-300 text-fem-navy hover:text-blue-600 shadow-xl font-semibold px-3 sm:px-4 py-2 w-full sm:w-auto transition-all duration-300 hover:scale-105"
                    >
                      <Share2 className="w-4 h-4 mr-2 transition-all duration-300 group-hover:scale-110 group-hover:text-blue-500" />
                          <span className="text-sm sm:text-base">Share Business</span>
                    </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            
            {/* Main Content */}
            <div className="xl:col-span-2">
              <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-fem-navy to-fem-terracotta text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Business Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 bg-gray-100/50 backdrop-blur-sm">
                      <TabsTrigger value="overview" className="text-xs sm:text-sm px-2 sm:px-3 py-2 whitespace-nowrap">Overview</TabsTrigger>
                      <TabsTrigger value="services" className="text-xs sm:text-sm px-2 sm:px-3 py-2 whitespace-nowrap">Services ({services.length}/20)</TabsTrigger>
                      <TabsTrigger value="products" className="text-xs sm:text-sm px-2 sm:px-3 py-2 whitespace-nowrap">Products ({business.products ? business.products.length : 0}/20)</TabsTrigger>
                      <TabsTrigger value="reviews" className="text-xs sm:text-sm px-2 sm:px-3 py-2 whitespace-nowrap">Reviews</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="overview" className="mt-6">
                      <div className="space-y-6">
                        {/* Business Logo section removed as requested */}

                        {/* Business Profile Image Upload Section */}
                        {user && user.user_type === 'business' && isBusinessOwner && (
                          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                            <div className="flex items-center justify-between mb-4">
                              <h3 className="text-xl font-semibold text-fem-navy flex items-center gap-2">
                                <Camera className="w-5 h-5 text-fem-terracotta" />
                                Business Profile Image
                              </h3>
                              <div className="flex gap-2">
                                <input
                                  type="file"
                                  id="profile-image-upload"
                                  accept="image/*"
                                  onChange={(e) => handleImageFileSelect(e, 'profile')}
                                  className="hidden"
                                  disabled={isUploadingProfileImage}
                                />
                                <label
                                  htmlFor="profile-image-upload"
                                  className={`cursor-pointer px-3 py-1.5 text-xs font-medium rounded-md border transition-colors ${
                                    isUploadingProfileImage
                                      ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                      : 'bg-fem-terracotta text-white border-fem-terracotta hover:bg-fem-terracotta/90'
                                  }`}
                                >
                                  {isUploadingProfileImage ? 'Uploading...' : 'Upload Image'}
                                </label>
                              </div>
                            </div>
                            <div className="flex justify-center">
                              <div className="w-32 h-32 rounded-lg overflow-hidden border border-gray-300 bg-white flex items-center justify-center shadow-md">
                                {business.business_image_url ? (
                                  <img 
                                    src={business.business_image_url} 
                                    alt={`${business.business_name} profile image`}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.src = "/placeholder.svg";
                                      target.className = "w-full h-full object-cover";
                                    }}
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                                    Click Upload Image to add your business profile image
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* About Section */}
                        <MotionWrapper
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.6, delay: 0.2 }}
                        >
                          <GlassmorphismCard className="bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-sm border-0 shadow-xl relative overflow-hidden">
                            {/* Decorative elements */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-fem-navy/5 to-transparent rounded-full blur-2xl" />
                            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-fem-terracotta/5 to-transparent rounded-full blur-xl" />
                            
                            <CardHeader className="relative z-10">
                              <CardTitle className="flex items-center gap-3 text-2xl">
                                <div className="p-3 rounded-xl bg-gradient-to-br from-fem-navy to-fem-terracotta text-white shadow-lg">
                                  <Package className="w-6 h-6" />
                                </div>
                                <span className="bg-gradient-to-r from-fem-navy to-fem-terracotta bg-clip-text text-transparent font-bold">
                                  About {business.business_name}
                                </span>
                              </CardTitle>
                            </CardHeader>
                            
                            <CardContent className="relative z-10 space-y-6">
                              <div className="prose prose-gray max-w-none">
                                <p className="text-gray-700 leading-relaxed text-lg">
                                  {business.description || business.long_description || "This business hasn't added a description yet. Contact them directly to learn more about their services and offerings."}
                                </p>
                              </div>
                            </CardContent>
                          </GlassmorphismCard>
                        </MotionWrapper>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="services" className="mt-6">
                      <div className="space-y-6">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-2xl font-bold text-fem-navy">Services</h3>
                          {user && user.user_type === 'business' && isBusinessOwner && (
                            <div className="flex items-center gap-3">
                              {services.length >= 20 ? (
                                <div className="text-sm text-gray-500 italic">
                                  Service limit reached (20/20)
                                </div>
                              ) : (
                                <Button
                                  onClick={handleAddService}
                                  className="bg-gradient-to-r from-fem-terracotta to-fem-gold hover:from-fem-terracotta/90 hover:to-fem-gold/90 text-white px-6 py-2"
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
                                    src={(() => {
                                      // Filter out placeholder URLs and prioritize real images
                                      const realServiceImage = service.service_image_url && !service.service_image_url.includes('via.placeholder.com') ? service.service_image_url : null;
                                      const realImages = service.images?.filter((img: string) => !img.includes('via.placeholder.com')) || [];
                                      const realBusinessLogo = business.business_logo_url && !business.business_logo_url.includes('via.placeholder.com') ? business.business_logo_url : null;
                                      const realBusinessImage = business.business_image_url && !business.business_image_url.includes('via.placeholder.com') ? business.business_image_url : null;
                                      
                                      return realServiceImage || realImages[0] || realBusinessLogo || realBusinessImage || "/placeholder.svg";
                                    })()}
                                    alt={service.name}
                                    className="w-full h-48 sm:h-40 md:h-48 object-cover rounded-t-lg hover:opacity-90 transition-opacity"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.src = "/placeholder.svg";
                                    }}
                                  />
                                  
                                  {/* Multiple Images Indicator */}
                                  {service.images && service.images.length > 0 && (
                                    <div className="absolute top-2 left-2">
                                      <Badge className="bg-black/80 text-white text-xs font-medium px-2 py-1 rounded-full border border-white/20 shadow-lg">
                                        {service.images.length + (service.service_image_url ? 1 : 0)} images
                                      </Badge>
                                    </div>
                                  )}
                                  
                                  {/* Availability Badge - Top Left */}
                                  <div className="absolute top-2 left-2">
                                    <Badge className={`px-2 py-1 text-xs font-medium rounded-full ${
                                      service.is_active
                                        ? 'bg-green-100 text-green-800 border border-green-200' 
                                        : 'bg-red-100 text-red-800 border border-red-200'
                                    }`}>
                                      {service.is_active ? 'Available' : 'Unavailable'}
                                    </Badge>
                                  </div>
                                  
                                  {/* Action Buttons - Top Right */}
                                  <div className="absolute top-2 right-2 flex flex-col gap-2">
                                    {isAuthenticated && (
                                      <LikeButton
                                        itemId={service.id}
                                        itemType="service"
                                        itemName={service.name}
                                        businessName={business.business_name}
                                        businessId={business.id}
                                        description={service.description}
                                        size="sm"
                                        className="bg-white/90 hover:bg-white shadow-lg"
                                      />
                                    )}
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleShareService(service);
                                      }}
                                      className="bg-white/90 hover:bg-white text-fem-navy hover:text-fem-terracotta shadow-lg h-8 w-8 p-0 rounded-full"
                                    >
                                      <Share2 className="w-4 h-4" />
                                    </Button>
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
                                    {service.price_range && service.price_range !== 'Free' && (
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
                                  {user && user.user_type === 'business' && (
                                    <div className="flex gap-2 pt-2 border-t border-gray-100">
                                      {/* Edit and Delete buttons removed */}
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
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-2xl font-bold text-fem-navy">Products</h3>
                          {user && user.user_type === 'business' && isBusinessOwner && (
                            <div className="flex items-center gap-3">
                              {business.products && business.products.length >= 20 ? (
                                <div className="text-sm text-gray-500 italic">
                                  Product limit reached (20/20)
                                </div>
                              ) : (
                                <Button
                                  onClick={handleAddProduct}
                                  className="bg-gradient-to-r from-fem-terracotta to-fem-gold hover:from-fem-terracotta/90 hover:to-fem-gold/90 text-white px-6 py-2"
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
                                <div className="relative group">
                                  {/* Main Product Image with Hover Effects */}
                                  <div className="aspect-square bg-gray-50 rounded-t-lg overflow-hidden">
                                    <img 
                                      src={(() => {
                                        // Filter out placeholder URLs and prioritize real images
                                        const realProductImage = product.product_image_url && !product.product_image_url.includes('via.placeholder.com') ? product.product_image_url : null;
                                        const realImages = product.images?.filter((img: string) => !img.includes('via.placeholder.com')) || [];
                                        const realBusinessLogo = business.business_logo_url && !business.business_logo_url.includes('via.placeholder.com') ? business.business_logo_url : null;
                                        const realBusinessImage = business.business_image_url && !business.business_image_url.includes('via.placeholder.com') ? business.business_image_url : null;
                                        
                                        return realProductImage || realImages[0] || realBusinessLogo || realBusinessImage || "/placeholder.svg";
                                      })()}
                                      alt={product.name}
                                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                      onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.src = "/placeholder.svg";
                                      }}
                                    />
                                  </div>
                                  
                                  {/* Hover Overlay with Quick Actions */}
                                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 rounded-t-lg">
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                      <Button
                                        size="sm"
                                        className="bg-white text-fem-navy hover:bg-fem-terracotta hover:text-white shadow-lg"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleProductClick(product);
                                        }}
                                      >
                                        <Eye className="w-4 h-4 mr-2" />
                                        Quick View
                                      </Button>
                                    </div>
                                  </div>
                                  
                                  {/* Status Badges - Modern Design */}
                                  <div className="absolute top-3 left-3 flex flex-col gap-2">
                                    {/* Stock Status Badge */}
                                    <Badge className={`px-3 py-1 text-xs font-semibold rounded-full shadow-lg border-0 ${
                                      product.in_stock 
                                        ? 'bg-green-500 text-white' 
                                        : 'bg-red-500 text-white'
                                    }`}>
                                      {product.in_stock ? 'In Stock' : 'Out of Stock'}
                                    </Badge>
                                    
                                    {/* Active Status Badge */}
                                    <Badge className={`px-3 py-1 text-xs font-semibold rounded-full shadow-lg border-0 ${
                                      product.is_active !== false
                                        ? 'bg-blue-500 text-white' 
                                        : 'bg-gray-500 text-white'
                                    }`}>
                                      {product.is_active !== false ? 'Active' : 'Inactive'}
                                    </Badge>
                                  </div>
                                  
                                  {/* Image Gallery Indicator */}
                                  {product.images && product.images.length > 0 && (
                                    <div className="absolute top-3 right-3">
                                      <Badge className="bg-black/80 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg border border-white/20">
                                        <Package className="w-3 h-3 mr-1" />
                                        {product.images.length} Photos
                                      </Badge>
                                    </div>
                                  )}
                                  
                                  {/* Action Buttons - Top Right */}
                                  <div className="absolute top-3 right-3 flex flex-col gap-2">
                                    {isAuthenticated && (
                                      <LikeButton
                                        itemId={product.id}
                                        itemType="product"
                                        itemName={product.name}
                                        businessName={business.business_name}
                                        businessId={business.id}
                                        description={product.description}
                                        price={product.price}
                                        priceCurrency={product.price_currency}
                                        size="sm"
                                        className="bg-white/90 hover:bg-white shadow-lg"
                                      />
                                    )}
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleShareProduct(product);
                                      }}
                                      className="bg-white/90 hover:bg-white text-fem-navy hover:text-fem-terracotta shadow-lg h-8 w-8 p-0 rounded-full"
                                    >
                                      <Share2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                  
                                  {/* Price Tag - Floating Design */}
                                  <div className="absolute bottom-3 left-3">
                                    <div className="bg-fem-terracotta text-white px-3 py-2 rounded-full shadow-lg font-bold text-sm">
                                      {product.price} {product.price_currency}
                                    </div>
                                  </div>
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
                                      {/* Edit and Delete buttons removed */}
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
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-2xl font-bold text-fem-navy">Customer Reviews</h3>
                          {user && !userReviewData && !isBusinessOwner && (
                            <Button
                              onClick={() => !isBusinessOwner && setShowReviewForm(true)}
                              className="bg-gradient-to-r from-fem-terracotta to-fem-gold hover:from-fem-terracotta/90 hover:to-fem-gold/90 text-white px-6 py-2"
                            >
                              Write Review
                            </Button>
                          )}
                          {user && userReviewData && !isBusinessOwner && (
                            <div className="flex gap-2">
                              <Button
                                onClick={() => !isBusinessOwner && setShowReviewForm(true)}
                                variant="outline"
                                className="border-fem-gold text-fem-gold hover:bg-fem-gold hover:text-white px-6 py-2"
                              >
                                Edit Review
                              </Button>
                              <Button
                                onClick={handleDeleteReview}
                                variant="outline"
                                className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white px-6 py-2"
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
                                
                                {/* Review Actions */}
                                <div className="flex items-center justify-between mt-3">
                                  <div className="text-xs text-gray-500">
                                    {formatToBritishDate(review.created_at)}
                                  </div>
                                  
                                  {/* Like Button - Only show if user doesn't own the review */}
                                  {user && review.user !== user.partnership_number && (
                                    <LikeButton
                                      id={review.id.toString()}
                                      type="review"
                                      initialLiked={review.is_liked_by_user}
                                      likeCount={review.like_count}
                                      onLikeChange={() => {}}
                                      disabled={false}
                                    />
                                  )}
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
            <div className="xl:col-span-1 order-first xl:order-last">
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
                      <ProtectedContactInfo 
                        phone={business.phone}
                        email={business.email}
                        variant="card"
                      />
                      
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

                {/* Business Summary - Redesigned from Business Details */}
                <MotionWrapper
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <GlassmorphismCard className="backdrop-blur-md bg-gradient-to-br from-white/95 to-white/85 border-0 shadow-2xl relative overflow-hidden">
                    {/* Decorative Background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-fem-navy/10 via-fem-terracotta/5 to-fem-gold/10" />
                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-fem-terracotta/20 to-transparent rounded-full blur-xl" />
                    <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-fem-navy/15 to-transparent rounded-full blur-lg" />
                    
                    <CardHeader className="relative z-10 pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-fem-navy to-fem-terracotta text-white shadow-md">
                          <Building2 className="w-5 h-5" />
                        </div>
                        <span className="bg-gradient-to-r from-fem-navy to-fem-terracotta bg-clip-text text-transparent font-bold">
                          Business Summary
                        </span>
                      </CardTitle>
                    </CardHeader>
                    
                    <CardContent className="relative z-10 pt-0 space-y-4">
                      {/* Category */}
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-purple-50/80 to-indigo-50/80 border border-purple-200/30">
                        <div className="p-2 rounded-md bg-gradient-to-br from-purple-500 to-indigo-500 text-white">
                          <Package className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-500">Category</div>
                          <div className="text-base font-bold text-purple-700">
                            {business.category?.name || 'General Business'}
                          </div>
                        </div>
                      </div>

                      {/* Member Since */}
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-green-50/80 to-emerald-50/80 border border-green-200/30">
                        <div className="p-2 rounded-md bg-gradient-to-br from-green-500 to-emerald-500 text-white">
                          <Calendar className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-500">Member Since</div>
                          <div className="text-base font-bold text-green-700">
                            {formatToBritishDate(business.created_at)}
                          </div>
                        </div>
                      </div>

                      {/* Community */}
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-blue-50/80 to-cyan-50/80 border border-blue-200/30">
                        <div className="p-2 rounded-md bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
                          <Users className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-500">Community</div>
                          <div className="text-base font-bold text-blue-700">
                            FEM Family Business
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </GlassmorphismCard>
                </MotionWrapper>
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
              className="bg-white rounded-2xl p-3 sm:p-6 max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
              onClick={(e) => e.stopPropagation()}
              style={{ 
                scrollBehavior: 'smooth',
                WebkitOverflowScrolling: 'touch',
                overscrollBehavior: 'contain'
              }}
            >
              {/* Sticky Header for Mobile */}
              <div className="sticky top-0 bg-white z-10 pb-3 border-b border-gray-100 mb-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg sm:text-2xl font-bold text-fem-navy truncate pr-4">
                  {selectedProductDetail.name}
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowProductDetailModal(false)}
                    className="text-gray-500 hover:text-gray-700 flex-shrink-0"
                    aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
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
                  <div className="flex items-center justify-between gap-2 text-gray-600 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-fem-terracotta" />
                      <span>Added: {selectedProductDetail.created_at ? formatToBritishDate(selectedProductDetail.created_at) : 'N/A'}</span>
                    </div>
                    {/* Review Product Button - Moved here beside the date */}
                      <Button
                        size="sm"
                        onClick={() => {
                          setShowProductDetailModal(false);
                          resetReviewForm();
                          setShowReviewForm(true);
                          setSelectedReviewItem({
                            type: 'product',
                            id: selectedProductDetail.id,
                            name: selectedProductDetail.name
                          });
                        }}
                      className="bg-fem-terracotta hover:bg-fem-terracotta/90 text-white text-xs px-3 py-1 h-7"
                      >
                        <MessageSquare className="w-3 h-3 mr-1" />
                        Review
                      </Button>
                  </div>
                </div>
                
                {/* Action Buttons for Business Owners */}
                {user && user.user_type === 'business' && (
                  <div className="flex gap-2 pt-2 border-t border-gray-100">
                    {/* Edit and Delete buttons removed */}
                  </div>
                )}
              </div>

              {/* Product Reviews Section - Moved Up */}
              <div className="mt-6 pt-4 border-t border-gray-100">
                <h3 className="text-lg font-semibold text-fem-navy mb-4 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-fem-terracotta" />
                  Product Reviews
                </h3>
                <ProductServiceReviews 
                  type="product" 
                  itemId={selectedProductDetail.id} 
                  itemName={selectedProductDetail.name}
                  showAllButton={false}
                  maxReviews={3}
                />
              </div>

              {/* Product Images - Creative Ecommerce Style Display */}
              {selectedProductDetail.images && selectedProductDetail.images.length > 0 && (
                <div className="mt-8">
                  <h4 className="text-lg font-semibold text-fem-navy mb-4 flex items-center gap-2">
                    <Package className="w-5 h-5 text-fem-terracotta" />
                    Product Gallery
                  </h4>
                  
                  {/* Main Featured Image - Mobile Optimized */}
                  <div className="relative mb-6">
                    <div className="aspect-square sm:aspect-square bg-gray-50 rounded-xl sm:rounded-2xl overflow-hidden shadow-lg">
                      <img
                        src={selectedProductDetail.images[currentProductImageIndex] || selectedProductDetail.product_image_url}
                        alt={`${selectedProductDetail.name} featured image`}
                        className="w-full h-full object-cover transition-transform duration-500"
                        style={{ 
                          WebkitUserSelect: 'none',
                          userSelect: 'none',
                          pointerEvents: 'auto'
                        }}
                      />
                    </div>
                    
                    {/* Image Navigation Arrows - Mobile Optimized */}
                    {selectedProductDetail.images.length > 1 && (
                      <>
                        <button
                          onClick={() => {
                            const totalImages = selectedProductDetail.images.length;
                            setCurrentProductImageIndex((prev) => (prev - 1 + totalImages) % totalImages);
                          }}
                          className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 bg-white/90 hover:bg-white text-fem-navy rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 touch-manipulation"
                          aria-label="Previous image"
                        >
                          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                        <button
                          onClick={() => {
                            const totalImages = selectedProductDetail.images.length;
                            setCurrentProductImageIndex((prev) => (prev + 1) % totalImages);
                          }}
                          className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 bg-white/90 hover:bg-white text-fem-navy rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 touch-manipulation"
                          aria-label="Next image"
                        >
                          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                      </>
                    )}
                    
                    {/* Image Counter Badge - Mobile Optimized */}
                    <div className="absolute top-2 sm:top-4 right-2 sm:right-4 bg-black/70 text-white text-xs sm:text-sm px-2 sm:px-3 py-1 rounded-full font-medium">
                      {currentProductImageIndex + 1} of {selectedProductDetail.images.length}
                    </div>
                  </div>
                  
                  {/* Thumbnail Gallery - Mobile Optimized */}
                  {selectedProductDetail.images.length > 1 && (
                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 sm:gap-3">
                      {selectedProductDetail.images.map((imageUrl, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentProductImageIndex(index)}
                          className={`relative aspect-square rounded-lg sm:rounded-xl overflow-hidden border-2 transition-all duration-300 hover:scale-105 touch-manipulation ${
                            index === currentProductImageIndex
                              ? 'border-fem-terracotta ring-2 ring-fem-terracotta/20'
                              : 'border-gray-200 hover:border-fem-terracotta/50'
                          }`}
                        >
                          <img
                            src={imageUrl}
                            alt={`${selectedProductDetail.name} thumbnail ${index + 1}`}
                            className="w-full h-full object-cover"
                            style={{ 
                              WebkitUserSelect: 'none',
                              userSelect: 'none'
                            }}
                          />
                          {index === currentProductImageIndex && (
                            <div className="absolute inset-0 bg-fem-terracotta/20 flex items-center justify-center">
                              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-fem-terracotta rounded-full"></div>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
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
              className="bg-white rounded-2xl p-3 sm:p-6 max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
              onClick={(e) => e.stopPropagation()}
              style={{ 
                scrollBehavior: 'smooth',
                WebkitOverflowScrolling: 'touch',
                overscrollBehavior: 'contain'
              }}
            >
              {/* Sticky Header for Mobile */}
              <div className="sticky top-0 bg-white z-10 pb-3 border-b border-gray-100 mb-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg sm:text-2xl font-bold text-fem-navy truncate pr-4">
                  {selectedServiceDetail.name}
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowServiceDetailModal(false)}
                    className="text-gray-500 hover:text-gray-700 flex-shrink-0"
                    aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </Button>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-fem-navy">Description</h3>
                <p className="text-gray-700 leading-relaxed">{selectedServiceDetail.description}</p>
                
                {/* Enhanced Status Section */}
                <div className="flex items-center justify-between">
                  <div className="text-lg font-bold text-fem-terracotta bg-gradient-to-r from-fem-terracotta to-fem-gold bg-clip-text text-transparent">
                    {selectedServiceDetail.price_range !== 'Free' ? selectedServiceDetail.price_range : 'Contact for pricing'}
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
                    {/* Edit and Delete buttons removed */}
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

              {/* Service Reviews Section */}
              <div className="mt-6 pt-4 border-t border-gray-100">
                <h3 className="text-lg font-semibold text-fem-navy mb-4 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-fem-terracotta" />
                  Service Reviews
                </h3>
                <ProductServiceReviews 
                  type="service" 
                  itemId={selectedServiceDetail.id} 
                  itemName={selectedServiceDetail.name}
                  showAllButton={false}
                  maxReviews={3}
                />
              </div>

              {/* Review Service Button */}
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <Button
                    onClick={() => {
                      setShowServiceDetailModal(false);
                      resetReviewForm();
                      setShowReviewForm(true);
                      setSelectedReviewItem({
                        type: 'service',
                        id: selectedServiceDetail.id,
                        name: selectedServiceDetail.name
                      });
                    }}
                    className="w-full bg-fem-terracotta hover:bg-fem-terracotta/90 text-white"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Review This Service
                  </Button>
              </div>
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
            onClick={() => {
              setShowReviewForm(false);
              if (selectedReviewItem) {
                setSelectedReviewItem(null);
                resetReviewForm();
              }
            }}
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
                  {selectedReviewItem 
                    ? `Review ${selectedReviewItem.name}` 
                    : userReviewData 
                      ? 'Edit Review' 
                      : 'Write a Review'
                  }
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowReviewForm(false);
                    if (selectedReviewItem) {
                      setSelectedReviewItem(null);
                      resetReviewForm();
                    }
                  }}
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
                        onClick={() => {
                          setUserRating(rating);
                          // Clear any review errors when user changes rating
                          if (reviewError) {
                            setReviewError(null);
                          }
                        }}
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
                    onChange={(e) => {
                      setUserReview(e.target.value);
                      // Clear any review errors when user starts typing
                      if (reviewError) {
                        setReviewError(null);
                      }
                    }}
                    placeholder={selectedReviewItem 
                      ? `Share your experience with this ${selectedReviewItem.type}...`
                      : "Share your experience with this business..."
                    }
                    rows={4}
                    className="mt-1"
                  />
                </div>

                {/* Review Error Display */}
                {reviewError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center">
                        <span className="text-red-600 text-sm font-bold">!</span>
                      </div>
                      <p className="text-red-700 text-sm font-medium">{reviewError}</p>
                    </div>
                  </div>
                )}

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
                    onClick={() => {
                      setShowReviewForm(false);
                      if (selectedReviewItem) {
                        setSelectedReviewItem(null);
                        resetReviewForm();
                      }
                    }}
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

      {/* Share Modal */}
      {currentShareData && (
        <ShareModal
          isOpen={shareModalOpen}
          onClose={() => setShareModalOpen(false)}
          shareData={currentShareData}
        />
      )}

      {/* Scroll to Top Button */}
      <motion.button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-fem-navy to-fem-terracotta text-white p-3 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-4 focus:ring-fem-terracotta/30"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        aria-label="Scroll to top"
      >
        <ChevronUp className="w-5 h-5" />
      </motion.button>

      <Footer />
    </div>
  );
};

export default BusinessDetailPage; 