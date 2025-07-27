import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Star, 
  Phone, 
  Globe, 
  MapPin, 
  Shield, 
  Heart, 
  Grid3X3, 
  List,
  Clock
} from "lucide-react";

interface BusinessListProps {
  filters: any;
}

// Mock business data
const businesses = [
  {
    id: 1,
    name: "Grace Family Restaurant",
    category: "Restaurant",
    description: "Family-owned restaurant serving homestyle meals with a warm, welcoming atmosphere. All ingredients sourced locally with love.",
    rating: 4.8,
    reviewCount: 42,
    phone: "(555) 123-4567",
    website: "gracefamilyrest.com",
    address: "123 Faith Ave, Atlanta, GA 30309",
    verified: true,
    image: "/lovable-uploads/f1a3f2a4-bbe7-46e5-be66-1ad39e35defa.png",
    hours: "Mon-Sat 7AM-9PM, Sun 8AM-8PM",
    tags: ["Family-Friendly", "Local Ingredients", "Catering"],
    dateAdded: "2024-01-15"
  },
  {
    id: 2,
    name: "Covenant Auto Repair",
    category: "Automotive",
    description: "Honest and reliable auto repair services. We treat your car like our own with transparent pricing and quality work.",
    rating: 4.9,
    reviewCount: 38,
    phone: "(555) 987-6543",
    website: "covenantauto.com",
    address: "456 Service St, Atlanta, GA 30308",
    verified: true,
    image: "/lovable-uploads/f1a3f2a4-bbe7-46e5-be66-1ad39e35defa.png",
    hours: "Mon-Fri 8AM-6PM, Sat 9AM-4PM",
    tags: ["Certified Mechanics", "Warranty", "Towing"],
    dateAdded: "2024-01-10"
  },
  {
    id: 3,
    name: "Faith Tech Solutions",
    category: "Technology",
    description: "IT support and web development services for businesses and individuals. Helping our community embrace technology.",
    rating: 4.7,
    reviewCount: 29,
    phone: "(555) 456-7890",
    website: "faithtech.com",
    address: "789 Digital Dr, Atlanta, GA 30307",
    verified: true,
    image: "/lovable-uploads/f1a3f2a4-bbe7-46e5-be66-1ad39e35defa.png",
    hours: "Mon-Fri 9AM-5PM",
    tags: ["Web Development", "IT Support", "Cloud Services"],
    dateAdded: "2024-01-20"
  },
  {
    id: 4,
    name: "Blessed Beauty Salon",
    category: "Beauty & Personal Care",
    description: "Full-service beauty salon offering hair, nails, and skincare services in a relaxing Christian environment.",
    rating: 4.6,
    reviewCount: 56,
    phone: "(555) 321-0987",
    website: "blessedbeauty.com",
    address: "321 Style Blvd, Atlanta, GA 30306",
    verified: false,
    image: "/lovable-uploads/f1a3f2a4-bbe7-46e5-be66-1ad39e35defa.png",
    hours: "Tue-Sat 9AM-7PM",
    tags: ["Hair Styling", "Manicure", "Skincare"],
    dateAdded: "2024-01-25"
  },
  {
    id: 5,
    name: "Cornerstone Legal Services",
    category: "Legal Services",
    description: "Comprehensive legal services with a focus on family law, estate planning, and business formation.",
    rating: 4.8,
    reviewCount: 23,
    phone: "(555) 654-3210",
    website: "cornerstonelegal.com",
    address: "987 Justice Way, Atlanta, GA 30305",
    verified: true,
    image: "/lovable-uploads/f1a3f2a4-bbe7-46e5-be66-1ad39e35defa.png",
    hours: "Mon-Fri 9AM-5PM",
    tags: ["Family Law", "Estate Planning", "Business Law"],
    dateAdded: "2024-01-08"
  }
];

