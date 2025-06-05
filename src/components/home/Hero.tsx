
import { Link } from "react-router-dom";
import { Search, ArrowRight, Sparkles, Users, Briefcase, Target, Play, Globe, Zap } from "lucide-react";
import ThreeDModel from "@/components/3d/ThreeDModel";
import Interactive3DButton from "@/components/3d/Interactive3DButton";
import FloatingCard from "@/components/3d/FloatingCard";
import ParticleField from "@/components/3d/ParticleField";
import Typography3D from "@/components/3d/Typography3D";
import Infographic3D from "@/components/3d/Infographic3D";

export const Hero = () => {
  const statsData = [
    { label: "Jobs", value: 150, color: "#FFBD59", icon: <Briefcase className="w-4 h-4" /> },
    { label: "Members", value: 500, color: "#C84B31", icon: <Users className="w-4 h-4" /> },
    { label: "Success", value: 85, color: "#FFD68A", icon: <Target className="w-4 h-4" /> }
  ];

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-fem-navy via-fem-navy/95 to-fem-navy overflow-hidden">
      {/* Sophisticated Background */}
      <div className="absolute inset-0">
        <ParticleField count={80} />
        
        {/* Elegant floating orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-radial from-fem-gold/10 via-fem-gold/5 to-transparent rounded-full blur-3xl animate-float-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-radial from-fem-terracotta/15 via-fem-terracotta/8 to-transparent rounded-full blur-3xl animate-float" />
        
        {/* Subtle grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255, 189, 89, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 189, 89, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '80px 80px',
            transform: 'perspective(1000px) rotateX(60deg)',
            transformOrigin: 'center bottom'
          }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="min-h-screen flex flex-col justify-center">
          {/* Main Hero Content */}
          <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
            {/* Left: Content */}
            <div className="space-y-8">
              {/* Floating badge */}
              <FloatingCard className="inline-block" glassEffect intensity={0.6}>
                <div className="px-6 py-3 rounded-full">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 bg-fem-gold rounded-full animate-pulse" />
                    <span className="text-gray-300 font-medium">Connecting Faith & Purpose</span>
                    <Sparkles className="w-4 h-4 text-fem-gold" />
                  </div>
                </div>
              </FloatingCard>

              {/* Main headline */}
              <div className="space-y-4">
                <Typography3D variant="hero" className="leading-tight" animated>
                  <div className="space-y-2">
                    <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
                      Discover Your
                    </div>
                    <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
                      <span className="text-fem-gold">Divine Calling</span>
                    </div>
                    <div className="animate-fade-in text-4xl lg:text-5xl" style={{ animationDelay: '0.5s' }}>
                      Through Meaningful Work
                    </div>
                  </div>
                </Typography3D>
              </div>
              
              {/* Subtitle */}
              <div className="animate-fade-in" style={{ animationDelay: '0.7s' }}>
                <p className="text-xl text-gray-300 max-w-lg leading-relaxed">
                  Connect with opportunities that align with your skills, values, and calling within the FEM Family Church community in Kenya.
                </p>
              </div>
              
              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-4 animate-fade-in" style={{ animationDelay: '0.9s' }}>
                <Link to="/jobs">
                  <Interactive3DButton variant="primary" size="lg" className="px-8 py-4 text-lg group">
                    <div className="flex items-center gap-3">
                      <Briefcase className="w-5 h-5" />
                      Explore Opportunities
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Interactive3DButton>
                </Link>
                <Link to="/post-job">
                  <Interactive3DButton variant="glass" size="lg" className="px-8 py-4 text-lg group">
                    <div className="flex items-center gap-3">
                      <Plus className="w-5 h-5" />
                      Post a Job
                    </div>
                  </Interactive3DButton>
                </Link>
              </div>

              {/* Trust indicators */}
              <div className="flex items-center gap-8 pt-8 animate-fade-in" style={{ animationDelay: '1.1s' }}>
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-fem-gold to-fem-terracotta border-2 border-white" />
                    ))}
                  </div>
                  <span className="text-gray-300 text-sm">500+ Active Members</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-fem-gold" />
                  <span className="text-gray-300 text-sm">Kenya-wide Network</span>
                </div>
              </div>
            </div>
            
            {/* Right: 3D Visual */}
            <div className="relative h-[500px] lg:h-[600px]">
              <div className="absolute inset-0 animate-fade-in" style={{ animationDelay: '0.5s' }}>
                <ThreeDModel 
                  type="city" 
                  className="w-full h-full" 
                  interactive={true} 
                />
              </div>
              
              {/* Floating stats */}
              <div className="absolute top-16 -left-8 animate-float">
                <FloatingCard className="p-4" glassEffect>
                  <div className="text-center">
                    <Zap className="w-6 h-6 text-fem-gold mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">98%</div>
                    <div className="text-xs text-gray-300">Success Rate</div>
                  </div>
                </FloatingCard>
              </div>
              
              <div className="absolute bottom-20 -right-8 animate-float-slow">
                <FloatingCard className="p-4" glassEffect>
                  <div className="text-center">
                    <Target className="w-6 h-6 text-fem-gold mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">150+</div>
                    <div className="text-xs text-gray-300">Job Matches</div>
                  </div>
                </FloatingCard>
              </div>
            </div>
          </div>

          {/* Enhanced Search Section */}
          <div className="max-w-4xl mx-auto animate-fade-in" style={{ animationDelay: '1.3s' }}>
            <FloatingCard className="rounded-2xl" glassEffect intensity={0.8}>
              <div className="p-8">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-white mb-2">Find Your Perfect Match</h3>
                  <p className="text-gray-300">Search through divine opportunities tailored for you</p>
                </div>
                
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search by role, skills, or calling..."
                      className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-fem-gold/50"
                    />
                  </div>
                  <Interactive3DButton variant="primary" className="px-8 py-4">
                    <div className="flex items-center gap-2">
                      Search Jobs
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </Interactive3DButton>
                </div>
              </div>
            </FloatingCard>
          </div>

          {/* Stats Section */}
          <div className="mt-24 animate-fade-in" style={{ animationDelay: '1.5s' }}>
            <div className="text-center mb-12">
              <Typography3D variant="heading" className="mb-4">
                Platform Impact
              </Typography3D>
              <p className="text-gray-300 text-lg">Transforming lives through meaningful connections</p>
            </div>
            
            <Infographic3D 
              data={statsData}
              type="bar"
              className="max-w-3xl mx-auto"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
