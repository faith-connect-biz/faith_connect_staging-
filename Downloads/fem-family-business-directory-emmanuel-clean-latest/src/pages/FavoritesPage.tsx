import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, 
  Package, 
  Settings, 
  MapPin, 
  Star, 
  Building2, 
  Eye,
  Share2,
  Trash2,
  MessageSquare
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

interface FavoriteItem {
  id: string;
  type: 'product' | 'service';
  name: string;
  description?: string;
  price?: string;
  price_currency?: string;
  business_name: string;
  business_id: string;
  category?: string;
  rating?: number;
  review_count?: number;
  in_stock?: boolean;
  is_active?: boolean;
  created_at: string;
}

const FavoritesPage = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<{
    products: FavoriteItem[];
    services: FavoriteItem[];
    businesses: FavoriteItem[];
  }>({ products: [], services: [], businesses: [] });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
      return;
    }

    // Load favorites from localStorage
    loadFavorites();
  }, [isAuthenticated, navigate]);

  const loadFavorites = () => {
    try {
      const storedFavorites = localStorage.getItem(`favorites_${user?.id}`);
      if (storedFavorites) {
        const parsed = JSON.parse(storedFavorites);
        console.log('FavoritesPage - Loaded favorites:', parsed);
        console.log('FavoritesPage - Products:', parsed.products);
        console.log('FavoritesPage - Services:', parsed.services);
        
        // Clean up any items that might be in the wrong arrays
        const cleanedFavorites = cleanupFavoritesStructure(parsed);
        setFavorites(cleanedFavorites);
        
        // Save the cleaned structure back to localStorage
        localStorage.setItem(`favorites_${user?.id}`, JSON.stringify(cleanedFavorites));
      }
    } catch (error) {
      console.error("Error loading favorites:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const cleanupFavoritesStructure = (favorites: any) => {
    const cleaned = {
      products: [],
      services: [],
      businesses: []
    };

    // Move products to products array
    if (favorites.products) {
      favorites.products.forEach((item: any) => {
        if (item.type === 'product') {
          cleaned.products.push(item);
        } else if (item.type === 'service') {
          cleaned.services.push(item);
        } else {
          // If no type specified, assume it's a product (backward compatibility)
          cleaned.products.push({ ...item, type: 'product' });
        }
      });
    }

    // Move services to services array
    if (favorites.services) {
      favorites.services.forEach((item: any) => {
        if (item.type === 'service') {
          cleaned.services.push(item);
        } else if (item.type === 'product') {
          cleaned.products.push(item);
        } else {
          // If no type specified, assume it's a service (backward compatibility)
          cleaned.services.push({ ...item, type: 'service' });
        }
      });
    }

    // Move businesses to businesses array
    if (favorites.businesses) {
      favorites.businesses.forEach((item: any) => {
        if (item.type === 'business') {
          cleaned.businesses.push(item);
        } else if (item.type === 'product') {
          cleaned.products.push(item);
        } else if (item.type === 'service') {
          cleaned.services.push(item);
        } else {
          // If no type specified, assume it's a business (backward compatibility)
          cleaned.businesses.push({ ...item, type: 'business' });
        }
      });
    }

    console.log('FavoritesPage - Cleaned favorites structure:', cleaned);
    return cleaned;
  };

  const removeFavorite = (itemId: string, type: 'product' | 'service' | 'business') => {
    try {
      const newFavorites = {
        ...favorites,
        [type === 'product' ? 'products' : type === 'service' ? 'services' : 'businesses']: 
          favorites[type === 'product' ? 'products' : type === 'service' ? 'services' : 'businesses'].filter(item => item.id !== itemId)
      };
      
      setFavorites(newFavorites);
      localStorage.setItem(`favorites_${user?.id}`, JSON.stringify(newFavorites));
      
      toast({
        title: "Removed from favorites",
        description: "Item has been removed from your favorites list.",
      });
    } catch (error) {
      console.error("Error removing favorite:", error);
      toast({
        title: "Error",
        description: "Failed to remove item from favorites.",
        variant: "destructive",
      });
    }
  };

  const shareItem = async (item: FavoriteItem) => {
    const shareData = {
      title: `${item.name} - ${item.business_name}`,
      text: item.description || `Check out this ${item.type} from ${item.business_name}`,
      url: `${window.location.origin}/business/${item.business_id}`,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.log("Share cancelled");
      }
    } else {
      // Fallback: copy to clipboard
      const shareUrl = `${shareData.title}\n\n${shareData.text}\n\n${shareData.url}`;
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast({
          title: "Link copied!",
          description: "Share link has been copied to your clipboard.",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to copy share link.",
          variant: "destructive",
        });
      }
    }
  };

  const viewItem = (item: FavoriteItem) => {
    navigate(`/business/${item.business_id}`);
  };

  if (!isAuthenticated) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fem-terracotta mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your favorites...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-fem-navy to-fem-terracotta text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <div className="w-20 h-20 bg-fem-gold rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-10 h-10 text-white fill-current" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">My Favorites</h1>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              Keep track of all the products and services you love from our faith-based business community.
            </p>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            {/* Favorites Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <Card className="text-center p-6 bg-gradient-to-br from-red-50 to-red-100 border-red-200">
                <Heart className="w-12 h-12 text-red-500 mx-auto mb-3" />
                <div className="text-2xl font-bold text-red-600">
                  {favorites.products.length + favorites.services.length + favorites.businesses.length}
                </div>
                <div className="text-sm text-red-700 font-medium">Total Favorites</div>
              </Card>
              
              <Card className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <Package className="w-12 h-12 text-blue-500 mx-auto mb-3" />
                <div className="text-2xl font-bold text-blue-600">
                  {favorites.products.length + favorites.services.length + favorites.businesses.length}
                </div>
                <div className="text-sm text-blue-700 font-medium">All Favorites</div>
              </Card>
            </div>

            {/* All Favorites List */}
            <div className="space-y-6">
              {favorites.products.length === 0 && favorites.services.length === 0 && favorites.businesses.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl shadow-lg">
                  <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">No Favorites Yet</h3>
                  <p className="text-gray-500 mb-6">Start exploring our business directory to find items you love!</p>
                  <Button 
                    onClick={() => navigate("/directory")}
                    className="bg-fem-terracotta hover:bg-fem-terracotta/90 text-white"
                  >
                    Explore Directory
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Products */}
                  {favorites.products.map((item) => (
                    <Card key={`product-${item.id}`} className="group hover:shadow-xl transition-all duration-300 border-l-4 border-l-blue-500">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Package className="w-4 h-4 text-blue-500" />
                              <Badge variant="outline" className="text-xs text-blue-600 border-blue-200">Product</Badge>
                            </div>
                            <h3 className="font-bold text-lg text-fem-navy mb-2 group-hover:text-fem-terracotta transition-colors">
                              {item.name}
                            </h3>
                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                              {item.description || "No description available"}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFavorite(item.id, 'product')}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="space-y-3 mb-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Business:</span>
                            <span className="text-sm font-medium text-fem-navy">{item.business_name}</span>
                          </div>
                          {item.price && (
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">Price:</span>
                              <span className="text-lg font-bold text-fem-terracotta">
                                {item.price} {item.price_currency}
                              </span>
                            </div>
                          )}
                          {item.rating && (
                            <div className="flex items-center gap-2">
                              <Star className="w-4 h-4 text-yellow-500 fill-current" />
                              <span className="text-sm text-gray-600">
                                {item.rating.toFixed(1)} ({item.review_count || 0} reviews)
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <Button
                            onClick={() => viewItem(item)}
                            className="flex-1 bg-fem-terracotta hover:bg-fem-terracotta/90 text-white"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => shareItem(item)}
                            className="border-fem-terracotta text-fem-terracotta hover:bg-fem-terracotta hover:text-white"
                          >
                            <Share2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {/* Services */}
                  {favorites.services.map((item) => (
                    <Card key={`service-${item.id}`} className="group hover:shadow-xl transition-all duration-300 border-l-4 border-l-green-500">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Settings className="w-4 h-4 text-green-500" />
                              <Badge variant="outline" className="text-xs text-green-600 border-green-200">Service</Badge>
                            </div>
                            <h3 className="font-bold text-lg text-fem-navy mb-2 group-hover:text-fem-terracotta transition-colors">
                              {item.name}
                            </h3>
                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                              {item.description || "No description available"}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFavorite(item.id, 'service')}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="space-y-3 mb-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Business:</span>
                            <span className="text-sm font-medium text-fem-navy">{item.business_name}</span>
                          </div>
                          {item.price && (
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">Price:</span>
                              <span className="text-lg font-bold text-fem-terracotta">
                                {item.price} {item.price_currency}
                              </span>
                            </div>
                          )}
                          {item.rating && (
                            <div className="flex items-center gap-2">
                              <Star className="w-4 h-4 text-yellow-500 fill-current" />
                              <span className="text-sm text-gray-600">
                                {item.rating.toFixed(1)} ({item.review_count || 0} reviews)
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <Button
                            onClick={() => viewItem(item)}
                            className="flex-1 bg-fem-terracotta hover:bg-fem-terracotta/90 text-white"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => shareItem(item)}
                            className="border-fem-terracotta text-fem-terracotta hover:bg-fem-terracotta hover:text-white"
                          >
                            <Share2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {/* Businesses */}
                  {favorites.businesses.map((item) => (
                    <Card key={`business-${item.id}`} className="group hover:shadow-xl transition-all duration-300 border-l-4 border-l-purple-500">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Building2 className="w-4 h-4 text-purple-500" />
                              <Badge variant="outline" className="text-xs text-purple-600 border-purple-200">Business</Badge>
                            </div>
                            <h3 className="font-bold text-lg text-fem-navy mb-2 group-hover:text-fem-terracotta transition-colors">
                              {item.name}
                            </h3>
                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                              {item.description || "No description available"}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFavorite(item.id, 'business')}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="space-y-3 mb-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Business:</span>
                            <span className="text-sm font-medium text-fem-navy">{item.business_name}</span>
                          </div>
                          {item.rating && (
                            <div className="flex items-center gap-2">
                              <Star className="w-4 h-4 text-yellow-500 fill-current" />
                              <span className="text-sm text-gray-600">
                                {item.rating.toFixed(1)} ({item.review_count || 0} reviews)
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <Button
                            onClick={() => viewItem(item)}
                            className="flex-1 bg-fem-terracotta hover:bg-fem-terracotta/90 text-white"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => shareItem(item)}
                            className="border-fem-terracotta text-fem-terracotta hover:bg-fem-terracotta hover:text-white"
                          >
                            <Share2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default FavoritesPage;
