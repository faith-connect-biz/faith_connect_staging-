import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

interface LikeButtonProps {
  itemId: string;
  itemType: 'product' | 'service' | 'business';
  itemName: string;
  businessName: string;
  businessId: string;
  description?: string;
  price?: string;
  priceCurrency?: string;
  rating?: number;
  reviewCount?: number;
  inStock?: boolean;
  isActive?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const LikeButton = ({
  itemId,
  itemType,
  itemName,
  businessName,
  businessId,
  description,
  price,
  priceCurrency,
  rating,
  reviewCount,
  inStock,
  isActive,
  className = "",
  size = "md"
}: LikeButtonProps) => {
  const { user, isAuthenticated } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      checkIfLiked();
    }
  }, [isAuthenticated, user, itemId]);

  const checkIfLiked = () => {
    try {
      const storedFavorites = localStorage.getItem(`favorites_${user?.id}`);
      if (storedFavorites) {
        const favorites = JSON.parse(storedFavorites);
        // Check in all arrays to handle any data inconsistencies
        const allItems = [
          ...(favorites.products || []), 
          ...(favorites.services || []), 
          ...(favorites.businesses || [])
        ];
        const likedItem = allItems.find((item: any) => item.id === itemId);
        setIsLiked(!!likedItem);
        
        // If item is found in wrong array, log it for debugging
        if (likedItem && likedItem.type !== itemType) {
          console.warn(`LikeButton - Item ${itemId} found in wrong array: expected ${itemType}, found in ${likedItem.type}`);
        }
      }
    } catch (error) {
      console.error("Error checking like status:", error);
    }
  };

  const handleLike = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please sign in to save favorites.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const storedFavorites = localStorage.getItem(`favorites_${user?.id}`) || '{"products": [], "services": [], "businesses": []}';
      const favorites = JSON.parse(storedFavorites);
      console.log('LikeButton - Initial favorites structure:', favorites);
      console.log('LikeButton - Current itemType:', itemType);
      
      const itemData = {
        id: itemId,
        type: itemType,
        name: itemName,
        description,
        price,
        price_currency: priceCurrency,
        business_name: businessName,
        business_id: businessId,
        rating,
        review_count: reviewCount,
        in_stock: inStock,
        is_active: isActive,
        created_at: new Date().toISOString(),
      };

      if (isLiked) {
        // Remove from favorites - check all arrays to handle data inconsistencies
        let removed = false;
        
        // Remove from products array if found there
        if (favorites.products) {
          const productIndex = favorites.products.findIndex((item: any) => item.id === itemId);
          if (productIndex !== -1) {
            favorites.products.splice(productIndex, 1);
            removed = true;
          }
        }
        
        // Remove from services array if found there
        if (favorites.services && !removed) {
          const serviceIndex = favorites.services.findIndex((item: any) => item.id === itemId);
          if (serviceIndex !== -1) {
            favorites.services.splice(serviceIndex, 1);
            removed = true;
          }
        }
        
        // Remove from businesses array if found there
        if (favorites.businesses && !removed) {
          const businessIndex = favorites.businesses.findIndex((item: any) => item.id === itemId);
          if (businessIndex !== -1) {
            favorites.businesses.splice(businessIndex, 1);
            removed = true;
          }
        }
        
        toast({
          title: "Removed from favorites",
          description: `${itemName} has been removed from your favorites.`,
        });
      } else {
        // Add to favorites - ensure it goes to the correct array
        // First, remove from wrong arrays if it exists there
        if (favorites.products) {
          favorites.products = favorites.products.filter((item: any) => item.id !== itemId);
        }
        if (favorites.services) {
          favorites.services = favorites.services.filter((item: any) => item.id !== itemId);
        }
        if (favorites.businesses) {
          favorites.businesses = favorites.businesses.filter((item: any) => item.id !== itemId);
        }
        
        // Add to correct array
        const targetArray = itemType === 'product' ? 'products' : itemType === 'service' ? 'services' : 'businesses';
        console.log('LikeButton - Adding item to favorites:', {
          itemType,
          itemData,
          targetArray
        });
        favorites[targetArray].push(itemData);
        
        toast({
          title: "Added to favorites",
          description: `${itemName} has been added to your favorites!`,
        });
      }

      console.log('LikeButton - Final favorites structure:', favorites);
      localStorage.setItem(`favorites_${user?.id}`, JSON.stringify(favorites));
      setIsLiked(!isLiked);
    } catch (error) {
      console.error("Error updating favorites:", error);
      toast({
        title: "Error",
        description: "Failed to update favorites. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getButtonSize = () => {
    switch (size) {
      case 'sm':
        return 'h-8 w-8';
      case 'lg':
        return 'h-12 w-12';
      default:
        return 'h-10 w-10';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return 'w-4 h-4';
      case 'lg':
        return 'w-6 h-6';
      default:
        return 'w-5 h-5';
    }
  };

  return (
    <Button
      onClick={handleLike}
      disabled={isLoading}
      variant="ghost"
      size="sm"
      className={`${getButtonSize()} p-0 rounded-full transition-all duration-300 hover:scale-110 ${
        isLiked 
          ? 'text-red-500 hover:text-red-600 hover:bg-red-50' 
          : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
      } ${className}`}
      title={isLiked ? `Remove ${itemName} from favorites` : `Add ${itemName} to favorites`}
    >
      <Heart 
        className={`${getIconSize()} transition-all duration-300 ${
          isLiked ? 'fill-current' : ''
        }`} 
      />
    </Button>
  );
};

export default LikeButton;
