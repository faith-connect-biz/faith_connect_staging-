
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search, LogOut, User, Menu, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      setIsMobileMenuOpen(false);
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-sm py-4 relative">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2" onClick={closeMobileMenu}>
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
        <div className="hidden md:flex items-center gap-6">
          <Link to="/directory" className="text-fem-navy hover:text-fem-terracotta transition-colors">
            Business Directory
          </Link>
          {isAuthenticated && user?.user_type === "business" && (
            <Link to="/register-business" className="text-fem-navy hover:text-fem-terracotta transition-colors">
              List Business
            </Link>
          )}
          <Link to="/about" className="text-fem-navy hover:text-fem-terracotta transition-colors">
            About
          </Link>
          {isAuthenticated && (
            <Link to="/chat" className="text-fem-navy hover:text-fem-terracotta transition-colors">
              Chat
            </Link>
          )}
        </div>
        
        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
          <Button variant="ghost" size="icon" className="text-fem-navy">
            <Search className="h-5 w-5" />
          </Button>
          
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
                <LogOut className="h-4 w-4 mr-2" />
                <span>Logout</span>
              </Button>
            </div>
          ) : (
            <>
              <Link to="/login">
                <Button variant="outline" className="border-fem-terracotta text-fem-terracotta hover:bg-fem-terracotta hover:text-white">
                  Sign In
                </Button>
              </Link>
              <Link to="/register">
                <Button className="bg-fem-terracotta hover:bg-fem-terracotta/90 text-white">
                  Register
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center gap-2">
          <Button variant="ghost" size="icon" className="text-fem-navy">
            <Search className="h-5 w-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-fem-navy"
            onClick={toggleMobileMenu}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white shadow-lg border-t border-gray-100 z-50">
          <div className="container mx-auto px-4 py-4 space-y-4">
            {/* Mobile Navigation Links */}
            <div className="space-y-3">
              <Link 
                to="/directory" 
                className="block py-2 text-fem-navy hover:text-fem-terracotta transition-colors"
                onClick={closeMobileMenu}
              >
                Business Directory
              </Link>
              {isAuthenticated && user?.user_type === "business" && (
                <Link 
                  to="/register-business" 
                  className="block py-2 text-fem-navy hover:text-fem-terracotta transition-colors"
                  onClick={closeMobileMenu}
                >
                  List Business
                </Link>
              )}
              <Link 
                to="/about" 
                className="block py-2 text-fem-navy hover:text-fem-terracotta transition-colors"
                onClick={closeMobileMenu}
              >
                About
              </Link>
              {isAuthenticated && (
                <Link 
                  to="/chat" 
                  className="block py-2 text-fem-navy hover:text-fem-terracotta transition-colors"
                  onClick={closeMobileMenu}
                >
                  Chat
                </Link>
              )}
            </div>

            {/* Mobile Actions */}
            <div className="pt-4 border-t border-gray-100 space-y-3">
              {isAuthenticated ? (
                <>
                  <Link to="/profile" onClick={closeMobileMenu}>
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
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={closeMobileMenu}>
                    <Button variant="outline" className="w-full border-fem-terracotta text-fem-terracotta hover:bg-fem-terracotta hover:text-white">
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/register" onClick={closeMobileMenu}>
                    <Button className="w-full bg-fem-terracotta hover:bg-fem-terracotta/90 text-white">
                      Register
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};
