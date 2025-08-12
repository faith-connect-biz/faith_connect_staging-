
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { AuthModal } from '@/components/auth/AuthModal';
import { Menu, X, User, Building2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'signup'>('login');
  const { user, isAuthenticated, logout, isBusinessUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Ensure we have the latest user data
  const currentUser = user;
  const isBusiness = currentUser?.user_type === 'business';
  const isCommunity = currentUser?.user_type === 'community';

  // Force re-render when user changes
  useEffect(() => {
    // This will trigger a re-render when user state changes
    console.log('Navbar: User state changed:', {
      user: currentUser,
      isAuthenticated,
      isBusiness,
      isCommunity,
      userType: currentUser?.user_type
    });
  }, [user, isAuthenticated, currentUser, isBusiness, isCommunity]);

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

  const openAuthModal = (tab: 'login' | 'signup') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  return (
    <nav className="bg-white shadow-sm py-4 relative">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2" onClick={closeMenu}>
          <img 
            src="/lovable-uploads/f1a3f2a4-bbe7-46e5-be66-1ad39e35defa.png" 
            alt="FEM Family Church Logo" 
            className="h-10 w-auto sm:h-12" 
          />
          <div className="hidden sm:flex flex-col">
            <span className="font-heading font-semibold text-fem-navy text-sm sm:text-base">Faith Connect</span>
            <span className="text-xs text-fem-darkgray">Business Directory</span>
          </div>
          <div className="sm:hidden">
            <span className="font-heading font-semibold text-fem-navy text-sm">Faith Connect</span>
          </div>
        </Link>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          <Link to="/directory" className="text-fem-navy hover:text-fem-terracotta transition-colors">
            Business Directory
          </Link>
          {/* Business Management Links - Only for Business Users */}
          {isAuthenticated && isBusiness && (
            <>
              <Link to="/register-business" className="text-fem-navy hover:text-fem-terracotta transition-colors">
                List Business
              </Link>
              <Link to="/manage-business" className="text-fem-navy hover:text-fem-terracotta transition-colors">
                Manage Business
              </Link>
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
              >
                <X className="h-4 w-4 mr-2" />
                <span>Logout</span>
              </Button>
            </div>
          ) : (
                         <>
               <Button 
                 variant="outline" 
                 className="border-fem-terracotta text-fem-terracotta hover:bg-fem-terracotta hover:text-white"
                 onClick={() => openAuthModal('login')}
               >
                 Sign In
               </Button>
               <Button 
                 className="bg-fem-terracotta hover:bg-fem-terracotta/90 text-white"
                 onClick={() => openAuthModal('signup')}
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
                  <Link 
                    to="/register-business" 
                    className="block py-2 text-fem-navy hover:text-fem-terracotta transition-colors"
                    onClick={closeMenu}
                  >
                    List Business
                  </Link>
                  <Link 
                    to="/manage-business" 
                    className="block py-2 text-fem-navy hover:text-fem-terracotta transition-colors"
                    onClick={closeMenu}
                  >
                    Manage Business
                  </Link>
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
                  >
                    <X className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    variant="outline" 
                    className="w-full border-fem-terracotta text-fem-terracotta hover:bg-fem-terracotta hover:text-white"
                    onClick={() => {
                      closeMenu();
                      openAuthModal('login');
                    }}
                  >
                    Sign In
                  </Button>
                  <Button 
                    className="w-full bg-fem-terracotta hover:bg-fem-terracotta/90 text-white"
                    onClick={() => {
                      closeMenu();
                      openAuthModal('signup');
                    }}
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
        defaultTab={authModalTab}
      />
    </nav>
  );
};

export { Navbar };
