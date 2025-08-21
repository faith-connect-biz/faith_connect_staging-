
import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  life: number;
  maxLife: number;
}

interface ParticleFieldProps {
  count?: number;
  className?: string;
}

export const ParticleField: React.FC<ParticleFieldProps> = ({ 
  count = 50, 
  className = '' 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Initialize particles
    particlesRef.current = Array.from({ length: count }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      z: Math.random() * 100,
      vx: (Math.random() - 0.5) * 0.1,
      vy: (Math.random() - 0.5) * 0.1,
      vz: (Math.random() - 0.5) * 0.1,
      life: Math.random() * 100,
      maxLife: 100
    }));

    // Create particle elements
    const particleElements = particlesRef.current.map(() => {
      const particle = document.createElement('div');
      particle.className = 'absolute w-1 h-1 bg-fem-gold rounded-full opacity-30';
      particle.style.transformStyle = 'preserve-3d';
      container.appendChild(particle);
      return particle;
    });

    const animate = () => {
      particlesRef.current.forEach((particle, index) => {
        // Update particle position
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.z += particle.vz;
        particle.life -= 0.5;

        // Reset particle if it's dead or out of bounds
        if (particle.life <= 0 || particle.x < 0 || particle.x > 100 || particle.y < 0 || particle.y > 100) {
          particle.x = Math.random() * 100;
          particle.y = Math.random() * 100;
          particle.z = Math.random() * 100;
          particle.life = particle.maxLife;
        }

        // Update DOM element
        const element = particleElements[index];
        if (element) {
          const opacity = (particle.life / particle.maxLife) * 0.6;
          const scale = 0.5 + (particle.life / particle.maxLife) * 0.5;
          
          element.style.transform = `
            translate3d(${particle.x}%, ${particle.y}%, ${particle.z}px) 
            scale(${scale})
          `;
          element.style.opacity = opacity.toString();
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      particleElements.forEach(element => {
        if (element.parentNode) {
          element.parentNode.removeChild(element);
        }
      });
    };
  }, [count]);

  return (
    <div 
      ref={containerRef}
      className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}
      style={{ 
        perspective: '1000px',
        transformStyle: 'preserve-3d'
      }}
    />
  );
};

export default ParticleField;
