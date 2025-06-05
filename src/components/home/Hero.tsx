
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import ThreeDModel from "@/components/3d/ThreeDModel";
import Interactive3DButton from "@/components/3d/Interactive3DButton";

export const Hero = () => {
  return (
    <div className="bg-gradient-to-br from-fem-navy via-fem-navy/98 to-fem-navy/95 text-white py-16 md:py-24 relative overflow-hidden">
      {/* Enhanced background with animated particles */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-20 left-10 w-24 h-24 bg-fem-terracotta/10 rounded-full blur-3xl animate-pulse-light"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-fem-gold/10 rounded-full blur-3xl animate-pulse-light" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-fem-terracotta/5 rounded-full blur-2xl animate-pulse-light" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-40 left-20 w-20 h-20 bg-fem-gold/8 rounded-full blur-2xl animate-pulse-light" style={{ animationDelay: '3s' }}></div>
        
        {/* Animated grid overlay */}
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255, 189, 89, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 189, 89, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
            animation: 'float 20s ease-in-out infinite'
          }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="max-w-2xl">
            <h1 className="text-3xl md:text-5xl font-bold mb-6 animate-fade-in" style={{animationDelay: '0.1s'}}>
              Find Your <span className="gradient-text text-transparent">Purpose</span> Through 
              <span className="text-fem-terracotta"> Meaningful Work</span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-300 mb-8 animate-fade-in" style={{animationDelay: '0.3s'}}>
              Connecting FEM Family Church members in Kenya with opportunities that align with their skills, values, and calling.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-start mb-10 animate-fade-in" style={{animationDelay: '0.5s'}}>
              <Link to="/jobs">
                <Interactive3DButton variant="primary" size="lg" className="w-full sm:w-auto">
                  Find Jobs
                </Interactive3DButton>
              </Link>
              <Link to="/post-job">
                <Interactive3DButton variant="outline" size="lg" className="w-full sm:w-auto">
                  Post a Job
                </Interactive3DButton>
              </Link>
            </div>
            
            <div className="glass-card rounded-lg p-4 flex items-center gap-3 max-w-2xl animate-fade-in shadow-lg border border-white/20 backdrop-blur-md" style={{animationDelay: '0.7s'}}>
              <Search className="text-fem-gold h-5 w-5 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search for jobs in Kenya (e.g. Painter, Software Engineer)"
                className="flex-1 border-0 focus:ring-0 focus:outline-none bg-transparent text-white placeholder:text-gray-400"
              />
              <Interactive3DButton variant="secondary" className="px-6 py-2">
                Search
              </Interactive3DButton>
            </div>
          </div>
          
          <div className="h-[400px] hidden md:block relative">
            <ThreeDModel type="city" className="w-full h-full" interactive={true} />
          </div>
        </div>
        
        {/* Add floating stats cards with 3D effects */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 animate-fade-in" style={{animationDelay: '0.9s'}}>
          {[
            { label: "Active Jobs", value: "150+", icon: "💼" },
            { label: "Church Members", value: "500+", icon: "👥" },
            { label: "Success Stories", value: "75+", icon: "✨" }
          ].map((stat, index) => (
            <div 
              key={index}
              className="glass-card p-6 text-center hover-card-effect transform transition-all duration-300 hover:scale-105"
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 189, 89, 0.2)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                animationDelay: `${1 + index * 0.2}s`
              }}
            >
              <div className="text-2xl mb-2">{stat.icon}</div>
              <div className="text-2xl font-bold text-fem-gold mb-1">{stat.value}</div>
              <div className="text-sm text-gray-300">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
