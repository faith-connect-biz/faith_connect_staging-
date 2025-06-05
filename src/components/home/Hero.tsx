
import { Link } from "react-router-dom";
import { Search, ArrowRight, Sparkles, Users, Briefcase, Target } from "lucide-react";
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
    { label: "Success", value: 75, color: "#FFD68A", icon: <Target className="w-4 h-4" /> }
  ];

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-fem-navy via-fem-navy/98 to-fem-navy/90 text-white overflow-hidden">
      {/* Enhanced 3D Background */}
      <div className="absolute inset-0 z-0">
        <ParticleField count={120} />
        
        {/* Dynamic floating geometric shapes */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-fem-terracotta/20 to-fem-gold/20 rounded-full blur-3xl animate-float-slow transform-3d" 
             style={{ transform: 'perspective(1000px) rotateX(45deg)' }} />
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-br from-fem-gold/20 to-fem-terracotta/20 rounded-full blur-3xl animate-float transform-3d" 
             style={{ transform: 'perspective(1000px) rotateY(45deg)' }} />
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-fem-terracotta/10 rounded-full blur-2xl animate-float-fast transform-3d" 
             style={{ transform: 'perspective(1000px) rotateZ(45deg)' }} />
        
        {/* Enhanced 3D Grid overlay */}
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255, 189, 89, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 189, 89, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
            transform: 'perspective(1500px) rotateX(45deg) rotateY(5deg)',
            transformOrigin: 'center bottom'
          }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10 py-16 md:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-screen">
          {/* Left Content - Enhanced 3D Typography */}
          <div className="max-w-2xl">
            {/* 3D Floating badge */}
            <FloatingCard className="inline-block mb-8 px-4 py-2 rounded-full" glassEffect intensity={0.8}>
              <div className="flex items-center gap-2 text-sm">
                <Sparkles className="w-4 h-4 text-fem-gold animate-pulse" />
                <span className="text-gray-300">Connect • Grow • Serve</span>
              </div>
            </FloatingCard>

            {/* Enhanced 3D Typography */}
            <Typography3D variant="hero" className="mb-8 leading-tight" animated>
              <span className="block animate-fade-in" style={{ animationDelay: '0.1s' }}>
                Find Your
              </span>
              <span className="block animate-fade-in" style={{ animationDelay: '0.3s' }}>
                Purpose
              </span>
              <span className="block text-fem-gold animate-fade-in" style={{ animationDelay: '0.5s' }}>
                Through Work
              </span>
            </Typography3D>
            
            <FloatingCard className="mb-10" glassEffect intensity={0.5}>
              <p className="text-lg md:text-xl text-gray-300 p-6">
                Connecting FEM Family Church members in Kenya with opportunities 
                that align with their skills, values, and divine calling.
              </p>
            </FloatingCard>
            
            {/* Enhanced 3D Action buttons */}
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
            
            {/* Enhanced 3D Search bar */}
            <FloatingCard className="rounded-2xl" glassEffect intensity={0.7}>
              <div className="p-6 flex items-center gap-4">
                <div className="p-3 rounded-xl bg-fem-gold/20 transform-3d" 
                     style={{ transform: 'perspective(1000px) rotateY(15deg)' }}>
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
          
          {/* Right Content - Enhanced 3D Model */}
          <div className="h-[600px] relative perspective-1000">
            <div className="absolute inset-0 transform-3d">
              <ThreeDModel 
                type="city" 
                className="w-full h-full opacity-90" 
                interactive={true} 
              />
              
              {/* Enhanced floating UI elements */}
              <div className="absolute top-10 left-10 animate-float">
                <FloatingCard className="p-4" glassEffect intensity={1.2}>
                  <div className="text-center transform-3d" style={{ transform: 'perspective(1000px) rotateY(10deg)' }}>
                    <div className="text-2xl font-bold text-fem-gold">150+</div>
                    <div className="text-xs text-gray-300">Active Jobs</div>
                  </div>
                </FloatingCard>
              </div>
              
              <div className="absolute bottom-20 right-10 animate-float-slow">
                <FloatingCard className="p-4" glassEffect intensity={1.2}>
                  <div className="text-center transform-3d" style={{ transform: 'perspective(1000px) rotateY(-10deg)' }}>
                    <div className="text-2xl font-bold text-fem-gold">500+</div>
                    <div className="text-xs text-gray-300">Members</div>
                  </div>
                </FloatingCard>
              </div>
            </div>
          </div>
        </div>
        
        {/* Enhanced 3D Statistics Section */}
        <div className="mt-20">
          <Typography3D variant="heading" className="text-center mb-12">
            Platform Statistics
          </Typography3D>
          
          <Infographic3D 
            data={statsData}
            type="bar"
            className="max-w-4xl mx-auto"
          />
        </div>
        
        {/* Enhanced 3D Floating stats cards */}
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
              intensity={1.0}
            >
              <div 
                className="p-8 text-center animate-fade-in transform-3d"
                style={{ 
                  animationDelay: `${1.2 + index * 0.2}s`,
                  transform: 'perspective(1000px) rotateX(5deg)'
                }}
              >
                <div className="text-4xl mb-4 transform-3d" 
                     style={{ transform: 'translateZ(20px)' }}>
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-fem-gold mb-2 transform-3d" 
                     style={{ transform: 'translateZ(15px)' }}>
                  {stat.value}
                </div>
                <div className="text-lg font-semibold text-white mb-2 transform-3d" 
                     style={{ transform: 'translateZ(10px)' }}>
                  {stat.label}
                </div>
                <div className="text-sm text-gray-400 transform-3d" 
                     style={{ transform: 'translateZ(5px)' }}>
                  {stat.description}
                </div>
              </div>
            </FloatingCard>
          ))}
        </div>
      </div>
    </div>
  );
};
