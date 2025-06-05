
import React, { useEffect, useRef, useState } from 'react';

interface DataPoint {
  label: string;
  value: number;
  color?: string;
  icon?: React.ReactNode;
}

interface Infographic3DProps {
  data: DataPoint[];
  type?: 'bar' | 'circle' | 'pyramid';
  title?: string;
  className?: string;
}

export const Infographic3D: React.FC<Infographic3DProps> = ({
  data,
  type = 'bar',
  title,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const maxValue = Math.max(...data.map(item => item.value));

  const renderBarChart = () => (
    <div className="flex items-end justify-center gap-4 h-64">
      {data.map((item, index) => {
        const height = (item.value / maxValue) * 200;
        const delay = index * 0.2;
        
        return (
          <div key={index} className="flex flex-col items-center gap-2">
            <div
              className="relative transform-3d transition-all duration-1000 hover:scale-110"
              style={{
                height: isVisible ? `${height}px` : '0px',
                width: '40px',
                background: item.color || `linear-gradient(135deg, #FFBD59, #C84B31)`,
                borderRadius: '8px 8px 0 0',
                transformStyle: 'preserve-3d',
                transform: 'perspective(1000px) rotateY(-10deg)',
                boxShadow: `
                  0 ${height/4}px ${height/8}px rgba(0,0,0,0.3),
                  inset 0 1px 0 rgba(255,255,255,0.2)
                `,
                animationDelay: `${delay}s`
              }}
            >
              {/* 3D side face */}
              <div 
                className="absolute top-0 right-0 w-2 bg-black/20"
                style={{
                  height: isVisible ? `${height}px` : '0px',
                  transform: 'rotateY(90deg) translateZ(20px)',
                  borderRadius: '0 8px 0 0'
                }}
              />
              
              {/* Value display */}
              <div 
                className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-sm font-bold text-fem-gold"
                style={{ transform: 'translateZ(10px)' }}
              >
                {item.value}
              </div>
            </div>
            
            <div className="text-xs text-center text-gray-400 max-w-12">
              {item.icon && <div className="mb-1">{item.icon}</div>}
              {item.label}
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderCircleChart = () => (
    <div className="relative w-64 h-64 mx-auto">
      {data.map((item, index) => {
        const angle = (item.value / maxValue) * 360;
        const delay = index * 0.3;
        
        return (
          <div
            key={index}
            className="absolute inset-0 transform-3d"
            style={{
              transform: `perspective(1000px) rotateX(10deg) rotateZ(${index * 90}deg)`,
              transformStyle: 'preserve-3d'
            }}
          >
            <div
              className="w-full h-full rounded-full border-8 transition-all duration-1000"
              style={{
                borderColor: item.color || '#FFBD59',
                borderTopColor: 'transparent',
                borderRightColor: 'transparent',
                borderBottomColor: angle > 180 ? (item.color || '#FFBD59') : 'transparent',
                borderLeftColor: angle > 270 ? (item.color || '#FFBD59') : 'transparent',
                animationDelay: `${delay}s`,
                opacity: isVisible ? 1 : 0,
                transform: `rotateZ(${isVisible ? angle : 0}deg)`
              }}
            />
          </div>
        );
      })}
    </div>
  );

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {title && (
        <h3 className="text-2xl font-bold text-center mb-8 text-fem-gold">
          {title}
        </h3>
      )}
      
      <div className="relative p-8 rounded-2xl glass-morphism">
        {type === 'bar' && renderBarChart()}
        {type === 'circle' && renderCircleChart()}
        
        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-fem-gold/30 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 4}s`
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Infographic3D;
