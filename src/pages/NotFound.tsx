
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-fem-gold/20 rounded-full mb-6">
          <span className="text-4xl font-bold text-fem-navy">404</span>
        </div>
        
        <h1 className="text-2xl font-bold text-fem-navy mb-2">Page Not Found</h1>
        
        <p className="text-gray-600 mb-6">
          We couldn't find the page you're looking for. It might have been moved, 
          deleted, or never existed.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            asChild 
            variant="outline" 
            className="flex items-center gap-2 border-fem-terracotta text-fem-terracotta hover:bg-fem-terracotta hover:text-white"
          >
            <Link to={-1 as any}>
              <ArrowLeft className="h-4 w-4" />
              <span>Go Back</span>
            </Link>
          </Button>
          
          <Button 
            asChild 
            className="flex items-center gap-2 bg-fem-terracotta hover:bg-fem-terracotta/90 text-white"
          >
            <Link to="/">
              <Home className="h-4 w-4" />
              <span>Return to Home</span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
