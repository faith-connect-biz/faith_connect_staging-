import { Card, CardContent } from "@/components/ui/card";
import { Building2, Users, Shield, Star } from "lucide-react";
import { useBusiness } from "@/contexts/BusinessContext";
import { useAuth } from "@/contexts/AuthContext";

export const CommunityStats = () => {
  const { businesses, isLoading } = useBusiness();
  const { user } = useAuth();

  // Calculate real statistics from the data
  const calculateStats = () => {
    if (isLoading || !Array.isArray(businesses) || !businesses.length) {
      return {
        totalBusinesses: "0",
        verifiedBusinesses: "0",
        averageRating: "0.0",
        totalUsers: "0"
      };
    }

    const totalBusinesses = businesses.length;
    const verifiedBusinesses = businesses.filter(b => b.is_verified).length;
    const averageRating = businesses.length > 0 
      ? (businesses.reduce((sum, b) => sum + b.rating, 0) / businesses.length).toFixed(1)
      : "0.0";
    
    // For now, we'll estimate users based on businesses (assuming 1 user per business + community users)
    // In a real app, you'd get this from a users API endpoint
    const totalUsers = totalBusinesses + Math.floor(totalBusinesses * 0.5); // Estimate

    return {
      totalBusinesses: totalBusinesses.toString(),
      verifiedBusinesses: verifiedBusinesses.toString(),
      averageRating,
      totalUsers: totalUsers.toString()
    };
  };

  const stats = calculateStats();

  const statsData = [
    {
      icon: Building2,
      value: `${stats.totalBusinesses}+`,
      label: "Local Businesses",
      description: "Trusted businesses in our directory"
    },
    {
      icon: Users,
      value: `${stats.totalUsers}+`,
      label: "Community Members",
      description: "Active church family members"
    },
    {
      icon: Shield,
      value: Array.isArray(businesses) && businesses.length > 0 ? `${Math.round((parseInt(stats.verifiedBusinesses) / parseInt(stats.totalBusinesses)) * 100)}%` : "0%",
      label: "Verified Businesses",
      description: "Background checked and approved"
    },
    {
      icon: Star,
      value: stats.averageRating,
      label: "Average Rating",
      description: "Community satisfaction score"
    }
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                <div className="text-3xl font-bold text-fem-navy mb-2">{stat.value}</div>
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