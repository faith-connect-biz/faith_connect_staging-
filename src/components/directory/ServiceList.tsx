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
  Clock,
  ExternalLink,
  Camera,
  Eye,
  MessageCircle,
  TrendingUp,
  Award,
  X,
  Building2,
  Calendar,
  Users,
  CheckCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MotionWrapper, HoverCard, GlassmorphismCard, GlowingCard } from "@/components/ui/MotionWrapper";
import { scrollAnimations, hoverAnimations } from "@/utils/animation";
import { useBusiness } from "@/contexts/BusinessContext";

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

interface ServiceListProps {
  filters: any;
}

export const ServiceList = ({ filters }: ServiceListProps) => {
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
      scrollAnimations.staggerFadeInOnScroll('.service-card', 0.1);
    }

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [businesses]);

  // Filter businesses that offer services
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
    
    // Filter for service-oriented businesses (you can customize this logic)
    const serviceCategories = [
      "Professional Services", "Health & Wellness", "Education", 
      "Automotive Services", "Home & Garden", "Beauty & Personal Care"
    ];
    
    return serviceCategories.includes(business.category?.name) || true; // Show all for now
  }) : [];

  const toggleFavorite = (businessId: string) => {
    setFavorites(prev => 
      prev.includes(businessId) 
        ? prev.filter(id => id !== businessId)
        : [...prev, businessId]
    );
  };

  const ServiceCard = ({ business }: { business: any }) => (
    <MotionWrapper animation="fadeIn" delay={0.1}>
      <HoverCard className="h-full">
        <Card className="service-card h-full bg-white/90 backdrop-blur-sm border-2 border-blue-100 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
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
              <Badge className="bg-blue-500 text-white">
                <Settings className="w-3 h-3 mr-1" />
                Services
              </Badge>
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
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg"
                  onClick={() => navigate(`/chat?business=${business.id}`)}
                >
                  <MessageCircle className="w-4 h-4 mr-1" />
                  Book Service
                </Button>
              </div>
            </div>
          </div>
          
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 
                  className="text-lg font-semibold text-fem-navy mb-2 cursor-pointer hover:text-fem-terracotta transition-colors duration-200 flex items-center gap-2 group"
                  onClick={() => navigate(`/business/${business.id}`)}
                  title="Click to view business details"
                >
                  {business.business_name}
                  <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-fem-terracotta transition-colors duration-200" />
                </h3>
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
                  <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                    <Settings className="w-3 h-3 mr-1" />
                    {business.category?.name}
                  </Badge>
                  <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                    <Clock className="w-3 h-3 mr-1" />
                    Available
                  </Badge>
                </div>

                {/* Service-specific information */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4 text-blue-500" />
                    <span>Appointment-based services</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="w-4 h-4 text-blue-500" />
                    <span>Professional consultation available</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => toggleFavorite(business.id)}
                  className={`${favorites.includes(business.id) ? 'text-red-500' : 'text-gray-400'} hover:text-red-500`}
                >
                  <Heart className={`w-4 h-4 ${favorites.includes(business.id) ? 'fill-current' : ''}`} />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => navigate(`/business/${business.id}`)}
                  className="text-gray-400 hover:text-fem-navy"
                  title="View business details"
                >
                  <Eye className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="border-fem-terracotta text-fem-terracotta hover:bg-fem-terracotta hover:text-white"
                  onClick={() => navigate(`/business/${business.id}`)}
                >
                  <Building2 className="w-4 h-4 mr-1" />
                  View Business
                </Button>
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
                  onClick={() => navigate(`/chat?business=${business.id}`)}
                >
                  <MessageCircle className="w-4 h-4 mr-1" />
                  Book Service
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </HoverCard>
    </MotionWrapper>
  );

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, index) => (
          <Card key={index} className="h-full">
            <Skeleton className="h-48 w-full" />
            <CardContent className="p-6 space-y-4">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-20" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (filteredBusinesses.length === 0) {
    return (
      <div className="text-center py-12">
        <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-fem-navy mb-2">No Services Found</h3>
        <p className="text-gray-600 mb-4">Try adjusting your filters or search terms</p>
        <Button onClick={() => window.location.reload()} variant="outline">
          Clear Filters
        </Button>
      </div>
    );
  }

  return (
    <div ref={listRef}>
      <div className={`grid gap-6 ${
        viewMode === "grid" 
          ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" 
          : "grid-cols-1"
      }`}>
        <AnimatePresence>
          {filteredBusinesses.map((business, index) => (
            <ServiceCard key={business.id} business={business} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}; 