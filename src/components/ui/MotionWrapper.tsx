import { useEffect, useRef } from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { scrollAnimations, hoverAnimations } from '@/utils/animation';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

interface MotionWrapperProps {
  children: React.ReactNode;
  className?: string;
  animation?: 'fadeIn' | 'slideUp' | 'slideLeft' | 'slideRight' | 'scale' | 'stagger';
  delay?: number;
  duration?: number;
  stagger?: number;
  threshold?: number;
  triggerOnce?: boolean;
}

export const MotionWrapper = ({
  children,
  className = "",
  animation = 'fadeIn',
  delay = 0,
  duration = 0.6,
  stagger = 0.1,
  threshold = 0.1,
  triggerOnce = true
}: MotionWrapperProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { threshold, once: triggerOnce });

  const variants = {
    fadeIn: {
      hidden: { opacity: 0, y: 50 },
      visible: { opacity: 1, y: 0 }
    },
    slideUp: {
      hidden: { opacity: 0, y: 100 },
      visible: { opacity: 1, y: 0 }
    },
    slideLeft: {
      hidden: { opacity: 0, x: -100 },
      visible: { opacity: 1, x: 0 }
    },
    slideRight: {
      hidden: { opacity: 0, x: 100 },
      visible: { opacity: 1, x: 0 }
    },
    scale: {
      hidden: { opacity: 0, scale: 0.8 },
      visible: { opacity: 1, scale: 1 }
    },
    stagger: {
      hidden: { opacity: 0, y: 30 },
      visible: { 
        opacity: 1, 
        y: 0,
        transition: {
          staggerChildren: stagger
        }
      }
    }
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      variants={variants[animation]}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      transition={{
        duration,
        delay,
        ease: "easeOut"
      }}
    >
      {children}
    </motion.div>
  );
};

interface ParallaxWrapperProps {
  children: React.ReactNode;
  className?: string;
  speed?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
}

export const ParallaxWrapper = ({
  children,
  className = "",
  speed = 0.5,
  direction = 'up'
}: ParallaxWrapperProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, -100 * speed]);
  const x = useTransform(scrollYProgress, [0, 1], [0, direction === 'left' ? -100 * speed : 100 * speed]);

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{
        y: direction === 'up' || direction === 'down' ? y : 0,
        x: direction === 'left' || direction === 'right' ? x : 0
      }}
    >
      {children}
    </motion.div>
  );
};

interface HoverCardProps {
  children: React.ReactNode;
  className?: string;
  scale?: number;
  y?: number;
  shadow?: boolean;
}

export const HoverCard = ({
  children,
  className = "",
  scale = 1.05,
  y = -5,
  shadow = true
}: HoverCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (cardRef.current) {
      hoverAnimations.cardHover(cardRef.current);
    }
  };

  const handleMouseLeave = () => {
    if (cardRef.current) {
      hoverAnimations.cardHoverOut(cardRef.current);
    }
  };

  return (
    <motion.div
      ref={cardRef}
      className={className}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      whileHover={{
        scale,
        y,
        transition: { duration: 0.3, ease: "easeOut" }
      }}
      whileTap={{ scale: 0.98 }}
      style={{
        boxShadow: shadow ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : 'none'
      }}
    >
      {children}
    </motion.div>
  );
};

interface ScrollTriggerWrapperProps {
  children: React.ReactNode;
  className?: string;
  trigger?: string;
  animation?: 'fadeIn' | 'stagger' | 'scale' | 'parallax';
  stagger?: number;
}

export const ScrollTriggerWrapper = ({
  children,
  className = "",
  trigger,
  animation = 'fadeIn',
  stagger = 0.1
}: ScrollTriggerWrapperProps) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      const selector = trigger || ref.current;
      
      switch (animation) {
        case 'fadeIn':
          scrollAnimations.fadeInOnScroll(selector);
          break;
        case 'stagger':
          scrollAnimations.staggerFadeInOnScroll(selector, stagger);
          break;
        case 'scale':
          scrollAnimations.scaleOnScroll(selector);
          break;
        case 'parallax':
          scrollAnimations.parallaxEffect(selector);
          break;
      }
    }

    return () => {
      // Cleanup scroll triggers
      ScrollTrigger.getAll().forEach(trigger => {
        if (trigger.vars.trigger === ref.current) {
          trigger.kill();
        }
      });
    };
  }, [animation, stagger, trigger]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
};

interface GlassmorphismCardProps {
  children: React.ReactNode;
  className?: string;
  blur?: number;
  opacity?: number;
  border?: boolean;
}

export const GlassmorphismCard = ({
  children,
  className = "",
  blur = 10,
  opacity = 0.1,
  border = true
}: GlassmorphismCardProps) => {
  return (
    <div
      className={className}
      style={{
        backdropFilter: `blur(${blur}px)`,
        backgroundColor: `rgba(255, 255, 255, ${opacity})`,
        border: border ? '1px solid rgba(255, 255, 255, 0.2)' : 'none',
        borderRadius: '12px',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)'
      }}
    >
      {children}
    </div>
  );
};

interface GlowingCardProps {
  children: React.ReactNode;
  className?: string;
  color?: string;
  intensity?: number;
  animated?: boolean;
}

export const GlowingCard = ({
  children,
  className = "",
  color = "#d97706",
  intensity = 0.5,
  animated = false
}: GlowingCardProps) => {
  return (
    <motion.div
      className={className}
      style={{
        boxShadow: `0 0 20px ${color}${Math.floor(intensity * 255).toString(16).padStart(2, '0')}`,
        border: `1px solid ${color}40`
      }}
      animate={animated ? {
        boxShadow: [
          `0 0 20px ${color}${Math.floor(intensity * 255).toString(16).padStart(2, '0')}`,
          `0 0 30px ${color}${Math.floor((intensity + 0.2) * 255).toString(16).padStart(2, '0')}`,
          `0 0 20px ${color}${Math.floor(intensity * 255).toString(16).padStart(2, '0')}`
        ]
      } : {}}
      transition={{
        duration: 2,
        repeat: animated ? Infinity : 0,
        ease: "easeInOut"
      }}
    >
      {children}
    </motion.div>
  );
};

export default {
  MotionWrapper,
  ParallaxWrapper,
  HoverCard,
  ScrollTriggerWrapper,
  GlassmorphismCard,
  GlowingCard
}; 