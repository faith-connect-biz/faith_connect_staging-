
import React, { useState, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageData {
  src: string;
  alt: string;
}

interface ImageCarouselProps {
  images: ImageData[];
  className?: string;
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({ images, className }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Remove the first image to avoid duplication
  const displayImages = images.slice(1);

  // Auto-scroll functionality
  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % displayImages.length);
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(interval);
  }, [displayImages.length, isAutoPlaying]);

  const toggleAutoPlay = () => {
    setIsAutoPlaying(!isAutoPlaying);
  };

  return (
    <div className={cn("relative w-full max-w-5xl mx-auto", className)}>
      {/* Main Carousel Container */}
      <div className="relative group">
        {/* Decorative Background Elements */}
        <div className="absolute -inset-4 bg-gradient-to-r from-fem-gold/10 via-transparent to-fem-terracotta/10 rounded-[2rem] blur-xl opacity-50" />
        <div className="absolute -inset-2 bg-gradient-to-br from-fem-gold/5 to-fem-terracotta/5 rounded-[1.5rem]" />
        
        {/* Main Image Container - More rectangular shape */}
        <div className="relative w-full h-[400px] rounded-[1.5rem] overflow-hidden shadow-2xl border border-white/10">
          {/* Dynamic Background Gradient Based on Current Image */}
          <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-transparent to-black/40 z-10" />
          
          <img
            src={displayImages[currentIndex].src}
            alt={displayImages[currentIndex].alt}
            className="w-full h-full object-cover transition-all duration-1000 ease-out"
            draggable={false}
          />

          {/* Auto-play Control */}
          <button
            onClick={toggleAutoPlay}
            className="absolute top-8 right-8 z-20 bg-black/20 hover:bg-black/40 backdrop-blur-xl rounded-full p-3 transition-all duration-300 hover:scale-110 border border-white/20 group/btn"
            aria-label={isAutoPlaying ? "Pause slideshow" : "Play slideshow"}
          >
            {isAutoPlaying ? (
              <Pause className="w-5 h-5 text-white group-hover/btn:text-fem-gold transition-colors" />
            ) : (
              <Play className="w-5 h-5 text-white group-hover/btn:text-fem-gold transition-colors" />
            )}
          </button>

          {/* Bottom Overlay with Quote/Message */}
          <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-8">
            <div className="max-w-4xl">
              <p className="text-white/90 text-lg font-mont font-medium italic mb-2">
                "A house of prayer for all nations - where faith meets purpose"
              </p>
              <p className="text-gray-300 text-sm font-mont">
                Pastor {currentIndex + 1} • FEM Family Church Leadership
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Thumbnail Strip with Better Spacing */}
      <div className="flex justify-center gap-6 mt-12">
        {displayImages.map((image, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={cn(
              "relative group/thumb transition-all duration-500",
              index === currentIndex 
                ? "scale-110" 
                : "opacity-60 hover:opacity-100 hover:scale-105"
            )}
          >
            <div className={cn(
              "relative w-24 h-24 rounded-2xl overflow-hidden border-3 transition-all duration-300",
              index === currentIndex 
                ? "border-fem-gold shadow-2xl shadow-fem-gold/25" 
                : "border-white/20 hover:border-fem-gold/50"
            )}>
              <img
                src={image.src}
                alt={image.alt}
                className="w-full h-full object-cover group-hover/thumb:scale-110 transition-transform duration-300"
              />
              {index === currentIndex && (
                <div className="absolute inset-0 bg-gradient-to-t from-fem-gold/30 to-transparent" />
              )}
            </div>
            
            {/* Active indicator */}
            {index === currentIndex && (
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-3 h-3 bg-fem-gold rounded-full shadow-lg" />
            )}
          </button>
        ))}
      </div>

      {/* Enhanced Progress Indicator */}
      <div className="flex justify-center gap-4 mt-10">
        {displayImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className="relative group/progress"
          >
            <div className={cn(
              "h-1.5 rounded-full transition-all duration-500 overflow-hidden",
              index === currentIndex 
                ? "w-16 bg-gradient-to-r from-fem-gold to-fem-terracotta shadow-lg" 
                : "w-4 bg-white/30 hover:bg-white/50 group-hover/progress:w-8"
            )}>
              {index === currentIndex && isAutoPlaying && (
                <div className="h-full bg-white/40 animate-pulse" />
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ImageCarousel;
