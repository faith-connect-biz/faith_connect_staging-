import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TextPlugin } from "gsap/TextPlugin";

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger, TextPlugin);

// Color theme constants
export const FAITH_COLORS = {
  navy: "#1e3a8a",
  terracotta: "#d97706", 
  gold: "#f59e0b",
  darkgray: "#374151",
  lightgray: "#f3f4f6"
};

// GSAP Animation Presets
export const animationPresets = {
  fadeInUp: {
    y: 50,
    opacity: 0,
    duration: 0.8,
    ease: "power2.out"
  },
  fadeInScale: {
    scale: 0.8,
    opacity: 0,
    duration: 0.6,
    ease: "back.out(1.7)"
  },
  staggerFadeIn: {
    y: 30,
    opacity: 0,
    duration: 0.6,
    stagger: 0.1,
    ease: "power2.out"
  },
  slideInLeft: {
    x: -100,
    opacity: 0,
    duration: 0.8,
    ease: "power2.out"
  },
  slideInRight: {
    x: 100,
    opacity: 0,
    duration: 0.8,
    ease: "power2.out"
  }
};

// Scroll-triggered animations
export const scrollAnimations = {
  // Fade in elements on scroll
  fadeInOnScroll: (selector: string) => {
    gsap.fromTo(selector, 
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: {
          trigger: selector,
          start: "top 80%",
          end: "bottom 20%",
          toggleActions: "play none none reverse"
        }
      }
    );
  },

  // Stagger fade in for lists
  staggerFadeInOnScroll: (selector: string, stagger = 0.1) => {
    gsap.fromTo(selector,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger,
        ease: "power2.out",
        scrollTrigger: {
          trigger: selector,
          start: "top 85%",
          end: "bottom 15%",
          toggleActions: "play none none reverse"
        }
      }
    );
  },

  // Parallax effect
  parallaxEffect: (selector: string, speed = 0.5) => {
    gsap.to(selector, {
      yPercent: -50 * speed,
      ease: "none",
      scrollTrigger: {
        trigger: selector,
        start: "top bottom",
        end: "bottom top",
        scrub: true
      }
    });
  },

  // Scale on scroll
  scaleOnScroll: (selector: string) => {
    gsap.fromTo(selector,
      { scale: 0.8, opacity: 0 },
      {
        scale: 1,
        opacity: 1,
        duration: 1,
        ease: "back.out(1.7)",
        scrollTrigger: {
          trigger: selector,
          start: "top 80%",
          end: "bottom 20%",
          toggleActions: "play none none reverse"
        }
      }
    );
  }
};

// Hover animations
export const hoverAnimations = {
  // Card hover effect
  cardHover: (element: HTMLElement) => {
    gsap.to(element, {
      scale: 1.05,
      y: -5,
      duration: 0.3,
      ease: "power2.out"
    });
  },

  // Card hover out
  cardHoverOut: (element: HTMLElement) => {
    gsap.to(element, {
      scale: 1,
      y: 0,
      duration: 0.3,
      ease: "power2.out"
    });
  },

  // Button hover
  buttonHover: (element: HTMLElement) => {
    gsap.to(element, {
      scale: 1.05,
      duration: 0.2,
      ease: "power2.out"
    });
  },

  // Button hover out
  buttonHoverOut: (element: HTMLElement) => {
    gsap.to(element, {
      scale: 1,
      duration: 0.2,
      ease: "power2.out"
    });
  }
};

// Page transition animations
export const pageTransitions = {
  // Page enter
  pageEnter: (element: HTMLElement) => {
    gsap.fromTo(element,
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "power2.out"
      }
    );
  },

  // Page exit
  pageExit: (element: HTMLElement) => {
    return gsap.to(element, {
      opacity: 0,
      y: -20,
      duration: 0.4,
      ease: "power2.in"
    });
  }
};

// Text animations
export const textAnimations = {
  // Typewriter effect
  typewriter: (element: HTMLElement, text: string, speed = 0.05) => {
    gsap.to(element, {
      duration: text.length * speed,
      text: text,
      ease: "none"
    });
  },

  // Text reveal
  textReveal: (element: HTMLElement) => {
    gsap.fromTo(element,
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power2.out"
      }
    );
  }
};

// Loading animations
export const loadingAnimations = {
  // Pulse effect
  pulse: (element: HTMLElement) => {
    gsap.to(element, {
      scale: 1.1,
      duration: 0.5,
      ease: "power2.inOut",
      yoyo: true,
      repeat: -1
    });
  },

  // Rotate effect
  rotate: (element: HTMLElement) => {
    gsap.to(element, {
      rotation: 360,
      duration: 1,
      ease: "none",
      repeat: -1
    });
  }
};

// Utility functions
export const animationUtils = {
  // Kill all animations on an element
  killAnimations: (element: HTMLElement) => {
    gsap.killTweensOf(element);
  },

  // Pause all scroll triggers
  pauseScrollTriggers: () => {
    ScrollTrigger.getAll().forEach(trigger => trigger.disable());
  },

  // Resume all scroll triggers
  resumeScrollTriggers: () => {
    ScrollTrigger.getAll().forEach(trigger => trigger.enable());
  },

  // Refresh scroll triggers
  refreshScrollTriggers: () => {
    ScrollTrigger.refresh();
  }
};

// Performance optimizations
export const performanceUtils = {
  // Debounce function
  debounce: (func: Function, wait: number) => {
    let timeout: NodeJS.Timeout;
    return function executedFunction(...args: any[]) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  // Throttle function
  throttle: (func: Function, limit: number) => {
    let inThrottle: boolean;
    return function executedFunction(...args: any[]) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
};

export default {
  animationPresets,
  scrollAnimations,
  hoverAnimations,
  pageTransitions,
  textAnimations,
  loadingAnimations,
  animationUtils,
  performanceUtils,
  FAITH_COLORS
}; 