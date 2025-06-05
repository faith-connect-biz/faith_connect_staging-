
import { Link } from "react-router-dom";
import { Search, ArrowRight, Sparkles, Users, Briefcase, Target, Globe, Zap, Plus, Heart, Star } from "lucide-react";
import ThreeDModel from "@/components/3d/ThreeDModel";
import Interactive3DButton from "@/components/3d/Interactive3DButton";
import FloatingCard from "@/components/3d/FloatingCard";
import ParticleField from "@/components/3d/ParticleField";
import Typography3D from "@/components/3d/Typography3D";
import Infographic3D from "@/components/3d/Infographic3D";

export const Hero = () => {
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

      <div className="absolute inset-0">
        <ParticleField count={40} />
        
        {/* Elegant mesh gradient overlay with parallax */}
        <div className="absolute inset-0 opacity-20 parallax-bg" style={{ transform: 'translateY(0px)' }}>
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-fem-gold/10 via-transparent to-fem-terracotta/10 animate-parallax" />
          <div className="absolute top-1/3 right-0 w-96 h-96 bg-gradient-radial from-fem-gold/15 to-transparent rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-gradient-radial from-fem-terracotta/12 to-transparent rounded-full blur-3xl animate-float" />
        </div>
      </div>

      <div className="container-modern relative z-10">
        <div className="section-full flex flex-col justify-center section-padding">
          
          {/* Header Badge */}
          <div className="text-center mb-16 scroll-reveal animate-fade-in">
            <FloatingCard className="inline-block" glassEffect intensity={0.7}>
              <div className="px-8 py-4 rounded-full glass-modern">
                <div className="flex items-center gap-3">
                  <Heart className="w-5 h-5 text-fem-gold animate-pulse" />
                  <span className="text-white font-mont font-semibold text-lg tracking-wide">FEM Family Church • Career Connect</span>
                  <Sparkles className="w-5 h-5 text-fem-gold" />
                </div>
              </div>
            </FloatingCard>
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-12 gap-20 items-center mb-32">
            
            {/* Left Content - 8 columns */}
            <div className="lg:col-span-8 space-y-12">
              
              {/* Main Headline with Church-focused Typography */}
              <div className="space-y-8 scroll-reveal" style={{ animationDelay: '0.2s' }}>
                <div className="text-hero leading-none max-w-5xl font-mont">
                  <div className="space-y-4">
                    <div className="text-white/95 font-light tracking-tight">Welcome to</div>
                    <div className="font-black bg-gradient-to-r from-fem-gold via-fem-terracotta to-fem-gold bg-clip-text text-transparent bg-300% animate-gradient-shift">
                      FEM Family Church
                    </div>
                    <div className="text-white font-medium tracking-tight text-4xl">
                      Career Connect
                    </div>
                    <div className="text-white/80 font-light text-2xl mt-6">
                      A House of Prayer for all Nations
                    </div>
                  </div>
                </div>
              </div>

              {/* Subtitle with Better Typography */}
              <div className="scroll-reveal max-w-3xl" style={{ animationDelay: '0.4s' }}>
                <p className="text-body-large text-gray-200 font-mont font-light leading-relaxed">
                  Discover meaningful career opportunities that align with your faith and calling within our thriving Kenya community. Connect with employers who share your values and commitment to divine purpose.
                </p>
              </div>

              {/* Modern Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-6 scroll-reveal" style={{ animationDelay: '0.6s' }}>
                <Link to="/jobs" className="group">
                  <button className="btn-modern group-hover:scale-110 transition-transform duration-300 text-lg px-8 py-4">
                    <div className="flex items-center gap-3">
                      <Briefcase className="w-6 h-6" />
                      <span className="font-mont font-semibold tracking-wide">Explore Opportunities</span>
                      <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" />
                    </div>
                  </button>
                </Link>
                
                <Link to="/post-job" className="group">
                  <button className="btn-outline-modern group-hover:scale-110 transition-transform duration-300 text-lg px-8 py-4">
                    <div className="flex items-center gap-3">
                      <Plus className="w-6 h-6" />
                      <span className="font-mont font-semibold tracking-wide">Become a Partner</span>
                      <ArrowRight className="w-6 h-6 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                    </div>
                  </button>
                </Link>
              </div>

              {/* Enhanced Trust Indicators */}
              <div className="flex flex-wrap items-center gap-12 pt-12 scroll-reveal" style={{ animationDelay: '0.8s' }}>
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

            {/* Right Visual - 4 columns with Square Church Leader Photos */}
            <div className="lg:col-span-4 relative">
              <div className="grid grid-cols-2 gap-6 scroll-reveal" style={{ animationDelay: '0.3s' }}>
                
                {/* Square Image 1 */}
                <div className="relative aspect-square rounded-2xl overflow-hidden glass-modern hover-card-modern">
                  <img 
                    src="/lovable-uploads/b392f8fd-6fc5-4bfe-96aa-dc60f6854ba2.png" 
                    alt="Church leader speaking" 
                    className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent rounded-2xl" />
                </div>

                {/* Square Image 2 */}
                <div className="relative aspect-square rounded-2xl overflow-hidden glass-modern hover-card-modern">
                  <img 
                    src="/lovable-uploads/2461e975-f920-4db9-8bb8-0fa2afe7fe8f.png" 
                    alt="Church leader preaching" 
                    className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent rounded-2xl" />
                </div>

                {/* Square Image 3 */}
                <div className="relative aspect-square rounded-2xl overflow-hidden glass-modern hover-card-modern">
                  <img 
                    src="/lovable-uploads/1d5eb230-3a20-497c-9b7c-e5d21ac111dc.png" 
                    alt="Church leader at podium" 
                    className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent rounded-2xl" />
                </div>

                {/* Floating Stats Card */}
                <div className="relative aspect-square flex items-center justify-center">
                  <FloatingCard className="p-8 rounded-2xl glass-modern w-full h-full flex flex-col items-center justify-center" glassEffect>
                    <Heart className="w-12 h-12 text-fem-gold mx-auto mb-4 animate-pulse" />
                    <div className="text-3xl font-mont font-black text-white mb-2 tracking-tight">Faith</div>
                    <div className="text-lg font-mont font-semibold text-white mb-1 tracking-tight">Based</div>
                    <div className="text-sm text-gray-300 font-mont tracking-wide">Community</div>
                  </FloatingCard>
                </div>
              </div>
            </div>
          </div>

          {/* Modern Search Section */}
          <div className="max-w-6xl mx-auto scroll-reveal" style={{ animationDelay: '1s' }}>
            <FloatingCard className="rounded-3xl hover-card-modern" glassEffect intensity={0.9}>
              <div className="p-12 lg:p-16 glass-modern rounded-3xl">
                <div className="text-center mb-12">
                  <h2 className="text-section-title text-white mb-6 font-mont tracking-tight">
                    Find Your Divine Calling
                  </h2>
                  <p className="text-body-large text-gray-300 font-mont leading-relaxed">Discover opportunities that align with your faith and purpose</p>
                </div>
                
                <div className="flex flex-col lg:flex-row gap-8">
                  <div className="flex-1 relative group">
                    <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6 group-focus-within:text-fem-gold transition-colors" />
                    <input
                      type="text"
                      placeholder="Search by role, ministry, or divine calling..."
                      className="w-full pl-16 pr-6 py-6 bg-white/10 border border-white/20 rounded-2xl text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-fem-gold/50 focus:border-fem-gold/50 transition-all text-lg font-mont backdrop-blur-xl"
                    />
                  </div>
                  <button className="btn-modern">
                    <div className="flex items-center gap-3">
                      <span className="font-mont font-semibold tracking-wide">Search Opportunities</span>
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  </button>
                </div>
              </div>
            </FloatingCard>
          </div>
        </div>
      </div>
    </div>
  );
};
