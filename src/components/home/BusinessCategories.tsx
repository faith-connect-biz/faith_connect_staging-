import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  Sprout,
  Factory,
  Hotel,
  DollarSign,
  Truck,
  Zap,
  Scissors,
  Music,
  Users,
  PawPrint
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useBusiness } from "@/contexts/BusinessContext";
import { useAuth } from "@/contexts/AuthContext";
import AuthModal from "@/components/auth/AuthModal";

// Icon mapping for categories
const categoryIcons: { [key: string]: any } = {
  // New comprehensive categories
  "Agriculture & Farming 🌱": Sprout,
  "Manufacturing & Production 🏭": Factory,
  "Retail & Wholesale 🛒": ShoppingBag,
  "Hospitality & Tourism 🏨": Hotel,
  "Technology & IT 💻": Monitor,
  "Finance & Insurance 💰": DollarSign,
  "Healthcare & Wellness 🏥": Heart,
  "Real Estate & Construction 🏗️": Building2,
  "Transportation & Logistics 🚚": Truck,
  "Professional Services 📑": Briefcase,
  "Education & Training 📚": GraduationCap,
  "Energy & Utilities ⚡": Zap,
  "Creative Industries 🎨": Palette,
  "Food & Beverage 🍽️": Utensils,
  "Beauty & Personal Care 💄": Scissors,
  "Automotive Services 🚗": Wrench,
  "Home & Garden 🏡": Home,
  "Entertainment & Media 🎭": Music,
  "Non-Profit & Community 🤝": Users,
  "Pet Services & Veterinary 🐾": PawPrint,
  // Legacy mappings for backward compatibility
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
  "Food & Dining": Utensils,
  "Health & Beauty": Heart,
  "Fashion & Clothing": ShoppingBag,
  "Sports & Fitness": Heart,
  "Entertainment": Monitor
};

// Default icon for unknown categories
const DefaultIcon = Building2;

export const BusinessCategories = () => {
  const { categories, businesses, isLoading, isLoadingBusinesses } = useBusiness();
  const { isAuthenticated, isBusinessUser } = useAuth();
  const navigate = useNavigate();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const handleOpenAuthModal = () => {
    setIsAuthModalOpen(true);
  };

  const handleRegisterBusinessClick = () => {
    // If user is authenticated and is a business user, navigate directly
    if (isAuthenticated && isBusinessUser()) {
      navigate('/register-business');
    } else {
      // Otherwise, open the auth modal
      handleOpenAuthModal();
    }
  };

  // Calculate business count for each category
  const getCategoryStats = () => {
    console.log('BusinessCategories Debug:', { 
      isLoading, 
      isLoadingBusinesses,
      categoriesLength: categories?.length, 
      businessesLength: businesses?.length,
      categories: categories,
      businesses: businesses?.map(b => ({ id: b.id, name: b.business_name, category: b.category }))
    });

    // Check if either businesses or categories are still loading
    if (isLoading || isLoadingBusinesses) {
      return [];
    }

    if (!Array.isArray(categories) || !categories.length) {
      console.log('No categories available');
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

    // Show only top categories with businesses
    return categoryStats
      .filter(category => category.count > 0) // Only show categories with businesses
      .sort((a, b) => b.count - a.count) // Sort by business count
      .slice(0, 8); // Show top 8 categories
  };

  const getCategoryColor = (categoryName: string): string => {
    const colorMap: { [key: string]: string } = {
      // New comprehensive categories
      "Agriculture & Farming 🌱": "text-green-600",
      "Manufacturing & Production 🏭": "text-gray-600",
      "Retail & Wholesale 🛒": "text-blue-600",
      "Hospitality & Tourism 🏨": "text-orange-600",
      "Technology & IT 💻": "text-indigo-600",
      "Finance & Insurance 💰": "text-purple-600",
      "Healthcare & Wellness 🏥": "text-red-600",
      "Real Estate & Construction 🏗️": "text-yellow-600",
      "Transportation & Logistics 🚚": "text-teal-600",
      "Professional Services 📑": "text-slate-600",
      "Education & Training 📚": "text-emerald-600",
      "Energy & Utilities ⚡": "text-cyan-600",
      "Creative Industries 🎨": "text-pink-600",
      "Food & Beverage 🍽️": "text-orange-600",
      "Beauty & Personal Care 💄": "text-pink-600",
      "Automotive Services 🚗": "text-amber-600",
      "Home & Garden 🏡": "text-emerald-600",
      "Entertainment & Media 🎭": "text-blue-600",
      "Non-Profit & Community 🤝": "text-purple-600",
      "Pet Services & Veterinary 🐾": "text-green-600",
      // Legacy mappings for backward compatibility
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
      "Food & Dining": "text-orange-600",
      "Health & Beauty": "text-pink-600",
      "Fashion & Clothing": "text-purple-600",
      "Sports & Fitness": "text-green-600",
      "Entertainment": "text-blue-600"
    };
    return colorMap[categoryName] || "text-gray-600";
  };

  const categoryStats = getCategoryStats();

  if (isLoading || isLoadingBusinesses) {
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
                { name: "Agriculture & Farming 🌱", icon: "🌱", count: 0, description: "Crops, livestock, agri-processing" },
                { name: "Technology & IT 💻", icon: "💻", count: 0, description: "Software, hardware, digital services" },
                { name: "Healthcare & Wellness 🏥", icon: "🏥", count: 0, description: "Hospitals, clinics, fitness, pharmaceuticals" },
                { name: "Food & Beverage 🍽️", icon: "🍽️", count: 0, description: "Restaurants, cafes, food services, catering" },
                { name: "Real Estate & Construction 🏗️", icon: "🏗️", count: 0, description: "Property development, rentals, housing" },
                { name: "Professional Services 📑", icon: "📑", count: 0, description: "Legal, consulting, accounting, design" },
                { name: "Transportation & Logistics 🚚", icon: "🚚", count: 0, description: "Delivery, ride-hailing, freight, warehousing" },
                { name: "Creative Industries 🎨", icon: "🎨", count: 0, description: "Media, film, advertising, design" }
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
              <Button 
                onClick={handleRegisterBusinessClick}
                className="bg-fem-terracotta hover:bg-fem-terracotta/90 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Register Your Business
              </Button>
            </div>
          </>
        )}
      </div>
      
      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)}
      />
    </section>
  );
};