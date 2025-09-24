import React, { useEffect, useState } from 'react';
import { useBusiness } from '@/contexts/BusinessContext';
import { Building2 } from 'lucide-react';

export const BusinessLogosCarousel = () => {
  const { businesses, fetchBusinesses } = useBusiness();
  const [logos, setLogos] = useState<string[]>([]);

  // Fetch businesses when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        await fetchBusinesses({ limit: 50 });
      } catch (error) {
        console.error('Error fetching businesses:', error);
      }
    };

    fetchData();
  }, [fetchBusinesses]);

  // Extract logos from businesses
  useEffect(() => {
    if (businesses && businesses.length > 0) {
      const businessLogos = businesses
        .filter(business => business.business_logo_url && !business.business_logo_url.includes('via.placeholder.com'))
        .map(business => business.business_logo_url!)
        .slice(0, 20); // Limit to 20 logos for performance

      // Duplicate logos for seamless scrolling
      setLogos([...businessLogos, ...businessLogos, ...businessLogos]);
    }
  }, [businesses]);

  if (logos.length === 0) {
    return null; // Don't render if no logos available
  }

  return (
    <section className="py-16 bg-gray-50 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-fem-navy mb-4">
            Trusted by Our Community
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover businesses that share your values and are making a difference in our community
          </p>
        </div>

        {/* Logo Carousel */}
        <div className="relative overflow-hidden">
          <div className="flex space-x-8 animate-scroll-left hover:animate-paused">
            {logos.map((logo, index) => (
              <div
                key={`${logo}-${index}`}
                className="flex-shrink-0 w-32 h-32 flex items-center justify-center bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100"
              >
                <img
                  src={logo}
                  alt={`Business logo ${index + 1}`}
                  className="max-w-24 max-h-24 object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <div className="hidden w-full h-full flex items-center justify-center">
                  <Building2 className="w-12 h-12 text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
