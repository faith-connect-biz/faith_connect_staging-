import React, { useEffect, useState, useRef } from 'react';
import { useCountUp } from '@/hooks/useCountUp';

interface AnimatedStatProps {
  value: string;
  suffix?: string;
  prefix?: string;
  duration?: number;
  delay?: number;
  className?: string;
}

export const AnimatedStat: React.FC<AnimatedStatProps> = ({
  value,
  suffix = '',
  prefix = '',
  duration = 2000,
  delay = 0,
  className = ''
}) => {
  const [shouldStart, setShouldStart] = useState(false);
  const elementRef = useRef<HTMLSpanElement>(null);

  // Parse the value to extract the number
  const parseValue = (val: string): number => {
    // Handle different formats like "80+", "4.5/5", "50+", "200"
    const numStr = val.replace(/[^\d.]/g, '');
    const num = parseFloat(numStr);
    
    // Safety check: ensure the number is reasonable
    // For ratings, allow up to 5, for other stats allow up to 1000
    const maxValue = val.includes('/5') ? 5 : 1000;
    if (isNaN(num) || num < 0 || num > maxValue || !isFinite(num)) {
      return 0;
    }
    
    return num;
  };

  const targetNumber = parseValue(value);
  const { count } = useCountUp(targetNumber, {
    duration,
    startOnMount: shouldStart,
    delay
  });

  // Check if value contains decimal places
  const hasDecimal = value.includes('.');
  const decimalPlaces = hasDecimal ? 1 : 0;

  // Format the display value
  const formatValue = (num: number): string => {
    if (hasDecimal) {
      return num.toFixed(decimalPlaces);
    }
    return Math.round(num).toString();
  };

  // Add suffix/prefix back
  const formatFinalValue = (num: number): string => {
    const formatted = formatValue(num);
    
    // Handle special cases
    if (value.includes('+')) {
      return `${formatted}+`;
    }
    if (value.includes('/')) {
      const parts = value.split('/');
      if (parts.length === 2) {
        return `${formatted}/${parts[1]}`;
      }
    }
    if (value.includes('%')) {
      return `${formatted}%`;
    }
    
    return `${prefix}${formatted}${suffix}`;
  };

  useEffect(() => {
    // Use Intersection Observer to start animation when element is visible
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShouldStart(true);
            observer.disconnect(); // Stop observing once animation starts
          }
        });
      },
      { threshold: 0.1 } // Start when 10% of the element is visible
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <span ref={elementRef} className={className}>
      {formatFinalValue(count)}
    </span>
  );
};
