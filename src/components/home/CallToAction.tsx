
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/api';
import AuthModal from '@/components/auth/AuthModal';
import { 
  UserPlus, 
  Briefcase, 
  ArrowRight,
  AlertCircle
} from 'lucide-react';

export const CallToAction = () => {
  const { user, isAuthenticated, isBusinessUser } = useAuth();
  const navigate = useNavigate();
  const [hasBusiness, setHasBusiness] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const handleOpenAuthModal = () => {
    setIsAuthModalOpen(true);
  };

  const handleListBusinessClick = () => {
    // If user is authenticated and is a business user, navigate directly
    if (isAuthenticated && isBusinessUser()) {
      navigate('/register-business');
    } else {
      // Otherwise, open the auth modal
      handleOpenAuthModal();
    }
  };

  useEffect(() => {
    const checkBusiness = async () => {
      if (user && user.user_type === 'business') {
        try {
          const existingBusiness = await apiService.getUserBusiness();
          setHasBusiness(!!existingBusiness);
        } catch (error) {
          console.error('Error checking business:', error);
          setHasBusiness(false);
        }
      }
    };

    checkBusiness();
  }, [user]);

  return (
    <section className="section-full bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
      
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-gradient-radial from-fem-gold/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-gradient-radial from-fem-terracotta/10 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="container-modern section-padding relative z-10">
        
        {/* Main Content */}
        <div className="max-w-5xl mx-auto text-center space-y-16">
          
          {/* Header */}
          <div className="scroll-reveal space-y-8">
             <h2 className="text-section-title text-fem-navy tracking-tight leading-tight">
               Ready to Join Faith Connect?
             </h2>
             <div className="w-24 h-1 bg-gradient-to-r from-fem-terracotta to-fem-gold mx-auto rounded-full"></div>
             <p className="text-body-large text-gray-600 leading-relaxed max-w-3xl mx-auto">
               Whether you're looking for trusted services or want to showcase your business to our faith community, Faith Connect brings believers together through commerce.
             </p>
          </div>
          
          {/* Action Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 scroll-reveal" style={{ animationDelay: '0.3s' }}>
            
             {/* Community Members Card */}
             <div className="group relative">
               <div className="bg-white rounded-3xl p-12 shadow-sm hover-card-modern border border-gray-100/50 h-full">
                 
                 {/* Icon */}
                 <div className="w-20 h-20 bg-gradient-to-r from-fem-terracotta to-fem-gold rounded-3xl flex items-center justify-center mb-8 mx-auto group-hover:scale-110 transition-transform duration-300">
                   <UserPlus className="w-10 h-10 text-white" />
                 </div>
                 
                 {/* Content */}
                 <div className="space-y-8">
                   <div className="space-y-4">
                     <h3 className="text-2xl font-mont font-semibold text-fem-navy">
                       For Community Members
                     </h3>
                     <p className="text-gray-600 leading-relaxed">
                       Find trusted businesses owned by fellow believers. Support local commerce while building meaningful relationships.
                     </p>
                   </div>
                   
                   <Link to="/directory" className="block">
                     <Button className="w-full btn-modern text-lg py-6 rounded-2xl group-hover:scale-105 transition-all duration-300">
                       <div className="flex items-center justify-center gap-3">
                         <span>Browse Directory</span>
                         <ArrowRight className="w-5 h-5" />
                       </div>
                     </Button>
                   </Link>
                 </div>
               </div>
             </div>
            
             {/* Business Owners Card */}
             <div className="group relative">
               <div className="bg-white rounded-3xl p-12 shadow-sm hover-card-modern border border-gray-100/50 h-full">
                 
                 {/* Icon */}
                 <div className="w-20 h-20 bg-gradient-to-r from-fem-gold to-fem-terracotta rounded-3xl flex items-center justify-center mb-8 mx-auto group-hover:scale-110 transition-transform duration-300">
                   <Briefcase className="w-10 h-10 text-white" />
                 </div>
                 
                 {/* Content */}
                 <div className="space-y-8">
                   <div className="space-y-4">
                     <h3 className="text-2xl font-mont font-semibold text-fem-navy">
                       For Business Owners
                     </h3>
                     <p className="text-gray-600 leading-relaxed">
                       Showcase your business to our church community. Connect with customers who share your values and faith commitment.
                     </p>
                   </div>
                   
                   {hasBusiness ? (
                     <div className="flex items-center justify-center gap-2 text-gray-600 text-sm">
                       <AlertCircle className="w-4 h-4" />
                       You already have a business listed on Faith Connect.
                     </div>
                   ) : user && user.user_type === 'community' ? (
                     <div className="flex items-center justify-center gap-2 text-gray-600 text-sm">
                       <AlertCircle className="w-4 h-4" />
                       Community members cannot list businesses.
                     </div>
                   ) : (
                     <Button 
                       onClick={handleListBusinessClick}
                       variant="outline" 
                       className="w-full text-lg py-6 rounded-2xl border-2 border-fem-terracotta text-fem-terracotta hover:bg-fem-terracotta hover:text-white group-hover:scale-105 transition-all duration-300"
                     >
                       <div className="flex items-center justify-center gap-3">
                         <span>List Your Business</span>
                         <ArrowRight className="w-5 h-5" />
                       </div>
                     </Button>
                   )}
                 </div>
               </div>
             </div>
          </div>
          
          {/* Bottom Message */}
          <div className="scroll-reveal pt-8" style={{ animationDelay: '0.6s' }}>
            <p className="text-gray-500 font-mont leading-relaxed">
              Join hundreds of faith-centered professionals already building meaningful connections in our community
            </p>
          </div>
        </div>
      </div>
      
      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)}
        hideTabs={true}
      />
    </section>
  );
};
