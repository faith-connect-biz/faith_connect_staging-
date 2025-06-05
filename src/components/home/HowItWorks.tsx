
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, User, Search, FileText, MessageCircle } from "lucide-react";

export const HowItWorks = () => {
  const steps = [
    {
      title: "Create Your Profile",
      description: "Build your professional profile with skills, experience, and church membership details for authentic connections.",
      icon: User,
      link: "/register",
      color: "from-blue-500/10 to-cyan-500/10",
      iconBg: "bg-blue-500/10 text-blue-600"
    },
    {
      title: "Discover Opportunities",
      description: "Browse curated job listings from faith-aligned businesses within our church community network.",
      icon: Search,
      link: "/jobs",
      color: "from-green-500/10 to-emerald-500/10",
      iconBg: "bg-green-500/10 text-green-600"
    },
    {
      title: "Apply with Purpose",
      description: "Submit meaningful applications with your profile and receive real-time notifications on your status.",
      icon: FileText,
      link: "/jobs",
      color: "from-purple-500/10 to-violet-500/10",
      iconBg: "bg-purple-500/10 text-purple-600"
    },
    {
      title: "Connect Securely",
      description: "Communicate with employers through our secure platform while maintaining your privacy and personal safety.",
      icon: MessageCircle,
      link: "/chat",
      color: "from-orange-500/10 to-red-500/10",
      iconBg: "bg-orange-500/10 text-orange-600"
    },
  ];

  return (
    <section className="section-full bg-fem-navy relative overflow-hidden">
      
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-fem-navy via-fem-navy/98 to-fem-navy/95" />
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-gradient-radial from-fem-gold/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-gradient-radial from-fem-terracotta/5 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="container-modern section-padding relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-24 max-w-4xl mx-auto scroll-reveal">
          <div className="space-y-8">
            <h2 className="text-section-title text-white tracking-tight leading-tight">
              Your Journey to Purpose
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-fem-terracotta to-fem-gold mx-auto rounded-full"></div>
            <p className="text-body-large text-gray-300 leading-relaxed">
              Our streamlined platform connects faith-centered professionals with meaningful opportunities in four simple steps
            </p>
          </div>
        </div>
        
        {/* Steps Grid */}
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-8 lg:gap-10">
            {steps.map((step, index) => (
              <div 
                key={step.title}
                className="group scroll-reveal"
                style={{ animationDelay: `${0.15 * index}s` }}
              >
                <div className="relative">
                  
                  {/* Step Number */}
                  <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-r from-fem-terracotta to-fem-gold rounded-full flex items-center justify-center text-white font-mont font-bold text-lg shadow-xl z-10">
                    {index + 1}
                  </div>
                  
                  {/* Main Card */}
                  <div className="glass-modern rounded-3xl p-8 h-full hover-card-modern group-hover:scale-105 transition-all duration-500">
                    
                    {/* Icon */}
                    <div className={`w-16 h-16 ${step.iconBg} rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300`}>
                      <step.icon className="w-8 h-8" />
                    </div>
                    
                    {/* Content */}
                    <div className="space-y-6">
                      <h3 className="text-xl font-mont font-semibold text-white leading-tight">
                        {step.title}
                      </h3>
                      
                      <p className="text-gray-300 leading-relaxed font-mont">
                        {step.description}
                      </p>
                      
                      {/* Action Link */}
                      <Link 
                        to={step.link} 
                        className="inline-flex items-center gap-2 text-fem-gold hover:text-fem-lightgold transition-colors duration-300 font-mont font-medium group/link"
                      >
                        <span>Get Started</span>
                        <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover/link:translate-x-1" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Call to Action */}
        <div className="mt-24 text-center scroll-reveal" style={{ animationDelay: '0.8s' }}>
          <div className="space-y-8">
            <h3 className="text-2xl lg:text-3xl font-mont font-semibold text-white">
              Ready to Begin Your Journey?
            </h3>
            <Link to="/register">
              <Button className="btn-modern text-lg px-10 py-6 rounded-full hover:scale-110 transition-all duration-300">
                <div className="flex items-center gap-3">
                  <span>Start Your Profile Today</span>
                  <ArrowRight className="w-5 h-5" />
                </div>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
