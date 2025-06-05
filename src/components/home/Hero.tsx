
import { Link } from "react-router-dom";
import { Search, ArrowRight, Sparkles } from "lucide-react";
import ThreeDModel from "@/components/3d/ThreeDModel";
import Interactive3DButton from "@/components/3d/Interactive3DButton";
import FloatingCard from "@/components/3d/FloatingCard";
import ParticleField from "@/components/3d/ParticleField";

export const Hero = () => {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-fem-navy via-fem-navy/98 to-fem-navy/90 text-white overflow-hidden">
      {/* Advanced 3D Background */}
      <div className="absolute inset-0 z-0">
        <ParticleField count={80} />
        
        {/* Floating geometric shapes */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-fem-terracotta/20 to-fem-gold/20 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-br from-fem-gold/20 to-fem-terracotta/20 rounded-full blur-3xl animate-float" />
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-fem-terracotta/10 rounded-full blur-2xl animate-float-fast" />
        
        {/* 3D Grid overlay */}
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255, 189, 89, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 189, 89, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
            transform: 'perspective(1000px) rotateX(30deg)',
            transformOrigin: 'center bottom'
          }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10 py-16 md:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-screen">
          {/* Left Content - Floating in 3D space */}
          <div className="max-w-2xl">
            {/* Floating badge */}
            <FloatingCard className="inline-block mb-8 px-4 py-2 rounded-full" glassEffect>
              <div className="flex items-center gap-2 text-sm">
                <Sparkles className="w-4 h-4 text-fem-gold" />
                <span className="text-gray-300">Connect • Grow • Serve</span>
              </div>
            </FloatingCard>

            {/* Main heading with 3D text effect */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight">
              <span 
                className="inline-block animate-fade-in"
                style={{
                  animationDelay: '0.1s',
                  textShadow: '0 4px 8px rgba(0,0,0,0.3), 0 8px 16px rgba(200,75,49,0.2)'
                }}
              >
                Find Your
              </span>
              <br />
              <span 
                className="gradient-text text-transparent bg-clip-text bg-gradient-to-r from-fem-terracotta via-fem-gold to-fem-terracotta animate-fade-in"
                style={{
                  animationDelay: '0.3s',
                  textShadow: '0 4px 8px rgba(0,0,0,0.3)'
                }}
              >
                Purpose
              </span>
              <br />
              <span 
                className="text-fem-gold animate-fade-in"
                style={{
                  animationDelay: '0.5s',
                  textShadow: '0 4px 8px rgba(0,0,0,0.3)'
                }}
              >
                Through Work
              </span>
            </h1>
            
            <FloatingCard className="mb-10" glassEffect intensity={0.5}>
              <p className="text-lg md:text-xl text-gray-300 p-6">
                Connecting FEM Family Church members in Kenya with opportunities 
                that align with their skills, values, and divine calling.
              </p>
            </FloatingCard>
            
            {/* 3D Action buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-start mb-12">
              <Link to="/jobs">
                <Interactive3DButton variant="primary" size="lg" className="w-full sm:w-auto px-8 py-4 text-lg">
                  <div className="flex items-center gap-2">
                    Explore Jobs
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </Interactive3DButton>
              </Link>
              <Link to="/post-job">
                <Interactive3DButton variant="glass" size="lg" className="w-full sm:w-auto px-8 py-4 text-lg">
                  Post Opportunity
                </Interactive3DButton>
              </Link>
            </div>
            
            {/* 3D Search bar */}
            <FloatingCard className="rounded-2xl" glassEffect>
              <div className="p-6 flex items-center gap-4">
                <div className="p-3 rounded-xl bg-fem-gold/20">
                  <Search className="text-fem-gold h-6 w-6" />
                </div>
                <input
                  type="text"
                  placeholder="Search for divine opportunities..."
                  className="flex-1 border-0 focus:ring-0 focus:outline-none bg-transparent text-white placeholder:text-gray-400 text-lg"
                />
                <Interactive3DButton variant="outline" className="px-6 py-3">
                  Search
                </Interactive3DButton>
              </div>
            </FloatingCard>
          </div>
          
          {/* Right Content - 3D Model with enhanced effects */}
          <div className="h-[600px] relative perspective-1000">
            <div className="absolute inset-0 transform-3d">
              <ThreeDModel 
                type="city" 
                className="w-full h-full opacity-90" 
                interactive={true} 
              />
              
              {/* Floating UI elements around 3D model */}
              <div className="absolute top-10 left-10 animate-float">
                <FloatingCard className="p-4" glassEffect>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-fem-gold">150+</div>
                    <div className="text-xs text-gray-300">Active Jobs</div>
                  </div>
                </FloatingCard>
              </div>
              
              <div className="absolute bottom-20 right-10 animate-float-slow">
                <FloatingCard className="p-4" glassEffect>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-fem-gold">500+</div>
                    <div className="text-xs text-gray-300">Members</div>
                  </div>
                </FloatingCard>
              </div>
            </div>
          </div>
        </div>
        
        {/* 3D Floating stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
          {[
            { 
              label: "Success Stories", 
              value: "75+", 
              icon: "✨",
              description: "Lives transformed through meaningful work"
            },
            { 
              label: "Church Partners", 
              value: "12+", 
              icon: "⛪",
              description: "Congregations actively participating"
            },
            { 
              label: "Skill Areas", 
              value: "25+", 
              icon: "🎯",
              description: "Professional categories available"
            }
          ].map((stat, index) => (
            <FloatingCard 
              key={index}
              className="rounded-2xl"
              glassEffect
              intensity={0.8}
            >
              <div 
                className="p-8 text-center animate-fade-in"
                style={{ animationDelay: `${1.2 + index * 0.2}s` }}
              >
                <div className="text-4xl mb-4">{stat.icon}</div>
                <div className="text-3xl font-bold text-fem-gold mb-2">{stat.value}</div>
                <div className="text-lg font-semibold text-white mb-2">{stat.label}</div>
                <div className="text-sm text-gray-400">{stat.description}</div>
              </div>
            </FloatingCard>
          ))}
        </div>
      </div>
    </div>
  );
};
