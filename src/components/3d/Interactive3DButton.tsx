
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

interface Interactive3DButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
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

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePosition({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePosition({ x: 0, y: 0 });
  };

  const baseStyles = {
    transform: `
      perspective(1000px) 
      rotateX(${mousePosition.y * -10}deg) 
      rotateY(${mousePosition.x * 10}deg) 
      translateZ(${isPressed ? -5 : 10}px)
      scale(${isPressed ? 0.98 : 1})
    `,
    transition: 'all 0.1s ease-out',
    transformStyle: 'preserve-3d' as const,
  };

  const shadowStyle = {
    boxShadow: `
      0 ${isPressed ? 2 : 8}px ${isPressed ? 8 : 25}px rgba(0, 0, 0, 0.15),
      0 ${isPressed ? 1 : 4}px ${isPressed ? 4 : 15}px rgba(200, 75, 49, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.1)
    `,
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-gradient-to-br from-fem-terracotta to-fem-terracotta/90 hover:from-fem-terracotta/90 hover:to-fem-terracotta text-white border-fem-terracotta/50';
      case 'secondary':
        return 'bg-gradient-to-br from-fem-gold to-fem-gold/90 hover:from-fem-gold/90 hover:to-fem-gold text-fem-navy border-fem-gold/50';
      case 'outline':
        return 'bg-transparent border-2 border-fem-gold text-fem-gold hover:bg-fem-gold/10 backdrop-blur-sm';
      default:
        return 'bg-gradient-to-br from-fem-terracotta to-fem-terracotta/90 hover:from-fem-terracotta/90 hover:to-fem-terracotta text-white border-fem-terracotta/50';
    }
  };

  return (
    <div className="relative inline-block" style={{ perspective: '1000px' }}>
      <Button
        onClick={onClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onMouseDown={() => setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        disabled={disabled}
        size={size}
        className={`
          relative border 
          ${getVariantClasses()}
          ${className}
          transition-all duration-100 ease-out
        `}
        style={{ ...baseStyles, ...shadowStyle }}
      >
        {/* 3D face effect */}
        <div 
          className="absolute inset-0 rounded-md opacity-20"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 50%, rgba(0,0,0,0.1) 100%)',
            transform: 'translateZ(1px)',
          }}
        />
        
        {/* Content */}
        <span className="relative z-10 font-medium">
          {children}
        </span>

        {/* Animated glow effect */}
        <div 
          className="absolute inset-0 rounded-md opacity-0 hover:opacity-100 transition-opacity duration-300"
          style={{
            background: variant === 'primary' 
              ? 'radial-gradient(circle at center, rgba(255, 189, 89, 0.3) 0%, transparent 70%)'
              : 'radial-gradient(circle at center, rgba(200, 75, 49, 0.3) 0%, transparent 70%)',
            transform: 'translateZ(-1px)',
          }}
        />
      </Button>
    </div>
  );
};

export default Interactive3DButton;
