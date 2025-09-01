
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ArrowRight, Sparkles, Users, Briefcase, Target, Globe, Zap, Plus, Heart, Star, Building2, CheckCircle } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/api';
import ImageCarousel from "@/components/ui/ImageCarousel";

interface HeroProps {
  actionButtons?: React.ReactNode;
}

export const Hero: React.FC<HeroProps> = ({ actionButtons }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState<any>(null);
  const [businessLogos, setBusinessLogos] = useState<any[]>([]);
  const [hasBusiness, setHasBusiness] = useState(false);
  const [isCheckingBusiness, setIsCheckingBusiness] = useState(false);
  const { user, isAuthenticated, isBusiness, isCommunity } = useAuth();

  const handleSearch = () => {
    if (searchTerm.trim()) {
      navigate(`/directory?search=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      navigate("/directory");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

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
        console.log('Fetching stats from:', `${import.meta.env.VITE_API_BASE_URL}/business/stats/`);
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/business/stats/`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Stats API response:', data);
        
        if (data.success) {
          setStats(data.data);
          setBusinessLogos(data.data.business_logos || []);
          console.log('Business logos set:', data.data.business_logos);
        } else {
          console.warn('Stats API returned success: false');
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
        // Set fallback stats to prevent UI from breaking
        setStats({
          total_businesses: 1000,
          total_users: 500,
          average_rating: 4.8,
          counties_covered: 15
        });
      }
    };

    fetchStats();
  }, []);

  const carouselImages = [
    // {
    //   src: "/lovable-uploads/Landing3.png",
    //   alt: "Church leader speaking at podium"
    // },
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
    <div className="relative section-full bg-gradient-to-br from-fem-navy via-fem-navy/98 to-fem-navy/95 overflow-hidden">
      {/* Wheat Field Background - Main Background */}
      <div className="absolute inset-0">
        <img 
          src="/lovable-uploads/18b2a2c2-8517-4194-b3af-fce8bf8b92c6.png" 
          alt="Wheat field background" 
          className="w-full h-full object-cover"
        />
        {/* Light overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/30 to-black/50" />
      </div>

      <div className="container-modern relative z-10">
        <div className="section-full-auto flex flex-col justify-center py-16 lg:py-20">
          
          {/* Header Badge */}
          <div className="text-center mb-8 scroll-reveal">
            <div className="inline-block">
              <div className="px-8 py-4 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
                <div className="flex items-center gap-3">
                  <Heart className="w-5 h-5 text-fem-gold" />
                  <span className="text-white font-mont font-semibold text-lg tracking-wide">Faith Connect • Business Connect</span>
                  <Sparkles className="w-5 h-5 text-fem-gold" />
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-12 gap-16 items-center mb-16">
            
            {/* Left Content - 8 columns */}
            <div className="lg:col-span-8 space-y-8">
              
              {/* Main Headline with Church-focused Typography */}
              <div className="space-y-6 scroll-reveal">
                <div className="text-hero leading-none max-w-5xl font-mont">
                   <div className="space-y-4">
                     <div className="text-white/95 font-light tracking-tight">Welcome to</div>
                     <div className="font-black bg-gradient-to-r from-fem-gold via-fem-terracotta to-fem-gold bg-clip-text text-transparent">
                       Faith Connect
                     </div>
                     <div className="text-white font-medium tracking-tight text-4xl">
                       Business Directory
                     </div>
                     <div className="text-white/80 font-light text-2xl mt-4">
                       Connecting Faith-Based Commerce
                     </div>
                   </div>
                </div>

                {/* Subtitle with Better Typography */}
                <div className="max-w-3xl scroll-reveal">
                   <p className="text-body-large text-gray-200 font-mont font-light leading-relaxed">
                     Discover trusted businesses owned by fellow believers in our faith community. Support local commerce while building meaningful relationships grounded in shared faith and values.
                   </p>
                </div>

                {/* Modern Action Buttons */}
                <div className="scroll-reveal">
                  {actionButtons ? (
                    actionButtons
                  ) : (
                    <>
                      {!isAuthenticated ? (
                        <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start">
                          <Link to="/directory" className="group">
                            <button className="btn-modern group-hover:scale-110 transition-transform duration-300 text-lg px-8 py-4">
                              <div className="flex items-center gap-3">
                                <Search className="w-6 h-6" />
                                <span className="font-mont font-semibold tracking-wide">Browse Directory</span>
                                <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" />
                              </div>
                            </button>
                          </Link>
                          <Link to="/register-business" className="group">
                            <button className="btn-outline-modern group-hover:scale-110 transition-transform duration-300 text-lg px-8 py-4">
                              <div className="flex items-center gap-3">
                                <Building2 className="w-6 h-6" />
                                <span className="font-mont font-semibold tracking-wide">List Your Business</span>
                                <ArrowRight className="w-6 h-6 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                              </div>
                            </button>
                          </Link>
                        </div>
                      ) : (
                        <>
                          {isCommunity && (
                            <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start">
                              <Link to="/directory" className="group">
                                <button className="btn-modern group-hover:scale-110 transition-transform duration-300 text-lg px-8 py-4">
                                  <div className="flex items-center gap-3">
                                    <Search className="w-6 h-6" />
                                    <span className="font-mont font-semibold tracking-wide">Browse Directory</span>
                                    <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" />
                                  </div>
                                </button>
                              </Link>
                              <Link to="/profile" className="group">
                                <button className="btn-outline-modern group-hover:scale-110 transition-transform duration-300 text-lg px-8 py-4">
                                  <div className="flex items-center gap-3">
                                    <Users className="w-6 h-6" />
                                    <span className="font-mont font-semibold tracking-wide">View Profile</span>
                                    <ArrowRight className="w-6 h-6 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                                  </div>
                                </button>
                              </Link>
                            </div>
                          )}
                          
                          {isBusiness && (
                            <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start">
                              <Link to="/directory" className="group">
                                <button className="btn-modern group-hover:scale-110 transition-transform duration-300 text-lg px-8 py-4">
                                  <div className="flex items-center gap-3">
                                    <Search className="w-6 h-6" />
                                    <span className="font-mont font-semibold tracking-wide">Browse Directory</span>
                                    <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" />
                                  </div>
                                </button>
                              </Link>
                              
                              {hasBusiness ? (
                                <div className="group cursor-not-allowed">
                                  <button 
                                    disabled 
                                    className="btn-outline-modern opacity-50 cursor-not-allowed text-lg px-8 py-4"
                                  >
                                    <div className="flex items-center gap-3">
                                      <CheckCircle className="w-6 h-6" />
                                      <span className="font-mont font-semibold tracking-wide">Business Listed</span>
                                    </div>
                                  </button>
                                </div>
                              ) : (
                                <Link to="/register-business" className="group">
                                  <button className="btn-outline-modern group-hover:scale-110 transition-transform duration-300 text-lg px-8 py-4">
                                    <div className="flex items-center gap-3">
                                      <Plus className="w-6 h-6" />
                                      <span className="font-mont font-semibold tracking-wide">List Your Business</span>
                                      <ArrowRight className="w-6 h-6 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                                    </div>
                                  </button>
                                </Link>
                              )}
                            </div>
                          )}
                        </>
                      )}
                    </>
                  )}
                </div>

                {/* Enhanced Trust Indicators */}
                <div className="flex flex-wrap items-center gap-8 pt-8 scroll-reveal">
                  <div className="flex items-center gap-4">
                    <div className="flex -space-x-3">
                      {businessLogos && businessLogos.length > 0 ? (
                        businessLogos.slice(0, 5).map((business, i) => (
                          <div 
                            key={business.id || i} 
                            className="w-12 h-12 rounded-full border-3 border-white shadow-xl hover:scale-110 transition-transform duration-300 overflow-hidden"
                            title={business.name || `Business ${i + 1}`}
                          >
                            <img 
                              src={business.logo_url || business.business_image_url} 
                              alt={business.name || `Business ${i + 1}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                console.warn(`Failed to load business logo for ${business.name || i}:`, business.logo_url);
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.nextElementSibling?.classList.remove('hidden');
                              }}
                            />
                            {/* Fallback icon if image fails */}
                            <div className="hidden w-full h-full bg-gradient-to-br from-fem-gold to-fem-terracotta rounded-full flex items-center justify-center">
                              <Building2 className="w-6 h-6 text-white" />
                            </div>
                          </div>
                        ))
                      ) : (
                        [1,2,3,4,5].map(i => (
                          <div 
                            key={i} 
                            className="w-12 h-12 rounded-full bg-gradient-to-br from-fem-gold to-fem-terracotta border-3 border-white shadow-xl hover:scale-110 transition-transform duration-300 flex items-center justify-center" 
                            title="Loading business logos..."
                          >
                            <Building2 className="w-6 h-6 text-white" />
                          </div>
                        ))
                      )}
                    </div>
                    <div>
                      <div className="text-white font-mont font-semibold text-lg tracking-wide">
                        {stats ? `${stats.total_businesses}+ Local Businesses` : "1000+ Local Businesses"}
                      </div>
                      <div className="text-gray-300 text-sm font-mont">Active Community</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <Globe className="w-10 h-10 text-fem-gold animate-float" />
                    <div>
                      <div className="text-white font-mont font-semibold text-lg tracking-wide">Kenya-wide</div>
                      <div className="text-gray-300 text-sm font-mont">Network Reach</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Visual - 4 columns with Interactive Image Carousel */}
            <div className="lg:col-span-4 relative">
              <div className="relative scroll-reveal">
                <ImageCarousel images={carouselImages} />
              </div>
            </div>
          </div>

          {/* Modern Search Section */}
          <div className="max-w-4xl mx-auto scroll-reveal mt-8">
            <div className="rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 p-6 lg:p-8">
              <div className="text-center mb-6">
                 <h2 className="text-2xl font-bold text-white mb-3 font-mont tracking-tight">
                   Find Trusted Businesses
                 </h2>
                 <p className="text-gray-300 font-mont leading-relaxed">Connect with faith-based businesses in your community</p>
              </div>
              
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1 relative group">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-fem-gold transition-colors" />
                   <input
                     type="text"
                     placeholder="Search businesses, services, or categories..."
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                     onKeyPress={handleKeyPress}
                     className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-fem-gold/50 focus:border-fem-gold/50 transition-all font-mont backdrop-blur-xl"
                   />
                </div>
                <button 
                  className="btn-modern px-6 py-4"
                  onClick={handleSearch}
                >
                   <div className="flex items-center gap-2">
                     <span className="font-mont font-semibold tracking-wide">Search Directory</span>
                     <ArrowRight className="w-4 h-4" />
                   </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
