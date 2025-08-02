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
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MotionWrapper, HoverCard, GlassmorphismCard, GlowingCard } from "@/components/ui/MotionWrapper";
import { scrollAnimations, hoverAnimations } from "@/utils/animation";

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

interface BusinessListProps {
  filters: any;
  viewType?: "services" | "products";
}

// Mock business data with Kenyan context
const businesses = [
  {
    id: 1,
    name: "Grace Family Restaurant",
    category: "Restaurant",
    description: "Family-owned restaurant serving authentic Kenyan cuisine with a warm, welcoming atmosphere.",
    rating: 4.8,
    reviewCount: 42,
    phone: "+254 700 123 456",
    address: "Westlands, Nairobi, Kenya",
    county: "Nairobi",
    verified: true,
    image: "/lovable-uploads/f1a3f2a4-bbe7-46e5-be66-1ad39e35defa.png",
    hours: "Mon-Sat 7AM-9PM, Sun 8AM-8PM",
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
      }
    ],
    products: [
      {
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
        name: "Signature Pilau",
        description: "Traditional Kenyan pilau with aromatic spices",
        price: "KSH 350",
        image: "/lovable-uploads/f1a3f2a4-bbe7-46e5-be66-1ad39e35defa.png",
        photos: [
          "/lovable-uploads/f1a3f2a4-bbe7-46e5-be66-1ad39e35defa.png",
          "/lovable-uploads/b392f8fd-6fc5-4bfe-96aa-dc60f6854ba2.png"
        ]
      }
    ]
  },
  {
    id: 2,
    name: "Covenant Auto Repair",
    category: "Automotive",
    description: "Honest and reliable auto repair services with transparent pricing.",
    rating: 4.9,
    reviewCount: 38,
    phone: "+254 733 987 654",
    address: "Industrial Area, Nairobi, Kenya",
    county: "Nairobi",
    verified: true,
    image: "/lovable-uploads/f1a3f2a4-bbe7-46e5-be66-1ad39e35defa.png",
    hours: "Mon-Fri 8AM-6PM, Sat 9AM-4PM",
    services: [
      {
        name: "Oil Change Service",
        description: "Complete oil change with premium quality oil",
        price: "KSH 2,500",
        duration: "30 minutes"
      },
      {
        name: "Brake System Repair",
        description: "Comprehensive brake system inspection and repair",
        price: "KSH 8,000",
        duration: "2-3 hours"
      }
    ],
    products: [
      {
        name: "Premium Motor Oil",
        description: "High-quality motor oil for all vehicle types",
        price: "KSH 1,200",
        image: "/lovable-uploads/f1a3f2a4-bbe7-46e5-be66-1ad39e35defa.png",
        photos: [
          "/lovable-uploads/f1a3f2a4-bbe7-46e5-be66-1ad39e35defa.png",
          "/lovable-uploads/541df702-f215-4b5f-bc60-d08161749258.png"
        ]
      }
    ]
  },
  {
    id: 3,
    name: "Faithful Tech Solutions",
    category: "Technology",
    description: "Professional IT services and computer repair with integrity.",
    rating: 4.7,
    reviewCount: 25,
    phone: "+254 722 456 789",
    address: "Upperhill, Nairobi, Kenya",
    county: "Nairobi",
    verified: true,
    image: "/lovable-uploads/f1a3f2a4-bbe7-46e5-be66-1ad39e35defa.png",
    hours: "Mon-Fri 9AM-6PM, Sat 10AM-4PM",
    services: [
      {
        name: "Computer Repair",
        description: "Fast and reliable computer repair services",
        price: "KSH 1,500",
        duration: "1-2 hours"
      },
      {
        name: "Network Setup",
        description: "Professional network installation and configuration",
        price: "KSH 5,000",
        duration: "2-4 hours"
      }
    ],
    products: [
      {
        name: "Gaming Laptop",
        description: "High-performance gaming laptop with warranty",
        price: "KSH 85,000",
    image: "/lovable-uploads/f1a3f2a4-bbe7-46e5-be66-1ad39e35defa.png",
        photos: [
          "/lovable-uploads/f1a3f2a4-bbe7-46e5-be66-1ad39e35defa.png",
          "/lovable-uploads/b392f8fd-6fc5-4bfe-96aa-dc60f6854ba2.png"
        ]
      }
    ]
  }
];

