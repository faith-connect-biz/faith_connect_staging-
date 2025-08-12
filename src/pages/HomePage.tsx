import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Building2, Users, Search, Star, ArrowRight } from 'lucide-react';
import { Hero } from '@/components/home/Hero';
import { BusinessCategories } from '@/components/home/BusinessCategories';
import { FeaturedBusinesses } from '@/components/home/FeaturedBusinesses';
import { HowItWorks } from '@/components/home/HowItWorks';
import { CommunityStats } from '@/components/home/CommunityStats';
import { Testimonials } from '@/components/home/Testimonials';

const HomePage: React.FC = () => {
  const { isAuthenticated, isBusinessUser, isCommunityUser } = useAuth();

  const renderActionButtons = () => {
    if (!isAuthenticated) {
      return (
        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <Link to="/directory" className="group">
            <button className="btn-modern group-hover:scale-110 transition-transform duration-300 text-lg px-8 py-4">
              <div className="flex items-center gap-3">
                <Search className="w-6 h-6" />
                <span className="font-mont font-semibold tracking-wide">Browse Directory</span>
                <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" />
              </div>
            </button>
          </Link>
          <Link to="/register-business" className="group">
            <button className="btn-outline-modern group-hover:scale-110 transition-transform duration-300 text-lg px-8 py-4">
              <div className="flex items-center gap-3">
                <Building2 className="w-6 h-6" />
                <span className="font-mont font-semibold tracking-wide">List Your Business</span>
                <ArrowRight className="w-6 h-6 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
              </div>
            </button>
          </Link>
        </div>
      );
    }

    if (isBusinessUser()) {
      return (
        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <Link to="/manage-business" className="group">
            <button className="btn-modern group-hover:scale-110 transition-transform duration-300 text-lg px-8 py-4">
              <div className="flex items-center gap-3">
                <Building2 className="w-6 h-6" />
                <span className="font-mont font-semibold tracking-wide">Manage Your Business</span>
                <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" />
              </div>
            </button>
          </Link>
          <Link to="/directory" className="group">
            <button className="btn-outline-modern group-hover:scale-110 transition-transform duration-300 text-lg px-8 py-4">
              <div className="flex items-center gap-3">
                <Search className="w-6 h-6" />
                <span className="font-mont font-semibold tracking-wide">Browse Directory</span>
                <ArrowRight className="w-6 h-6 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
              </div>
            </button>
          </Link>
        </div>
      );
    }

    if (isCommunityUser()) {
      return (
        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <Link to="/directory" className="group">
            <button className="btn-modern group-hover:scale-110 transition-transform duration-300 text-lg px-8 py-4">
              <div className="flex items-center gap-3">
                <Search className="w-6 h-6" />
                <span className="font-mont font-semibold tracking-wide">Browse Directory</span>
                <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" />
              </div>
            </button>
          </Link>
          <Link to="/profile" className="group">
            <button className="btn-outline-modern group-hover:scale-110 transition-transform duration-300 text-lg px-8 py-4">
              <div className="flex items-center gap-3">
                <Users className="w-6 h-6" />
                <span className="font-mont font-semibold tracking-wide">View Profile</span>
                <ArrowRight className="w-6 h-6 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
              </div>
            </button>
          </Link>
        </div>
      );
    }

    return null;
  };

  const renderCommunityUserInfo = () => {
    if (isAuthenticated && isCommunityUser()) {
      return (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">
              Want to List Your Business?
            </h3>
            <p className="text-blue-700 mb-4">
              You're currently logged in as a community member. To list and manage a business, 
              you'll need to log in with a business account.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button 
                onClick={() => {
                  // This would typically open a login modal or redirect to business login
                  window.location.href = '/';
                }}
                className="btn-outline-modern px-6 py-3"
              >
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  <span>Switch to Business Account</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen">
      <Hero actionButtons={renderActionButtons()} />
      {renderCommunityUserInfo()}
      <BusinessCategories />
      <FeaturedBusinesses />
      <HowItWorks />
      <CommunityStats />
      <Testimonials />
    </div>
  );
};

export default HomePage;
