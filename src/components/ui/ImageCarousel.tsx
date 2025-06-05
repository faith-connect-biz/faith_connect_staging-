
import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';
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
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll functionality
  useEffect(() => {
    if (!isZoomed) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
      }, 4000); // Change image every 4 seconds

      return () => clearInterval(interval);
    }
  }, [images.length, isZoomed]);

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
    resetZoom();
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    resetZoom();
  };

  const resetZoom = () => {
    setZoomLevel(1);
    setPosition({ x: 0, y: 0 });
    setIsZoomed(false);
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.5, 3));
    setIsZoomed(true);
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(zoomLevel - 0.5, 1);
    setZoomLevel(newZoom);
    if (newZoom === 1) {
      setIsZoomed(false);
      setPosition({ x: 0, y: 0 });
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isZoomed) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && isZoomed) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      handleZoomIn();
    } else {
      handleZoomOut();
    }
  };

  const handleImageClick = (e: React.MouseEvent) => {
    if (!isZoomed) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Calculate zoom position to center on click point
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      setPosition({
        x: (centerX - x) * 1.5,
        y: (centerY - y) * 1.5
      });
      
      setZoomLevel(2);
      setIsZoomed(true);
    }
  };

  return (
    <div className={cn("relative w-full max-w-2xl mx-auto", className)}>
      {/* Main Image Container */}
      <div 
        ref={containerRef}
        className="relative aspect-square rounded-2xl overflow-hidden glass-modern shadow-2xl cursor-pointer"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <img
          ref={imageRef}
          src={images[currentIndex].src}
          alt={images[currentIndex].alt}
          className={cn(
            "w-full h-full object-cover transition-transform duration-300 ease-out",
            isZoomed ? "cursor-grab" : "cursor-zoom-in",
            isDragging ? "cursor-grabbing" : ""
          )}
          style={{
            transform: `scale(${zoomLevel}) translate(${position.x / zoomLevel}px, ${position.y / zoomLevel}px)`
          }}
          onClick={handleImageClick}
          draggable={false}
        />
        
        {/* Gradient overlay for better control visibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
        
        {/* Navigation Controls */}
        {!isZoomed && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full p-3 transition-all duration-200 hover:scale-110"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>
            
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full p-3 transition-all duration-200 hover:scale-110"
              aria-label="Next image"
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>
          </>
        )}

        {/* Zoom Controls */}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <button
            onClick={handleZoomIn}
            className="bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full p-2 transition-all duration-200 hover:scale-110"
            aria-label="Zoom in"
          >
            <ZoomIn className="w-5 h-5 text-white" />
          </button>
          
          <button
            onClick={handleZoomOut}
            className="bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full p-2 transition-all duration-200 hover:scale-110"
            aria-label="Zoom out"
          >
            <ZoomOut className="w-5 h-5 text-white" />
          </button>
          
          {isZoomed && (
            <button
              onClick={resetZoom}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full p-2 transition-all duration-200 hover:scale-110"
              aria-label="Reset zoom"
            >
              <RotateCw className="w-5 h-5 text-white" />
            </button>
          )}
        </div>

        {/* Zoom level indicator */}
        {isZoomed && (
          <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-md rounded-full px-4 py-2">
            <span className="text-white text-sm font-mont">{Math.round(zoomLevel * 100)}%</span>
          </div>
        )}
      </div>

      {/* Thumbnail Strip */}
      <div className="flex justify-center gap-3 mt-6">
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => {
              setCurrentIndex(index);
              resetZoom();
            }}
            className={cn(
              "relative w-16 h-16 rounded-lg overflow-hidden transition-all duration-300 hover:scale-110",
              index === currentIndex 
                ? "ring-2 ring-fem-gold shadow-lg" 
                : "opacity-60 hover:opacity-100"
            )}
          >
            <img
              src={image.src}
              alt={image.alt}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>

      {/* Progress Indicator */}
      <div className="flex justify-center gap-2 mt-4">
        {images.map((_, index) => (
          <div
            key={index}
            className={cn(
              "h-2 rounded-full transition-all duration-300",
              index === currentIndex 
                ? "w-8 bg-fem-gold" 
                : "w-2 bg-white/30"
            )}
          />
        ))}
      </div>
    </div>
  );
};

export default ImageCarousel;
