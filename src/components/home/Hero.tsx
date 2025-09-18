import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Car, Utensils, ShoppingBag, Heart, Hotel, Building2, Users, Briefcase, Sprout, Factory, DollarSign, Truck, GraduationCap, Monitor, Palette, Wrench, Music, PawPrint, ChevronDown, MapPin } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { useBusiness } from '@/contexts/BusinessContext';
import { apiService } from '@/services/api';
import ImageCarousel from "@/components/ui/ImageCarousel";

interface HeroProps {
  actionButtons?: React.ReactNode;
}

interface PlatformStats {
  total_businesses: number;
  total_users: number;
  average_rating: number;
  counties_covered: number;
  business_logos?: Array<{
    name: string;
    logo_url: string;
    id: string;
  }>;
}

interface BusinessLogo {
  name: string;
  logo_url: string;
  id: string;
}

export const Hero: React.FC<HeroProps> = ({ actionButtons }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [location, setLocation] = useState("");
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [businessLogos, setBusinessLogos] = useState<BusinessLogo[]>([]);
  const [hasBusiness, setHasBusiness] = useState(false);
  const [isCheckingBusiness, setIsCheckingBusiness] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const { user, isAuthenticated, isBusiness, isCommunity } = useAuth();
  const { categories, businesses, isLoading, isLoadingBusinesses } = useBusiness();

  // Search suggestions data
  const searchSuggestions = [
    "restaurant", "food", "cafe", "barber", "salon", "spa", "hotel", "hotel accommodation",
    "car repair", "automotive", "mechanic", "gas station", "home services", "plumber", "electrician",
    "cleaning services", "laundry", "dry cleaning", "pharmacy", "medical", "clinic", "hospital",
    "bank", "insurance", "real estate", "lawyer", "accountant", "consulting", "education",
    "school", "training", "fitness", "gym", "beauty", "fashion", "clothing", "shoes",
    "electronics", "phone repair", "computer", "internet", "shopping", "supermarket", "grocery",
    "bakery", "butcher", "florist", "gift shop", "bookstore", "furniture", "home decor",
    "hardware", "garden", "pest control", "security", "transport", "delivery", "courier",
    "photography", "wedding", "event planning", "catering", "party supplies", "music",
    "entertainment", "travel", "tour guide", "taxi", "bus", "rental", "storage",
    "sms", "messaging", "communication", "mobile services", "text messaging", "bulk sms",
    "marketing", "advertising", "digital marketing", "social media", "web design"
  ];

  // Filter suggestions based on search term
  const filterSuggestions = (term: string) => {
    if (!term || term.length < 1) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    
    const filtered = searchSuggestions
      .filter(suggestion => 
        suggestion.toLowerCase().includes(term.toLowerCase())
      )
      .slice(0, 6); // Show max 6 suggestions
    
    console.log('Filtered suggestions for:', term, filtered); // Debug log
    
    setSuggestions(filtered);
    setShowSuggestions(filtered.length > 0);
    setSelectedSuggestionIndex(-1);
  };

  // Handle input change with debounced suggestions
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      filterSuggestions(searchTerm);
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleSearch = () => {
    if (searchTerm.trim()) {
      navigate(`/directory?search=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      navigate("/directory");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (selectedSuggestionIndex >= 0 && suggestions[selectedSuggestionIndex]) {
        // Use selected suggestion
        const selectedSuggestion = suggestions[selectedSuggestionIndex];
        setSearchTerm(selectedSuggestion);
        setShowSuggestions(false);
        navigate(`/directory?search=${encodeURIComponent(selectedSuggestion)}`);
      } else {
        handleSearch();
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedSuggestionIndex(prev => 
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setSelectedSuggestionIndex(-1);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchTerm(suggestion);
    setShowSuggestions(false);
    navigate(`/directory?search=${encodeURIComponent(suggestion)}`);
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node) &&
          searchInputRef.current && !searchInputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Check if user already has a business
  useEffect(() => {
    const checkExistingBusiness = async () => {
      if (isAuthenticated && isBusiness) {
        setIsCheckingBusiness(true);
        try {
          const existingBusiness = await apiService.getUserBusiness();
          setHasBusiness(!!existingBusiness);
        } catch (error) {
          console.error('Error checking existing business:', error);
          setHasBusiness(false);
        } finally {
          setIsCheckingBusiness(false);
        }
      }
    };

    checkExistingBusiness();
  }, [isAuthenticated, isBusiness]);

  // Fetch platform stats and business logos
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/business/stats/`;
        console.log('Fetching stats from:', apiUrl);
        
        const response = await fetch(apiUrl, {
          headers: {
            'Content-Type': 'application/json',
          },
          signal: AbortSignal.timeout(10000)
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Stats API response:', data);
        
        if (data.success) {
          setStats(data.data);
          setBusinessLogos(data.data.business_logos || []);
        } else {
          console.warn('Stats API returned success: false');
          throw new Error('API returned success: false');
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
        const fallbackStats = {
          total_businesses: 1000,
          total_users: 500,
          average_rating: 4.8,
          counties_covered: 15,
          business_logos: []
        };
        setStats(fallbackStats);
        setBusinessLogos([]);
      }
    };

    fetchStats();
  }, []);

  // Icon mapping for categories
  const categoryIcons: { [key: string]: any } = {
    "Agriculture & Farming 🌱": Sprout,
    "Manufacturing & Production 🏭": Factory,
    "Retail & Wholesale 🛒": ShoppingBag,
    "Hospitality & Tourism 🏨": Hotel,
    "Technology & IT 💻": Monitor,
    "Finance & Insurance 💰": DollarSign,
    "Healthcare & Wellness 🏥": Heart,
    "Real Estate & Construction 🏗️": Building2,
    "Transportation & Logistics 🚚": Truck,
    "Professional Services 📁": Briefcase,
    "Education & Training 📚": GraduationCap,
    "Energy & Utilities ⚡": Wrench,
    "Creative Industries 🎨": Palette,
    "Food & Beverage 🍽️": Utensils,
    "Beauty & Personal Care 💄": Heart,
    "Automotive Services 🚗": Car,
    "Home & Garden 🏡": Building2,
    "Entertainment & Media 🎭": Music,
    "Non-Profit & Community 🤝": Users,
    "Pet Services & Veterinary 🐾": PawPrint,
    "Sports & Recreation 🏃": Heart,
    "Mining & Natural Resources ⛏️": Wrench,
    "Textiles & Fashion 👗": ShoppingBag,
    "Government & Public Services 🏛️": Building2,
    "Import & Export Trade 🚢": Truck,
    // Legacy mappings
    "Restaurant": Utensils,
    "Retail": ShoppingBag,
    "Services": Briefcase,
    "Health & Wellness": Heart,
    "Automotive": Car,
    "Real Estate": Building2,
    "Education": GraduationCap,
    "Technology": Monitor,
    "Beauty & Personal Care": Heart,
    "Home & Garden": Building2,
    "Professional Services": Briefcase,
    "Automotive Services": Car,
    "Food & Dining": Utensils,
    "Health & Beauty": Heart,
    "Fashion & Clothing": ShoppingBag,
    "Sports & Fitness": Heart,
    "Entertainment": Music
  };

  // Get top 5 categories with most businesses
  const getTop5Categories = () => {
    if (isLoading || isLoadingBusinesses || !Array.isArray(categories) || !Array.isArray(businesses)) {
      return [
        { id: 1, name: "Food & Beverage", displayName: "Restaurant", icon: Utensils, color: "bg-orange-100 text-orange-600", slug: "food-beverage" },
        { id: 2, name: "Retail & Wholesale", displayName: "Shopping", icon: ShoppingBag, color: "bg-blue-100 text-blue-600", slug: "retail-wholesale" },
        { id: 3, name: "Automotive Services", displayName: "Automotive", icon: Car, color: "bg-amber-100 text-amber-600", slug: "automotive-services" },
        { id: 4, name: "Beauty & Personal Care", displayName: "Beauty & Spa", icon: Heart, color: "bg-pink-100 text-pink-600", slug: "beauty-personal-care" },
        { id: 5, name: "Hospitality & Tourism", displayName: "Hotels", icon: Hotel, color: "bg-purple-100 text-purple-600", slug: "hospitality-tourism" }
      ];
    }

    const categoryStats = categories.map(category => {
      const matchingBusinesses = businesses.filter(business => {
        if (!business.category) return false;
        const categoryId = category.id;
        let businessCategoryId: any;
        if (typeof business.category === 'object' && business.category && 'id' in business.category) {
          businessCategoryId = (business.category as any).id;
        } else {
          businessCategoryId = business.category;
        }
        return categoryId == businessCategoryId;
      });
      
      const businessCount = matchingBusinesses.length;
      const IconComponent = categoryIcons[category.name] || Building2;
      
      // Create a shorter display name by removing emojis and keeping the main part
      const displayName = category.name.replace(/[🌱🏭🛒🏨💻💰🏥🏗️🚚📁📚⚡🎨🍽️💄🚗🏡🎭🤝🐾🏃⛏️👗🏛️🚢]/g, '').trim();
      
      return {
        id: category.id,
        name: category.name,
        displayName,
        slug: category.slug,
        count: businessCount,
        icon: IconComponent,
        color: getCategoryColor(category.name)
      };
    });

    return categoryStats
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };

  const getCategoryColor = (categoryName: string): string => {
    const colorMap: { [key: string]: string } = {
      "Agriculture & Farming 🌱": "bg-green-100 text-green-600",
      "Manufacturing & Production 🏭": "bg-gray-100 text-gray-600",
      "Retail & Wholesale 🛒": "bg-blue-100 text-blue-600",
      "Hospitality & Tourism 🏨": "bg-orange-100 text-orange-600",
      "Technology & IT 💻": "bg-indigo-100 text-indigo-600",
      "Finance & Insurance 💰": "bg-purple-100 text-purple-600",
      "Healthcare & Wellness 🏥": "bg-red-100 text-red-600",
      "Real Estate & Construction 🏗️": "bg-yellow-100 text-yellow-600",
      "Transportation & Logistics 🚚": "bg-teal-100 text-teal-600",
      "Professional Services 📁": "bg-slate-100 text-slate-600",
      "Education & Training 📚": "bg-emerald-100 text-emerald-600",
      "Energy & Utilities ⚡": "bg-cyan-100 text-cyan-600",
      "Creative Industries 🎨": "bg-pink-100 text-pink-600",
      "Food & Beverage 🍽️": "bg-orange-100 text-orange-600",
      "Beauty & Personal Care 💄": "bg-pink-100 text-pink-600",
      "Automotive Services 🚗": "bg-amber-100 text-amber-600",
      "Home & Garden 🏡": "bg-emerald-100 text-emerald-600",
      "Entertainment & Media 🎭": "bg-blue-100 text-blue-600",
      "Non-Profit & Community 🤝": "bg-purple-100 text-purple-600",
      "Pet Services & Veterinary 🐾": "bg-green-100 text-green-600",
      "Sports & Recreation 🏃": "bg-green-100 text-green-600",
      "Mining & Natural Resources ⛏️": "bg-gray-100 text-gray-600",
      "Textiles & Fashion 👗": "bg-pink-100 text-pink-600",
      "Government & Public Services 🏛️": "bg-slate-100 text-slate-600",
      "Import & Export Trade 🚢": "bg-blue-100 text-blue-600",
      // Legacy mappings
      "Restaurant": "bg-orange-100 text-orange-600",
      "Retail": "bg-blue-100 text-blue-600",
      "Services": "bg-green-100 text-green-600",
      "Health & Wellness": "bg-red-100 text-red-600",
      "Automotive": "bg-purple-100 text-purple-600",
      "Real Estate": "bg-yellow-100 text-yellow-600",
      "Education": "bg-indigo-100 text-indigo-600",
      "Technology": "bg-teal-100 text-teal-600",
      "Beauty & Personal Care": "bg-pink-100 text-pink-600",
      "Home & Garden": "bg-emerald-100 text-emerald-600",
      "Professional Services": "bg-slate-100 text-slate-600",
      "Automotive Services": "bg-amber-100 text-amber-600",
      "Food & Dining": "bg-orange-100 text-orange-600",
      "Health & Beauty": "bg-pink-100 text-pink-600",
      "Fashion & Clothing": "bg-purple-100 text-purple-600",
      "Sports & Fitness": "bg-green-100 text-green-600",
      "Entertainment": "bg-blue-100 text-blue-600"
    };
    return colorMap[categoryName] || "bg-gray-100 text-gray-600";
  };

  // Sliding background images
  const carouselImages = [
    {
      src: "/lovable-uploads/Landing3.png",
      alt: "Church leader speaking"
    },
    {
      src: "/lovable-uploads/Landing2.png",
      alt: "Church leader preaching"
    },
    {
      src: "/lovable-uploads/Landing1.png",
      alt: "Church leader at podium"
    }
  ];

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Sliding Background Images - Full Screen */}
      <div className="absolute inset-0 w-full h-full">
        <ImageCarousel 
          images={carouselImages} 
          className="w-full h-full object-cover"
          fullScreen={true}
        />
        {/* Dark overlay for better text contrast */}
        <div className="absolute inset-0 bg-black/70" />
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-16">
        
        {/* Central Content Area */}
        <div className="max-w-4xl mx-auto text-center space-y-6 md:space-y-8 px-2 sm:px-4">
          
          {/* Main Headline */}
          <div className="space-y-3 md:space-y-4 lg:space-y-6 px-4">
            <div className="text-white font-medium text-xl md:text-2xl lg:text-3xl xl:text-4xl drop-shadow-lg">
              Welcome to
            </div>
            <h1 className="font-black bg-gradient-to-r from-fem-gold via-fem-terracotta to-fem-gold bg-clip-text text-transparent text-3xl md:text-4xl lg:text-5xl xl:text-6xl leading-tight drop-shadow-lg">
              Faith Connect
            </h1>
            <div className="text-white font-bold text-xl md:text-2xl lg:text-3xl xl:text-4xl drop-shadow-lg">
              Business Directory
            </div>
            <p className="text-sm md:text-base lg:text-lg text-gray-100 max-w-2xl mx-auto leading-relaxed px-2 md:px-4 drop-shadow-lg bg-black/20 backdrop-blur-sm rounded-lg py-2 md:py-3">
              Discover trusted businesses owned by fellow believers. Support local commerce while building meaningful relationships.
            </p>
          </div>

          {/* Search Bar */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-1 md:p-2 shadow-2xl max-w-2xl mx-auto relative mx-2 sm:mx-4 md:mx-auto">
            <div className="flex gap-1 md:gap-2">
              {/* What Field */}
              <div className="flex-1 relative">
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Ex: food, service, barber, hotel"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={handleKeyPress}
                  onFocus={() => {
                    if (suggestions.length > 0) setShowSuggestions(true);
                  }}
                  className="w-full px-3 md:px-4 py-3 md:py-4 bg-transparent border-none outline-none text-gray-800 placeholder:text-gray-500 text-base md:text-lg"
                />
                <div className="absolute right-2 md:right-3 top-1/2 transform -translate-y-1/2">
                  <ChevronDown className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                </div>
              </div>
              
              {/* Search Button */}
              <button 
                onClick={handleSearch}
                className="bg-gradient-to-r from-fem-gold to-fem-terracotta hover:from-fem-gold/90 hover:to-fem-terracotta/90 text-white px-4 md:px-6 lg:px-8 py-3 md:py-4 rounded-xl font-semibold transition-all duration-200 flex items-center gap-1 md:gap-2 shadow-lg hover:shadow-xl"
              >
                <Search className="w-4 h-4 md:w-5 md:h-5" />
                <span className="hidden sm:inline">Search</span>
              </button>
            </div>

            {/* Search Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div 
                ref={suggestionsRef}
                className="absolute top-full left-2 right-2 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 z-50 max-h-60 overflow-y-auto"
              >
                {suggestions.map((suggestion, index) => (
                  <button
                    key={suggestion}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-150 first:rounded-t-xl last:rounded-b-xl ${
                      index === selectedSuggestionIndex ? 'bg-gray-100' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="text-gray-800 font-medium">{suggestion}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center mt-6 px-4">
            <button
              onClick={() => navigate("/directory")}
              className="bg-gradient-to-r from-fem-gold to-fem-terracotta hover:from-fem-gold/90 hover:to-fem-terracotta/90 text-white px-6 md:px-8 py-3 md:py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 w-full sm:w-auto text-sm md:text-base"
            >
              Browse Directory
            </button>
            <button
              onClick={() => navigate("/business/register")}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/30 hover:border-white/50 px-6 md:px-8 py-3 md:py-3 rounded-xl font-semibold transition-all duration-200 backdrop-blur-sm w-full sm:w-auto text-sm md:text-base"
            >
              List Your Business
            </button>
          </div>

          {/* Top 5 Category Buttons */}
          <div className="flex flex-wrap justify-center gap-1 md:gap-2 lg:gap-3 mt-6 md:mt-8 px-2">
            {getTop5Categories().map((category, index) => {
              const IconComponent = category.icon;
              return (
                <button
                  key={category.id}
                  className={`flex flex-col items-center gap-1 p-2 rounded-lg ${category.color} hover:scale-105 transition-transform duration-200 w-[60px] sm:w-[70px] md:w-[80px] lg:w-[90px] flex-shrink-0`}
                  onClick={() => navigate(`/directory?category=${category.slug}`)}
                >
                  <IconComponent className="w-3 h-3 sm:w-4 sm:h-4 md:w-4 md:h-4" />
                  <span className="text-[10px] sm:text-xs font-medium text-center leading-tight hidden xs:block">{category.displayName.split(' ')[0]}</span>
                  <span className="text-[9px] font-medium text-center leading-tight xs:hidden">{category.displayName.split(' ')[0].substring(0, 3)}</span>
                </button>
              );
            })}
          </div>

          {/* Stats Row */}
          <div className="mt-6 md:mt-8 flex flex-wrap items-center justify-center gap-x-1 sm:gap-x-2 md:gap-x-4 gap-y-1 text-white font-semibold text-[10px] sm:text-xs md:text-sm lg:text-base drop-shadow-lg bg-black/20 backdrop-blur-sm rounded-lg px-2 sm:px-3 md:px-6 py-2 md:py-3 mx-2 sm:mx-4 md:mx-0">
            <span className="whitespace-nowrap">69+ Local Businesses</span>
            <span className="text-gray-300 hidden sm:inline">•</span>
            <span className="whitespace-nowrap">Active Community</span>
            <span className="text-gray-300 hidden sm:inline">•</span>
            <span className="whitespace-nowrap">Kenya-wide</span>
            <span className="text-gray-300 hidden sm:inline">•</span>
            <span className="whitespace-nowrap">Network Reach</span>
          </div>
        </div>

        {/* Footer Attribution */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
          <div className="flex items-center gap-2 text-white/60 text-sm">
            <span>Image Courtesy Of Seattle Opera</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};