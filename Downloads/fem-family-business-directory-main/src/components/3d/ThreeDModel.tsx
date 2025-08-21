
import React, { useEffect, useRef, useState } from 'react';

// Interface for component props
interface ThreeDModelProps {
  type?: 'city' | 'globe';
  className?: string;
  interactive?: boolean;
}

/**
 * Enhanced 3D visualization component with improved animations and interactivity
 */
export function ThreeDModel({ type = 'city', className = '', interactive = false }: ThreeDModelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!interactive) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      
      setMousePosition({ x: x - 0.5, y: y - 0.5 });
    };

    const container = containerRef.current;
    container?.addEventListener('mousemove', handleMouseMove);
    container?.addEventListener('mouseenter', () => setIsHovered(true));
    container?.addEventListener('mouseleave', () => setIsHovered(false));

    return () => {
      container?.removeEventListener('mousemove', handleMouseMove);
      container?.removeEventListener('mouseenter', () => setIsHovered(true));
      container?.removeEventListener('mouseleave', () => setIsHovered(false));
    };
  }, [interactive]);

  const parallaxStyle = interactive ? {
    transform: `perspective(1000px) rotateY(${mousePosition.x * 10}deg) rotateX(${-mousePosition.y * 10}deg) scale(${isHovered ? 1.05 : 1})`,
    transition: isHovered ? 'transform 0.1s ease-out' : 'transform 0.3s ease-out'
  } : {};

  return (
    <div 
      ref={containerRef}
      className={`w-full h-full relative overflow-hidden ${className}`}
      style={{ perspective: '1000px' }}
    >
      {/* Enhanced gradient background with animated overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-fem-navy/90 via-fem-navy/95 to-fem-navy z-0">
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            background: `radial-gradient(circle at ${50 + mousePosition.x * 20}% ${50 + mousePosition.y * 20}%, rgba(255, 189, 89, 0.3) 0%, transparent 50%)`
          }}
        />
      </div>
      
      {/* Dynamic content based on type */}
      {type === 'city' ? (
        <div 
          className="relative z-10 w-full h-full flex items-center justify-center"
          style={parallaxStyle}
        >
          {/* Enhanced city skyline with layers */}
          <div className="relative">
            {/* Background buildings layer */}
            <div className="absolute inset-0 grid grid-cols-7 gap-1 opacity-40">
              {Array.from({ length: 21 }).map((_, i) => {
                const height = 60 + Math.random() * 80;
                const delay = i * 0.1;
                
                return (
                  <div 
                    key={`bg-${i}`}
                    className="bg-fem-navy/60 rounded-sm animate-float"
                    style={{ 
                      height: `${height}px`,
                      width: '6px',
                      animationDelay: `${delay}s`,
                      transform: `translateZ(-50px) scale(0.8)`
                    }}
                  />
                );
              })}
            </div>

            {/* Main buildings layer */}
            <div className="grid grid-cols-6 gap-2 relative z-10">
              {Array.from({ length: 18 }).map((_, i) => {
                const height = 50 + Math.random() * 140;
                const colorIndex = i % 4;
                const colors = ['#C84B31', '#1A1F2C', '#FFBD59', '#FFD68A'];
                const color = colors[colorIndex];
                const delay = i * 0.15;
                
                return (
                  <div 
                    key={i} 
                    className="relative rounded-sm animate-float shadow-lg"
                    style={{ 
                      height: `${height}px`,
                      width: '10px',
                      backgroundColor: color,
                      animationDelay: `${delay}s`,
                      transform: `translateY(${Math.sin(i + mousePosition.x * 5) * 3}px)`,
                      boxShadow: `0 ${height/10}px ${height/5}px rgba(0,0,0,0.3)`
                    }}
                  >
                    {/* Building windows */}
                    {height > 80 && (
                      <div className="absolute inset-x-0 top-2 space-y-1">
                        {Array.from({ length: Math.floor(height / 20) }).map((_, windowIndex) => (
                          <div 
                            key={windowIndex}
                            className="w-1 h-1 bg-fem-gold/80 mx-auto animate-pulse"
                            style={{ animationDelay: `${windowIndex * 0.5}s` }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Foreground accent buildings */}
            <div className="absolute bottom-0 left-0 right-0 flex justify-around">
              {Array.from({ length: 3 }).map((_, i) => (
                <div 
                  key={`fg-${i}`}
                  className="bg-fem-terracotta rounded-sm animate-float-slow shadow-2xl"
                  style={{ 
                    height: `${80 + i * 20}px`,
                    width: '8px',
                    animationDelay: `${i * 0.3}s`,
                    transform: `translateZ(20px) scale(1.2)`
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div 
          className="relative z-10 w-full h-full flex items-center justify-center"
          style={parallaxStyle}
        >
          {/* Enhanced globe with rotation and interactive effects */}
          <div 
            className="relative w-52 h-52 rounded-full animate-float-slow shadow-2xl"
            style={{ 
              background: `conic-gradient(from ${mousePosition.x * 180}deg, rgba(255,189,89,0.9) 0%, rgba(200,75,49,0.7) 50%, rgba(255,189,89,0.9) 100%)`,
              boxShadow: `0 0 60px rgba(255, 189, 89, ${isHovered ? 0.6 : 0.4}), inset 0 0 40px rgba(200, 75, 49, 0.3)`,
              transform: `rotateY(${mousePosition.x * 20}deg) rotateX(${mousePosition.y * 10}deg)`
            }}
          >
            {/* Animated continents */}
            <div 
              className="absolute w-14 h-10 bg-fem-terracotta/50 rounded-full top-8 left-6 transform rotate-12 transition-transform duration-300"
              style={{ transform: `rotate(${12 + mousePosition.x * 5}deg)` }}
            />
            <div 
              className="absolute w-12 h-16 bg-fem-terracotta/50 rounded-full top-16 left-16 transition-transform duration-300"
              style={{ transform: `scale(${1 + mousePosition.y * 0.1})` }}
            />
            <div 
              className="absolute w-18 h-12 bg-fem-terracotta/50 rounded-full bottom-8 right-8 transform -rotate-12 transition-transform duration-300"
              style={{ transform: `rotate(${-12 + mousePosition.x * -3}deg)` }}
            />

            {/* Orbital rings */}
            <div 
              className="absolute inset-0 border-2 border-fem-gold/30 rounded-full animate-spin"
              style={{ 
                animationDuration: '20s',
                transform: `rotateX(70deg) scale(1.2)`
              }}
            />
            <div 
              className="absolute inset-0 border border-fem-terracotta/20 rounded-full animate-spin"
              style={{ 
                animationDuration: '30s',
                animationDirection: 'reverse',
                transform: `rotateX(60deg) rotateY(45deg) scale(1.4)`
              }}
            />
          </div>
        </div>
      )}
      
      {/* Enhanced particle effects with interactive behavior */}
      <div className="absolute inset-0 z-5 overflow-hidden pointer-events-none">
        {Array.from({ length: interactive ? 25 : 15 }).map((_, i) => {
          const size = Math.random() * 8 + 2;
          const initialX = Math.random() * 100;
          const initialY = Math.random() * 100;
          const animationDuration = Math.random() * 15 + 10;
          const delay = Math.random() * 5;
          
          return (
            <div 
              key={i}
              className="absolute rounded-full bg-white/10 backdrop-blur-sm"
              style={{
                width: `${size}px`,
                height: `${size}px`,
                left: `${initialX + (interactive ? mousePosition.x * 10 : 0)}%`,
                top: `${initialY + (interactive ? mousePosition.y * 10 : 0)}%`,
                animation: `float ${animationDuration}s infinite ease-in-out`,
                animationDelay: `${delay}s`,
                boxShadow: `0 0 ${size * 2}px rgba(255, 189, 89, 0.3)`,
                transform: `translateZ(${Math.random() * 100}px)`
              }}
            />
          );
        })}
      </div>

      {/* Interactive glow effect */}
      {interactive && isHovered && (
        <div 
          className="absolute inset-0 z-20 pointer-events-none"
          style={{
            background: `radial-gradient(circle at ${(mousePosition.x + 0.5) * 100}% ${(mousePosition.y + 0.5) * 100}%, rgba(255, 189, 89, 0.1) 0%, transparent 50%)`,
            mixBlendMode: 'overlay'
          }}
        />
      )}
    </div>
  );
}

export default ThreeDModel;
