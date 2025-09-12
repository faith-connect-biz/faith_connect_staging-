import React, { useState, useEffect, useMemo, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Package, Settings, Star, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { useBusiness } from "@/contexts/BusinessContext";

export const ProductServiceCarousel = () => {
  const { services, products } = useBusiness();
  const [scrollPosition, setScrollPosition] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const [itemWidth, setItemWidth] = useState(320); // Default width, will be calculated

  const scrollLeft = () => {
    if (containerRef.current) {
      const gap = 24; // gap-6 = 24px
      const scrollAmount = itemWidth + gap;
      
      containerRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (containerRef.current) {
      const gap = 24; // gap-6 = 24px
      const scrollAmount = itemWidth + gap;
      
      containerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleScroll = () => {
    if (containerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
      setScrollPosition(scrollLeft);
      setCanScrollLeft(scrollLeft > 10); // Add small threshold to prevent flickering
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  // Debounced scroll handler to improve performance
  const debouncedHandleScroll = useMemo(() => {
    let timeoutId: NodeJS.Timeout;
    return () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleScroll, 10);
    };
  }, []);

  // Calculate item width when component mounts or items change
  useEffect(() => {
    if (containerRef.current) {
      const firstItem = containerRef.current.querySelector('.carousel-item');
      if (firstItem) {
        const rect = firstItem.getBoundingClientRect();
        setItemWidth(rect.width);
      }
    }
  }, [services, products]);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', debouncedHandleScroll);
      handleScroll(); // Initial call
      
      return () => {
        container.removeEventListener('scroll', debouncedHandleScroll);
      };
    }
  }, [services, products, debouncedHandleScroll]);

  // Combine and shuffle products and services - memoized to prevent re-shuffling
  const shuffledItems = useMemo(() => {
    const allItems = [...(services || []), ...(products || [])];
    return allItems.sort(() => Math.random() - 0.5).slice(0, 12);
  }, [services, products]);



  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-fem-navy mb-4">
            Some Products & Services
          </h2>
          <p className="text-fem-darkgray max-w-2xl mx-auto">
            Discover quality products and professional services from our community businesses.
          </p>
          

        </div>
        
        {shuffledItems.length > 0 ? (
          <>
            {/* Carousel Section */}
            <div className="relative">
              {/* Left Scroll Button */}
              <button
                onClick={scrollLeft}
                className={`absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white/90 hover:bg-white border border-gray-200 rounded-full p-2 shadow-lg transition-all duration-200 hover:shadow-xl ${
                  canScrollLeft ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>

              {/* Right Scroll Button */}
              <button
                onClick={scrollRight}
                className={`absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white/90 hover:bg-white border border-gray-200 rounded-full p-2 shadow-lg transition-all duration-200 hover:shadow-xl ${
                  canScrollRight ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
              >
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>

              {/* Scrollable Container */}
              <div 
                ref={containerRef}
                className="flex gap-6 overflow-x-auto scrollbar-hide pb-4 px-2"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {shuffledItems.map((item, index) => {
                  // Check if item has the expected structure
                  if (!item || typeof item !== 'object') {
                    return null;
                  }

                  // Use 'name' property which exists on both services and products
                  const name = (item as any).name || 'Unknown';
                  const description = (item as any).description || '';
                  const price = (item as any).price_range || (item as any).price || '';
                  const rating = (item as any).rating || 0;
                  const businessName = (item as any).business?.business_name || 'Unknown Business';
                  
                  // Extract business ID - handle both object and string formats
                  const businessId = (item as any).business?.id || (item as any).business || null;
                  
                  // Debug logging to help troubleshoot linking issues
                  if (process.env.NODE_ENV === 'development') {
                    console.log('Carousel Item Debug:', {
                      name,
                      businessId,
                      business: (item as any).business,
                      itemKeys: Object.keys(item as any)
                    });
                  }
                  
                  // Check for different image properties and filter out placeholder URLs
                  const getImageUrl = () => {
                    const serviceImage = (item as any).service_image_url && !(item as any).service_image_url.includes('via.placeholder.com') ? (item as any).service_image_url : null;
                    const productImage = (item as any).product_image_url && !(item as any).product_image_url.includes('via.placeholder.com') ? (item as any).product_image_url : null;
                    const generalImage = (item as any).image && !(item as any).image.includes('via.placeholder.com') ? (item as any).image : null;
                    const images = (item as any).images?.filter((img: string) => !img.includes('via.placeholder.com')) || [];
                    
                    return serviceImage || productImage || generalImage || images[0] || null;
                  };
                  
                  const imageUrl = getImageUrl();
                  
                  // Determine if it's a service or product based on available properties
                  const isService = 'duration' in item || 'service_image_url' in item;
                  const isProduct = !isService;
                  

                  
                  return (
                    <div key={`${index}-${name}`} className="carousel-item flex-shrink-0 w-80">
                                              {businessId ? (
                         <Link 
                           to={`/business/${businessId}`}
                           className="block"
                         >
                           <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer h-full">
                             <CardContent className="p-4 h-full flex flex-col">
                               {/* Image */}
                               <div className="w-full h-48 mb-4 rounded-lg overflow-hidden bg-gray-100">
                                 {imageUrl ? (
                                   <img 
                                     src={imageUrl} 
                                     alt={name}
                                     className="w-full h-full object-cover"
                                     onError={(e) => {
                                       const target = e.target as HTMLImageElement;
                                       target.style.display = 'none';
                                       target.nextElementSibling?.classList.remove('hidden');
                                     }}
                                   />
                                 ) : null}
                                 <div className={`w-full h-full flex items-center justify-center ${imageUrl ? 'hidden' : ''}`}>
                                   {isService ? (
                                     <Settings className="w-16 h-16 text-gray-400" />
                                   ) : (
                                     <Package className="w-16 h-16 text-gray-400" />
                                   )}
                                 </div>
                               </div>

                               {/* Content */}
                               <div className="flex-grow">
                                 <h3 className="font-semibold text-fem-navy mb-2 line-clamp-2">
                                   {name}
                                 </h3>
                                 
                                 {description && (
                                   <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                     {description}
                                   </p>
                                 )}

                                 {/* Business Info */}
                                 <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                                   <MapPin className="w-4 h-4" />
                                   <span>{businessName}</span>
                                 </div>

                                 {/* Rating and Price */}
                                 <div className="flex items-center justify-between">
                                   <div className="flex items-center gap-1">
                                     <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                     <span className="text-sm text-gray-600">{rating.toFixed(1)}</span>
                                   </div>
                                   {price && (
                                     <span className="text-lg font-semibold text-fem-terracotta">
                                       {isProduct ? `KSh ${price}` : price}
                                     </span>
                                   )}
                                 </div>
                               </div>
                             </CardContent>
                           </Card>
                         </Link>
                       ) : (
                         <div className="block">
                           <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer h-full">
                             <CardContent className="p-4 h-full flex flex-col">
                               {/* Image */}
                               <div className="w-full h-48 mb-4 rounded-lg overflow-hidden bg-gray-100">
                                 {imageUrl ? (
                                   <img 
                                     src={imageUrl} 
                                     alt={name}
                                     className="w-full h-full object-cover"
                                     onError={(e) => {
                                       const target = e.target as HTMLImageElement;
                                       target.style.display = 'none';
                                       target.nextElementSibling?.classList.remove('hidden');
                                     }}
                                   />
                                 ) : null}
                                 <div className={`w-full h-full flex items-center justify-center ${imageUrl ? 'hidden' : ''}`}>
                                   {isService ? (
                                     <Settings className="w-16 h-16 text-gray-400" />
                                   ) : (
                                     <Package className="w-16 h-16 text-gray-400" />
                                   )}
                                 </div>
                               </div>

                               {/* Content */}
                               <div className="flex-grow">
                                 <h3 className="font-semibold text-fem-navy mb-2 line-clamp-2">
                                   {name}
                                 </h3>
                                 
                                 {description && (
                                   <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                     {description}
                                   </p>
                                 )}

                                 {/* Business Info */}
                                 <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                                   <MapPin className="w-4 h-4" />
                                   <span>{businessName}</span>
                                 </div>

                                 {/* Rating and Price */}
                                 <div className="flex items-center justify-between">
                                   <div className="flex items-center gap-1">
                                     <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                     <span className="text-sm text-gray-600">{rating.toFixed(1)}</span>
                                   </div>
                                   {price && (
                                     <span className="text-lg font-semibold text-fem-terracotta">
                                       {isProduct ? `KSh ${price}` : price}
                                     </span>
                                   )}
                                 </div>
                               </div>
                             </CardContent>
                           </Card>
                         </div>
                       )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* View All Button */}
            <div className="text-center mt-8">
              <Link to="/directory">
                <Button className="bg-fem-terracotta hover:bg-fem-terracotta/90 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                  View All Products & Services
                </Button>
              </Link>
            </div>
          </>
        ) : (
          <div className="text-center">
            <p className="text-gray-500 mb-4">
              {services?.length === 0 && products?.length === 0 
                ? "No products or services available yet. Be the first to add yours!"
                : "Loading products and services..."}
            </p>
            <Link to="/directory">
              <Button className="bg-fem-terracotta hover:bg-fem-terracotta/90 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                Browse Directory
              </Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};
