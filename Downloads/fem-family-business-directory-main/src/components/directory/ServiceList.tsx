import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
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
  CheckCircle,
  DollarSign
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MotionWrapper, HoverCard, GlassmorphismCard, GlowingCard } from "@/components/ui/MotionWrapper";
import { scrollAnimations, hoverAnimations } from "@/utils/animation";
import { useBusiness } from "@/contexts/BusinessContext";
import { Service } from "@/services/api";
import { Pagination } from "@/components/Pagination";

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

interface ServiceListProps {
  filters: any;
  currentPage?: number;
  itemsPerPage?: number;
  onPageChange?: (page: number) => void;
}

export const ServiceList = ({ filters, currentPage = 1, itemsPerPage = 15, onPageChange }: ServiceListProps) => {
  const navigate = useNavigate();
  const { services, businesses, isLoading } = useBusiness();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
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
  }, [services]);

  // Filter services based on filters
  const filteredServices = Array.isArray(services) ? services.filter(service => {
    // Get the business for this service
    // Handle both string and object business references
    const businessId = typeof service.business === 'string' ? service.business : service.business.id;
    const business = businesses.find(b => b.id === businessId);
    if (!business) return false;

    // Filter by search term
    if (filters.searchTerm && 
        !service.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) &&
        !service.description?.toLowerCase().includes(filters.searchTerm.toLowerCase()) &&
        !business.business_name.toLowerCase().includes(filters.searchTerm.toLowerCase())) return false;
    
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

  // Pagination logic
  const totalItems = filteredServices.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedServices = filteredServices.slice(startIndex, endIndex);

  const toggleFavorite = (serviceId: string) => {
    setFavorites(prev => 
      prev.includes(serviceId) 
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleServiceClick = (service: Service) => {
    // Navigate to the business page when service is clicked
    // Handle both string and object business references
    const businessId = typeof service.business === 'string' ? service.business : service.business.id;
    const business = businesses.find(b => b.id === businessId);
    if (business) {
      navigate(`/business/${business.id}`);
    }
  };

  const ServiceCard = ({ service }: { service: Service }) => {
    // Handle both string and object business references
    const businessId = typeof service.business === 'string' ? service.business : service.business.id;
    const business = businesses.find(b => b.id === businessId);
    
    if (!business) return null;

    return (
      <MotionWrapper animation="fadeIn" delay={0.1}>
        <HoverCard className="h-full">
          <Card 
            className="service-card h-full bg-white/90 backdrop-blur-sm border-2 border-fem-navy/10 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer"
            onClick={() => handleServiceClick(service)}
          >
            <div className="relative">
              <img 
                src={service.service_image_url || service.images?.[0] || business.business_image_url || business.business_logo_url || "/placeholder.svg"} 
                alt={service.name}
                className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/placeholder.svg";
                }}
              />
              
              {/* Service Status Badge */}
              <div className="absolute top-3 left-3">
                <Badge variant={(service.is_active || service.is_available) ? "default" : "secondary"} className="bg-fem-navy/90 text-white">
                  {(service.is_active || service.is_available) ? "Available" : "Unavailable"}
                </Badge>
              </div>

              {/* Business Verification Badge */}
              {business.is_verified && (
                <div className="absolute top-3 right-3">
                  <Badge variant="default" className="bg-green-600 text-white">
                    <Shield className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                </div>
              )}

              {/* Favorite Button */}
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white/80 hover:bg-white"
                                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(service.id?.toString() || '');
                  }}
              >
                <Heart 
                  className={`w-4 h-4 ${favorites.includes(service.id?.toString() || '') ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} 
                />
              </Button>
            </div>

            <CardContent className="p-4">
              {/* Service Name */}
              <h3 className="font-semibold text-lg text-fem-navy mb-2 group-hover:text-fem-blue transition-colors duration-200">
                {service.name}
              </h3>

              {/* Business Name */}
              <p className="text-sm text-gray-600 mb-2 flex items-center">
                <Building2 className="w-4 h-4 mr-1" />
                {business.business_name}
              </p>

              {/* Service Description */}
              {service.description && (
                <p className="text-gray-700 text-sm mb-3 line-clamp-2">
                  {service.description}
                </p>
              )}

              {/* Service Details */}
              <div className="space-y-2 mb-3">
                {service.price_range && service.price_range !== 'Free' && (
                  <div className="flex items-center text-sm text-gray-600">
                    <DollarSign className="w-4 h-4 mr-1" />
                    {service.price_range}
                  </div>
                )}
                
                {service.duration && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-1" />
                    {service.duration}
                  </div>
                )}
              </div>

              {/* Business Location */}
              <div className="flex items-center text-sm text-gray-600 mb-3">
                <MapPin className="w-4 h-4 mr-1" />
                {business.city && business.county ? `${business.city}, ${business.county}` : business.address}
              </div>

              {/* Business Rating */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-500 mr-1" />
                  <span className="text-sm font-medium text-gray-700">
                    {typeof business.rating === 'number' ? business.rating.toFixed(1) : business.rating}
                  </span>
                  <span className="text-sm text-gray-500 ml-1">
                    ({business.review_count || 0} reviews)
                  </span>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  className="text-fem-navy border-fem-navy hover:bg-fem-navy hover:text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleServiceClick(service);
                  }}
                >
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        </HoverCard>
      </MotionWrapper>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex space-x-4">
            <Skeleton className="h-48 w-48" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!filteredServices.length) {
    return (
      <div className="text-center py-12">
        <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No services found</h3>
        <p className="text-gray-500">Try adjusting your filters or search terms.</p>
      </div>
    );
  }

  return (
    <div ref={listRef} className="space-y-6">
      {/* View Mode Toggle */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("grid")}
          >
            <Grid3X3 className="w-4 h-4 mr-1" />
            Grid
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("list")}
          >
            <List className="w-4 h-4 mr-1" />
            List
          </Button>
        </div>
        
        <div className="text-sm text-gray-500">
          {filteredServices.length} service{filteredServices.length !== 1 ? 's' : ''} found
        </div>
      </div>

      {/* Services Grid/List */}
      <div className={viewMode === "grid" 
        ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
        : "space-y-4"
      }>
        <AnimatePresence>
          {paginatedServices.map((service, index) => (
            <ServiceCard key={service.id || `service-${index}`} service={service} />
          ))}
        </AnimatePresence>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange || (() => {})}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
          />
        </div>
      )}
    </div>
  );
}; 