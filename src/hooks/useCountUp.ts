import { useState, useEffect, useRef } from 'react';

interface UseCountUpOptions {
  duration?: number;
  startOnMount?: boolean;
  delay?: number;
}

export const useCountUp = (
  end: number,
  options: UseCountUpOptions = {}
) => {
  const { duration = 2000, startOnMount = true, delay = 0 } = options;
  const [count, setCount] = useState(0);
  const [isCounting, setIsCounting] = useState(false);
  const frameRef = useRef<number>();
  const startTimeRef = useRef<number>();

  const startCounting = () => {
    if (isCounting) return;
    
    setIsCounting(true);
    setCount(0);
    
    const startCountingAfterDelay = () => {
      startTimeRef.current = Date.now();
      
      const animate = (currentTime: number) => {
        if (!startTimeRef.current) return;
        
        const elapsed = currentTime - startTimeRef.current;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function for smooth animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const currentCount = easeOutQuart * end;
        
        setCount(currentCount);
        
        if (progress < 1) {
          frameRef.current = requestAnimationFrame(animate);
        } else {
          setCount(end);
          setIsCounting(false);
        }
      };
      
      frameRef.current = requestAnimationFrame(animate);
    };
    
    if (delay > 0) {
      setTimeout(startCountingAfterDelay, delay);
    } else {
      startCountingAfterDelay();
    }
  };

  const reset = () => {
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
    }
    setCount(0);
    setIsCounting(false);
  };

  useEffect(() => {
    if (startOnMount) {
      startCounting();
    }
    
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [end, startOnMount, delay, duration]);

  return { count, isCounting, startCounting, reset };
};
