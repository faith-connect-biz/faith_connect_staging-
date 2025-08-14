import React from "react";
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
  Briefcase
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
  "Real Estate": Home,
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

  // Calculate business count for each category
  const getCategoryStats = () => {
    // console.log('BusinessCategories Debug:', { 
    //   isLoading, 
    //   categoriesLength: categories?.length, 
    //   businessesLength: businesses?.length,
    //   categories: categories,
    //   businesses: businesses?.map(b => ({ id: b.id, name: b.business_name, category: b.category }))
    // });

    if (isLoading) {
      return [];
    }

    if (!Array.isArray(categories) || !categories.length) {
      // console.log('No categories available');
      return [];
    }

    const categoryStats = categories.map(category => {
      const matchingBusinesses = Array.isArray(businesses) ? businesses.filter(business => {
        // Handle both object and number category types
        const categoryId = category.id;
        const businessCategoryId = typeof business.category === 'object' ? business.category?.id : business.category;
        const matches = categoryId == businessCategoryId; // Use loose equality to handle type differences
        // console.log(`Category ${category.name} (ID: ${categoryId}, type: ${typeof categoryId}) vs Business ${business.business_name} category ID: ${businessCategoryId} (type: ${typeof businessCategoryId}) - Match: ${matches}`);
        return matches; // Backend already filters for active businesses
      }) : [];
      
      const businessCount = matchingBusinesses.length;

      const IconComponent = categoryIcons[category.name] || DefaultIcon;

      return {
        id: category.id,
        name: category.name,
        slug: category.slug,
        count: businessCount,
        icon: IconComponent,
        color: getCategoryColor(category.name)
      };
    });

    // console.log('Category stats before filtering:', categoryStats);

    // Show all categories, not just those with businesses
    return categoryStats
      .sort((a, b) => b.count - a.count) // Sort by business count
      .slice(0, 8); // Show top 8 categories
  };

  const getCategoryColor = (categoryName: string): string => {
    const colorMap: { [key: string]: string } = {
      "Restaurant": "text-orange-600",
      "Retail": "text-blue-600",
      "Services": "text-green-600",
      "Health & Wellness": "text-red-600",
      "Automotive": "text-purple-600",
      "Real Estate": "text-yellow-600",
      "Education": "text-indigo-600",
      "Technology": "text-teal-600",
      "Beauty & Personal Care": "text-pink-600",
      "Home & Garden": "text-emerald-600",
      "Professional Services": "text-slate-600",
      "Automotive Services": "text-amber-600",
      // New categories from API
      "Food & Dining": "text-orange-600",
      "Health & Beauty": "text-pink-600",
      "Fashion & Clothing": "text-purple-600",
      "Sports & Fitness": "text-green-600",
      "Entertainment": "text-blue-600"
    };
    return colorMap[categoryName] || "text-gray-600";
  };

  const categoryStats = getCategoryStats();

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
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <Card key={index} className="animate-pulse">
                <CardContent className="p-6 text-center">
                  <div className="mx-auto w-12 h-12 mb-4 bg-gray-200 rounded-lg"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3 mx-auto"></div>
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {categoryStats.map((category, index) => (
                <Link 
                  key={category.id}
                  to={`/directory?category=${category.slug}`}
                  className="block"
                >
                  <Card className="hover-card-effect cursor-pointer transition-all duration-300 hover:shadow-lg">
                    <CardContent className="p-6 text-center">
                      <div className={`mx-auto w-12 h-12 mb-4 flex items-center justify-center rounded-lg bg-gray-50 ${category.color}`}>
                        {React.createElement(category.icon, { className: "w-6 h-6" })}
                      </div>
                      <h3 className="font-semibold text-fem-navy mb-2">{category.name}</h3>
                      <p className="text-sm text-fem-darkgray mb-2">
                        {category.count} {category.count === 1 ? 'business' : 'businesses'}
                      </p>
                      {category.description && (
                        <p className="text-xs text-gray-500 line-clamp-2">
                          {category.description}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
            
            <div className="text-center mt-8">
              <Link to="/directory">
                <button className="bg-fem-terracotta hover:bg-fem-terracotta/90 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                  View All Categories
                </button>
              </Link>
            </div>
          </>
        ) : (
          // Show default categories when no data is available
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { name: "Food & Dining", icon: "🍽️", count: 0, description: "Restaurants, cafes, and food services" },
                { name: "Technology", icon: "💻", count: 0, description: "IT services, web development, and tech support" },
                { name: "Automotive", icon: "🚗", count: 0, description: "Auto repair, maintenance, and car services" },
                { name: "Health & Beauty", icon: "💄", count: 0, description: "Salons, spas, and wellness services" },
                { name: "Real Estate", icon: "🏠", count: 0, description: "Property management and real estate services" },
                { name: "Education", icon: "📚", count: 0, description: "Schools, training, and educational services" },
                { name: "Professional Services", icon: "💼", count: 0, description: "Legal, accounting, and consulting" },
                { name: "Home & Garden", icon: "🌱", count: 0, description: "Home improvement and gardening services" }
              ].map((category, index) => (
                <div key={category.name} className="stagger-item tilt-3d magnetic neon-glow bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer">
                  <div className="text-4xl mb-4">{category.icon}</div>
                  <h3 className="text-xl font-semibold text-fem-navy mb-2">{category.name}</h3>
                  <p className="text-sm text-gray-500 mb-2">No businesses yet</p>
                  {category.description && (
                    <p className="text-xs text-gray-400 line-clamp-2">
                      {category.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
            
            <div className="text-center mt-8">
              <p className="text-sm text-gray-500 mb-4">No businesses registered yet - be the first to join our community!</p>
              <Link to="/register-business">
                <button className="bg-fem-terracotta hover:bg-fem-terracotta/90 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                  Register Your Business
                </button>
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
};