import React from 'react';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showBackground?: boolean;
  showGlow?: boolean;
  variant?: 'default' | 'minimal' | 'enhanced';
}

const sizeClasses = {
  sm: 'h-6 w-auto',
  md: 'h-8 w-auto sm:h-10',
  lg: 'h-10 w-auto sm:h-12',
  xl: 'h-12 w-auto sm:h-16'
};

export const Logo: React.FC<LogoProps> = ({ 
  className, 
  size = 'md', 
  showBackground = true,
  showGlow = true,
  variant = 'default'
}) => {
  const baseClasses = cn(
    'relative transition-all duration-300',
    sizeClasses[size],
    className
  );

  if (variant === 'minimal') {
    return (
      <img 
        src="/lovable-uploads/NewFaithConnect.png" 
        alt="Faith Connect Logo" 
        className={cn(baseClasses, 'filter drop-shadow-sm')}
      />
    );
  }

  if (variant === 'enhanced') {
    return (
      <div className="relative group">
        {showBackground && (
          <div className="absolute inset-0 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg group-hover:shadow-2xl transition-all duration-300 -m-2 p-2"></div>
        )}
        <img 
          src="/lovable-uploads/NewFaithConnect.png" 
          alt="Faith Connect Logo" 
          className={cn(
            baseClasses,
            'relative group-hover:scale-110 group-hover:rotate-1 group-hover:drop-shadow-2xl group-active:animate-bounce group-active:scale-95 group-active:rotate-0 group-active:drop-shadow-lg filter drop-shadow-md'
          )}
        />
        {showGlow && (
          <div className="absolute inset-0 bg-gradient-to-r from-fem-terracotta/20 to-fem-gold/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -m-2 blur-sm"></div>
        )}
      </div>
    );
  }

  // Default variant
  return (
    <div className="relative group">
      {showBackground && (
        <div className="absolute inset-0 bg-white/90 backdrop-blur-sm rounded-lg shadow-md group-hover:shadow-lg transition-all duration-300 -m-1 p-1"></div>
      )}
      <img 
        src="/lovable-uploads/NewFaithConnect.png" 
        alt="Faith Connect Logo" 
        className={cn(
          baseClasses,
          'relative group-hover:scale-105 filter drop-shadow-sm'
        )}
      />
      {showGlow && (
        <div className="absolute inset-0 bg-gradient-to-r from-fem-terracotta/10 to-fem-gold/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 -m-1 blur-sm"></div>
      )}
    </div>
  );
};

// Specialized logo components for different contexts
export const NavbarLogo: React.FC<{ className?: string }> = ({ className }) => (
  <Logo 
    size="lg" 
    variant="enhanced" 
    className={className}
  />
);

export const FooterLogo: React.FC<{ className?: string }> = ({ className }) => (
  <Logo 
    size="md" 
    variant="default" 
    className={className}
  />
);

export const InlineLogo: React.FC<{ className?: string }> = ({ className }) => (
  <Logo 
    size="sm" 
    variant="minimal" 
    showBackground={false}
    showGlow={false}
    className={className}
  />
);













