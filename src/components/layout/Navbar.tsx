import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Menu, 
  X, 
  LogIn,
  User,
  ArrowRight,
  Settings,
  Heart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();

  // Scroll detection for shadow
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  // Define menu items - base items always visible
  const baseMenuItems = [
    { path: '/', label: 'Home' },
    { path: '/about', label: 'About Us' },
    { path: '/directory', label: 'Business Directory' },
    { path: '/contact', label: 'Contact Us' },
  ];

  // Items visible only when authenticated
  const authMenuItems = [
    { path: '/manage-business', label: 'Manage Your Listing', icon: Settings },
    { path: '/favorites', label: 'Favourites', icon: Heart },
  ];

  const NavLinkItem = ({ path, label, icon: Icon }: { path: string; label: string; icon?: React.ComponentType<{ className?: string }> }) => {
    const isActive = location.pathname === path;
    
    return (
      <Link 
        to={path}
        className={`
          relative px-4 py-2 rounded-lg transition-all duration-300
          ${isActive 
            ? 'text-fem-terracotta font-semibold bg-fem-terracotta/10' 
            : 'text-gray-700 hover:text-fem-terracotta hover:bg-gray-50'}
        `}
      >
        {Icon && <Icon className="w-4 h-4 inline mr-2" />}
        {label}
        {isActive && (
          <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-fem-terracotta rounded-full"></span>
        )}
      </Link>
    );
  };

  const MobileNavLink = ({ path, label, icon: Icon }: { path: string; label: string; icon?: React.ComponentType<{ className?: string }> }) => {
    const isActive = location.pathname === path;
    
    return (
      <Link 
        to={path}
        className={`
          flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300
          ${isActive 
            ? 'text-fem-terracotta font-semibold bg-fem-terracotta/10' 
            : 'text-gray-700 hover:text-fem-terracotta hover:bg-gray-50'}
        `}
        onClick={closeMenu}
      >
        {Icon && <Icon className="w-5 h-5" />}
        {label}
      </Link>
    );
  };

  return (
    <nav className={`sticky top-0 bg-white border-b z-50 transition-shadow duration-300 ${
      isScrolled ? 'shadow-md' : 'shadow-sm'
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link to="/" onClick={closeMenu} className="flex items-center">
            <img
              src="/NewFaithConnect (1).png"
              alt="Faith Connect Logo"
              className="h-12 w-auto"
            />
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-2">
            {baseMenuItems.map((item) => (
              <NavLinkItem key={item.path} {...item} />
            ))}
            
            {/* Authenticated menu items */}
            {isAuthenticated && authMenuItems.map((item) => (
              <NavLinkItem key={item.path} {...item} />
            ))}
          </div>

          {/* Desktop Auth Section */}
          <div className="hidden lg:flex items-center gap-4 ml-6">
            {isAuthenticated ? (
              <>
                <Link 
                  to="/profile"
                  className="flex items-center gap-2 text-gray-700 hover:text-fem-terracotta transition-colors"
                >
                  <User className="w-5 h-5" />
                  <span className="font-medium">{user?.firstName || 'Profile'}</span>
                </Link>
                <Button 
                  onClick={logout}
                  variant="outline" 
                  size="sm"
                  className="border-gray-300 hover:border-red-500 hover:text-red-500"
                >
                  Logout
                </Button>
              </>
            ) : (
              <Link to="/login">
                <Button className="bg-gradient-to-r from-fem-terracotta to-fem-gold hover:from-fem-terracotta/90 hover:to-fem-gold/90 text-white">
                  <LogIn className="w-4 h-4 mr-2" />
                  Login
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="lg:hidden p-2 text-gray-700 hover:text-fem-terracotta transition-colors"
            onClick={toggleMenu}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/20 z-[50] lg:hidden"
            onClick={closeMenu}
          />
          
          {/* Mobile Menu Content */}
          <div className="fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-[60] lg:hidden overflow-y-auto animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-white sticky top-0">
              <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
              <button 
                onClick={closeMenu}
                className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                aria-label="Close menu"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Navigation Items */}
            <div className="px-4 py-6 space-y-2">
              {/* Base Menu Items */}
              {baseMenuItems.map((item) => (
                <MobileNavLink key={item.path} {...item} />
              ))}
              
              {/* Authenticated Menu Items */}
              {isAuthenticated && (
                <>
                  {authMenuItems.map((item) => (
                    <MobileNavLink key={item.path} {...item} />
                  ))}
                </>
              )}

              {/* Divider */}
              <div className="border-t border-gray-200 my-6"></div>

              {/* Auth Section */}
              {isAuthenticated ? (
                <div className="space-y-2">
                  <Link 
                    to="/profile"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:text-fem-terracotta hover:bg-gray-50 transition-all"
                    onClick={closeMenu}
                  >
                    <User className="w-5 h-5" />
                    <span>{user?.firstName || 'Profile'}</span>
                  </Link>
                  <button 
                    onClick={() => {
                      logout();
                      closeMenu();
                    }}
                    className="w-full text-left px-4 py-3 rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50 transition-all"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <Link 
                  to="/login"
                  className="flex items-center justify-between w-full px-4 py-3 bg-gradient-to-r from-fem-terracotta to-fem-gold text-white rounded-lg hover:from-fem-terracotta/90 hover:to-fem-gold/90 transition-all shadow-lg group"
                  onClick={closeMenu}
                >
                  <span className="font-semibold">Login</span>
                  <ArrowRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
                </Link>
              )}
            </div>
          </div>
        </>
      )}
    </nav>
  );
};

export { Navbar };