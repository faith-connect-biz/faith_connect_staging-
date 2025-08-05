import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Star, 
  Phone, 
  MapPin, 
  Shield, 
  Heart, 
  Grid3X3, 
  List,
  Settings,
  Package,
  Clock,
  ExternalLink,
  Camera,
  Eye,
  ShoppingCart,
  MessageCircle,
  TrendingUp,
  Award,
  X,
  Building2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MotionWrapper, HoverCard, GlassmorphismCard, GlowingCard } from "@/components/ui/MotionWrapper";
import { scrollAnimations, hoverAnimations } from "@/utils/animation";
import { useBusiness } from "@/contexts/BusinessContext";

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

interface BusinessListProps {
  filters: any;
  viewType?: "services" | "products";
}

export const BusinessList = ({ filters, viewType = "services" }: BusinessListProps) => {
  const navigate = useNavigate();
  const { businesses, isLoading } = useBusiness();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<any>(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  // GSAP Scroll Animations
  useEffect(() => {
    if (listRef.current) {
      scrollAnimations.staggerFadeInOnScroll('.business-card', 0.1);
    }

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [viewType, businesses]);

  // Filter businesses based on filters
  const filteredBusinesses = Array.isArray(businesses) ? businesses.filter(business => {
    // Filter by search term
    if (filters.searchTerm && !business.business_name.toLowerCase().includes(filters.searchTerm.toLowerCase()) &&
        !business.description?.toLowerCase().includes(filters.searchTerm.toLowerCase())) return false;
    
    // Filter by category
    if (filters.category && filters.category !== "all" && business.category?.name !== filters.category) return false;
    
    // Filter by county
    if (filters.county && filters.county !== "all" && business.county !== filters.county) return false;
    
    // Filter by rating
    if (business.rating < filters.rating[0] || business.rating > filters.rating[1]) return false;
    
    // Filter by verified only
    if (filters.verifiedOnly && !business.is_verified) return false;
    
    return true;
  }) : [];

  const toggleFavorite = (businessId: string) => {
    setFavorites(prev => 
      prev.includes(businessId) 
        ? prev.filter(id => id !== businessId)
        : [...prev, businessId]
    );
  };

  const BusinessCard = ({ business }: { business: any }) => (
    <MotionWrapper animation="fadeIn" delay={0.1}>
      <HoverCard className="h-full">
        <Card className="business-card h-full bg-white/90 backdrop-blur-sm border-2 border-fem-navy/10 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
          <div className="relative">
            <img 
              src={business.business_image_url || business.business_logo_url || "/placeholder.svg"} 
              alt={business.business_name}
              className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute top-4 right-4 flex gap-2">
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
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="absolute bottom-4 left-4 right-4 flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex-1 bg-white/90 text-gray-800 hover:bg-white"
                  onClick={() => {
                    setSelectedBusiness(business);
                    setShowPhotoModal(true);
                  }}
                >
                  <Camera className="w-4 h-4 mr-1" />
                  View Photos
                </Button>
                <Button 
                  size="sm" 
                  className="flex-1 bg-gradient-to-r from-fem-terracotta to-fem-gold hover:from-fem-terracotta/90 hover:to-fem-gold/90 text-white shadow-lg"
                  onClick={() => navigate(`/chat?business=${business.id}`)}
                >
                  <MessageCircle className="w-4 h-4 mr-1" />
                  Contact
                </Button>
              </div>
            </div>
          </div>
          
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-fem-navy mb-2">{business.business_name}</h3>
                <p className="text-sm text-gray-600 mb-3">{business.description}</p>
                
                <div className="flex items-center gap-4 mb-3">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm font-medium">{business.rating}</span>
                    <span className="text-sm text-gray-500">({business.review_count} reviews)</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-500">
                    <MapPin className="w-3 h-3" />
                    <span className="text-sm">{business.city}, {business.county}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="outline" className="text-xs">
                    {business.category?.name}
                  </Badge>
                  {viewType === "services" && (
                    <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                      <Settings className="w-3 h-3 mr-1" />
                      Services
                    </Badge>
                  )}
                  {viewType === "products" && (
                    <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                      <Package className="w-3 h-3 mr-1" />
                      Products
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex gap-2 mt-4">
              <Button 
                size="sm" 
                variant="outline" 
                className="flex-1 border-fem-navy text-fem-navy hover:bg-fem-navy hover:text-white"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                <Link to={`/business/${business.id}`}>View Details</Link>
              </Button>
              <Button 
                size="sm" 
                className="flex-1 bg-gradient-to-r from-fem-terracotta to-fem-gold hover:from-fem-terracotta/90 hover:to-fem-gold/90 text-white shadow-lg"
                onClick={() => navigate(`/chat?business=${business.id}`)}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Contact
              </Button>
            </div>
          </CardContent>
        </Card>
      </HoverCard>
    </MotionWrapper>
  );

  const BusinessPhotoModal = ({ business, onClose }: { business: any, onClose: () => void }) => (
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
            <h3 className="text-xl font-semibold text-fem-navy">{business.business_name}</h3>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
          
          <div className="aspect-video rounded-lg overflow-hidden mb-4">
            <img 
              src={business.business_image_url || business.business_logo_url || "/placeholder.svg"} 
              alt={business.business_name}
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="space-y-2">
            <p className="text-gray-600">{business.description}</p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500" />
                <span className="font-medium">{business.rating}</span>
                <span className="text-gray-500">({business.review_count} reviews)</span>
              </div>
              <Badge variant="outline">{business.category?.name}</Badge>
            </div>
            <div className="flex items-center gap-1 text-gray-500">
              <MapPin className="w-4 h-4" />
              <span>{business.address}</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="h-64">
            <CardContent className="p-6">
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2 mb-4" />
              <Skeleton className="h-20 w-full mb-4" />
              <div className="flex gap-2">
                <Skeleton className="h-8 flex-1" />
                <Skeleton className="h-8 flex-1" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (filteredBusinesses.length === 0) {
    return (
      <MotionWrapper animation="fadeIn" delay={0.2}>
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-r from-fem-gold/20 to-fem-terracotta/20 rounded-full flex items-center justify-center">
            <Building2 className="w-12 h-12 text-fem-terracotta" />
          </div>
          <h3 className="text-xl font-semibold text-fem-navy mb-2">
            No businesses found
          </h3>
          <p className="text-gray-600 mb-4">
            Try adjusting your filters or search terms
          </p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-fem-terracotta to-fem-gold hover:from-fem-terracotta/90 hover:to-fem-gold/90 text-white"
          >
            Clear Filters
          </Button>
        </div>
      </MotionWrapper>
    );
  }

  return (
    <div ref={listRef}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBusinesses.map(business => (
          <BusinessCard key={business.id} business={business} />
        ))}
      </div>

      {showPhotoModal && selectedBusiness && (
        <BusinessPhotoModal 
          business={selectedBusiness} 
          onClose={() => {
            setShowPhotoModal(false);
            setSelectedBusiness(null);
          }} 
        />
      )}
    </div>
  );
};