import React, { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ScrollToTop: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (!isVisible) return null;

  return (
    <Button
      onClick={scrollToTop}
      className="fixed bottom-6 left-6 z-40 bg-fem-navy hover:bg-fem-navy/90 text-white rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-all duration-300 group"
      size="icon"
      title="Scroll to top"
    >
      <ChevronUp className="w-6 h-6 group-hover:scale-110 transition-transform duration-200" />
    </Button>
  );
};

export default ScrollToTop;
