
import React from 'react';

interface Typography3DProps {
  children: React.ReactNode;
  variant?: 'hero' | 'heading' | 'subheading';
  className?: string;
  animated?: boolean;
}

export const Typography3D: React.FC<Typography3DProps> = ({
  children,
  variant = 'heading',
  className = '',
  animated = true
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'hero':
        return {
          fontSize: 'clamp(3rem, 8vw, 6rem)',
          fontWeight: '800',
          textShadow: `
            0 0 20px rgba(255, 189, 89, 0.5),
            0 5px 10px rgba(0, 0, 0, 0.3),
            0 10px 20px rgba(200, 75, 49, 0.2),
            0 20px 40px rgba(0, 0, 0, 0.1)
          `,
          background: `linear-gradient(135deg, 
            #FFBD59 0%, 
            #C84B31 25%, 
            #FFBD59 50%, 
            #C84B31 75%, 
            #FFBD59 100%)`,
          backgroundSize: '300% 300%',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          animation: animated ? 'gradient-shift 6s ease-in-out infinite' : undefined
        };
      case 'heading':
        return {
          fontSize: 'clamp(2rem, 5vw, 3.5rem)',
          fontWeight: '700',
          textShadow: `
            0 2px 4px rgba(0, 0, 0, 0.3),
            0 4px 8px rgba(200, 75, 49, 0.2)
          `,
          background: `linear-gradient(135deg, #FFBD59, #C84B31)`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        };
      case 'subheading':
        return {
          fontSize: 'clamp(1.5rem, 3vw, 2.5rem)',
          fontWeight: '600',
          textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
          color: '#FFBD59'
        };
      default:
        return {};
    }
  };

  return (
    <div 
      className={`transform-3d transition-all duration-500 hover:scale-105 ${className}`}
      style={{
        transform: 'perspective(1000px) rotateX(2deg)',
        transformStyle: 'preserve-3d',
        ...getVariantStyles()
      }}
    >
      {children}
    </div>
  );
};

export default Typography3D;