export const BusinessList = ({ filters }: BusinessListProps) => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isLoading, setIsLoading] = useState(false);
  const [favorites, setFavorites] = useState<number[]>([]);

  // Filter and sort businesses based on filters
  const filteredBusinesses = businesses.filter((business) => {
    if (filters.searchTerm && !business.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) &&
        !business.description.toLowerCase().includes(filters.searchTerm.toLowerCase())) {
      return false;
    }
    if (filters.category && business.category !== filters.category) {
      return false;
    }
    if (filters.verifiedOnly && !business.verified) {
      return false;
    }
    return true;
  }).sort((a, b) => {
    switch (filters.sortBy) {
      case "newest":
        return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
      case "rating":
        return b.rating - a.rating;
      case "name":
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  const toggleFavorite = (businessId: number) => {
    setFavorites(prev => 
      prev.includes(businessId) 
        ? prev.filter(id => id !== businessId)
        : [...prev, businessId]
    );
  };

  const BusinessCard = ({ business, isListView = false }: { business: any, isListView?: boolean }) => (
    <Card 
      key={business.id} 
      className={`hover-card-effect cursor-pointer transition-all duration-300 hover:shadow-lg ${
        isListView ? 'w-full' : ''
      }`}
    >
      <CardContent className={`p-6 ${isListView ? 'flex gap-6' : ''}`}>
        <div className={`${isListView ? 'w-24 h-24 flex-shrink-0' : 'flex items-start gap-4 mb-4'}`}>
          <div className={`${isListView ? 'w-full h-full' : 'w-12 h-12'} rounded-lg overflow-hidden flex-shrink-0`}>
            <img 
              src={business.image} 
              alt={`${business.name} logo`} 
              className="w-full h-full object-cover"
            />
          </div>
          
          {!isListView && (
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-lg text-fem-navy">{business.name}</h3>
                  {business.verified && (
                    <Shield className="w-4 h-4 text-green-600" />
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleFavorite(business.id)}
                  className="p-1"
                >
                  <Heart 
                    className={`w-4 h-4 ${
                      favorites.includes(business.id) 
                        ? 'fill-red-500 text-red-500' 
                        : 'text-gray-400'
                    }`} 
                  />
                </Button>
              </div>
              <Badge variant="outline" className="bg-fem-gold/10 text-fem-navy border-fem-gold/20 mb-2">
                {business.category}
              </Badge>
            </div>
          )}
        </div>
        
        <div className={`${isListView ? 'flex-1' : ''}`}>
          {isListView && (
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-lg text-fem-navy">{business.name}</h3>
                {business.verified && (
                  <Shield className="w-4 h-4 text-green-600" />
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleFavorite(business.id)}
                className="p-1"
              >
                <Heart 
                  className={`w-4 h-4 ${
                    favorites.includes(business.id) 
                      ? 'fill-red-500 text-red-500' 
                      : 'text-gray-400'
                  }`} 
                />
              </Button>
            </div>
          )}
          
          {isListView && (
            <Badge variant="outline" className="bg-fem-gold/10 text-fem-navy border-fem-gold/20 mb-3">
              {business.category}
            </Badge>
          )}
          
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">{business.description}</p>
          
          <div className="flex items-center gap-1 mb-3">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`w-4 h-4 ${i < Math.floor(business.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                />
              ))}
            </div>
            <span className="text-sm font-medium text-fem-navy">{business.rating}</span>
            <span className="text-xs text-gray-500">({business.reviewCount} reviews)</span>
          </div>
          
          <div className={`space-y-2 text-xs text-gray-600 mb-4 ${isListView ? 'grid grid-cols-2 gap-2' : ''}`}>
            <div className="flex items-center gap-2">
              <Phone className="w-3 h-3" />
              <span>{business.phone}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-3 h-3" />
              <span>{business.address}</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-3 h-3" />
              <span>{business.website}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-3 h-3" />
              <span>{business.hours}</span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-1 mb-4">
            {business.tags.map((tag: string) => (
              <Badge key={tag} variant="outline" className="text-xs bg-gray-50 text-gray-600">
                {tag}
              </Badge>
            ))}
          </div>
          
          <div className="flex gap-3">
            <Button asChild variant="outline" size="sm" className="flex-1 border-fem-navy text-fem-navy hover:bg-fem-navy hover:text-white">
              <Link to={`/business/${business.id}`}>View Details</Link>
            </Button>
            <Button size="sm" className="flex-1 bg-fem-terracotta hover:bg-fem-terracotta/90 text-white">
              Contact
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-40 w-full mb-4" />
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-4" />
                <Skeleton className="h-8 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with view controls */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("grid")}
            className={viewMode === "grid" ? "bg-fem-terracotta hover:bg-fem-terracotta/90" : "border-fem-navy text-fem-navy hover:bg-fem-navy hover:text-white"}
          >
            <Grid3X3 className="w-4 h-4 mr-2" />
            Grid
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("list")}
            className={viewMode === "list" ? "bg-fem-terracotta hover:bg-fem-terracotta/90" : "border-fem-navy text-fem-navy hover:bg-fem-navy hover:text-white"}
          >
            <List className="w-4 h-4 mr-2" />
            List
          </Button>
        </div>
        <p className="text-sm text-gray-600">
          {filteredBusinesses.length} business{filteredBusinesses.length !== 1 ? 'es' : ''} found
        </p>
      </div>

      {/* Business listings */}
      {filteredBusinesses.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-gray-400 mb-4">
              <MapPin className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-fem-navy mb-2">No businesses found</h3>
            <p className="text-gray-600">Try adjusting your filters or search terms.</p>
          </CardContent>
        </Card>
      ) : (
        <div className={
          viewMode === "grid" 
            ? "grid grid-cols-1 md:grid-cols-2 gap-6"
            : "space-y-4"
        }>
          {filteredBusinesses.map((business) => (
            <BusinessCard 
              key={business.id} 
              business={business} 
              isListView={viewMode === "list"}
            />
          ))}
        </div>
      )}
    </div>
  );
};