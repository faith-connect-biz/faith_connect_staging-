
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface NavItem {
  label: string;
  path: string;
  icon?: React.ReactNode;
}

interface Navigation3DProps {
  items: NavItem[];
  className?: string;
}

export const Navigation3D: React.FC<Navigation3DProps> = ({ items, className = '' }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const location = useLocation();

  return (
    <nav className={`relative ${className}`}>
      <div className="flex gap-2">
        {items.map((item, index) => {
          const isActive = location.pathname === item.path;
          const isHovered = hoveredIndex === index;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="relative group"
            >
              <div
                className={`
                  px-6 py-3 rounded-lg font-medium transition-all duration-300 transform-3d
                  ${isActive 
                    ? 'text-white' 
                    : 'text-gray-300 hover:text-white'
                  }
                `}
                style={{
                  transform: `
                    perspective(1000px) 
                    rotateX(${isHovered ? -5 : 0}deg) 
                    rotateY(${isHovered ? 5 : 0}deg) 
                    translateZ(${isHovered ? 10 : 0}px)
                    scale(${isHovered ? 1.05 : 1})
                  `,
                  transformStyle: 'preserve-3d',
                  background: isActive || isHovered ? `
                    linear-gradient(135deg, 
                      rgba(255, 189, 89, 0.2) 0%, 
                      rgba(200, 75, 49, 0.3) 100%)
                  ` : 'transparent',
                  backdropFilter: isActive || isHovered ? 'blur(10px)' : 'none',
                  border: isActive || isHovered ? '1px solid rgba(255, 189, 89, 0.3)' : '1px solid transparent',
                  boxShadow: isHovered ? `
                    0 10px 25px rgba(0, 0, 0, 0.2),
                    0 5px 10px rgba(255, 189, 89, 0.1)
                  ` : 'none'
                }}
              >
                <span className="flex items-center gap-2 relative z-10">
                  {item.icon}
                  {item.label}
                </span>
                
                {/* 3D depth layer */}
                <div 
                  className="absolute inset-0 rounded-lg opacity-30"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0.1) 100%)',
                    transform: 'translateZ(-2px)',
                  }}
                />
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default Navigation3D;
