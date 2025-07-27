import { Card, CardContent } from "@/components/ui/card";
import { Building2, Users, Shield, Star } from "lucide-react";

const stats = [
  {
    icon: Building2,
    value: "150+",
    label: "Local Businesses",
    description: "Trusted businesses in our directory"
  },
  {
    icon: Users,
    value: "1,200+",
    label: "Community Members",
    description: "Active church family members"
  },
  {
    icon: Shield,
    value: "95%",
    label: "Verified Businesses",
    description: "Background checked and approved"
  },
  {
    icon: Star,
    value: "4.8",
    label: "Average Rating",
    description: "Community satisfaction score"
  }
];

export const CommunityStats = () => {
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
          {stats.map((stat, index) => (
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