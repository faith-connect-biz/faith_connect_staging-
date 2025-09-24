import React, { useState, useEffect, useMemo, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Package, Settings, Star, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { useBusiness } from "@/contexts/BusinessContext";

export const ProductServiceCarousel = () => {
  const { services, products, fetchServices, fetchProducts, isLoadingServices, isLoadingProducts } = useBusiness();
  const [scrollPosition, setScrollPosition] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const [itemWidth, setItemWidth] = useState(320); // Default width, will be calculated
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);

  // Combine and filter items, then shuffle - memoized to prevent re-shuffling
  const shuffledItems = useMemo(() => {
    const allItems = [...(services || []), ...(products || [])];
    
    // Debug logging to see what data we have
    console.log('ProductServiceCarousel - All items:', {
      servicesCount: services?.length || 0,
      productsCount: products?.length || 0,
      totalItems: allItems.length,
      services: services?.slice(0, 2), // Log first 2 services
      products: products?.slice(0, 2)  // Log first 2 products
    });
    
    // Filter to include items with or without images (we'll show placeholder for items without images)
    const validItems = allItems.filter(item => 
      item && 
      typeof item === 'object' && 
      (item.name || item.service_name || item.product_name) // Must have a name
    );
    
    console.log('ProductServiceCarousel - Valid items after filtering:', validItems.length);
    
    return validItems.sort(() => Math.random() - 0.5).slice(0, 12);
  }, [services, products]);

  // Fetch services and products when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([
          fetchServices({ limit: 50 }),
          fetchProducts({ limit: 50 })
        ]);
      } catch (error) {
        console.error('Error fetching services and products:', error);
      }
    };

    fetchData();
  }, [fetchServices, fetchProducts]);

  // Continuous auto-scroll effect
  useEffect(() => {
    if (!isAutoScrolling || shuffledItems.length <= 3) return;

    const interval = setInterval(() => {
      if (containerRef.current) {
        const container = containerRef.current;
        const scrollAmount = itemWidth + 24; // item width + gap
        const maxScroll = container.scrollWidth - container.clientWidth;
        
        setScrollPosition(prev => {
          const newPosition = prev + scrollAmount;
          if (newPosition >= maxScroll) {
            // Reset to beginning for seamless loop
            container.scrollTo({ left: 0, behavior: 'instant' });
            return 0;
          }
          return newPosition;
        });
        
        container.scrollTo({ 
          left: scrollPosition + scrollAmount, 
          behavior: 'smooth' 
        });
      }
    }, 3000); // Auto-scroll every 3 seconds

    return () => clearInterval(interval);
  }, [isAutoScrolling, shuffledItems.length, itemWidth, scrollPosition]);

  // Pause auto-scroll on hover
  const handleMouseEnter = () => setIsAutoScrolling(false);
  const handleMouseLeave = () => setIsAutoScrolling(true);

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

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-fem-navy mb-3 sm:mb-4">
            Some Products & Services
          </h2>
          <p className="text-sm sm:text-base text-fem-darkgray max-w-2xl mx-auto px-4">
            Discover quality products and professional services from our community businesses.
          </p>
        </div>
        
        {(isLoadingServices || isLoadingProducts) ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fem-terracotta mx-auto mb-4"></div>
            <p className="text-gray-500">Loading products and services...</p>
          </div>
        ) : shuffledItems.length > 0 ? (
          <>
            {/* Carousel Section */}
            <div className="relative">
              {/* Left Scroll Button */}
              <button
                onClick={scrollLeft}
                className={`absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white/90 hover:bg-white border border-gray-200 rounded-full p-1.5 sm:p-2 shadow-lg transition-all duration-200 hover:shadow-xl ${
                  canScrollLeft ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
              </button>

              {/* Right Scroll Button */}
              <button
                onClick={scrollRight}
                className={`absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white/90 hover:bg-white border border-gray-200 rounded-full p-1.5 sm:p-2 shadow-lg transition-all duration-200 hover:shadow-xl ${
                  canScrollRight ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
              >
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
              </button>

              {/* Scrollable Container */}
              <div 
                ref={containerRef}
                className="flex gap-4 sm:gap-6 overflow-x-auto scrollbar-hide pb-4 px-2"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                {shuffledItems.map((item, index) => {
                  // Check if item has the expected structure
                  if (!item || typeof item !== 'object') {
                    return null;
                  }

                  // Handle different name properties for services and products
                  const name = (item as any).name || (item as any).service_name || (item as any).product_name || 'Unknown';
                  const description = (item as any).description || (item as any).service_description || (item as any).product_description || '';
                  const price = (item as any).price_range || (item as any).price || (item as any).service_price || (item as any).product_price || '';
                  const rating = (item as any).rating || (item as any).service_rating || (item as any).product_rating || 0;
                  const businessName = (item as any).business?.business_name || (item as any).business_name || 'Unknown Business';
                  
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
                    const serviceImage = (item as any).service_image_url && 
                      !(item as any).service_image_url.includes('via.placeholder.com') && 
                      !(item as any).service_image_url.includes('placeholder') ? (item as any).service_image_url : null;
                    
                    const productImage = (item as any).product_image_url && 
                      !(item as any).product_image_url.includes('via.placeholder.com') && 
                      !(item as any).product_image_url.includes('placeholder') ? (item as any).product_image_url : null;
                    
                    const generalImage = (item as any).image_url && 
                      !(item as any).image_url.includes('via.placeholder.com') && 
                      !(item as any).image_url.includes('placeholder') ? (item as any).image_url : null;
                    
                    const image = (item as any).image && 
                      !(item as any).image.includes('via.placeholder.com') && 
                      !(item as any).image.includes('placeholder') ? (item as any).image : null;
                    
                    const images = (item as any).images?.filter((img: string) => 
                      !img.includes('via.placeholder.com') && 
                      !img.includes('placeholder')
                    ) || [];
                    
                    return serviceImage || productImage || generalImage || image || images[0] || null;
                  };
                  
                  const imageUrl = getImageUrl();
                  
                  // Determine if it's a service or product based on available properties
                  const isService = 'duration' in item || 'service_image_url' in item;
                  const isProduct = !isService;
                  

                  
                  return (
                    <div key={`${index}-${name}`} className="carousel-item flex-shrink-0 w-64 sm:w-72 md:w-80">
                                              {businessId ? (
                         <Link 
                           to={`/business/${businessId}`}
                           className="block h-full"
                         >
                           <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer h-72 sm:h-80 md:h-96">
                             <CardContent className="p-3 sm:p-4 h-full flex flex-col">
                               {/* Image */}
                               <div className="w-full h-32 sm:h-40 md:h-48 mb-3 sm:mb-4 rounded-lg overflow-hidden bg-gray-100">
                                 {imageUrl ? (
                                   <img 
                                     src={imageUrl} 
                                     alt={name}
                                     className="w-full h-full object-cover"
                                     loading="lazy"
                                     decoding="async"
                                     onError={(e) => {
                                       const target = e.target as HTMLImageElement;
                                       target.style.display = 'none';
                                       target.nextElementSibling?.classList.remove('hidden');
                                     }}
                                   />
                                 ) : null}
                                 <div className={`w-full h-full flex items-center justify-center ${imageUrl ? 'hidden' : ''}`}>
                                   {isService ? (
                                     <Settings className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 text-gray-400" />
                                   ) : (
                                     <Package className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 text-gray-400" />
                                   )}
                                 </div>
                               </div>

                               {/* Content */}
                               <div className="flex-grow flex flex-col justify-between">
                                 <div>
                                   <h3 className="font-semibold text-fem-navy mb-1 sm:mb-2 line-clamp-2 text-sm sm:text-base">
                                     {name}
                                   </h3>
                                   
                                   {description && (
                                     <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3 line-clamp-2">
                                       {description}
                                     </p>
                                   )}

                                   {/* Business Info */}
                                   <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-500 mb-2 sm:mb-3">
                                     <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                                     <span className="truncate">{businessName}</span>
                                   </div>
                                 </div>

                                 {/* Rating and Price - Always at bottom */}
                                 <div className="flex items-center justify-between mt-auto">
                                   <div className="flex items-center gap-1">
                                     <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-current" />
                                     <span className="text-xs sm:text-sm text-gray-600">{rating.toFixed(1)}</span>
                                   </div>
                                   {price && (
                                     <span className="text-sm sm:text-lg font-semibold text-fem-terracotta">
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
                           <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer h-72 sm:h-80 md:h-96">
                             <CardContent className="p-3 sm:p-4 h-full flex flex-col">
                               {/* Image */}
                               <div className="w-full h-32 sm:h-40 md:h-48 mb-3 sm:mb-4 rounded-lg overflow-hidden bg-gray-100">
                                 {imageUrl ? (
                                   <img 
                                     src={imageUrl} 
                                     alt={name}
                                     className="w-full h-full object-cover"
                                     loading="lazy"
                                     decoding="async"
                                     onError={(e) => {
                                       const target = e.target as HTMLImageElement;
                                       target.style.display = 'none';
                                       target.nextElementSibling?.classList.remove('hidden');
                                     }}
                                   />
                                 ) : null}
                                 <div className={`w-full h-full flex items-center justify-center ${imageUrl ? 'hidden' : ''}`}>
                                   {isService ? (
                                     <Settings className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 text-gray-400" />
                                   ) : (
                                     <Package className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 text-gray-400" />
                                   )}
                                 </div>
                               </div>

                               {/* Content */}
                               <div className="flex-grow flex flex-col justify-between">
                                 <div>
                                   <h3 className="font-semibold text-fem-navy mb-1 sm:mb-2 line-clamp-2 text-sm sm:text-base">
                                     {name}
                                   </h3>
                                   
                                   {description && (
                                     <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3 line-clamp-2">
                                       {description}
                                     </p>
                                   )}

                                   {/* Business Info */}
                                   <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-500 mb-2 sm:mb-3">
                                     <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                                     <span className="truncate">{businessName}</span>
                                   </div>
                                 </div>

                                 {/* Rating and Price - Always at bottom */}
                                 <div className="flex items-center justify-between mt-auto">
                                   <div className="flex items-center gap-1">
                                     <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-current" />
                                     <span className="text-xs sm:text-sm text-gray-600">{rating.toFixed(1)}</span>
                                   </div>
                                   {price && (
                                     <span className="text-sm sm:text-lg font-semibold text-fem-terracotta">
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
            <div className="text-center mt-6 sm:mt-8">
              <Link to="/directory">
                <Button className="bg-gradient-to-r from-fem-gold to-fem-terracotta hover:from-fem-gold/90 hover:to-fem-terracotta/90 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm sm:text-base">
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
                : `Found ${services?.length || 0} services and ${products?.length || 0} products, but none are ready to display.`}
            </p>
            <Link to="/directory">
              <Button className="bg-gradient-to-r from-fem-gold to-fem-terracotta hover:from-fem-gold/90 hover:to-fem-terracotta/90 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm sm:text-base">
                Browse Directory
              </Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};
