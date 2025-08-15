
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import AuthModal from '@/components/auth/AuthModal';
import { 
  Menu, 
  X, 
  User, 
  Loader2,
  Building2,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiService } from '@/services/api';
import { toast } from '@/hooks/use-toast';

const Navbar: React.FC = () => {
  const { user, isAuthenticated, isBusiness, logout, isLoggingOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [hasExistingBusiness, setHasExistingBusiness] = useState(false);
  const [isCheckingBusiness, setIsCheckingBusiness] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check if user already has a business
  useEffect(() => {
    const checkExistingBusiness = async () => {
      if (isAuthenticated && isBusiness) {
        setIsCheckingBusiness(true);
        try {
          const existingBusiness = await apiService.getUserBusiness();
          setHasExistingBusiness(!!existingBusiness);
        } catch (error) {
          console.error('Error checking existing business:', error);
          setHasExistingBusiness(false);
        } finally {
          setIsCheckingBusiness(false);
        }
      }
    };

    checkExistingBusiness();
  }, [isAuthenticated, isBusiness]);

  // Ensure we have the latest user data
  const isCommunity = user?.user_type === 'community';

  // Force re-render when user changes
  useEffect(() => {
    console.log('Navbar: User state changed:', {
      user: user,
      isAuthenticated,
      isBusiness,
      isCommunity,
      userType: user?.user_type
    });
  }, [user, isAuthenticated, isBusiness, isCommunity]);

  const handleLogout = async () => {
    try {
      await logout();
      setIsMenuOpen(false);
      navigate("/");
    } catch (error) {
      console.error('Logout failed:', error);
      toast({
        title: "Logout Failed",
        description: "There was an error logging out. Please try again.",
        variant: "destructive"
      });
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const openAuthModal = () => {
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  return (
         <nav className="bg-[#faf9f8] shadow-sm py-4 relative">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link to="/" className="flex items-center" onClick={closeMenu}>
          <img 
            src="/lovable-uploads/NewFaithConnect.png" 
            alt="Faith Connect Logo" 
            className="h-10 w-auto sm:h-12" 
          />
        </Link>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          <Link to="/directory" className="text-fem-navy hover:text-fem-terracotta transition-colors">
            Business Directory
          </Link>
          {/* Business Management Links - Only for Business Users */}
          {isAuthenticated && isBusiness && (
            <>
              {isCheckingBusiness ? (
                <div className="text-fem-navy opacity-50">
                  <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
                  Loading...
                </div>
              ) : !hasExistingBusiness ? (
                <Link to="/register-business" className="text-fem-navy hover:text-fem-terracotta transition-colors">
                  List Business
                </Link>
              ) : (
                <Link to="/manage-business" className="text-fem-navy hover:text-fem-terracotta transition-colors">
                  Manage Business
                </Link>
              )}
            </>
          )}
          <Link to="/about" className="text-fem-navy hover:text-fem-terracotta transition-colors">
            About
          </Link>
        </div>
        
        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Link to="/profile">
                <Button variant="outline" className="flex items-center gap-2 border-fem-terracotta text-fem-terracotta hover:bg-fem-terracotta hover:text-white">
                  <User className="h-4 w-4" />
                  <span>Profile</span>
                </Button>
              </Link>
              <Button 
                variant="ghost" 
                className="text-fem-navy hover:text-fem-terracotta"
                onClick={handleLogout}
                disabled={isLoggingOut}
              >
                {isLoggingOut ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    <span>Logging out...</span>
                  </>
                ) : (
                  <>
                    <X className="h-4 w-4 mr-2" />
                    <span>Logout</span>
                  </>
                )}
              </Button>
            </div>
          ) : (
                         <>
               <Button 
                 variant="outline" 
                 className="border-fem-terracotta text-fem-terracotta hover:bg-fem-terracotta hover:text-white"
                 onClick={openAuthModal}
               >
                 Sign In
               </Button>
               <Button 
                 className="bg-fem-terracotta hover:bg-fem-terracotta/90 text-white"
                 onClick={openAuthModal}
               >
                 Register
               </Button>
             </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-fem-navy"
            onClick={toggleMenu}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white shadow-lg border-t border-gray-100 z-50">
          <div className="container mx-auto px-4 py-4 space-y-4">
            {/* Mobile Navigation Links */}
            <div className="space-y-3">
              <Link 
                to="/directory" 
                className="block py-2 text-fem-navy hover:text-fem-terracotta transition-colors"
                onClick={closeMenu}
              >
                Business Directory
              </Link>
              {/* Business Management Links - Only for Business Users */}
              {isAuthenticated && isBusiness && (
                <>
                  {isCheckingBusiness ? (
                    <div className="block py-2 text-fem-navy opacity-50">
                      <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
                      Loading...
                    </div>
                  ) : !hasExistingBusiness ? (
                    <Link 
                      to="/register-business" 
                      className="block py-2 text-fem-navy hover:text-fem-terracotta transition-colors"
                      onClick={closeMenu}
                    >
                      List Business
                    </Link>
                  ) : (
                    <Link 
                      to="/manage-business" 
                      className="block py-2 text-fem-navy hover:text-fem-terracotta transition-colors"
                      onClick={closeMenu}
                    >
                      Manage Business
                    </Link>
                  )}
                </>
              )}
              <Link 
                to="/about" 
                className="block py-2 text-fem-navy hover:text-fem-terracotta transition-colors"
                onClick={closeMenu}
              >
                About
              </Link>

            </div>

            {/* Mobile Actions */}
            <div className="pt-4 border-t border-gray-100 space-y-3">
              {isAuthenticated ? (
                <>
                  <Link to="/profile" onClick={closeMenu}>
                    <Button variant="outline" className="w-full border-fem-terracotta text-fem-terracotta hover:bg-fem-terracotta hover:text-white">
                      <User className="h-4 w-4 mr-2" />
                      Profile
                    </Button>
                  </Link>
                  <Button 
                    variant="ghost" 
                    className="w-full text-fem-navy hover:text-fem-terracotta"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                  >
                    {isLoggingOut ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        <span>Logging out...</span>
                      </>
                    ) : (
                      <>
                        <X className="h-4 w-4 mr-2" />
                        <span>Logout</span>
                      </>
                    )}
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    variant="outline" 
                    className="w-full border-fem-terracotta text-fem-terracotta hover:bg-fem-terracotta hover:text-white"
                    onClick={openAuthModal}
                  >
                    Sign In
                  </Button>
                  <Button 
                    className="w-full bg-fem-terracotta hover:bg-fem-terracotta/90 text-white"
                    onClick={openAuthModal}
                  >
                    Register
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={closeAuthModal}
      />
    </nav>
  );
};

export { Navbar };
