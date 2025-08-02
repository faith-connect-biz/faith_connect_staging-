import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Phone, Globe, MapPin, Shield } from "lucide-react";

const featuredBusinesses = [
  {
    id: 1,
    name: "Nyama Choma Paradise",
    category: "Restaurant",
    description: "Authentic Kenyan nyama choma and traditional dishes in a warm, family-friendly atmosphere.",
    rating: 4.8,
    reviewCount: 42,
    phone: "+254 700 123 456",
    website: "nyamachomaparadise.co.ke",
    address: "123 Kimathi Street, Nairobi, Kenya",
    verified: true,
    image: "/lovable-uploads/f1a3f2a4-bbe7-46e5-be66-1ad39e35defa.png",
    hours: "Mon-Sat 7AM-9PM"
  },
  {
    id: 2,
    name: "Mombasa AutoCare",
    category: "Automotive",
    description: "Complete automotive repair and maintenance services in Mombasa. We treat your car like our own.",
    rating: 4.9,
    reviewCount: 38,
    phone: "+254 733 987 654",
    website: "mombasaautocare.co.ke",
    address: "456 Moi Avenue, Mombasa, Kenya",
    verified: true,
    image: "/lovable-uploads/f1a3f2a4-bbe7-46e5-be66-1ad39e35defa.png",
    hours: "Mon-Fri 8AM-6PM"
  },
  {
    id: 3,
    name: "TechSavvy Kenya",
    category: "Technology",
    description: "Professional IT services and computer repair in Nairobi. Web development for businesses and individuals.",
    rating: 4.7,
    reviewCount: 29,
    phone: "+254 711 456 789",
    website: "techsavvykenya.co.ke",
    address: "789 Westlands Road, Nairobi, Kenya",
    verified: true,
    image: "/lovable-uploads/f1a3f2a4-bbe7-46e5-be66-1ad39e35defa.png",
    hours: "Mon-Fri 9AM-5PM"
  }
];

export const FeaturedBusinesses = () => {
  return (
    <section className="py-8 sm:py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 sm:mb-12">
          <div className="mb-4 sm:mb-0">
            <h2 className="text-2xl sm:text-3xl font-bold text-fem-navy mb-2 sm:mb-4">Featured Businesses</h2>
            <p className="text-fem-darkgray text-sm sm:text-base">Trusted and verified businesses in our community</p>
          </div>
          <Link 
            to="/directory" 
            className="text-fem-terracotta hover:text-fem-terracotta/80 font-medium hidden md:inline-flex items-center"
          >
            View all businesses
            <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {featuredBusinesses.map((business, index) => (
            <Card 
              key={business.id} 
              className="hover-card-effect cursor-pointer transition-all duration-300 hover:shadow-lg"
              style={{ animationDelay: `${0.1 * index}s` }}
            >
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg overflow-hidden flex-shrink-0">
                    <img 
                      src={business.image} 
                      alt={`${business.name} logo`} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-base sm:text-lg text-fem-navy truncate">{business.name}</h3>
                      {business.verified && (
                        <Shield className="w-4 h-4 text-green-600 flex-shrink-0" />
                      )}
                    </div>
                    <Badge variant="outline" className="bg-fem-gold/10 text-fem-navy border-fem-gold/20 mb-2 text-xs">
                      {business.category}
                    </Badge>
                  </div>
                </div>
                
                <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 line-clamp-2 leading-relaxed">{business.description}</p>
                
                <div className="flex items-center gap-1 mb-3">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-3 h-3 sm:w-4 sm:h-4 ${i < Math.floor(business.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                      />
                    ))}
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-fem-navy ml-1">{business.rating}</span>
                  <span className="text-xs text-gray-500">({business.reviewCount} reviews)</span>
                </div>
                
                <div className="space-y-1 sm:space-y-2 text-xs text-gray-600 mb-4">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{business.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{business.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{business.website}</span>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <Button asChild variant="outline" size="sm" className="flex-1 border-fem-navy text-fem-navy hover:bg-fem-navy hover:text-white text-xs sm:text-sm h-8 sm:h-9">
                    <Link to={`/business/${business.id}`}>View Details</Link>
                  </Button>
                  <Button size="sm" className="flex-1 bg-fem-terracotta hover:bg-fem-terracotta/90 text-white text-xs sm:text-sm h-8 sm:h-9">
                    Contact
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="mt-6 sm:mt-8 text-center md:hidden">
          <Link to="/directory">
            <Button variant="outline" className="border-fem-terracotta text-fem-terracotta hover:bg-fem-terracotta hover:text-white w-full sm:w-auto">
              View All Businesses
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};