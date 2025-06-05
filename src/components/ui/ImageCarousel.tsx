import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
interface ImageData {
  src: string;
  alt: string;
}
interface ImageCarouselProps {
  images: ImageData[];
  className?: string;
}
const ImageCarousel: React.FC<ImageCarouselProps> = ({
  images,
  className
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Remove the first image to avoid duplication
  const displayImages = images.slice(1);

  // Auto-scroll functionality
  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % displayImages.length);
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(interval);
  }, [displayImages.length, isAutoPlaying]);
  return <div className={cn("relative w-full max-w-5xl mx-auto", className)}>
      {/* Main Carousel Container */}
      <div className="relative group">
        {/* Decorative Background Elements */}
        <div className="absolute -inset-4 bg-gradient-to-r from-fem-gold/10 via-transparent to-fem-terracotta/10 rounded-[2rem] blur-xl opacity-50" />
        <div className="absolute -inset-2 bg-gradient-to-br from-fem-gold/5 to-fem-terracotta/5 rounded-[1.5rem]" />
        
        {/* Main Image Container - More rectangular shape */}
        <div className="relative w-full h-[400px] rounded-[1.5rem] overflow-hidden shadow-2xl border border-white/10">
          {/* Dynamic Background Gradient Based on Current Image */}
          <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-transparent to-black/40 z-10" />
          
          <img src={displayImages[currentIndex].src} alt={displayImages[currentIndex].alt} className="w-full h-full object-cover transition-all duration-1000 ease-out" draggable={false} />
        </div>
      </div>

      {/* Enhanced Thumbnail Strip with Better Spacing */}
      

      {/* Enhanced Progress Indicator */}
      <div className="flex justify-center gap-4 mt-10">
        {displayImages.map((_, index) => <button key={index} onClick={() => setCurrentIndex(index)} className="relative group/progress">
            <div className={cn("h-1.5 rounded-full transition-all duration-500 overflow-hidden", index === currentIndex ? "w-16 bg-gradient-to-r from-fem-gold to-fem-terracotta shadow-lg" : "w-4 bg-white/30 hover:bg-white/50 group-hover/progress:w-8")}>
              {index === currentIndex && isAutoPlaying && <div className="h-full bg-white/40 animate-pulse" />}
            </div>
          </button>)}
      </div>
    </div>;
};
export default ImageCarousel;