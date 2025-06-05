
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const categories = [
  { name: "Technology", icon: "💻", count: 24, color: "from-blue-500/20 to-purple-500/20" },
  { name: "Healthcare", icon: "🏥", count: 18, color: "from-green-500/20 to-teal-500/20" },
  { name: "Education", icon: "📚", count: 15, color: "from-yellow-500/20 to-amber-500/20" },
  { name: "Construction", icon: "🏗️", count: 12, color: "from-red-500/20 to-orange-500/20" },
  { name: "Hospitality", icon: "🏨", count: 10, color: "from-pink-500/20 to-rose-500/20" },
  { name: "Finance", icon: "💰", count: 8, color: "from-emerald-500/20 to-green-500/20" },
  { name: "Creative", icon: "🎨", count: 7, color: "from-indigo-500/20 to-violet-500/20" },
  { name: "Administrative", icon: "📝", count: 14, color: "from-cyan-500/20 to-sky-500/20" },
];

export const JobCategories = () => {
  return (
    <section className="section-full bg-gradient-to-b from-white to-gray-50/50">
      <div className="container-modern section-padding">
        
        {/* Section Header */}
        <div className="text-center mb-24 max-w-4xl mx-auto scroll-reveal">
          <div className="space-y-8">
            <h2 className="text-section-title text-fem-navy tracking-tight leading-tight">
              Explore Opportunities
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-fem-terracotta to-fem-gold mx-auto rounded-full"></div>
            <p className="text-body-large text-gray-600 leading-relaxed">
              Discover meaningful work across various industries within our thriving Kenya community
            </p>
          </div>
        </div>
        
        {/* Categories Grid */}
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {categories.map((category, index) => (
              <Link 
                to={`/jobs?category=${category.name.toLowerCase()}`} 
                key={category.name}
                className="group scroll-reveal"
                style={{ animationDelay: `${0.1 * index}s` }}
              >
                <div className={cn(
                  "relative bg-white rounded-3xl p-10 shadow-sm hover-card-modern",
                  "border border-gray-100/50 transition-all duration-500",
                  "hover:shadow-2xl hover:-translate-y-3"
                )}>
                  
                  {/* Background Gradient */}
                  <div className={cn(
                    "absolute inset-0 bg-gradient-to-br rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500",
                    category.color
                  )} />
                  
                  {/* Content */}
                  <div className="relative z-10 text-center space-y-6">
                    <div className="text-5xl lg:text-6xl animate-float-slow group-hover:scale-110 transition-transform duration-300">
                      {category.icon}
                    </div>
                    
                    <div className="space-y-3">
                      <h3 className="text-xl font-mont font-semibold text-fem-navy group-hover:text-fem-terracotta transition-colors duration-300">
                        {category.name}
                      </h3>
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-2xl font-mont font-bold text-fem-gold">
                          {category.count}
                        </span>
                        <span className="text-sm text-gray-500 font-mont">
                          openings
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Hover Arrow */}
                  <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                    <svg className="w-6 h-6 text-fem-terracotta" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
        
        {/* Call to Action */}
        <div className="mt-24 text-center scroll-reveal" style={{ animationDelay: '0.8s' }}>
          <Link 
            to="/jobs" 
            className="group inline-flex items-center gap-3 text-fem-terracotta hover:text-fem-terracotta/80 font-mont font-semibold text-lg transition-all duration-300"
          >
            <span>Explore All Opportunities</span>
            <svg 
              className="w-6 h-6 transition-transform duration-300 group-hover:translate-x-2" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
};
