
import React, { useState, useRef } from 'react';

interface FloatingCardProps {
  children: React.ReactNode;
  className?: string;
  glassEffect?: boolean;
  intensity?: number;
}

export const FloatingCard: React.FC<FloatingCardProps> = ({
  children,
  className = '',
  glassEffect = true,
  intensity = 1
}) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePosition({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePosition({ x: 0, y: 0 });
    setIsHovered(false);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const transform = `
    perspective(1000px) 
    rotateX(${mousePosition.y * -10 * intensity}deg) 
    rotateY(${mousePosition.x * 10 * intensity}deg) 
    translateZ(${isHovered ? 20 : 0}px)
    scale(${isHovered ? 1.02 : 1})
  `;

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      className={`
        relative transform-3d transition-all duration-300 ease-out cursor-pointer
        ${className}
      `}
      style={{
        transform,
        transformStyle: 'preserve-3d',
        boxShadow: `
          0 ${isHovered ? 30 : 20}px ${isHovered ? 60 : 40}px rgba(0, 0, 0, 0.1),
          0 ${isHovered ? 15 : 10}px ${isHovered ? 30 : 20}px rgba(200, 75, 49, 0.1)
        `,
        background: glassEffect ? `
          linear-gradient(135deg, 
            rgba(255, 255, 255, 0.1) 0%, 
            rgba(255, 255, 255, 0.05) 100%)
        ` : undefined,
        backdropFilter: glassEffect ? 'blur(20px)' : undefined,
        border: glassEffect ? '1px solid rgba(255, 255, 255, 0.2)' : undefined
      }}
    >
      {/* Inner glow */}
      <div 
        className="absolute inset-0 rounded-lg opacity-20"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 50%, rgba(0,0,0,0.1) 100%)',
          transform: 'translateZ(1px)',
        }}
      />
      
      {/* Content */}
      <div 
        className="relative z-10"
        style={{ transform: 'translateZ(5px)' }}
      >
        {children}
      </div>

      {/* Ambient glow */}
      <div 
        className={`absolute inset-0 rounded-lg transition-opacity duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          background: 'radial-gradient(circle at center, rgba(255, 189, 89, 0.15) 0%, transparent 70%)',
          transform: 'translateZ(-2px)',
          filter: 'blur(20px)'
        }}
      />
    </div>
  );
};

export default FloatingCard;
