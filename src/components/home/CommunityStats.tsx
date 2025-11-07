import { Card, CardContent } from "@/components/ui/card";
import { Building2, Users, Shield } from "lucide-react";
import { useBusiness } from "@/contexts/BusinessContext";
import { useAuth } from "@/contexts/AuthContext";
import { apiService } from "@/services/api";
import { useEffect, useState } from "react";
import { AnimatedStat } from "@/components/ui/AnimatedStat";

interface PlatformStats {
  total_businesses: number;
  total_users: number;
  verified_businesses: number;
  average_rating: number;
}

export const CommunityStats = () => {
  const { businesses, isLoading, fetchBusinesses } = useBusiness();
  const { user } = useAuth();
  const [platformStats, setPlatformStats] = useState<PlatformStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  // Ensure businesses are fetched when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('🔄 CommunityStats - Fetching businesses...');
        await fetchBusinesses({ limit: 100 }); // Fetch more businesses for accurate stats
      } catch (error) {
        console.error('❌ CommunityStats - Error fetching businesses:', error);
      }
    };

    if (!businesses || businesses.length === 0) {
      fetchData();
    }
  }, [fetchBusinesses, businesses]);

  // Fetch platform statistics from API
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoadingStats(true);
        console.log('🔄 CommunityStats - Fetching platform statistics...');
        const stats = await apiService.getStats();
        console.log('✅ CommunityStats - Platform stats received:', stats);
        setPlatformStats(stats);
      } catch (error) {
        console.error('❌ CommunityStats - Error fetching platform statistics:', error);
        setPlatformStats(null);
      } finally {
        setIsLoadingStats(false);
      }
    };

    fetchStats();
  }, []);

  // Debug business data
  useEffect(() => {
    console.log('🔍 CommunityStats - Business data:', {
      isLoading,
      businessesLength: businesses?.length || 0,
      businesses: businesses?.slice(0, 3) // Log first 3 businesses for debugging
    });
  }, [businesses, isLoading]);

  // Calculate real statistics from the data
  const calculateStats = () => {
    console.log('🔄 CommunityStats - Calculating stats:', {
      platformStats,
      isLoadingStats,
      businessesLength: businesses?.length || 0
    });

    // Use platform stats if available, otherwise fall back to business data calculations
    if (platformStats && !isLoadingStats && platformStats.total_businesses !== undefined) {
      const totalBusinesses = platformStats.total_businesses || 0;
      const verifiedBusinesses = platformStats.verified_businesses || 0;
      const totalUsers = platformStats.total_users || 0;
      
      const verifiedPercentage = totalBusinesses > 0 
        ? Math.round((verifiedBusinesses / totalBusinesses) * 100)
        : 0;

      // Safety check for average rating - handle scientific notation and invalid values
      let safeAverageRating = "0.0";
      if (platformStats.average_rating !== null && platformStats.average_rating !== undefined) {
        const rating = Number(platformStats.average_rating);
        if (!isNaN(rating) && rating >= 0 && rating <= 5 && isFinite(rating)) {
          safeAverageRating = rating.toFixed(1);
        }
      }

      const stats = {
        totalBusinesses: totalBusinesses.toString(),
        verifiedBusinesses: verifiedPercentage.toString(),
        averageRating: safeAverageRating,
        totalUsers: totalUsers.toString()
      };

      console.log('✅ CommunityStats - Using platform stats:', stats);
      return stats;
    }

    // Fallback to business data calculations if platform stats are not available
    if (isLoading || !Array.isArray(businesses) || !businesses.length) {
      console.log('⚠️ CommunityStats - No business data available, using demo data for testing');
      // Use demo data to test the component
      return {
        totalBusinesses: "80",
        verifiedBusinesses: "50",
        averageRating: "4.5",
        totalUsers: "200"
      };
    }

    const totalBusinesses = businesses.length;
    const verifiedBusinesses = businesses.filter(b => b.is_verified).length;
    
    // Calculate average rating from businesses with ratings > 0
    const businessesWithRatings = businesses.filter(b => 
      b.rating && b.rating > 0 && !isNaN(Number(b.rating))
    );
    
    const averageRating = businessesWithRatings.length > 0 
      ? (businessesWithRatings.reduce((sum, b) => {
          const rating = Number(b.rating);
          return sum + (isNaN(rating) ? 0 : rating);
        }, 0) / businessesWithRatings.length).toFixed(1)
      : "0.0";
    
    // Estimate users based on businesses (assuming 1 user per business + community users)
    const totalUsers = totalBusinesses + Math.floor(totalBusinesses * 0.5);

    const stats = {
      totalBusinesses: totalBusinesses.toString(),
      verifiedBusinesses: Math.round((verifiedBusinesses / totalBusinesses) * 100).toString(),
      averageRating,
      totalUsers: totalUsers.toString()
    };

    console.log('✅ CommunityStats - Using business data fallback:', {
      totalBusinesses,
      verifiedBusinesses,
      averageRating,
      totalUsers,
      finalStats: stats
    });

    return stats;
  };

  const stats = calculateStats();

  const statsData = [
    {
      icon: Building2,
      value: `${stats.totalBusinesses}+`,
      label: "Local Businesses",
      description: "Trusted businesses in our directory",
      delay: 0
    },
    {
      icon: Users,
      value: `${stats.totalUsers}`,
      label: "Community Members",
      description: "Active church family members",
      delay: 200
    },
    {
      icon: Shield,
      value: `${stats.verifiedBusinesses}%`,
      label: "Verified Businesses",
      description: "Background checked and approved",
      delay: 400
    },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-fem-navy mb-4">
            Our Growing Community
          </h2>
          <p className="text-fem-darkgray max-w-2xl mx-auto">
            See how our faith-based business directory is strengthening connections 
            and supporting local commerce within our church family.
          </p>
        </div>
        
        {/* Mobile: Continuous sliding cards */}
        <div className="md:hidden">
          <div className="relative overflow-hidden">
            <div className="flex gap-4 animate-scroll-stats hover:animate-paused">
              {/* Duplicate the cards for seamless loop */}
              {[...statsData, ...statsData].map((stat, index) => (
                <Card 
                  key={`${stat.label}-${index}`}
                  className="text-center hover-card-effect border-0 shadow-sm bg-gradient-to-br from-fem-gold/5 to-fem-terracotta/5 flex-shrink-0 w-48"
                  style={{ animationDelay: `${0.1 * index}s` }}
                >
                  <CardContent className="p-4">
                    <div className="mx-auto w-12 h-12 mb-3 flex items-center justify-center rounded-full bg-fem-terracotta/10">
                      <stat.icon className="w-6 h-6 text-fem-terracotta" />
                    </div>
                    <div className="text-2xl font-bold text-fem-navy mb-1">
                      {isLoadingStats && !platformStats ? (
                        <div className="bg-gray-200 h-6 w-12 rounded mx-auto"></div>
                      ) : (
                        <AnimatedStat
                          value={stat.value}
                          duration={2000}
                          delay={stat.delay}
                          className="text-2xl font-bold text-fem-navy"
                        />
                      )}
                    </div>
                    <h3 className="font-semibold text-fem-navy mb-1 text-sm">{stat.label}</h3>
                    <p className="text-xs text-fem-darkgray leading-tight">{stat.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Desktop: Grid layout */}
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-6">
          {statsData.map((stat, index) => (
            <Card 
              key={stat.label} 
              className="text-center hover-card-effect border-0 shadow-sm bg-gradient-to-br from-fem-gold/5 to-fem-terracotta/5"
              style={{ animationDelay: `${0.1 * index}s` }}
            >
              <CardContent className="p-6">
                <div className="mx-auto w-16 h-16 mb-4 flex items-center justify-center rounded-full bg-fem-terracotta/10">
                  <stat.icon className="w-8 h-8 text-fem-terracotta" />
                </div>
                <div className="text-3xl font-bold text-fem-navy mb-2">
                  {isLoadingStats && !platformStats ? (
                    <div className="bg-gray-200 h-8 w-16 rounded mx-auto"></div>
                  ) : (
                    <AnimatedStat
                      value={stat.value}
                      duration={2000}
                      delay={stat.delay}
                      className="text-3xl font-bold text-fem-navy"
                    />
                  )}
                </div>
                <h3 className="font-semibold text-fem-navy mb-2">{stat.label}</h3>
                <p className="text-sm text-fem-darkgray">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};