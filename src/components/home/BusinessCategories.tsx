import React, { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Utensils, 
  ShoppingBag, 
  Settings, 
  Heart, 
  Car, 
  Home, 
  GraduationCap, 
  Monitor,
  Building2,
  Palette,
  Wrench,
  Briefcase,
  Hammer,
  HardHat
} from "lucide-react";
import { Link } from "react-router-dom";
import { useBusiness } from "@/contexts/BusinessContext";

// Icon mapping for categories
const categoryIcons: { [key: string]: any } = {
  "Restaurant": Utensils,
  "Retail": ShoppingBag,
  "Services": Settings,
  "Health & Wellness": Heart,
  "Automotive": Car,
  "Real Estate": HardHat,
  "Education": GraduationCap,
  "Technology": Monitor,
  "Beauty & Personal Care": Palette,
  "Home & Garden": Building2,
  "Professional Services": Briefcase,
  "Automotive Services": Wrench,
  // New categories from API
  "Food & Dining": Utensils,
  "Health & Beauty": Heart,
  "Fashion & Clothing": ShoppingBag,
  "Sports & Fitness": Heart,
  "Entertainment": Monitor,
  // Add more mappings as needed
};

// Default icon for unknown categories
const DefaultIcon = Building2;

export const BusinessCategories = () => {
  const { categories, businesses, isLoading } = useBusiness();

  // Calculate business count for each category - memoized to prevent unnecessary recalculations
  const categoryStats = useMemo(() => {
    // Check if data is still loading
    if (isLoading) {
      return [];
    }

    if (!Array.isArray(categories) || !categories.length) {
      return [];
    }

    if (!Array.isArray(businesses)) {
      return [];
    }

    // Color mapping object - defined outside the map to avoid recreation
    const colorMap: { [key: string]: string } = {
      "Restaurant": "text-orange-600 bg-orange-50",
      "Retail": "text-blue-600 bg-blue-50",
      "Services": "text-green-600 bg-green-50",
      "Health & Wellness": "text-red-600 bg-red-50",
      "Automotive": "text-purple-600 bg-purple-50",
      "Real Estate": "text-yellow-600 bg-yellow-50",
      "Education": "text-indigo-600 bg-indigo-50",
      "Technology": "text-teal-600 bg-teal-50",
      "Beauty & Personal Care": "text-pink-600 bg-pink-50",
      "Home & Garden": "text-emerald-600 bg-emerald-50",
      "Professional Services": "text-slate-600 bg-slate-50",
      "Automotive Services": "text-amber-600 bg-amber-50",
      "Food & Dining": "text-orange-600 bg-orange-50",
      "Health & Beauty": "text-pink-600 bg-pink-50",
      "Fashion & Clothing": "text-purple-600 bg-purple-50",
      "Sports & Fitness": "text-green-600 bg-green-50",
      "Entertainment": "text-blue-600 bg-blue-50"
    };

    const stats = categories.map(category => {
      const matchingBusinesses = businesses.filter(business => {
        // Handle both object and number category types
        const categoryId = category.id;
        const businessCategoryId = typeof business.category === 'object' ? business.category?.id : business.category;
        return categoryId == businessCategoryId; // Use loose equality to handle type differences
      });
      
      const businessCount = matchingBusinesses.length;
      const IconComponent = categoryIcons[category.name] || DefaultIcon;

      return {
        id: category.id,
        name: category.name,
        slug: category.slug,
        count: businessCount,
        icon: IconComponent,
        color: colorMap[category.name] || "text-gray-600 bg-gray-50"
      };
    });

    // Show only categories with businesses, sorted by count, limited to top 10
    return stats
      .filter(stat => stat.count > 0) // Only show categories with businesses
      .sort((a, b) => b.count - a.count) // Sort by business count (highest first)
      .slice(0, 10); // Show only top 10 categories
  }, [categories, businesses, isLoading]);

  if (isLoading) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-fem-navy mb-4">
              Explore Business Categories
            </h2>
            <p className="text-fem-darkgray max-w-2xl mx-auto">
              Discover trusted businesses within our faith community. From restaurants to tech services, 
              find everything you need while supporting fellow believers.
            </p>
          </div>
          
          {/* Mobile App Style Loading Skeleton */}
          <div className="grid grid-cols-4 gap-3 max-w-md mx-auto mb-8 md:hidden">
            {[...Array(12)].map((_, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-3 shadow-lg border border-gray-100 h-20 flex flex-col items-center justify-between">
                <div className="w-5 h-5 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
              </div>
            ))}
          </div>
          
          {/* Desktop Loading Skeleton - 5 Columns */}
          <div className="hidden lg:grid grid-cols-5 gap-4 mb-8">
            {[...Array(12)].map((_, index) => (
              <Card key={index} className="bg-gray-50 shadow-lg border-0 h-[180px]">
                <CardContent className="p-6 text-center h-full flex flex-col justify-between">
                  <div className="mx-auto w-16 h-16 mb-4 bg-gray-200 rounded-xl"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Medium Screen Loading Skeleton - 3 Columns */}
          <div className="hidden md:grid lg:hidden grid-cols-3 gap-4 mb-8">
            {[...Array(12)].map((_, index) => (
              <Card key={index} className="bg-gray-50 shadow-lg border-0 h-[160px]">
                <CardContent className="p-5 text-center h-full flex flex-col justify-between">
                  <div className="mx-auto w-14 h-14 mb-3 bg-gray-200 rounded-lg"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-fem-navy mb-4">
            Explore Business Categories
          </h2>
          <p className="text-fem-darkgray max-w-2xl mx-auto">
            Discover trusted businesses within our faith community. From restaurants to tech services, 
            find everything you need while supporting fellow believers.
          </p>
        </div>
        
        {categoryStats.length > 0 ? (
          <>
            {/* Enhanced Mobile App Style Grid */}
            <div className="grid grid-cols-4 gap-3 max-w-md mx-auto mb-8 md:hidden">
              {categoryStats.slice(0, 12).map((category, index) => (
                <Link 
                  key={category.id}
                  to={`/directory?category=${category.slug}`}
                  className="block"
                >
                  <div className={`flex flex-col items-center justify-between gap-2 p-3 rounded-xl ${category.color} hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl border border-white/50 cursor-pointer backdrop-blur-sm h-20`}>
                    {React.createElement(category.icon, { className: "w-5 h-5 drop-shadow-sm flex-shrink-0" })}
                    <span className="text-[9px] font-semibold text-center leading-tight drop-shadow-sm line-clamp-2 flex-grow flex items-center justify-center">{category.name}</span>
                  </div>
                </Link>
              ))}
            </div>
            
            {/* Enhanced Desktop Grid - 5 Columns */}
            <div className="hidden lg:grid grid-cols-5 gap-4 mb-8">
              {categoryStats.slice(0, 12).map((category, index) => (
                <Link 
                  key={category.id}
                  to={`/directory?category=${category.slug}`}
                  className="block h-full"
                >
                  <Card className={`hover-card-effect cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 border-0 shadow-lg h-[180px] ${category.color.split(' ')[1]}`}>
                    <CardContent className="p-6 text-center h-full flex flex-col justify-between">
                      <div className="flex flex-col items-center h-full">
                        <div className={`mx-auto w-16 h-16 mb-4 flex items-center justify-center rounded-xl bg-white/80 backdrop-blur-sm shadow-md ${category.color.split(' ')[0]}`}>
                          {React.createElement(category.icon, { className: "w-8 h-8" })}
                        </div>
                        <h3 className="font-semibold text-fem-navy mb-2 text-sm line-clamp-2 leading-tight flex-grow flex items-center justify-center text-center">{category.name}</h3>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
            
            {/* Medium Screen Grid - 3 Columns */}
            <div className="hidden md:grid lg:hidden grid-cols-3 gap-4 mb-8">
              {categoryStats.slice(0, 12).map((category, index) => (
                <Link 
                  key={category.id}
                  to={`/directory?category=${category.slug}`}
                  className="block h-full"
                >
                  <Card className={`hover-card-effect cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 border-0 shadow-lg h-[160px] ${category.color.split(' ')[1]}`}>
                    <CardContent className="p-5 text-center h-full flex flex-col justify-between">
                      <div className="flex flex-col items-center h-full">
                        <div className={`mx-auto w-14 h-14 mb-3 flex items-center justify-center rounded-lg bg-white/80 backdrop-blur-sm shadow-md ${category.color.split(' ')[0]}`}>
                          {React.createElement(category.icon, { className: "w-7 h-7" })}
                        </div>
                        <h3 className="font-semibold text-fem-navy mb-2 text-sm line-clamp-2 leading-tight flex-grow flex items-center justify-center text-center">{category.name}</h3>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
            
            <div className="text-center mt-8">
              <Link to="/directory">
                <button className="bg-gradient-to-r from-fem-gold to-fem-terracotta hover:from-fem-gold/90 hover:to-fem-terracotta/90 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
                  View All Categories
                </button>
              </Link>
            </div>
          </>
        ) : (
          // Show message when no categories are available
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <Building2 className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No Categories Available</h3>
              <p className="text-gray-500 mb-4">
                {isLoading 
                  ? "Loading categories..." 
                  : "No business categories found. Please try again later."
                }
              </p>
              {!isLoading && (
                <button 
                  onClick={() => window.location.reload()} 
                  className="bg-gradient-to-r from-fem-gold to-fem-terracotta hover:from-fem-gold/90 hover:to-fem-terracotta/90 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Refresh Page
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};