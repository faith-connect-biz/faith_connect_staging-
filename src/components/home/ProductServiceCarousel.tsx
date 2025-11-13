import React, { useState, useEffect, useMemo, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Package,
  Settings,
  Star,
  MapPin,
  Building2,
  Heart,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useBusiness } from "@/contexts/BusinessContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";

type AnyRecord = Record<string, unknown>;

const asRecord = (value: unknown): AnyRecord =>
  value && typeof value === "object" ? (value as AnyRecord) : {};

const extractImageUrl = (item: AnyRecord): string | null => {
  const serviceImageValue = item?.service_image_url;
  const serviceImage =
    typeof serviceImageValue === "string" &&
    !serviceImageValue.includes("via.placeholder.com") &&
    !serviceImageValue.toLowerCase().includes("placeholder")
      ? serviceImageValue
      : null;

  const productImageValue = item?.product_image_url;
  const productImage =
    typeof productImageValue === "string" &&
    !productImageValue.includes("via.placeholder.com") &&
    !productImageValue.toLowerCase().includes("placeholder")
      ? productImageValue
      : null;

  const generalImageValue = item?.image_url;
  const generalImage =
    typeof generalImageValue === "string" &&
    !generalImageValue.includes("via.placeholder.com") &&
    !generalImageValue.toLowerCase().includes("placeholder")
      ? generalImageValue
      : null;

  const imageValue = item?.image;
  const fallbackImage =
    typeof imageValue === "string" &&
    !imageValue.includes("via.placeholder.com") &&
    !imageValue.toLowerCase().includes("placeholder")
      ? imageValue
      : null;

  const imagesValue = item?.images;
  const images = Array.isArray(imagesValue)
    ? imagesValue.filter(
        (img): img is string =>
          typeof img === "string" &&
          !img.includes("via.placeholder.com") &&
          !img.toLowerCase().includes("placeholder")
      )
    : [];

  return serviceImage || productImage || generalImage || fallbackImage || images[0] || null;
};

