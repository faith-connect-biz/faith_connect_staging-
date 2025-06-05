
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface Interactive3DButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'glass';
  size?: 'sm' | 'lg';
  className?: string;
  disabled?: boolean;
}

export const Interactive3DButton: React.FC<Interactive3DButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'lg',
  className = '',
  disabled = false
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!buttonRef.current) return;
    
    const rect = buttonRef.current.getBoundingClientRect();
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

  const baseTransform = `
    perspective(1000px) 
    rotateX(${mousePosition.y * -15}deg) 
    rotateY(${mousePosition.x * 15}deg) 
    translateZ(${isPressed ? -8 : isHovered ? 20 : 10}px)
    scale(${isPressed ? 0.95 : isHovered ? 1.05 : 1})
  `;

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          background: `linear-gradient(135deg, 
            rgba(200, 75, 49, 0.9) 0%, 
            rgba(200, 75, 49, 1) 50%, 
            rgba(160, 60, 39, 1) 100%)`,
          boxShadow: `
            0 ${isHovered ? 25 : 15}px ${isHovered ? 50 : 30}px rgba(200, 75, 49, 0.4),
            0 ${isHovered ? 12 : 8}px ${isHovered ? 25 : 15}px rgba(0, 0, 0, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.2),
            inset 0 -1px 0 rgba(0, 0, 0, 0.2)
          `,
          border: '1px solid rgba(255, 255, 255, 0.2)'
        };
      case 'glass':
        return {
          background: `linear-gradient(135deg, 
            rgba(255, 255, 255, 0.1) 0%, 
            rgba(255, 255, 255, 0.05) 100%)`,
          backdropFilter: 'blur(20px)',
          boxShadow: `
            0 ${isHovered ? 25 : 15}px ${isHovered ? 50 : 30}px rgba(0, 0, 0, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.3),
            inset 0 -1px 0 rgba(0, 0, 0, 0.1)
          `,
          border: '1px solid rgba(255, 189, 89, 0.3)'
        };
      case 'outline':
        return {
          background: 'transparent',
          boxShadow: `
            0 ${isHovered ? 20 : 10}px ${isHovered ? 40 : 20}px rgba(255, 189, 89, 0.2),
            inset 0 0 0 2px rgba(255, 189, 89, 0.5)
          `,
          border: '2px solid rgba(255, 189, 89, 0.8)'
        };
      default:
        return {};
    }
  };

  return (
    <div className="relative inline-block transform-3d" style={{ perspective: '1000px' }}>
      <Button
        ref={buttonRef}
        onClick={onClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onMouseEnter={handleMouseEnter}
        onMouseDown={() => setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        disabled={disabled}
        size={size}
        className={`
          relative overflow-hidden transform-3d transition-all duration-300 ease-out
          ${variant === 'glass' ? 'text-white' : ''}
          ${variant === 'outline' ? 'text-fem-gold hover:text-white' : 'text-white'}
          ${className}
        `}
        style={{
          transform: baseTransform,
          transformStyle: 'preserve-3d',
          ...getVariantStyles()
        }}
      >
        {/* 3D depth layers */}
        <div 
          className="absolute inset-0 rounded-md opacity-30"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 50%, rgba(0,0,0,0.2) 100%)',
            transform: 'translateZ(-2px)',
          }}
        />
        
        {/* Content with 3D effect */}
        <span 
          className="relative z-10 font-semibold tracking-wide transform-3d"
          style={{
            transform: 'translateZ(5px)',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}
        >
          {children}
        </span>

        {/* Animated particles */}
        {isHovered && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full opacity-60 animate-pulse"
                style={{
                  left: `${20 + i * 12}%`,
                  top: `${30 + (i % 2) * 40}%`,
                  animationDelay: `${i * 0.1}s`,
                  transform: 'translateZ(10px)'
                }}
              />
            ))}
          </div>
        )}

        {/* Glow effect */}
        <div 
          className={`absolute inset-0 rounded-md transition-opacity duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            background: variant === 'primary' 
              ? 'radial-gradient(circle at center, rgba(255, 189, 89, 0.4) 0%, transparent 70%)'
              : 'radial-gradient(circle at center, rgba(200, 75, 49, 0.4) 0%, transparent 70%)',
            transform: 'translateZ(-5px)',
            filter: 'blur(10px)'
          }}
        />
      </Button>
    </div>
  );
};

export default Interactive3DButton;
