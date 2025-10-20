import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Menu, 
  X,
  LogIn,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();

  // Scroll detection for glass effect
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className={`sticky top-0 py-4 z-40 transition-all duration-700 ${
      isScrolled 
        ? 'bg-white/15 backdrop-blur-xl shadow-2xl border-b border-white/30' 
        : 'bg-white/10 backdrop-blur-lg shadow-lg border-b border-white/20'
    }`}>
      <div className="container mx-auto px-4 flex justify-between items-center">
            <Link to="/" className="flex items-center group" onClick={closeMenu}>
              <img
                src="/android-chrome-192x192-removebg-preview.png"
                alt="Faith Connect Logo"
                className="h-16 w-auto"
                style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}
              />
            </Link>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          <Link to="/" className={`text-fem-navy transition-all duration-500 relative group px-4 py-2 rounded-xl backdrop-blur-sm ${location.pathname === '/' ? 'text-fem-terracotta font-semibold bg-white/20 shadow-lg' : 'hover:text-fem-terracotta hover:bg-white/10 hover:shadow-md'}`}>
            Home
            <span className={`absolute bottom-0 left-0 h-0.5 bg-fem-terracotta transition-all duration-500 ${location.pathname === '/' ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
          </Link>
          <Link to="/directory" className={`text-fem-navy transition-all duration-500 relative group px-4 py-2 rounded-xl backdrop-blur-sm ${location.pathname === '/directory' ? 'text-fem-terracotta font-semibold bg-white/20 shadow-lg' : 'hover:text-fem-terracotta hover:bg-white/10 hover:shadow-md'}`}>
            Business Directory
            <span className={`absolute bottom-0 left-0 h-0.5 bg-fem-terracotta transition-all duration-500 ${location.pathname === '/directory' ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
          </Link>
          <Link to="/about" className={`text-fem-navy transition-all duration-500 relative group px-4 py-2 rounded-xl backdrop-blur-sm ${location.pathname === '/about' ? 'text-fem-terracotta font-semibold bg-white/20 shadow-lg' : 'hover:text-fem-terracotta hover:bg-white/10 hover:shadow-md'}`}>
            About
            <span className={`absolute bottom-0 left-0 h-0.5 bg-fem-terracotta transition-all duration-500 ${location.pathname === '/about' ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
          </Link>
          <Link to="/contact" className={`text-fem-navy transition-all duration-500 relative group px-4 py-2 rounded-xl backdrop-blur-sm ${location.pathname === '/contact' ? 'text-fem-terracotta font-semibold bg-white/20 shadow-lg' : 'hover:text-fem-terracotta hover:bg-white/10 hover:shadow-md'}`}>
            Contact
            <span className={`absolute bottom-0 left-0 h-0.5 bg-fem-terracotta transition-all duration-500 ${location.pathname === '/contact' ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
          </Link>
          
          {/* Authentication Section */}
          {isAuthenticated ? (
            <div className="flex items-center space-x-4">
              <Link to="/profile" className="flex items-center space-x-2 text-gray-700 hover:text-fem-terracotta transition-colors">
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
            </div>
          ) : (
            <Link to="/login">
              <Button className="bg-gradient-to-r from-fem-terracotta to-fem-gold hover:from-fem-terracotta/90 hover:to-fem-gold/90 text-white backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-500 border border-white/20">
                <LogIn className="w-4 h-4 mr-2" />
                Login
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center gap-2">
          <button 
            className="text-fem-navy p-2"
            onClick={toggleMenu}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white/20 backdrop-blur-xl shadow-2xl border-t border-white/30 z-50 rounded-b-2xl mx-2 mt-2">
          <div className="container mx-auto px-6 py-6 space-y-4">
            {/* Mobile Navigation Links */}
            <div className="space-y-2">
              <Link 
                to="/" 
                className="block py-3 px-4 text-fem-navy hover:text-fem-terracotta hover:bg-white/10 rounded-xl transition-all duration-500 font-medium backdrop-blur-sm"
                onClick={closeMenu}
              >
                Home
              </Link>
              <Link 
                to="/directory" 
                className="block py-3 px-4 text-fem-navy hover:text-fem-terracotta hover:bg-white/10 rounded-xl transition-all duration-500 font-medium backdrop-blur-sm"
                onClick={closeMenu}
              >
                Business Directory
              </Link>
              <Link 
                to="/about" 
                className="block py-3 px-4 text-fem-navy hover:text-fem-terracotta hover:bg-white/10 rounded-xl transition-all duration-500 font-medium backdrop-blur-sm"
                onClick={closeMenu}
              >
                About
              </Link>
              <Link 
                to="/contact" 
                className="block py-3 px-4 text-fem-navy hover:text-fem-terracotta hover:bg-white/10 rounded-xl transition-all duration-500 font-medium backdrop-blur-sm"
                onClick={closeMenu}
              >
                Contact
              </Link>
              
              {/* Mobile Authentication */}
              <div className="pt-4 border-t border-gray-200">
                {isAuthenticated ? (
                  <div className="space-y-2">
                    <Link 
                      to="/profile" 
                      className="flex items-center space-x-2 py-3 px-4 text-gray-800 hover:text-fem-terracotta hover:bg-fem-terracotta/10 rounded-xl transition-all duration-200 font-medium"
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
                      className="w-full text-left py-3 px-4 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all duration-200 font-medium"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <Link 
                    to="/login" 
                    className="block py-3 px-4 bg-gradient-to-r from-fem-terracotta to-fem-gold text-white hover:from-fem-terracotta/90 hover:to-fem-gold/90 rounded-xl transition-all duration-500 font-medium text-center backdrop-blur-sm shadow-lg hover:shadow-xl border border-white/20"
                    onClick={closeMenu}
                  >
                    <LogIn className="w-5 h-5 inline mr-2" />
                    Login
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export { Navbar };