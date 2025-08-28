
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

  // Handle empty images array
  if (!images || images.length === 0) {
    return (
      <div className={cn("relative w-full max-w-5xl mx-auto flex items-center justify-center h-[400px] bg-gray-100 rounded-[1.5rem]", className)}>
        <p className="text-gray-500">No images available</p>
      </div>
    );
  }

  // Remove the first image to avoid duplication
  const displayImages = images.length > 1 ? images.slice(1) : images;

  // Auto-scroll functionality
  useEffect(() => {
    if (!isAutoPlaying || displayImages.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % displayImages.length);
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(interval);
  }, [displayImages.length, isAutoPlaying]);

  // Reset index if it's out of bounds
  useEffect(() => {
    if (currentIndex >= displayImages.length) {
      setCurrentIndex(0);
    }
  }, [currentIndex, displayImages.length]);

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
          
          {displayImages[currentIndex] && (
            <img 
              src={displayImages[currentIndex].src} 
              alt={displayImages[currentIndex].alt} 
              className="w-full h-full object-cover transition-all duration-1000 ease-out" 
              draggable={false}
              onError={(e) => {
                console.error('Image failed to load:', displayImages[currentIndex].src);
                e.currentTarget.src = '/placeholder.svg';
              }}
            />
          )}
        </div>

        {/* Navigation Arrows */}
        {displayImages.length > 1 && (
          <>
            <button
              onClick={() => setCurrentIndex(prev => prev === 0 ? displayImages.length - 1 : prev - 1)}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 rounded-full p-2 transition-all duration-200 z-20"
              aria-label="Previous image"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => setCurrentIndex(prev => (prev + 1) % displayImages.length)}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 rounded-full p-2 transition-all duration-200 z-20"
              aria-label="Next image"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Thumbnail Strip */}
      {displayImages.length > 1 && (
        <div className="flex justify-center gap-3 mt-6 px-4">
          {displayImages.map((image, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                "flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-300",
                index === currentIndex 
                  ? "border-fem-gold shadow-lg scale-110" 
                  : "border-white/30 hover:border-white/50 opacity-70 hover:opacity-100"
              )}
            >
              <img
                src={image.src}
                alt={image.alt}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder.svg';
                }}
              />
            </button>
          ))}
        </div>
      )}

      {/* Enhanced Progress Indicator */}
      {displayImages.length > 1 && (
        <div className="flex justify-center gap-4 mt-6">
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
      )}
    </div>
  );
};

export default ImageCarousel;
