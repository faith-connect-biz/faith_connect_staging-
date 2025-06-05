
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
      {/* Wheat Field Background */}
      <div className="absolute inset-0">
        <img 
          src="https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2000&q=80" 
          alt="Wheat field background" 
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-fem-navy/80 via-fem-navy/60 to-fem-navy/80" />
      </div>

      {/* Church leader images as background overlays */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full opacity-15">
          <img 
            src="/lovable-uploads/96b9a54c-1f33-4912-8a15-81ef6ee611b1.png" 
            alt="Church leader" 
            className="absolute top-10 left-10 w-64 h-80 object-cover rounded-2xl shadow-2xl animate-float-slow parallax-bg"
          />
          <img 
            src="/lovable-uploads/e9d4667b-2b87-49d2-8663-753539468e34.png" 
            alt="Church leader" 
            className="absolute top-32 right-20 w-56 h-72 object-cover rounded-2xl shadow-2xl animate-float parallax-bg"
          />
          <img 
            src="/lovable-uploads/06b622e4-037d-4adb-95e9-2f4e2c861815.png" 
            alt="Church leader" 
            className="absolute bottom-20 left-1/3 w-60 h-76 object-cover rounded-2xl shadow-2xl animate-float-fast parallax-bg"
          />
        </div>
        
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

            {/* Right Visual - 4 columns */}
            <div className="lg:col-span-4 relative">
              <div className="relative h-[400px] lg:h-[500px] scroll-reveal hover-card-modern" style={{ animationDelay: '0.3s' }}>
                
                {/* Featured Image Card - Similar to reference */}
                <div className="absolute inset-0 rounded-3xl overflow-hidden glass-modern">
                  <img 
                    src="/lovable-uploads/4a1c83b8-3c22-4e2f-bb68-4a2d39bbb994.png" 
                    alt="Church service" 
                    className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
                  />
                  
                  {/* Gradient overlay for depth */}
                  <div className="absolute inset-0 bg-gradient-to-t from-fem-navy/30 via-transparent to-transparent rounded-3xl" />
                </div>

                {/* Floating Stats Cards with Modern Design */}
                <div className="absolute -top-6 -left-6 animate-float">
                  <FloatingCard className="p-6 rounded-2xl glass-modern" glassEffect>
                    <div className="text-center">
                      <Heart className="w-8 h-8 text-fem-gold mx-auto mb-3" />
                      <div className="text-2xl font-mont font-black text-white mb-1 tracking-tight">Faith</div>
                      <div className="text-xs text-gray-300 font-mont tracking-wide">Based</div>
                    </div>
                  </FloatingCard>
                </div>

                <div className="absolute -bottom-6 -right-6 animate-float-slow">
                  <FloatingCard className="p-6 rounded-2xl glass-modern" glassEffect>
                    <div className="text-center">
                      <Target className="w-8 h-8 text-fem-gold mx-auto mb-3" />
                      <div className="text-2xl font-mont font-black text-white mb-1 tracking-tight">150+</div>
                      <div className="text-xs text-gray-300 font-mont tracking-wide">Active Jobs</div>
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