export const BusinessList = ({ filters, viewType = "services" }: BusinessListProps) => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isLoading, setIsLoading] = useState(false);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  // GSAP Scroll Animations
  useEffect(() => {
    if (listRef.current) {
      scrollAnimations.staggerFadeInOnScroll(listRef.current, 0.1);
    }

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [viewType]);

  // Filter businesses based on viewType and filters
  const filteredBusinesses = businesses.filter(business => {
    // Filter by viewType
    if (viewType === "services" && business.services.length === 0) return false;
    if (viewType === "products" && business.products.length === 0) return false;
    
    // Filter by search term
    if (filters.searchTerm && !business.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) &&
        !business.description.toLowerCase().includes(filters.searchTerm.toLowerCase())) return false;
    
    // Filter by category
    if (filters.category && filters.category !== "All Categories" && business.category !== filters.category) return false;
    
    // Filter by county
    if (filters.county && business.county !== filters.county) return false;
    
    // Filter by rating
    if (business.rating < filters.rating[0] || business.rating > filters.rating[1]) return false;
    
    // Filter by verified only
    if (filters.verifiedOnly && !business.verified) return false;
    
    return true;
  });

  const toggleFavorite = (businessId: number) => {
    setFavorites(prev => 
      prev.includes(businessId) 
        ? prev.filter(id => id !== businessId)
        : [...prev, businessId]
    );
  };

  const ServiceCard = ({ business, service }: { business: any, service: any }) => (
    <MotionWrapper animation="fadeIn" delay={0.1}>
      <HoverCard className="h-full">
        <Card className="h-full bg-white/90 backdrop-blur-sm border-2 border-fem-navy/10 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-fem-navy mb-2">{service.name}</h3>
                <p className="text-sm text-gray-600 mb-3">{service.description}</p>
                
                <div className="flex items-center justify-end text-sm">
                  <div className="flex items-center gap-1 text-gray-500">
                    <Clock className="w-3 h-3" />
                    <span>{service.duration}</span>
          </div>
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

  const ProductCard = ({ business, product }: { business: any, product: any }) => (
    <MotionWrapper animation="fadeIn" delay={0.1}>
      <HoverCard className="h-full">
        <Card className="h-full bg-white/90 backdrop-blur-sm border-2 border-fem-navy/10 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
          <div className="relative">
            <img 
              src={product.image} 
              alt={product.name}
              className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="absolute bottom-4 left-4 right-4 flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex-1 bg-white/90 text-gray-800 hover:bg-white"
                  onClick={() => {
                    setSelectedProduct(product);
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
                  <ShoppingCart className="w-4 h-4 mr-1" />
                  Inquire
                </Button>
              </div>
            </div>
          </div>
          
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-fem-navy mb-2">{product.name}</h3>
                <p className="text-sm text-gray-600 mb-3">{product.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-fem-terracotta">{product.price}</span>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <MapPin className="w-3 h-3" />
                    <span>{business.county}</span>
                  </div>
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
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            {product.photos.map((photo: string, index: number) => (
              <div key={index} className="aspect-square rounded-lg overflow-hidden">
                <img 
                  src={photo} 
                  alt={`${product.name} photo ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
          
          <div className="space-y-2">
            <p className="text-gray-600">{product.description}</p>
            <p className="text-lg font-bold text-fem-terracotta">{product.price}</p>
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
            <Package className="w-12 h-12 text-fem-terracotta" />
          </div>
          <h3 className="text-xl font-semibold text-fem-navy mb-2">
            No {viewType === "services" ? "services" : "products"} found
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
      {viewType === "services" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBusinesses.map(business => 
            business.services.map((service: any, index: number) => (
              <ServiceCard key={`${business.id}-${index}`} business={business} service={service} />
            ))
          )}
            </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBusinesses.map(business => 
            business.products.map((product: any, index: number) => (
              <ProductCard key={`${business.id}-${index}`} business={business} product={product} />
            ))
          )}
        </div>
      )}

      {showPhotoModal && selectedProduct && (
        <ProductPhotoModal 
          product={selectedProduct} 
          onClose={() => {
            setShowPhotoModal(false);
            setSelectedProduct(null);
          }} 
        />
      )}
    </div>
  );
};