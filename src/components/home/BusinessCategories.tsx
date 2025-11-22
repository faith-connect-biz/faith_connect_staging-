import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Building2 } from "lucide-react";
import { Link } from "react-router-dom";
import { apiService, Category } from "@/services/api";
import { motion } from "framer-motion";

// Icon mapping for categories (emoji-based)
const getCategoryIcon = (categoryName: string): string => {
  const iconMap: { [key: string]: string } = {
    'Restaurant': '🍽️',
    'Retail': '🛍️',
    'Services': '🔧',
    'Health & Wellness': '💚',
    'Automotive': '🚗',
    'Real Estate': '🏠',
    'Education': '📚',
    'Entertainment': '🎬',
    'Financial Services': '💰',
    'Legal Services': '⚖️',
    'Construction': '🏗️',
    'Beauty & Personal Care': '💄',
    'Home & Garden': '🏡',
    'Professional Services': '💼',
    'Non-Profit': '🤝',
  };
  return iconMap[categoryName] || '📦';
};

// Color mapping for categories
const getCategoryColor = (categoryName: string): string => {
  const colorMap: { [key: string]: string } = {
    "Restaurant": "text-orange-600 bg-orange-50 border-orange-200",
    "Retail": "text-blue-600 bg-blue-50 border-blue-200",
    "Services": "text-green-600 bg-green-50 border-green-200",
    "Health & Wellness": "text-red-600 bg-red-50 border-red-200",
    "Automotive": "text-purple-600 bg-purple-50 border-purple-200",
    "Real Estate": "text-yellow-600 bg-yellow-50 border-yellow-200",
    "Education": "text-indigo-600 bg-indigo-50 border-indigo-200",
    "Entertainment": "text-pink-600 bg-pink-50 border-pink-200",
    "Financial Services": "text-emerald-600 bg-emerald-50 border-emerald-200",
    "Legal Services": "text-slate-600 bg-slate-50 border-slate-200",
    "Construction": "text-amber-600 bg-amber-50 border-amber-200",
    "Beauty & Personal Care": "text-rose-600 bg-rose-50 border-rose-200",
    "Home & Garden": "text-teal-600 bg-teal-50 border-teal-200",
    "Professional Services": "text-cyan-600 bg-cyan-50 border-cyan-200",
    "Non-Profit": "text-violet-600 bg-violet-50 border-violet-200",
  };
  return colorMap[categoryName] || "text-gray-600 bg-gray-50 border-gray-200";
};

export const BusinessCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        console.log('🔄 Fetching categories from /api/business/vset/categories/');
        const response = await apiService.getCategoriesWithSubcategories();
        console.log('✅ Categories fetched successfully:', response.results?.length || 0, 'categories');
        setCategories(response.results || []);
      } catch (error) {
        console.error('❌ Error fetching categories from /api/business/vset/categories/:', error);
        setCategories([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Prepare category display data
  const categoryStats = useMemo(() => {
    if (!Array.isArray(categories) || !categories.length) {
      return [];
    }

    return categories.map(category => {
      const subcategoryCount = Array.isArray(category.subcategories) 
        ? category.subcategories.length 
        : 0;

      return {
        id: category.id,
        name: category.name,
        slug: category.slug,
        subcategoryCount,
        icon: getCategoryIcon(category.name),
        color: getCategoryColor(category.name)
      };
    });
  }, [categories]);

  if (isLoading) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-fem-navy mb-2">
              Explore Business Categories
            </h2>
            <p className="text-fem-darkgray max-w-2xl mx-auto text-sm">
              Discover trusted businesses within our faith community. From restaurants to tech services, find everything you need while supporting fellow believers.
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
        <div className="text-center mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-fem-navy mb-2">
            Explore Business Categories
          </h2>
          <p className="text-fem-darkgray max-w-2xl mx-auto text-sm">
            Discover trusted businesses within our faith community. From restaurants to tech services, find everything you need while supporting fellow believers.
          </p>
        </div>
        
        {categoryStats.length > 0 ? (
          <>
            {/* Animated horizontal scrolling carousel */}
            <div className="relative overflow-hidden mb-6">
              {/* Gradient overlays for fade effect */}
              <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
              <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>
              
              {/* Scrolling container */}
              <div className="flex gap-4 animate-scroll-categories hover:animate-paused">
                {/* Duplicate categories for seamless loop */}
                {[...categoryStats, ...categoryStats].map((category, index) => (
                  <motion.div
                    key={`${category.id}-${index}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (index % categoryStats.length) * 0.05 }}
                    whileHover={{ scale: 1.15, y: -8, zIndex: 20 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-shrink-0"
                  >
                    <Link 
                      to={`/directory?category=${category.slug}`}
                      className="block"
                    >
                      <div className="cursor-pointer transition-all duration-300 p-4 w-24 md:w-28 group relative">
                        <div className="flex flex-col items-center justify-center">
                          <span className="text-3xl md:text-4xl mb-2 group-hover:scale-125 group-hover:rotate-6 transition-all duration-300">{category.icon}</span>
                          <span className="text-xs font-semibold text-center leading-tight line-clamp-2 text-fem-navy group-hover:text-fem-terracotta transition-colors duration-300">{category.name}</span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
            
            <div className="text-center mt-6">
              <Link to="/directory">
                <motion.button 
                  className="bg-gradient-to-r from-fem-gold to-fem-terracotta hover:from-fem-gold/90 hover:to-fem-terracotta/90 text-white px-6 py-2 rounded-lg font-semibold text-sm transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  View All Categories
                </motion.button>
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