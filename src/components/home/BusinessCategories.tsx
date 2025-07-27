import { Card, CardContent } from "@/components/ui/card";
import { 
  Utensils, 
  ShoppingBag, 
  Wrench, 
  Heart, 
  Car, 
  Home, 
  GraduationCap, 
  Monitor 
} from "lucide-react";
import { Link } from "react-router-dom";

const categories = [
  { name: "Restaurant", icon: Utensils, count: 24, color: "text-orange-600" },
  { name: "Retail", icon: ShoppingBag, count: 18, color: "text-blue-600" },
  { name: "Services", icon: Wrench, count: 32, color: "text-green-600" },
  { name: "Health & Wellness", icon: Heart, count: 15, color: "text-red-600" },
  { name: "Automotive", icon: Car, count: 12, color: "text-purple-600" },
  { name: "Real Estate", icon: Home, count: 9, color: "text-yellow-600" },
  { name: "Education", icon: GraduationCap, count: 7, color: "text-indigo-600" },
  { name: "Technology", icon: Monitor, count: 14, color: "text-teal-600" },
];

export const BusinessCategories = () => {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-fem-navy mb-4">
            Explore Business Categories
          </h2>
          <p className="text-fem-darkgray max-w-2xl mx-auto">
            Discover trusted businesses within our faith community. From restaurants to tech services, 
            find everything you need while supporting fellow believers.
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {categories.map((category, index) => (
            <Link 
              key={category.name}
              to={`/directory?category=${category.name.toLowerCase()}`}
              className="block"
            >
              <Card className="hover-card-effect cursor-pointer transition-all duration-300 hover:shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className={`mx-auto w-12 h-12 mb-4 flex items-center justify-center rounded-lg bg-gray-50 ${category.color}`}>
                    <category.icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-fem-navy mb-2">{category.name}</h3>
                  <p className="text-sm text-fem-darkgray">{category.count} businesses</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
        
        <div className="text-center mt-8">
          <Link to="/directory">
            <button className="bg-fem-terracotta hover:bg-fem-terracotta/90 text-white px-6 py-3 rounded-lg font-medium transition-colors">
              View All Categories
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
};