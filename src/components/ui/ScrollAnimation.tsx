import React from 'react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { cn } from '@/lib/utils';

interface ScrollAnimationProps {
  children: React.ReactNode;
  className?: string;
  animation?: 'fadeIn' | 'slideUp' | 'slideDown' | 'slideLeft' | 'slideRight' | 'scale' | 'rotate';
  delay?: number;
  duration?: number;
  threshold?: number;
  triggerOnce?: boolean;
}

const animationClasses = {
  fadeIn: 'opacity-0 translate-y-4',
  slideUp: 'opacity-0 translate-y-8',
  slideDown: 'opacity-0 -translate-y-8',
  slideLeft: 'opacity-0 translate-x-8',
  slideRight: 'opacity-0 -translate-x-8',
  scale: 'opacity-0 scale-95',
  rotate: 'opacity-0 rotate-3',
};

const visibleClasses = {
  fadeIn: 'opacity-100 translate-y-0',
  slideUp: 'opacity-100 translate-y-0',
  slideDown: 'opacity-100 translate-y-0',
  slideLeft: 'opacity-100 translate-x-0',
  slideRight: 'opacity-100 translate-x-0',
  scale: 'opacity-100 scale-100',
  rotate: 'opacity-100 rotate-0',
};

export const ScrollAnimation: React.FC<ScrollAnimationProps> = ({
  children,
  className,
  animation = 'fadeIn',
  delay = 0,
  duration = 500,
  threshold = 0.1,
  triggerOnce = true,
}) => {
  const { ref, isVisible } = useScrollAnimation({
    threshold,
    triggerOnce,
  });

  return (
    <div
      ref={ref}
      className={cn(
        'transition-all ease-out',
        isVisible ? visibleClasses[animation] : animationClasses[animation],
        className
      )}
      style={{
        transitionDelay: `${delay}ms`,
        transitionDuration: `${duration}ms`,
      }}
    >
      {children}
    </div>
  );
};

// Specialized components for common animations
export const FadeIn: React.FC<Omit<ScrollAnimationProps, 'animation'>> = (props) => (
  <ScrollAnimation {...props} animation="fadeIn" />
);

export const SlideUp: React.FC<Omit<ScrollAnimationProps, 'animation'>> = (props) => (
  <ScrollAnimation {...props} animation="slideUp" />
);

export const SlideDown: React.FC<Omit<ScrollAnimationProps, 'animation'>> = (props) => (
  <ScrollAnimation {...props} animation="slideDown" />
);

export const SlideLeft: React.FC<Omit<ScrollAnimationProps, 'animation'>> = (props) => (
  <ScrollAnimation {...props} animation="slideLeft" />
);

export const SlideRight: React.FC<Omit<ScrollAnimationProps, 'animation'>> = (props) => (
  <ScrollAnimation {...props} animation="slideRight" />
);

export const ScaleIn: React.FC<Omit<ScrollAnimationProps, 'animation'>> = (props) => (
  <ScrollAnimation {...props} animation="scale" />
);

export const RotateIn: React.FC<Omit<ScrollAnimationProps, 'animation'>> = (props) => (
  <ScrollAnimation {...props} animation="rotate" />
);