export const ProductServiceCarousel = () => {
  const {
    businesses,
    services,
    products,
    fetchBusinesses,
    fetchServices,
    fetchProducts,
    isLoadingBusinesses,
    isLoadingServices,
    isLoadingProducts
  } = useBusiness();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [scrollPosition, setScrollPosition] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const [itemWidth, setItemWidth] = useState(320); // Default width, will be calculated
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);

  const handleFavoriteClick = (
    event: React.MouseEvent<HTMLButtonElement>,
    _businessId?: string | null
  ) => {
    event.preventDefault();
    event.stopPropagation();

    if (!isAuthenticated) {
      localStorage.setItem("open_login_modal", "true");
      toast({
        title: "Sign in required",
        description: "Please sign in to save favourites.",
      });
      return;
    }

    toast({
      title: "Favorites coming soon",
      description: "We’re polishing this feature. Stay tuned!",
    });
  };

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
    const validItems = allItems.filter(item => {
      if (!item || typeof item !== "object") {
        return false;
      }

      const candidate = item as any;
      const hasName = candidate.name || candidate.service_name || candidate.product_name;
      if (!hasName) {
        return false;
      }

      return !!extractImageUrl(candidate);
    });
    
    console.log('ProductServiceCarousel - Valid items after filtering:', validItems.length);
    
    return validItems.sort(() => Math.random() - 0.5).slice(0, 12);
  }, [services, products]);

  // Fetch services and products when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([
          fetchServices({ limit: 50 }),
          fetchProducts({ limit: 50 }),
          fetchBusinesses({ limit: 12 })
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

  const highlightedBusinesses = useMemo(() => {
    if (!businesses || businesses.length === 0) {
      return [];
    }

    const validBusinesses = businesses.filter(
      (business) => business && typeof business === "object"
    );

    // Shuffle using Fisher–Yates to ensure we pick a random subset on each data refresh
    const shuffled = [...validBusinesses];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled.slice(0, 6);
  }, [businesses]);

  return (
    <>
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
                  const candidate = asRecord(item);
                  const name =
                    (candidate.name as string) ||
                    (candidate.service_name as string) ||
                    (candidate.product_name as string) ||
                    "Community Offering";
                  const description =
                    (candidate.description as string) ||
                    (candidate.service_description as string) ||
                    (candidate.product_description as string) ||
                    "";
                  const price =
                    (candidate.price_range as string) ||
                    candidate.price ||
                    candidate.service_price ||
                    candidate.product_price ||
                    "";
                  const rating =
                    candidate.rating || candidate.service_rating || candidate.product_rating || 0;
                  const businessRef = asRecord(candidate.business);
                  const businessName =
                    (businessRef.business_name as string) ||
                    (candidate.business_name as string) ||
                    "Faith Connect Business";
                  
                  // Extract business ID - handle both object and string formats
                  const businessId =
                    (businessRef.id as string) ||
                    (typeof candidate.business === "string" ? candidate.business : null);
                  
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
                  const imageUrl = extractImageUrl(candidate);
                  
                  // Determine if it's a service or product based on available properties
                  const isService = "duration" in candidate || "service_image_url" in candidate;
                  const isProduct = !isService;
                  

                  
                  const businessData = candidate;
                  const businessDetails = asRecord(businessData.business);
                  const businessLogoValue = businessDetails.business_logo_url;
                  const logoUrl =
                    (typeof businessLogoValue === "string" && businessLogoValue) ||
                    (typeof businessDetails.logo_url === "string" && businessDetails.logo_url) ||
                    extractImageUrl(businessData);
                  const destination = businessId ? `/business/${businessId}` : "/directory";
                  const isServiceCard =
                    Boolean((businessData.duration as unknown) || businessData.service_image_url);
                  const tagLabel = businessData.is_featured
                    ? "Featured"
                    : isServiceCard
                    ? "Top Service"
                    : "Popular";
                  const ratingValue = Number(rating) || 4.8;
                  const priceLabel =
                    (typeof price === "string" && price.trim().length > 0 && price) ||
                    (typeof price === "number" && `KSh ${price.toLocaleString()}`) ||
                    "Contact for quote";
                  const categoryRecord = asRecord(businessDetails.category);
                  const categoryDetailsRecord = asRecord(businessData.category_details);
                  const categoryName =
                    (typeof categoryRecord.name === "string" && categoryRecord.name) ||
                    (typeof businessDetails.category === "string" && businessDetails.category) ||
                    (typeof businessData.category === "string" && businessData.category) ||
                    (typeof categoryDetailsRecord.name === "string" && categoryDetailsRecord.name) ||
                    null;
                  const cityCandidates = [
                    businessDetails.city,
                    businessDetails.county,
                    businessData.city,
                    businessData.county,
                  ];
                  const cityName = cityCandidates.find(
                    (value): value is string =>
                      typeof value === "string" && value.trim().length > 0
                  );
                  const featureChips = [
                    categoryName ? String(categoryName) : null,
                    cityName ? String(cityName) : null,
                    isServiceCard ? "Trusted Expert" : "Quality Assured",
                  ].filter(Boolean) as string[];
                  
                  const thumbnailUrl = logoUrl || (typeof imageUrl === "string" ? imageUrl : null);
                  return (
                    <div
                      key={`${index}-${name}`}
                      className="carousel-item flex-shrink-0 w-64 sm:w-72 md:w-80"
                    >
                      <Link to={destination} className="block h-full">
                        <Card className="group flex h-full flex-col overflow-hidden rounded-3xl border-0 shadow-lg transition-all duration-300 hover:shadow-2xl">
                          <div className="relative h-44 w-full overflow-hidden">
                            {thumbnailUrl ? (
                              <img
                                src={thumbnailUrl}
                                alt={name}
                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = "none";
                                }}
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-gradient-to-r from-fem-gold/30 to-fem-terracotta/30">
                                {isServiceCard ? (
                                  <Settings className="h-10 w-10 text-white/70" />
                                ) : (
                                  <Package className="h-10 w-10 text-white/70" />
                                )}
                              </div>
                            )}
                            <div className="absolute inset-x-0 top-0 flex items-start justify-between p-4">
                              <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-fem-terracotta shadow">
                                {tagLabel}
                              </span>
                              <button
                                type="button"
                                onClick={(event) => handleFavoriteClick(event, businessId)}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-fem-terracotta shadow transition-transform duration-200 hover:scale-105"
                                aria-label="Save to favourites"
                              >
                                <Heart className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                          <CardContent className="flex flex-1 flex-col space-y-4 p-6">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-fem-navy line-clamp-2">
                                  {name}
                                </h3>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <MapPin className="h-4 w-4 text-fem-terracotta" />
                                <span className="truncate">
                                  {businessName || "Faith Connect"}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <Star className="h-4 w-4 text-fem-gold" />
                                <span>{ratingValue.toFixed(1)}</span>
                                <span className="text-gray-400">• {priceLabel}</span>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              {featureChips.slice(0, 3).map((chip) => (
                                <span
                                  key={`${businessId || index}-${chip}`}
                                  className="rounded-full bg-fem-gold/10 px-3 py-1 text-xs font-medium text-fem-terracotta"
                                >
                                  {chip}
                                </span>
                              ))}
                            </div>

                            <div className="mt-auto inline-flex items-center justify-center rounded-full bg-gradient-to-r from-fem-gold to-fem-terracotta px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-[1.02]">
                              See Details
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
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
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-fem-navy mb-3 sm:mb-4">
              Some Businesses
            </h2>
            <p className="text-sm sm:text-base text-fem-darkgray max-w-2xl mx-auto px-4">
              Explore highlighted members from our faith-based business community.
            </p>
          </div>
          {isLoadingBusinesses && highlightedBusinesses.length === 0 ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fem-terracotta mx-auto mb-4"></div>
              <p className="text-gray-500">Loading businesses...</p>
            </div>
          ) : highlightedBusinesses.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {highlightedBusinesses.map((business) => {
                const businessData = business as any;
                const logoUrl =
                  businessData?.business_logo_url ||
                  businessData?.logo_url ||
                  businessData?.image_url ||
                  null;

                return (
                  <Card
                    key={business.id}
                  className="relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 group rounded-3xl"
                >
                  <div
                    className="absolute inset-0 bg-cover bg-center transform group-hover:scale-105 transition-transform duration-500"
                    style={{
                      backgroundImage: logoUrl
                        ? `url(${logoUrl})`
                        : "linear-gradient(135deg, rgba(255,184,0,0.15), rgba(247,127,0,0.2))",
                      filter: logoUrl ? "blur(6px)" : "none",
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-white/90 via-white/88 to-white/94 group-hover:from-white/85 group-hover:via-white/82 group-hover:to-white/88 transition-colors duration-300" />
                  <CardContent className="relative flex flex-col h-full p-8">
                    <div className="mx-auto mb-6">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-fem-gold/20 via-white to-fem-terracotta/10 border border-white/60 shadow-lg flex items-center justify-center backdrop-blur-sm">
                        {logoUrl ? (
                          <img
                            src={logoUrl}
                            alt={business.business_name}
                            className="w-14 h-14 object-contain rounded-full"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = "none";
                            }}
                          />
                        ) : (
                          <Building2 className="w-9 h-9 text-fem-gold" />
                        )}
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold text-fem-navy text-center mb-3 leading-tight">
                      {business.business_name || "Unnamed Business"}
                    </h3>
                    <p className="text-sm text-fem-darkgray text-center mb-6 line-clamp-4">
                      {business.description ||
                        "A valued member of the Faith Connect business community, offering remarkable products and services to our faith family."}
                    </p>
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-8">
                      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 shadow-sm border border-white/60">
                        <MapPin className="w-4 h-4 text-fem-terracotta" />
                        <span className="truncate max-w-[180px]">
                          {business.city ||
                            business.county ||
                            business.address ||
                            "Location coming soon"}
                        </span>
                      </div>
                    </div>
                    <Link
                      to={`/business/${business.id}`}
                      className="relative mt-auto inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-fem-gold to-fem-terracotta rounded-full shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-200"
                    >
                      View Business
                    </Link>
                  </CardContent>
                </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center">
              <p className="text-gray-500 mb-4">
                No businesses are available yet. Check back soon as our directory updates.
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
    </>
  );
};
