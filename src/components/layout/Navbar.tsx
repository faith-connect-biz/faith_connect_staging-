
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search, LogOut, User } from "lucide-react";
import { useState, useEffect } from "react";

export const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [userType, setUserType] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const loggedInStatus = localStorage.getItem("isLoggedIn") === "true";
    const email = localStorage.getItem("userEmail");
    const type = localStorage.getItem("userType");
    
    setIsLoggedIn(loggedInStatus);
    setUserEmail(email || "");
    setUserType(type);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userType");
    setIsLoggedIn(false);
    setUserEmail("");
    setUserType(null);
    navigate("/login");
  };

  return (
    <nav className="bg-white shadow-sm py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2">
          <img 
            src="/lovable-uploads/f1a3f2a4-bbe7-46e5-be66-1ad39e35defa.png" 
            alt="FEM Family Church Logo" 
            className="h-12 w-auto" 
          />
          <div className="hidden sm:flex flex-col">
            <span className="font-heading font-semibold text-fem-navy">FaithConnect</span>
            <span className="text-xs text-fem-darkgray">Business Directory</span>
          </div>
        </Link>
        
        <div className="hidden md:flex items-center gap-6">
          <Link to="/directory" className="text-fem-navy hover:text-fem-terracotta transition-colors">
            Business Directory
          </Link>
          {isLoggedIn && userType === "business" && (
            <Link to="/register-business" className="text-fem-navy hover:text-fem-terracotta transition-colors">
              List Business
            </Link>
          )}

          <Link to="/about" className="text-fem-navy hover:text-fem-terracotta transition-colors">
            About
          </Link>
          {isLoggedIn && (
            <Link to="/chat" className="text-fem-navy hover:text-fem-terracotta transition-colors">
              Chat
            </Link>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="text-fem-navy">
            <Search className="h-5 w-5" />
          </Button>
          
          {isLoggedIn ? (
            <div className="flex items-center gap-2">
              <Link to="/profile">
                <Button variant="outline" className="flex items-center gap-2 border-fem-terracotta text-fem-terracotta hover:bg-fem-terracotta hover:text-white">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">Profile</span>
                </Button>
              </Link>
              <Button 
                variant="ghost" 
                className="text-fem-navy hover:text-fem-terracotta"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          ) : (
            <>
              <Link to="/login">
                <Button variant="outline" className="hidden sm:inline-flex border-fem-terracotta text-fem-terracotta hover:bg-fem-terracotta hover:text-white">
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
      </div>
    </nav>
  );
};
