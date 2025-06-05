
import { Link } from "react-router-dom";
import { Search, ArrowRight, Sparkles, Users, Briefcase, Target, Globe, Zap, Plus, Heart, Star } from "lucide-react";
import ThreeDModel from "@/components/3d/ThreeDModel";
import Interactive3DButton from "@/components/3d/Interactive3DButton";
import FloatingCard from "@/components/3d/FloatingCard";
import ParticleField from "@/components/3d/ParticleField";
import Typography3D from "@/components/3d/Typography3D";
import Infographic3D from "@/components/3d/Infographic3D";

export const Hero = () => {
  const statsData = [
    { label: "Active Jobs", value: 150, color: "#FFBD59", icon: <Briefcase className="w-5 h-5" /> },
    { label: "Members", value: 500, color: "#C84B31", icon: <Users className="w-5 h-5" /> },
    { label: "Success Rate", value: 98, color: "#FFD68A", icon: <Star className="w-5 h-5" /> }
  ];

  return (
    <div className="relative section-full bg-gradient-to-br from-fem-navy via-fem-navy/98 to-fem-navy/95 overflow-hidden">
      {/* Sophisticated Background with Parallax */}
      <div className="absolute inset-0">
        <ParticleField count={60} />
        
        {/* Elegant mesh gradient overlay with parallax */}
        <div className="absolute inset-0 opacity-30 parallax-bg" style={{ transform: 'translateY(0px)' }}>
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-fem-gold/5 via-transparent to-fem-terracotta/5 animate-parallax" />
          <div className="absolute top-1/3 right-0 w-96 h-96 bg-gradient-radial from-fem-gold/10 to-transparent rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-gradient-radial from-fem-terracotta/8 to-transparent rounded-full blur-3xl animate-float" />
        </div>
        
        {/* Geometric patterns */}
        <div className="absolute inset-0 opacity-[0.03]">
          <div className="absolute top-20 left-20 w-32 h-32 border border-fem-gold/20 rotate-45 animate-float-slow" />
          <div className="absolute bottom-40 right-32 w-24 h-24 border border-fem-terracotta/20 rotate-12 animate-float" />
          <div className="absolute top-1/2 left-1/3 w-16 h-16 border border-fem-gold/30 rotate-45 animate-float-fast" />
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
            
            {/* Left Content - 7 columns */}
            <div className="lg:col-span-7 space-y-12">
              
              {/* Main Headline with Modern Typography */}
              <div className="space-y-8 scroll-reveal" style={{ animationDelay: '0.2s' }}>
                <div className="text-hero leading-none max-w-4xl font-mont">
                  <div className="space-y-4">
                    <div className="text-white/90 font-light tracking-tight">Discover Your</div>
                    <div className="font-black bg-gradient-to-r from-fem-gold via-fem-terracotta to-fem-gold bg-clip-text text-transparent bg-300% animate-gradient-shift">
                      Divine Purpose
                    </div>
                    <div className="text-white font-medium tracking-tight">
                      Through Meaningful Work
                    </div>
                  </div>
                </div>
              </div>

              {/* Subtitle with Better Typography */}
              <div className="scroll-reveal max-w-2xl" style={{ animationDelay: '0.4s' }}>
                <p className="text-body-large text-gray-300 font-mont font-light leading-relaxed">
                  Connect with opportunities that align with your faith, values, and calling within our thriving Kenya community.
                </p>
              </div>

              {/* Modern Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-6 scroll-reveal" style={{ animationDelay: '0.6s' }}>
                <Link to="/jobs" className="group">
                  <button className="btn-modern group-hover:scale-110 transition-transform duration-300">
                    <div className="flex items-center gap-3">
                      <Briefcase className="w-6 h-6" />
                      <span className="font-mont font-semibold tracking-wide">Explore Opportunities</span>
                      <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" />
                    </div>
                  </button>
                </Link>
                
                <Link to="/post-job" className="group">
                  <button className="btn-outline-modern group-hover:scale-110 transition-transform duration-300">
                    <div className="flex items-center gap-3">
                      <Plus className="w-6 h-6" />
                      <span className="font-mont font-semibold tracking-wide">Post a Position</span>
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
                    <div className="text-gray-400 text-sm font-mont">Active Community</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <Globe className="w-10 h-10 text-fem-gold animate-float" />
                  <div>
                    <div className="text-white font-mont font-semibold text-lg tracking-wide">Kenya-wide</div>
                    <div className="text-gray-400 text-sm font-mont">Network Reach</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Visual - 5 columns */}
            <div className="lg:col-span-5 relative">
              <div className="relative h-[500px] lg:h-[650px] scroll-reveal hover-card-modern" style={{ animationDelay: '0.3s' }}>
                
                {/* Main 3D Model */}
                <div className="absolute inset-0 rounded-3xl overflow-hidden glass-modern">
                  <ThreeDModel 
                    type="city" 
                    className="w-full h-full transform hover:scale-105 transition-transform duration-700" 
                    interactive={true} 
                  />
                  
                  {/* Gradient overlay for depth */}
                  <div className="absolute inset-0 bg-gradient-to-t from-fem-navy/20 via-transparent to-transparent rounded-3xl" />
                </div>

                {/* Floating Stats Cards with Modern Design */}
                <div className="absolute -top-8 -left-8 animate-float">
                  <FloatingCard className="p-8 rounded-3xl glass-modern" glassEffect>
                    <div className="text-center">
                      <Zap className="w-10 h-10 text-fem-gold mx-auto mb-4" />
                      <div className="text-4xl font-mont font-black text-white mb-2 tracking-tight">98%</div>
                      <div className="text-sm text-gray-300 font-mont tracking-wide">Success Rate</div>
                    </div>
                  </FloatingCard>
                </div>

                <div className="absolute -bottom-8 -right-8 animate-float-slow">
                  <FloatingCard className="p-8 rounded-3xl glass-modern" glassEffect>
                    <div className="text-center">
                      <Target className="w-10 h-10 text-fem-gold mx-auto mb-4" />
                      <div className="text-4xl font-mont font-black text-white mb-2 tracking-tight">150+</div>
                      <div className="text-sm text-gray-300 font-mont tracking-wide">Active Jobs</div>
                    </div>
                  </FloatingCard>
                </div>

                <div className="absolute top-1/2 -left-6 animate-float-fast">
                  <FloatingCard className="p-6 rounded-2xl glass-modern" glassEffect>
                    <div className="flex items-center gap-3">
                      <Heart className="w-7 h-7 text-fem-gold" />
                      <div className="text-white text-base font-mont font-semibold tracking-wide">Faith-Based</div>
                    </div>
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
                    Find Your Perfect Divine Match
                  </h2>
                  <p className="text-body-large text-gray-300 font-mont leading-relaxed">Discover opportunities that align with your faith and calling</p>
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
                      <span className="font-mont font-semibold tracking-wide">Search Divine Opportunities</span>
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  </button>
                </div>
              </div>
            </FloatingCard>
          </div>

          {/* Modern Stats Section */}
          <div className="mt-40 scroll-reveal" style={{ animationDelay: '1.2s' }}>
            <div className="text-center mb-20">
              <h2 className="text-section-title text-white mb-8 font-mont tracking-tight">
                Community Impact & Growth
              </h2>
              <p className="text-body-large text-gray-300 max-w-4xl mx-auto leading-relaxed font-mont">
                Transforming lives through meaningful faith-based connections and divine purpose alignment
              </p>
            </div>
            
            <div className="max-w-5xl mx-auto">
              <Infographic3D 
                data={statsData}
                type="bar"
                className="rounded-3xl glass-modern hover-card-modern"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
