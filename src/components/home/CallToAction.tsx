import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  UserPlus, 
  Briefcase, 
  ArrowRight
} from 'lucide-react';

export const CallToAction = () => {
  const navigate = useNavigate();

  const handleListBusinessClick = () => {
      navigate('/register-business');
  };

  return (
    <section className="section-full relative overflow-hidden">
      
      {/* Background Image */}
      <div className="absolute inset-0">
        <img 
          src="/shaking-hands-in-professional-business-meeting-2025-06-02-15-01-38-utc.jpg"
          alt="Business professionals shaking hands"
          className="w-full h-full object-cover"
        />
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/60"></div>
      </div>

      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-gradient-radial from-fem-gold/20 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="container-modern section-padding relative z-10">
        
        {/* Main Content */}
        <div className="max-w-5xl mx-auto text-center space-y-16">
          
          {/* Header */}
          <div className="scroll-reveal space-y-6 lg:space-y-8">
             <h2 className="text-2xl md:text-3xl lg:text-section-title text-white tracking-tight leading-tight drop-shadow-lg">
               Ready to Join Faith Connect?
             </h2>
             <div className="w-16 lg:w-24 h-1 bg-gradient-to-r from-fem-terracotta to-fem-gold mx-auto rounded-full shadow-lg"></div>
             <p className="text-base lg:text-body-large text-gray-100 leading-relaxed max-w-3xl mx-auto drop-shadow-lg bg-black/20 backdrop-blur-sm rounded-lg p-4 lg:p-6">
               Whether you're looking for trusted services or want to showcase your business to our faith community, Faith Connect brings believers together through commerce.
             </p>
          </div>
          
          {/* Action Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 scroll-reveal" style={{ animationDelay: '0.3s' }}>
            
             {/* Community Members Card */}
             <div className="group relative">
               <div className="bg-white/95 backdrop-blur-sm rounded-2xl lg:rounded-3xl p-6 md:p-8 lg:p-12 shadow-xl hover-card-modern border border-white/20 h-full">
                 
                 {/* Icon */}
                 <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-r from-fem-terracotta to-fem-gold rounded-2xl lg:rounded-3xl flex items-center justify-center mb-6 lg:mb-8 mx-auto group-hover:scale-110 transition-transform duration-300">
                   <UserPlus className="w-8 h-8 lg:w-10 lg:h-10 text-white" />
                 </div>
                 
                 {/* Content */}
                 <div className="space-y-6 lg:space-y-8">
                   <div className="space-y-3 lg:space-y-4">
                     <h3 className="text-xl lg:text-2xl font-mont font-semibold text-fem-navy">
                       For Community Members
                     </h3>
                     <p className="text-sm lg:text-base text-gray-600 leading-relaxed">
                       Find trusted businesses owned by fellow believers. Support local commerce while building meaningful relationships.
                     </p>
                   </div>
                   
                   <Link to="/directory" className="block">
                     <Button className="w-full btn-modern text-base lg:text-lg py-4 lg:py-6 rounded-xl lg:rounded-2xl group-hover:scale-105 transition-all duration-300">
                       <div className="flex items-center justify-center gap-2 lg:gap-3">
                         <span>Browse Directory</span>
                         <ArrowRight className="w-4 h-4 lg:w-5 lg:h-5" />
                       </div>
                     </Button>
                   </Link>
                 </div>
               </div>
             </div>
             
             {/* Business Owners Card */}
             <div className="group relative">
               <div className="bg-white/95 backdrop-blur-sm rounded-2xl lg:rounded-3xl p-6 md:p-8 lg:p-12 shadow-xl hover-card-modern border border-white/20 h-full">
                 
                 {/* Icon */}
                 <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-r from-fem-gold to-fem-terracotta rounded-2xl lg:rounded-3xl flex items-center justify-center mb-6 lg:mb-8 mx-auto group-hover:scale-110 transition-transform duration-300">
                   <Briefcase className="w-8 h-8 lg:w-10 lg:h-10 text-white" />
                 </div>
                 
                 {/* Content */}
                 <div className="space-y-6 lg:space-y-8">
                   <div className="space-y-3 lg:space-y-4">
                     <h3 className="text-xl lg:text-2xl font-mont font-semibold text-fem-navy">
                       For Business Owners
                     </h3>
                     <p className="text-sm lg:text-base text-gray-600 leading-relaxed">
                       Showcase your business to our church community. Connect with customers who share your values and faith commitment.
                     </p>
                   </div>
                   
                     <Button 
                       onClick={handleListBusinessClick}
                       variant="outline" 
                       className="w-full text-base lg:text-lg py-4 lg:py-6 rounded-xl lg:rounded-2xl border-2 border-fem-terracotta text-fem-terracotta hover:bg-fem-terracotta hover:text-white group-hover:scale-105 transition-all duration-300"
                     >
                       <div className="flex items-center justify-center gap-2 lg:gap-3">
                         <span>List Your Business</span>
                         <ArrowRight className="w-4 h-4 lg:w-5 lg:h-5" />
                       </div>
                     </Button>
                 </div>
               </div>
             </div>
          </div>
          
          {/* Bottom Message */}
          <div className="scroll-reveal pt-6 lg:pt-8" style={{ animationDelay: '0.6s' }}>
            <p className="text-sm lg:text-base text-gray-200 font-mont leading-relaxed drop-shadow-lg bg-black/30 backdrop-blur-sm rounded-lg p-3 lg:p-4">
              Join hundreds of faith-centered professionals already building meaningful connections in our community
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};