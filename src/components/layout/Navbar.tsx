
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import AuthModal from '@/components/auth/AuthModal';
import { NavbarLogo } from '@/components/ui/Logo';
import { 
  Menu, 
  X, 
  User, 
  Loader2,
  Building2,
  AlertCircle,
  Home
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiService } from '@/services/api';
import { toast } from '@/hooks/use-toast';

const Navbar: React.FC = () => {
  const { user, isAuthenticated, isBusiness, logout, isLoggingOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'signup'>('login');
  const [hasExistingBusiness, setHasExistingBusiness] = useState(false);
  const [isCheckingBusiness, setIsCheckingBusiness] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const location = useLocation();

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

  const openAuthModal = (tab: 'login' | 'signup' = 'login') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  // Auto-open login modal when instructed (e.g., after password reset)
  useEffect(() => {
    const shouldOpen = localStorage.getItem('open_login_modal');
    // Only open the modal if the user is NOT authenticated
    if (shouldOpen && !isAuthenticated) {
      setAuthModalTab('login');
      setIsAuthModalOpen(true);
    }
    // Always clear the flag once checked to avoid stale triggers
    if (shouldOpen) {
      localStorage.removeItem('open_login_modal');
    }
  }, [isAuthenticated]);

  return (
    <nav className="sticky top-0 bg-gradient-to-r from-slate-100 via-blue-50 to-slate-100 py-4 z-40 transition-all duration-300 shadow-sm border-b border-gray-200/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link to="/" className="flex items-center group" onClick={closeMenu}>
          <NavbarLogo />
        </Link>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          <Link to="/" className={`text-gray-700 transition-all duration-300 relative group px-3 py-2 rounded-md ${location.pathname === '/' ? 'text-fem-terracotta font-semibold bg-white/50' : 'hover:text-fem-terracotta hover:bg-white/30'}`}>
            Home
            <span className={`absolute bottom-0 left-0 h-0.5 bg-fem-terracotta transition-all duration-300 ${location.pathname === '/' ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
          </Link>
          <Link to="/directory" className={`text-gray-700 transition-all duration-300 relative group px-3 py-2 rounded-md ${location.pathname === '/directory' ? 'text-fem-terracotta font-semibold bg-white/50' : 'hover:text-fem-terracotta hover:bg-white/30'}`}>
            Business Directory
            <span className={`absolute bottom-0 left-0 h-0.5 bg-fem-terracotta transition-all duration-300 ${location.pathname === '/directory' ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
          </Link>
          {/* Business Management Links - Only for Business Users */}
          {isAuthenticated && isBusiness && (
            <>
              {isCheckingBusiness ? (
                <div className="text-gray-700 opacity-50 px-3 py-2">
                  <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
                  Loading...
                </div>
              ) : !hasExistingBusiness ? (
                <Link to="/register-business" className={`text-gray-700 transition-all duration-300 relative group px-3 py-2 rounded-md ${location.pathname === '/register-business' ? 'text-fem-terracotta font-semibold bg-white/50' : 'hover:text-fem-terracotta hover:bg-white/30'}`}>
                  List Business
                  <span className={`absolute bottom-0 left-0 h-0.5 bg-fem-terracotta transition-all duration-300 ${location.pathname === '/register-business' ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
                </Link>
              ) : (
                <Link to="/manage-business" className={`text-gray-700 transition-all duration-300 relative group px-3 py-2 rounded-md ${location.pathname === '/manage-business' ? 'text-fem-terracotta font-semibold bg-white/50' : 'hover:text-fem-terracotta hover:bg-white/30'}`}>
                  Manage Business
                  <span className={`absolute bottom-0 left-0 h-0.5 bg-fem-terracotta transition-all duration-300 ${location.pathname === '/manage-business' ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
                </Link>
              )}
            </>
          )}
          <Link to="/about" className={`text-gray-700 transition-all duration-300 relative group px-3 py-2 rounded-md ${location.pathname === '/about' ? 'text-fem-terracotta font-semibold bg-white/50' : 'hover:text-fem-terracotta hover:bg-white/30'}`}>
            About
            <span className={`absolute bottom-0 left-0 h-0.5 bg-fem-terracotta transition-all duration-300 ${location.pathname === '/about' ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
          </Link>
          <Link to="/contact" className={`text-gray-700 transition-all duration-300 relative group px-3 py-2 rounded-md ${location.pathname === '/contact' ? 'text-fem-terracotta font-semibold bg-white/50' : 'hover:text-fem-terracotta hover:bg-white/30'}`}>
            Contact
            <span className={`absolute bottom-0 left-0 h-0.5 bg-fem-terracotta transition-all duration-300 ${location.pathname === '/contact' ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
          </Link>
          {/* Favorites - Only when authenticated */}
          {isAuthenticated && (
            <Link to="/favorites" className={`text-gray-700 transition-all duration-300 relative group px-3 py-2 rounded-md ${location.pathname === '/favorites' ? 'text-fem-terracotta font-semibold bg-white/50' : 'hover:text-fem-terracotta hover:bg-white/30'}`}>
              Favorites
              <span className={`absolute bottom-0 left-0 h-0.5 bg-fem-terracotta transition-all duration-300 ${location.pathname === '/favorites' ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
            </Link>
          )}
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
        <div className="md:hidden absolute top-full left-0 right-0 bg-gradient-to-r from-slate-100 via-blue-50 to-slate-100 shadow-lg border-t border-gray-200/50 z-50">
          <div className="container mx-auto px-4 py-4 space-y-4">
            {/* Mobile Navigation Links */}
            <div className="space-y-3">
              <Link 
                to="/" 
                className="block py-2 px-3 text-gray-700 hover:text-fem-terracotta hover:bg-white/30 rounded-md transition-colors"
                onClick={closeMenu}
              >
                Home
              </Link>
              <Link 
                to="/directory" 
                className="block py-2 px-3 text-gray-700 hover:text-fem-terracotta hover:bg-white/30 rounded-md transition-colors"
                onClick={closeMenu}
              >
                Business Directory
              </Link>
              {/* Business Management Links - Only for Business Users */}
              {isAuthenticated && isBusiness && (
                <>
                  {isCheckingBusiness ? (
                    <div className="block py-2 px-3 text-gray-700 opacity-50">
                      <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
                      Loading...
                    </div>
                  ) : !hasExistingBusiness ? (
                    <Link 
                      to="/register-business" 
                      className="block py-2 px-3 text-gray-700 hover:text-fem-terracotta hover:bg-white/30 rounded-md transition-colors"
                      onClick={closeMenu}
                    >
                      List Business
                    </Link>
                  ) : (
                    <Link 
                      to="/manage-business" 
                      className="block py-2 px-3 text-gray-700 hover:text-fem-terracotta hover:bg-white/30 rounded-md transition-colors"
                      onClick={closeMenu}
                    >
                      Manage Business
                    </Link>
                  )}
                </>
              )}
              <Link 
                to="/about" 
                className="block py-2 px-3 text-gray-700 hover:text-fem-terracotta hover:bg-white/30 rounded-md transition-colors"
                onClick={closeMenu}
              >
                About
              </Link>
              <Link 
                to="/contact" 
                className="block py-2 px-3 text-gray-700 hover:text-fem-terracotta hover:bg-white/30 rounded-md transition-colors"
                onClick={closeMenu}
              >
                Contact
              </Link>
              {isAuthenticated && (
                <Link 
                  to="/favorites" 
                  className="block py-2 px-3 text-gray-700 hover:text-fem-terracotta hover:bg-white/30 rounded-md transition-colors"
                  onClick={closeMenu}
                >
                  Favorites
                </Link>
              )}

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
                    onClick={() => openAuthModal('login')}
                  >
                    Sign In
                  </Button>
                  <Button 
                    className="w-full bg-fem-terracotta hover:bg-fem-terracotta/90 text-white"
                    onClick={() => openAuthModal('signup')}
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
        hideTabs={true}
      />
    </nav>
  );
};

export { Navbar };
