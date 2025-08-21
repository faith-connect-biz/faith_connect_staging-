
import React, { useState, useEffect } from 'react';

interface GlowingOrbProps {
  size?: number;
  color?: string;
  intensity?: number;
  className?: string;
  animated?: boolean;
}

export const GlowingOrb: React.FC<GlowingOrbProps> = ({
  size = 100,
  color = '#FFBD59',
  intensity = 1,
  className = '',
  animated = true
}) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    if (animated) {
      window.addEventListener('mousemove', handleMouseMove);
      return () => window.removeEventListener('mousemove', handleMouseMove);
    }
  }, [animated]);

  return (
    <div 
      className={`absolute rounded-full pointer-events-none ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        background: `radial-gradient(circle, ${color}${Math.round(0.3 * intensity * 255).toString(16).padStart(2, '0')} 0%, transparent 70%)`,
        filter: `blur(${20 * intensity}px)`,
        animation: animated ? 'float 8s ease-in-out infinite' : undefined,
        transform: animated ? `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)` : undefined,
        transition: 'transform 0.3s ease-out'
      }}
    />
  );
};

export default GlowingOrb;
