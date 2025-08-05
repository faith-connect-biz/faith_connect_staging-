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
  // Add more mappings as needed
};

// Default icon for unknown categories
const DefaultIcon = Building2;

export const BusinessCategories = () => {
  const { categories, businesses, isLoading } = useBusiness();

  // Calculate business count for each category
  const getCategoryStats = () => {
    if (isLoading || !Array.isArray(categories) || !categories.length) {
      return [];
    }

    return categories.map(category => {
      const businessCount = businesses.filter(business => 
        business.category?.id === category.id
      ).length;

      const IconComponent = categoryIcons[category.name] || DefaultIcon;

      return {
        id: category.id,
        name: category.name,
        slug: category.slug,
        count: businessCount,
        icon: IconComponent,
        color: getCategoryColor(category.name)
      };
    }).filter(category => category.count > 0) // Only show categories with businesses
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
      "Automotive Services": "text-amber-600"
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
                      <p className="text-sm text-fem-darkgray">{category.count} businesses</p>
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
          <div className="text-center py-12">
            <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-fem-navy mb-2">No Categories Available</h3>
            <p className="text-gray-600">Categories will appear here once businesses are added to the directory.</p>
          </div>
        )}
      </div>
    </section>
  );
};