
import { Link, useNavigate } from "react-router-dom";
import { Search, ArrowRight, Sparkles, Users, Briefcase, Target, Globe, Zap, Plus, Heart, Star } from "lucide-react";
import { useState } from "react";
import ImageCarousel from "@/components/ui/ImageCarousel";

export const Hero = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

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

  const carouselImages = [
    {
      src: "/lovable-uploads/541df702-f215-4b5f-bc60-d08161749258.png",
      alt: "Church leader speaking at podium"
    },
    {
      src: "/lovable-uploads/b392f8fd-6fc5-4bfe-96aa-dc60f6854ba2.png",
      alt: "Church leader speaking"
    },
    {
      src: "/lovable-uploads/2461e975-f920-4db9-8bb8-0fa2afe7fe8f.png",
      alt: "Church leader preaching"
    },
    {
      src: "/lovable-uploads/1d5eb230-3a20-497c-9b7c-e5d21ac111dc.png",
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
        <div className="section-full flex flex-col justify-center section-padding">
          
          {/* Header Badge */}
          <div className="text-center mb-16 scroll-reveal">
            <div className="inline-block">
              <div className="px-8 py-4 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
                <div className="flex items-center gap-3">
                  <Heart className="w-5 h-5 text-fem-gold" />
                  <span className="text-white font-mont font-semibold text-lg tracking-wide">FEM Family Church • Business Connect</span>
                  <Sparkles className="w-5 h-5 text-fem-gold" />
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-12 gap-20 items-center mb-32">
            
            {/* Left Content - 8 columns */}
            <div className="lg:col-span-8 space-y-12">
              
              {/* Main Headline with Church-focused Typography */}
              <div className="space-y-8 scroll-reveal">
                <div className="text-hero leading-none max-w-5xl font-mont">
                   <div className="space-y-4">
                     <div className="text-white/95 font-light tracking-tight">Welcome to</div>
                     <div className="font-black bg-gradient-to-r from-fem-gold via-fem-terracotta to-fem-gold bg-clip-text text-transparent">
                       Faith Connect
                     </div>
                     <div className="text-white font-medium tracking-tight text-4xl">
                       Business Directory
                     </div>
                     <div className="text-white/80 font-light text-2xl mt-6">
                       Connecting Faith-Based Commerce
                     </div>
                   </div>
                </div>

                {/* Subtitle with Better Typography */}
                <div className="max-w-3xl scroll-reveal">
                   <p className="text-body-large text-gray-200 font-mont font-light leading-relaxed">
                     Discover trusted businesses owned by fellow believers in our church community. Support local commerce while building meaningful relationships grounded in shared faith and values.
                   </p>
                </div>

                {/* Modern Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-6 scroll-reveal">
                  <Link to="/directory" className="group">
                    <button className="btn-modern group-hover:scale-110 transition-transform duration-300 text-lg px-8 py-4">
                      <div className="flex items-center gap-3">
                        <Briefcase className="w-6 h-6" />
                        <span className="font-mont font-semibold tracking-wide">Browse Directory</span>
                        <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" />
                      </div>
                    </button>
                  </Link>
                  
                  <Link to="/register-business" className="group">
                    <button className="btn-outline-modern group-hover:scale-110 transition-transform duration-300 text-lg px-8 py-4">
                      <div className="flex items-center gap-3">
                        <Plus className="w-6 h-6" />
                        <span className="font-mont font-semibold tracking-wide">List Your Business</span>
                        <ArrowRight className="w-6 h-6 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                      </div>
                    </button>
                  </Link>
                </div>

                {/* Enhanced Trust Indicators */}
                <div className="flex flex-wrap items-center gap-12 pt-12 scroll-reveal">
                  <div className="flex items-center gap-4">
                    <div className="flex -space-x-3">
                      {[1,2,3,4,5].map(i => (
                        <div 
                          key={i} 
                          className="w-12 h-12 rounded-full bg-gradient-to-br from-fem-gold to-fem-terracotta border-3 border-white shadow-xl hover:scale-110 transition-transform duration-300" 
                        />
                      ))}
                    </div>
                    <div>
                      <div className="text-white font-mont font-semibold text-lg tracking-wide">500+ Members</div>
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
          <div className="max-w-4xl mx-auto scroll-reveal">
            <div className="rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 p-8 lg:p-10">
              <div className="text-center mb-8">
                 <h2 className="text-2xl font-bold text-white mb-4 font-mont tracking-tight">
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
