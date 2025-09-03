import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/api';
import { Hero } from '@/components/home/Hero';
import { BusinessCategories } from '@/components/home/BusinessCategories';
import { ProductServiceCarousel } from '@/components/home/ProductServiceCarousel';
import { HowItWorks } from '@/components/home/HowItWorks';
import { CommunityStats } from '@/components/home/CommunityStats';
import { Testimonials } from '@/components/home/Testimonials';
import { CallToAction } from '@/components/home/CallToAction';
import { Footer } from '@/components/layout/Footer';
import { 
  ArrowRight, 
  Building2, 
  Search, 
  Users,
  AlertCircle
} from 'lucide-react';

const HomePage: React.FC = () => {
  const { isAuthenticated, isBusinessUser, isCommunityUser } = useAuth();
  const [hasBusiness, setHasBusiness] = useState(false);

  useEffect(() => {
    const checkBusiness = async () => {
      if (isAuthenticated && isBusinessUser()) {
        try {
          const existingBusiness = await apiService.getUserBusiness();
          setHasBusiness(!!existingBusiness);
        } catch (error) {
          setHasBusiness(false);
        }
      }
    };
    checkBusiness();
  }, [isAuthenticated, isBusinessUser]);

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
            <button className="btn-modern group-hover:scale-110 transition-transform duration-300 text-lg px-8 py-4">
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
      if (hasBusiness) {
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
              <button className="btn-modern group-hover:scale-110 transition-transform duration-300 text-lg px-8 py-4">
                <div className="flex items-center gap-3">
                  <Search className="w-6 h-6" />
                  <span className="font-mont font-semibold tracking-wide">Browse Directory</span>
                  <ArrowRight className="w-6 h-6 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                </div>
              </button>
            </Link>
          </div>
        );
      } else {
        return (
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link to="/register-business" className="group">
              <button className="btn-modern group-hover:scale-110 transition-transform duration-300 text-lg px-8 py-4">
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
            <button className="btn-modern group-hover:scale-110 transition-transform duration-300 text-lg px-8 py-4">
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
              Welcome, Community Member!
            </h3>
            <p className="text-blue-700 mb-4">
              As a community member, you can browse our directory of trusted faith-based businesses, 
              leave reviews, and support local commerce within our church family.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/directory" className="btn-modern px-6 py-3">
                <div className="flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  <span>Browse Business Directory</span>
                </div>
              </Link>
              <Link to="/profile" className="btn-outline-modern px-6 py-3">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  <span>View Your Profile</span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      );
    }

    if (isAuthenticated && isBusinessUser() && hasBusiness) {
      return (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-amber-800 mb-2">
              Business Already Registered
            </h3>
            <p className="text-amber-700 mb-4">
              You already have a registered business. At the moment, business owners can only register one business.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/manage-business" className="btn-modern px-6 py-3">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  <span>Manage Your Business</span>
                </div>
              </Link>
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
      <ProductServiceCarousel />
      <HowItWorks />
      <CommunityStats />
      <Testimonials />
    </div>
  );
};

export default HomePage;
