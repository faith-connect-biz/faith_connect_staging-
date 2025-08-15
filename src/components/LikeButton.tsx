import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { apiService } from '@/services/api';

interface LikeButtonProps {
  id: string;
  type: 'business' | 'review';
  initialLiked?: boolean;
  likeCount?: number;
  onLikeChange?: (liked: boolean) => void;
  disabled?: boolean;
}

export const LikeButton: React.FC<LikeButtonProps> = ({
  id,
  type,
  initialLiked = false,
  likeCount = 0,
  onLikeChange,
  disabled = false
}) => {
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [isLoading, setIsLoading] = useState(false);
  const [currentLikeCount, setCurrentLikeCount] = useState(likeCount);

  const handleLikeToggle = async () => {
    if (disabled || isLoading) return;

    try {
      setIsLoading(true);
      
      let response;
      if (type === 'business') {
        response = await apiService.toggleBusinessLike(id);
      } else {
        response = await apiService.toggleReviewLike(id);
      }

      const newLikedState = response.liked;
      setIsLiked(newLikedState);
      
      // Update like count
      if (newLikedState) {
        setCurrentLikeCount(prev => prev + 1);
      } else {
        setCurrentLikeCount(prev => Math.max(0, prev - 1));
      }

      // Call parent callback if provided
      if (onLikeChange) {
        onLikeChange(newLikedState);
      }

      toast({
        title: response.message,
        variant: "default"
      });

    } catch (error: any) {
      console.error('Error toggling like:', error);
      
      // Show error message
      let errorMessage = "Failed to update like";
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleLikeToggle}
      disabled={disabled || isLoading}
      className={`flex items-center gap-2 transition-all duration-200 ${
        isLiked 
          ? 'text-red-500 hover:text-red-600 hover:bg-red-50' 
          : 'text-gray-500 hover:text-gray-600 hover:bg-gray-50'
      }`}
    >
      <Heart 
        className={`h-4 w-4 transition-all duration-200 ${
          isLiked ? 'fill-current' : 'fill-none'
        }`}
      />
      <span className="text-sm font-medium">
        {currentLikeCount > 0 ? currentLikeCount : ''}
      </span>
      {isLoading && (
        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
      )}
    </Button>
  );
};
