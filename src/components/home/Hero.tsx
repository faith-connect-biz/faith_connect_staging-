import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ChevronDown, MapPin, Heart, Star, FileText, ArrowRight, User, Building, Globe, Handshake } from "lucide-react";
import { 
  MdRestaurant, MdShoppingBag, MdLocalHospital, MdDirectionsCar, MdHotel,
  MdComputer, MdConstruction, MdLocalShipping, MdBusiness, MdSchool,
  MdAttachMoney, MdHome, MdPalette, MdMusicNote, MdPets, MdSportsBasketball,
  MdBuild, MdStore, MdRestaurantMenu, MdLocalPharmacy, MdAccountBalance,
  MdBrush, MdFitnessCenter, MdMovie, MdFlight, MdMoreHoriz
} from "react-icons/md";
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
        {/* Light overlay for better text contrast while keeping background visible */}
        <div className="absolute inset-0 bg-black/30" />
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
            {/* Faith Connect Text */}
            <div className="flex justify-center mb-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black bg-gradient-to-r from-fem-gold via-fem-terracotta to-fem-gold bg-clip-text text-transparent leading-tight">
                Faith Connect
              </h1>
            </div>
            <div className="text-white font-bold text-xl md:text-2xl lg:text-3xl xl:text-4xl drop-shadow-lg">
              Business Directory
            </div>
            <p className="text-sm md:text-base lg:text-lg text-gray-100 max-w-2xl mx-auto leading-relaxed px-2 md:px-4 drop-shadow-lg bg-black/20 backdrop-blur-sm rounded-lg py-2 md:py-3">
              Discover trusted businesses owned by fellow believers. Support local commerce while building meaningful relationships.
            </p>
          </div>

          {/* Search Bar */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-1 md:p-2 shadow-2xl max-w-2xl mx-auto relative mx-2 sm:mx-4 md:mx-auto z-10">
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
                    if (searchTerm.length >= 1) {
                      filterSuggestions(searchTerm);
                    }
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
                className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-2xl border border-gray-100 z-[9999] max-h-60 overflow-y-auto backdrop-blur-sm"
              >
                {suggestions.map((suggestion, index) => (
                  <button
                    key={suggestion}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className={`w-full px-3 py-2.5 text-left hover:bg-gray-50 transition-colors duration-150 first:rounded-t-lg last:rounded-b-lg border-b border-gray-100 last:border-b-0 ${
                      index === selectedSuggestionIndex ? 'bg-gray-50' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Search className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                      <span className="text-gray-700 text-sm font-medium">{suggestion}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center mt-8 px-4 relative z-0">
            <button
              onClick={() => navigate("/directory")}
              className="bg-gradient-to-r from-fem-gold to-fem-terracotta hover:from-fem-gold/90 hover:to-fem-terracotta/90 text-white px-6 md:px-8 py-3 md:py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 w-full sm:w-auto text-sm md:text-base"
            >
              Browse Directory
            </button>
            {(!isAuthenticated) ? (
              <Link 
                to="/" 
                state={{ showLogin: true, redirectAfterLogin: "/register-business" }}
                className="bg-white/10 hover:bg-white/20 text-white border border-white/30 hover:border-white/50 px-6 md:px-8 py-3 md:py-3 rounded-xl font-semibold transition-all duration-200 backdrop-blur-sm w-full sm:w-auto text-sm md:text-base text-center"
              >
                List Your Business
              </Link>
            ) : hasBusiness ? (
              <Link 
                to="/manage-business"
                className="bg-white/10 hover:bg-white/20 text-white border border-white/30 hover:border-white/50 px-6 md:px-8 py-3 md:py-3 rounded-xl font-semibold transition-all duration-200 backdrop-blur-sm w-full sm:w-auto text-sm md:text-base text-center"
              >
                Manage Your Business
              </Link>
            ) : (
              <Link 
                to="/register-business"
                className="bg-white/10 hover:bg-white/20 text-white border border-white/30 hover:border-white/50 px-6 md:px-8 py-3 md:py-3 rounded-xl font-semibold transition-all duration-200 backdrop-blur-sm w-full sm:w-auto text-sm md:text-base text-center"
              >
                List Your Business
              </Link>
            )}
          </div>

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
    </div>
  );
};