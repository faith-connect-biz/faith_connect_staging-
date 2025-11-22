import { Card, CardContent } from "@/components/ui/card";
import { Building2, Users, Shield } from "lucide-react";

export const CommunityStats = () => {

  // Use mock data for statistics
  const stats = {
    totalBusinesses: "150",
    verifiedBusinesses: "85",
    averageRating: "4.8",
    totalUsers: "500"
  };

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
      value: `${stats.totalUsers}+`,
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
                      {stat.value}
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
                  {stat.value}
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